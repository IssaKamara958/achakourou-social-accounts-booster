import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Utilisation de .trim() pour éliminer les espaces accidentels sur Netlify
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim(); // Utilisation de ?? pour une meilleure robustesse

// Validation critique : Si l'URL est manquante ou mal formatée, l'application ne peut pas fonctionner.
// Cela empêche createClient de lancer une erreur générique et fournit un message plus clair.
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  const errorMessage = `Supabase Error: Invalid VITE_SUPABASE_URL format. Must be a valid HTTP or HTTPS URL. Got: "${supabaseUrl}". Please verify your Netlify environment variables.`;
  console.error(errorMessage);
  throw new Error(errorMessage); // L'application ne peut pas démarrer sans une URL valide.
}

// Validation critique : La clé anon est nécessaire pour l'authentification.
if (!supabaseAnonKey) {
  const errorMessage = `Supabase Error: VITE_SUPABASE_ANON_KEY is missing. Please verify your Netlify environment variables.`;
  console.error(errorMessage);
  throw new Error(errorMessage); // L'application ne peut pas démarrer sans une clé valide.
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