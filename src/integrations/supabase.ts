import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Utilisation de .trim() pour éliminer les espaces accidentels sur Netlify
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

// Validation silencieuse pour éviter le crash brutal, mais log d'erreur clair
if (!supabaseUrl.startsWith('http')) {
  console.error("Supabase Error: Invalid VITE_SUPABASE_URL format. Verify your Netlify environment variables.");
}

// Export centralisé unique
// Note: Si d'autres fichiers utilisaient 'wn', ils doivent maintenant importer 'supabase'
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});