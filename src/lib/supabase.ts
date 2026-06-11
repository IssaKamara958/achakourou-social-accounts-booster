import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { env } from "@/config/env";

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error("Missing Supabase URL or anon key. Check your .env file and the VITE_ variables.");
}

export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabaseAnonKey
);
