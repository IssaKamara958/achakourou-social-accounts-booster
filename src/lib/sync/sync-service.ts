// Squelette du SyncService — implémentations à relier au client DB et aux intégrations
import type { SyncJob, SyncResult } from "./types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class SyncService {
  // Planifie une nouvelle sync job
  static async scheduleJob(job: Partial<SyncJob>): Promise<SyncJob> {
    const insert = {
      account_id: job.account_id || null,
      platform: job.platform || null,
      job_type: job.job_type || "posts",
      payload: job.payload || null,
      status: job.status || "pending",
      scheduled_at: job.scheduled_at || new Date().toISOString(),
      max_retries: job.max_retries ?? 5,
    };

    const { data, error } = await supabaseAdmin.from("sync_jobs").insert(insert).select().single();

    if (error) throw error;
    return data as SyncJob;
  }

  // Récupère et locke la prochaine job due de façon optimiste
  static async fetchNextJob(): Promise<SyncJob | null> {
    // 1) sélectionner candidate
    const now = new Date().toISOString();
    const { data: candidates, error: selErr } = await supabaseAdmin
      .from("sync_jobs")
      .select("*")
      .lte("scheduled_at", now)
      .eq("status", "pending")
      .order("scheduled_at", { ascending: true })
      .limit(1);

    if (selErr) throw selErr;
    if (!candidates || candidates.length === 0) return null;

    const candidate = candidates[0] as SyncJob;

    // 2) essayer d'updater atomiquement si toujours pending
    const { data: updated, error: updErr } = await supabaseAdmin
      .from("sync_jobs")
      .update({
        status: "in_progress",
        locked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .match({ id: candidate.id, status: "pending" })
      .select()
      .single();

    if (updErr) {
      // si l'update échoue, un autre worker a peut-être pris la job
      return null;
    }

    return updated as SyncJob;
  }

  static async markInProgress(jobId: string): Promise<void> {
    await supabaseAdmin
      .from("sync_jobs")
      .update({
        status: "in_progress",
        locked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  }

  static async markCompleted(jobId: string): Promise<void> {
    await supabaseAdmin
      .from("sync_jobs")
      .update({ status: "completed", updated_at: new Date().toISOString(), locked_at: null })
      .eq("id", jobId);
  }

  static async markFailed(jobId: string, errorMessage: string): Promise<void> {
    // incrémenter retries et planifier prochain retry si possible
    const { data, error } = await supabaseAdmin
      .from("sync_jobs")
      .select("retries, max_retries")
      .eq("id", jobId)
      .single();

    if (error) throw error;

    const retries = (data?.retries || 0) + 1;
    const maxRetries = data?.max_retries ?? 5;

    const nextStatus = retries > maxRetries ? "failed" : "pending";
    const nextRetryAt =
      retries > maxRetries
        ? null
        : new Date(Date.now() + Math.pow(2, retries) * 1000 * 60).toISOString();

    await supabaseAdmin
      .from("sync_jobs")
      .update({
        retries,
        status: nextStatus,
        last_error: errorMessage,
        scheduled_at: nextRetryAt,
        locked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // log audit
    await supabaseAdmin
      .from("sync_audit_logs")
      .insert({ job_id: jobId, level: "error", message: errorMessage, meta: { retries } });
  }

  // Traitement de la job : fetch depuis la plateforme et persist
  static async processJob(job: SyncJob): Promise<SyncResult> {
    try {
      // Si la job est liée à un compte, déléguer au SocialSyncService existant
      if (job.account_id) {
        const { SocialSyncService } = await import("@/lib/social/sync");
        await supabaseAdmin
          .from("sync_audit_logs")
          .insert({
            job_id: job.id,
            level: "info",
            message: "processJob start delegating to SocialSyncService",
            meta: { job },
          });
        await SocialSyncService.syncAccount(
          (
            await supabaseAdmin
              .from("social_accounts")
              .select("*")
              .eq("id", job.account_id)
              .single()
          ).data,
        );
        await supabaseAdmin
          .from("sync_audit_logs")
          .insert({
            job_id: job.id,
            level: "info",
            message: "processJob completed via SocialSyncService",
            meta: { job },
          });
        return { success: true };
      }

      // Pour d'autres types de jobs, ajouter des handlers spécifiques
      await supabaseAdmin
        .from("sync_audit_logs")
        .insert({
          job_id: job.id,
          level: "warn",
          message: "processJob unknown job_type",
          meta: { job },
        });
      return { success: false, error: "unknown job_type" };
    } catch (err: any) {
      await this.markFailed(job.id, err.message || String(err));
      return { success: false, error: err.message || String(err) };
    }
  }
}

export default SyncService;
