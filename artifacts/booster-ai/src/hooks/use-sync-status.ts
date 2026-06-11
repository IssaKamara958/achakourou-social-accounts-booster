import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useSyncStatus(userId?: string) {
  const query = useQuery({
    queryKey: ["syncJobs", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase.rpc("get_sync_jobs", { uid: userId });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    refetchInterval: 5000,
  });

  return { jobs: query.data || [], isLoading: query.isLoading, error: query.error };
}

export default useSyncStatus;
