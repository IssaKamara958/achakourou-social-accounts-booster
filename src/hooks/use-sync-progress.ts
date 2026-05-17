import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase";
import { useAuth } from "@/lib/auth";

type SyncEvent = {
  type: "INSERT" | "UPDATE" | "DELETE";
  new?: any;
  old?: any;
};

export function useSyncProgress() {
  const { user } = useAuth();
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`public:sync_jobs:user:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sync_jobs", filter: `account_id=eq.${user.id}` },
        (payload) => {
          const ev: SyncEvent = {
            type: payload.event.toUpperCase() as any,
            new: payload.new,
            old: payload.old,
          };
          setEvents((s) => [ev, ...s].slice(0, 50));
          // Invalider cache pour que UI mette à jour
          queryClient.invalidateQueries({ queryKey: ["syncJobs", user.id] });
        },
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        // noop
      }
    };
  }, [user?.id]);

  return { events };
}

export default useSyncProgress;
