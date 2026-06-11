
// supabase/functions/sync-social-accounts/index.ts

import { serve } from "http/server.ts";
import { createClient } from "@supabase/supabase-js";

// The Supabase client is initialized with the service role key to bypass RLS.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Interface representing the structure of our 'social_accounts' table.
interface SocialAccount {
  id: string;
  user_id: string;
  platform: string;
  username: string; // Changed from account_name
  access_token: string;
  refresh_token?: string;
  expires_at?: string; // Changed from token_expires_at
}

serve(async (req) => {
  // 1. Authentication: Check for the cron secret to ensure the function is called securely.
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${Deno.env.get("SYNC_CRON_SECRET")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 2. Fetch all social accounts that have a refresh token.
    // We only need to process accounts that can have their tokens refreshed.
    const { data: accounts, error } = await supabase
      .from("social_accounts")
      .select("id, user_id, platform, username, access_token, refresh_token, expires_at")
      .not("refresh_token", "is", null);

    if (error) {
      console.error("Error fetching accounts:", error);
      throw error;
    }

    console.log(`Found ${accounts?.length || 0} accounts to process for token refresh.`);

    // 3. Process each account.
    for (const account of accounts || []) {
      // We only need to check accounts where the expiry date is set.
      if (account.expires_at && new Date(account.expires_at) < new Date()) {
        console.log(`Token expired for ${account.username} on ${account.platform}. Attempting refresh.`);
        await refreshToken(account as SocialAccount);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${accounts?.length || 0} accounts.`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Main sync process error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// This function attempts to refresh an expired access token.
async function refreshToken(account: SocialAccount) {
  try {
    if (!account.refresh_token) {
      throw new Error("Cannot refresh token: no refresh_token provided.");
    }

    // Platform-specific OAuth endpoints for token refresh.
    const tokenEndpoints: Record<string, string> = {
      facebook: "https://graph.facebook.com/v19.0/oauth/access_token",
      instagram: "https://graph.instagram.com/v19.0/refresh_access_token", // Note: Instagram uses a different grant_type
      tiktok: "https://open.tiktokapis.com/v1/oauth/token",
    };

    const endpoint = tokenEndpoints[account.platform];
    if (!endpoint) {
      throw new Error(`Unsupported platform for token refresh: ${account.platform}`);
    }

    const body = new FormData();
    body.append("client_id", Deno.env.get(`${account.platform.toUpperCase()}_APP_ID`)!);
    body.append("client_secret", Deno.env.get(`${account.platform.toUpperCase()}_APP_SECRET`)!);
    
    // Instagram has a different grant type for refreshing tokens
    if (account.platform === 'instagram') {
        body.append("grant_type", "ig_refresh_token");
        body.append("access_token", account.access_token); // Instagram refresh needs the old access_token
    } else {
        body.append("grant_type", "refresh_token");
        body.append("refresh_token", account.refresh_token);
    }
    

    const response = await fetch(endpoint, {
      method: "POST",
      body,
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Token refresh failed for ${account.username}: ${data.error?.message || response.statusText}`);
    }
    
    // Update the account in the database with the new token details.
    const { error: updateError } = await supabase
      .from("social_accounts")
      .update({
        access_token: data.access_token,
        // Some platforms might not return a new refresh token. In that case, keep the old one.
        refresh_token: data.refresh_token || account.refresh_token,
        expires_at: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);

    if (updateError) {
      throw new Error(`DB update failed after token refresh: ${updateError.message}`);
    }

    console.log(`Successfully refreshed token for ${account.username} on ${account.platform}.`);

  } catch (err) {
    console.error(`Error refreshing token for account ${account.id}:`, err);
    
    // Log the failed sync attempt in the 'sync_jobs' table.
    await supabase.from("sync_jobs").insert({
      user_id: account.user_id,
      social_account_id: account.id,
      status: "failed",
      // Use the payload field to store rich error information.
      payload: { 
        error_message: err.message,
        operation: 'token_refresh',
        platform: account.platform,
      },
    });
  }
}
