import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/use-profile";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthCtx = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const { profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (mounted) {
          setSession(data.session ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (mounted) setLoading(false);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (mounted) {
        setSession(s);
      }
    });

    initAuth();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,

        // 🔥 FIX PRINCIPAL ICI
        profile: profile ?? null,

        session,
        loading: loading || profileLoading,

        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);