
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // Ne pas jeter d'erreur si le profil n'est pas trouvé
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data;
};

export const useProfile = () => {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery<Profile | null>({
    queryKey: ["profile", user?.id],
    queryFn: () => (user ? fetchProfile(user.id) : Promise.resolve(null)),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    profile: query.data,
    isLoading: query.isLoading || authLoading,
    error: query.error,
  };
};
