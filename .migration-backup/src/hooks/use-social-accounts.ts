// Hooks React pour la gestion des comptes sociaux
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  SocialAccountsService,
  SocialPostsService,
} from "@/lib/social/database";
import type { Database } from "@/lib/supabase/types";

type SocialAccount = Database["public"]["Tables"]["social_accounts"]["Row"];
type SocialPost = Database["public"]["Tables"]["posts"]["Row"];
type SyncJob = Database["public"]["Tables"]["sync_jobs"]["Row"];
type SyncJobInsert = Database["public"]["Tables"]["sync_jobs"]["Insert"];

export type SocialPlatform = "tiktok" | "instagram" | "facebook";

export type SeoOptimizationInput = {
  handle: string;
  niche: string;
  platform: SocialPlatform;
};

export type AIOptimizationRecommendations = {
  score: number;
  recommendations: string[];
};

export type SeoOptimizationResponse = AIOptimizationRecommendations & {
  bio_optimization?: string;
  content_strategy?: string;
  growth_tips?: string[];
  audience_insights?: { age: string; gender: string; location: string };
  content_pillars?: string[];
};

async function fetchSeoOptimization(
  input: SeoOptimizationInput
): Promise<SeoOptimizationResponse> {
  const { handle, niche, platform } = input;

  const { data, error } = await supabase.functions.invoke(
    "analyze-profile",
    {
      body: { handle, niche, platform },
    }
  );

  if (error) throw error;

  return data as SeoOptimizationResponse;
}

/* =========================================================
   QUERY KEY CENTRALISÉ (FIX IMPORTANT POUR never[])
========================================================= */
const syncAccountsKey = (
  userId?: string,
  accountIds?: string[]
) =>
  ["syncAccounts", userId, accountIds?.join(",") ?? ""] as const;

/* =========================================================
   SOCIAL ACCOUNTS
========================================================= */
export function useSocialAccounts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery<SocialAccount[]>(({
    queryKey: ["socialAccounts", user?.id],
    queryFn: () =>
      user
        ? SocialAccountsService.getUserAccounts(user.id)
        : Promise.resolve([]),
    enabled: !!user,
    staleTime: 1000 * 30,
    retry: 2,
    refetchOnWindowFocus: true,
  }));

  const createAccountMutation = useMutation({
    mutationFn: SocialAccountsService.createAccount,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["socialAccounts", user?.id],
      }),
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({
      accountId,
      updates,
    }: {
      accountId: string;
      updates: Database["public"]["Tables"]["social_accounts"]["Update"];
    }) => SocialAccountsService.updateAccount(accountId, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["socialAccounts", user?.id],
      }),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: SocialAccountsService.deleteAccount,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["socialAccounts", user?.id],
      }),
  });

  return {
    accounts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createAccount: createAccountMutation.mutate,
    updateAccount: updateAccountMutation.mutate,
    deleteAccount: deleteAccountMutation.mutate,
    isCreating: createAccountMutation.isPending,
    isUpdating: updateAccountMutation.isPending,
    isDeleting: deleteAccountMutation.isPending,
  };
}

/* =========================================================
   SOCIAL POSTS
========================================================= */
export function useSocialPosts(accountId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<SocialPost[]>(({
    queryKey: ["socialPosts", accountId],
    queryFn: () =>
      accountId
        ? SocialPostsService.getAccountPosts(accountId)
        : Promise.resolve([]),
    enabled: !!accountId,
    staleTime: 1000 * 30,
    retry: 2,
    refetchInterval: 20_000,
  }));

  const createPostMutation = useMutation({
    mutationFn: SocialPostsService.createPost,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["socialPosts", accountId],
      }),
  });

  const updatePostMutation = useMutation({
    mutationFn: ({
      postId,
      updates,
    }: {
      postId: string;
      updates: Database["public"]["Tables"]["posts"]["Update"];
    }) => SocialPostsService.updatePost(postId, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["socialPosts", accountId],
      }),
  });

  const deletePostMutation = useMutation({
    mutationFn: SocialPostsService.deletePost,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["socialPosts", accountId],
      }),
  });

  return {
    posts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createPost: createPostMutation.mutate,
    updatePost: updatePostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  };
}

