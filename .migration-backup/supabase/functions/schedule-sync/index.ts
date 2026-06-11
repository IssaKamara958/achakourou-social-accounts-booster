/// <reference types="https://deno.land/x/deno/cli/types/dts/index.d.ts" />

// supabase/functions/schedule-sync/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize the Supabase client with the service role key to bypass RLS.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // 1. Authenticate the request using a bearer token.
  const authHeader = req.headers.get("Authorization");
  const secret = Deno.env.get("SCHEDULE_SYNC_SECRET") || Deno.env.get("SYNC_CRON_SECRET");
  if (authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 2. Parse the request body.
    const body = await req.json().catch(() => ({}));
    const { social_account_id, job_type, payload } = body;

    if (!social_account_id) {
      return new Response(JSON.stringify({ error: "social_account_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Fetch the social account to get the corresponding user_id.
    // This is necessary because the \'sync_jobs\' table requires a user_id.
    const { data: account, error: accountError } = await supabase
      .from("social_accounts")
      .select("user_id")
      .eq("id", social_account_id)
      .single();

    if (accountError || !account) {
      throw new Error(`Social account with id ${social_account_id} not found.`);
    }

    // 4. Insert the new job into the \'sync_jobs\' table with the correct schema.
    const { data: job, error: insertError } = await supabase
      .from("sync_jobs")
      .insert({
        user_id: account.user_id, // Correctly fetched user_id
        social_account_id: social_account_id, // The ID from the request
        status: "pending", // The job starts in a pending state
        // The payload can store additional info, like the job_type.
        payload: {
            ...payload, // Include any payload from the original request
            job_type: job_type || "generic_sync", // Add job_type to the payload field
        },
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 5. Return a success response with the created job.
    return new Response(JSON.stringify({ success: true, job }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("schedule-sync error:", err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
