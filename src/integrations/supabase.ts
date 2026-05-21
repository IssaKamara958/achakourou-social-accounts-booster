import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";

// Warning si env manquantes
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project-id")) {
  console.warn(
    "⚠️ Supabase URL ou Anon Key manquante. Vérifie ton fichier .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)"
  );
}

// Singleton global (évite re-init en dev avec HMR)
declare global {
  // eslint-disable-next-line no-var
  var __supabase_client: ReturnType<typeof createClient> | undefined;
}

const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
};

let supabase: ReturnType<typeof createClient>;

if (import.meta.env.DEV) {
  if (!globalThis.__supabase_client) {
    globalThis.__supabase_client = createClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "placeholder-anon-key",
      options
    );
  }

  supabase = globalThis.__supabase_client;
} else {
  supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-anon-key",
    options
  );
}

export { supabase };