import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase";

export function useSyncStatus(userId?: string) {
  const query = useQuery(
    ["syncJobs", userId],
    async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("sync_jobs")
        .select("*")
        .or(`account_id.eq.${userId},payload->>user_id.eq.${userId}`)
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    { enabled: !!userId, refetchInterval: 5000 },
  );

  return { jobs: query.data || [], isLoading: query.isLoading, error: query.error };
}

export default useSyncStatus;
