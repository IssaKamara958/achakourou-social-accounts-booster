import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Validate the Authorization: Bearer <jwt> header for server-route handlers.
 * Returns an authenticated Supabase client scoped to the user (RLS applies)
 * and the resolved userId. Throws a Response on failure.
 */
export async function requireUser(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new Response("Unauthorized", { status: 401 });
  }
  const token = auth.slice(7).trim();
  if (!token) throw new Response("Unauthorized", { status: 401 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Response("Server misconfigured", { status: 500 });

  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return { supabase, userId: data.claims.sub as string };
}