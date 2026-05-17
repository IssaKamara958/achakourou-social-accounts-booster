import SyncService from "./sync-service";

const DEFAULT_POLL_INTERVAL = 5000;

export async function runWorkerLoop(stopSignal?: { stopped?: boolean }) {
  console.log("[sync-worker] démarrage du worker");
  while (!stopSignal?.stopped) {
    try {
      const job = await SyncService.fetchNextJob();
      if (!job) {
        await new Promise((r) => setTimeout(r, DEFAULT_POLL_INTERVAL));
        continue;
      }

      console.log("[sync-worker] traité job", job.id, job.job_type);
      // marquer in progress (déjà fait par fetchNextJob), mais assurer
      await SyncService.markInProgress(job.id);

      const res = await SyncService.processJob(job);
      if (res.success) {
        await SyncService.markCompleted(job.id);
      } else {
        await SyncService.markFailed(job.id, res.error || "unknown error");
      }
    } catch (err) {
      console.error("[sync-worker] erreur de boucle", err);
      await new Promise((r) => setTimeout(r, DEFAULT_POLL_INTERVAL));
    }
  }
  console.log("[sync-worker] arrêté");
}

export default runWorkerLoop;
