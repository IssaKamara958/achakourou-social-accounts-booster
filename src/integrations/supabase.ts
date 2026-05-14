import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

// Vérification sans bloquer l'exécution
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
  console.warn(
    'ATTENTION: Configuration Supabase manquante ou fictive. L’authentification ne fonctionnera pas tant que vous n’aurez pas rempli les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env.'
  );
}

// Utilisation d'un pattern Singleton robuste pour Vite/HMR
const getSupabaseClient = () => {
  if (import.meta.env.DEV && (globalThis as any).__supabase_instance) {
    return (globalThis as any).__supabase_instance;
  }

  const client = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  if (import.meta.env.DEV) {
    (globalThis as any).__supabase_instance = client;
  }

  return client;
};

export const supabase = getSupabaseClient();
