/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase";
import { useAuth } from "@/lib/auth";
import { useNetworkStatus } from "@/use-network-status";
import useSyncStatus from "@/hooks/use-sync-status";

type AppStatusContextType = {
  isOnline: boolean;
  authLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  backendAvailable: boolean;
  backendLoading: boolean;
  backendError: string | null;
  syncActive: boolean;
  syncJobsCount: number;
  pendingSyncJobs: number;
  failedSyncJobs: number;
  refreshBackendStatus: () => void;
};

const defaultContext: AppStatusContextType = {
  isOnline: true,
  authLoading: true,
  isAuthenticated: false,
  userId: null,
  backendAvailable: false,
  backendLoading: false,
  backendError: null,
  syncActive: false,
  syncJobsCount: 0,
  pendingSyncJobs: 0,
  failedSyncJobs: 0,
  refreshBackendStatus: () => {},
};

const AppStatusContext = createContext<AppStatusContextType>(defaultContext);

export function AppStatusProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const isOnline = useNetworkStatus();
  const { jobs = [] } = useSyncStatus(user?.id);

  const backendQuery = useQuery<boolean>({
    queryKey: ["backendHealth"],
    queryFn: async () => {
      const { error } = await supabase.from("trends").select("id").limit(1);
      if (error) {
        throw error;
      }
      return true;
    },
    enabled: isOnline,
    staleTime: 1000 * 30,
    refetchInterval: 15000,
    retry: 1,
  });

  const backendAvailable = isOnline && !backendQuery.isError;
  const backendError = backendQuery.error?.message ?? null;
  const pendingSyncJobs = jobs.filter((job) => job.status === "pending").length;
  const failedSyncJobs = jobs.filter((job) => job.status === "failed").length;
  const syncActive = jobs.some((job) => job.status === "pending" || job.status === "in_progress");

  return (
    <AppStatusContext.Provider
      value={{
        isOnline,
        authLoading,
        isAuthenticated: !!user,
        userId: user?.id ?? null,
        backendAvailable,
        backendLoading: backendQuery.isLoading,
        backendError,
        syncActive,
        syncJobsCount: jobs.length,
        pendingSyncJobs,
        failedSyncJobs,
        refreshBackendStatus: backendQuery.refetch,
      }}
    >
      {children}
    </AppStatusContext.Provider>
  );
}

export function useAppStatus() {
  return useContext(AppStatusContext);
}
