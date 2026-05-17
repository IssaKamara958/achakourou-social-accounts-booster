import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
);

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${Deno.env.get("SCHEDULE_SYNC_SECRET")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const accountId = body.account_id;
    if (!accountId) return new Response("account_id required", { status: 400 });

    const { data, error } = await supabase
      .from("sync_jobs")
      .insert({
        account_id: accountId,
        job_type: body.job_type || "posts",
        payload: body.payload || null,
        scheduled_at: body.scheduled_at || new Date().toISOString(),
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, job: data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("schedule-sync error", err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