/* =========================================================
   PLATFORM ACCOUNTS
========================================================= */
export function usePlatformAccounts(platform: string) {
  const { user } = useAuth();

  const query = useQuery<SocialAccount[]>(({
    queryKey: ["platformAccounts", user?.id, platform],
    queryFn: () =>
      user
        ? SocialAccountsService.getAccountsByPlatform(user.id, platform)
        : Promise.resolve([]),
    enabled: !!user,
    staleTime: 1000 * 60,
    retry: 2,
  }));

  return {
    accounts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

/* =========================================================
   SEO OPTIMIZATION
========================================================= */
export function useSeoOptimization(input?: SeoOptimizationInput) {
  const query = useQuery<SeoOptimizationResponse>(({
    queryKey: ["seoOptimization", input?.handle, input?.niche, input?.platform],
    queryFn: () => {
      if (!input) throw new Error("Missing input");
      return fetchSeoOptimization(input);
    },
    enabled: false,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  }));

  return {
    seoOptimization: query.data || null,
    isLoading: query.isFetching,
    error: query.error,
    refresh: query.refetch,
    analyze: query.refetch,
  };
}

/* =========================================================
   SYNC ACCOUNTS (FIX COMPLET)
========================================================= */

/* 🔥 FIX IMPORTANT : context typé */
type SyncMutationContext = {
  previousData?: SyncJob[];
};

export function useSyncAccounts(accountId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { accounts, isLoading: accountsLoading, error: accountsError } =
    useSocialAccounts();

  const accountIds = useMemo(() => {
    if (accountId) return [accountId];
    return accounts.map((a) => a.id);
  }, [accountId, accounts]);

  const queryKey = syncAccountsKey(user?.id, accountIds);
  const enabled = !!user?.id && accountIds.length > 0;

  const query = useQuery<SyncJob[]>(({
    queryKey,
    queryFn: async () => {
      if (!enabled) return [];

      const { data, error } = await supabase
        .from("sync_jobs")
        .select("*")
        .in("account_id", accountIds)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as SyncJob[];
    },
    enabled,
    staleTime: 1000 * 15,
    retry: 2,
    refetchInterval: 15_000,
  }));

  const scheduleMutation = useMutation<
    SyncJob[],
    unknown,
    {
      accountId?: string;
      platform?: SocialPlatform;
      jobType?: "analytics" | "posts" | "comments" | "accounts";
    },
    SyncMutationContext
  >(({
    mutationFn: async ({ accountId: targetId, platform, jobType }) => {
      const targetIds = targetId ? [targetId] : accountIds;

      const jobs: SyncJobInsert[] = targetIds.map((id) => ({
        account_id: id,
        platform:
          platform ||
          accounts.find((a) => a.id === id)?.platform ||
          null,
        job_type: jobType ?? "analytics",
        payload: {
          requested_by: user?.id,
          requested_at: new Date().toISOString(),
        },
        scheduled_at: new Date().toISOString(),
        status: "pending",
      }));

      const { data, error } = await supabase
        .from("sync_jobs")
        .insert(jobs)
        .select();

      if (error) throw error;
      return (data ?? []) as SyncJob[];
    },

    onMutate: async (newSync): Promise<SyncMutationContext> => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<SyncJob[]>(queryKey);

      if (previousData) {
        queryClient.setQueryData<SyncJob[]>(
          queryKey,
          [
            ...previousData,
            ...accountIds.map(
              (id): SyncJob => ({
                id: `temp-${id}-${Date.now()}`,
                account_id: id,
                platform:
                  newSync.platform ||
                  accounts.find((a) => a.id === id)?.platform ||
                  null,
                job_type: newSync.jobType ?? "analytics",
                payload: {
                  requested_by: user?.id,
                  requested_at: new Date().toISOString(),
                },
                status: "pending",
                scheduled_at: new Date().toISOString(),
                retries: 0,
                max_retries: 5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
            ),
          ]
        );
      }

      return { previousData };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousData) {
        queryClient.setQueryData(queryKey, ctx.previousData);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  }));

  return {
    syncJobs: query.data || [],
    isLoading: query.isLoading || accountsLoading,
    error: query.error || accountsError,
    scheduleSync: scheduleMutation.mutate,
    isScheduling: scheduleMutation.isPending,
    scheduleError: scheduleMutation.error,
    refresh: query.refetch,
  };
}
