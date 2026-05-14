import React, {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase';

interface AuthContextType {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fetch initial session
    supabase.auth.getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        if (mounted) {
          setSession(session);
        }
      })
      .catch((err: any) => {
        if (err.status === 429) {
          console.error('Limite de requêtes atteinte. Veuillez réessayer dans quelques minutes.');
        } else {
          console.error('Erreur Auth initiale:', err.message);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Set up real-time listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setLoading(false); // Ensure loading is false after any auth state change
      }
    );

    // Cleanup the subscription when the component unmounts
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const value = {
    session,
    user: session?.user || null,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}