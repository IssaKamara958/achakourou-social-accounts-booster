// Hooks React pour la gestion des comptes sociaux
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  SocialAccountsService,
  SocialPostsService,
  SocialCommentsService,
  SocialAnalyticsService,
} from "@/lib/social/database";
import type {
  SocialAccount,
  SocialPost,
  SocialComment,
  SocialAnalytics,
  SocialPlatform,
  AIOptimizationRecommendations,
} from "@/lib/social/types";
import type { SyncJob } from "@/lib/sync/types";

export type SeoOptimizationInput = {
  handle: string;
  niche: string;
  platform: SocialPlatform;
};

export type SeoOptimizationResponse = AIOptimizationRecommendations & {
  bio_optimization?: string;
  content_strategy?: string;
  growth_tips?: string[];
  audience_insights?: { age: string; gender: string; location: string };
  content_pillars?: string[];
};

async function fetchSeoOptimization(input: SeoOptimizationInput): Promise<SeoOptimizationResponse> {
  const { handle, niche, platform } = input;

  const { data, error } = await supabase.functions.invoke("analyze-profile", {
    body: { handle, niche, platform },
  });

  if (error) {
    throw error;
  }

  return data as SeoOptimizationResponse;
}

/**
 * Hook pour récupérer et gérer les comptes sociaux d'un utilisateur
 */
export function useSocialAccounts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery<SocialAccount[]>({
    queryKey: ["socialAccounts", user?.id],
    queryFn: () => (user ? SocialAccountsService.getUserAccounts(user.id) : Promise.resolve([])),
    enabled: !!user,
    staleTime: 1000 * 30,
    retry: 2,
    refetchOnWindowFocus: "always",
  });

  const createAccountMutation = useMutation<
    unknown,
    unknown,
    Omit<SocialAccount, "id" | "created_at" | "updated_at">
  >({
    mutationFn: (accountData) => SocialAccountsService.createAccount(accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialAccounts", user?.id] });
    },
  });

  const updateAccountMutation = useMutation<
    unknown,
    unknown,
    { accountId: string; updates: Partial<SocialAccount> }
  >({
    mutationFn: ({ accountId, updates }) => SocialAccountsService.updateAccount(accountId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialAccounts", user?.id] });
    },
  });

  const deleteAccountMutation = useMutation<void, unknown, string>({
    mutationFn: (accountId) => SocialAccountsService.deleteAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialAccounts", user?.id] });
    },
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

/**
 * Hook pour récupérer et gérer les publications d'un compte
 */
export function useSocialPosts(accountId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<SocialPost[]>({
    queryKey: ["socialPosts", accountId],
    queryFn: () =>
      accountId ? SocialPostsService.getAccountPosts(accountId) : Promise.resolve([]),
    enabled: !!accountId,
    staleTime: 1000 * 30,
    retry: 2,
    refetchInterval: 20_000,
  });

  const createPostMutation = useMutation<
    unknown,
    unknown,
    Omit<SocialPost, "id" | "created_at" | "updated_at">
  >({
    mutationFn: (postData) => SocialPostsService.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialPosts", accountId] });
    },
  });

  const updatePostMutation = useMutation<
    unknown,
    unknown,
    { postId: string; updates: Partial<SocialPost> }
  >({
    mutationFn: ({ postId, updates }) => SocialPostsService.updatePost(postId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialPosts", accountId] });
    },
  });

  const publishPostMutation = useMutation<
    unknown,
    unknown,
    { postId: string; externalId?: string }
  >({
    mutationFn: ({ postId, externalId }) => SocialPostsService.publishPost(postId, externalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialPosts", accountId] });
    },
  });

  const deletePostMutation = useMutation<void, unknown, string>({
    mutationFn: (postId) => SocialPostsService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialPosts", accountId] });
    },
  });

  return {
    posts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createPost: createPostMutation.mutate,
    updatePost: updatePostMutation.mutate,
    publishPost: publishPostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isPublishing: publishPostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  };
}

/**
 * Hook pour récupérer les commentaires d'une publication
 */
export function useSocialComments(postId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<SocialComment[]>({
    queryKey: ["socialComments", postId],
    queryFn: () => (postId ? SocialCommentsService.getPostComments(postId) : Promise.resolve([])),
    enabled: !!postId,
    staleTime: 1000 * 10,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const updateCommentMutation = useMutation<
    unknown,
    unknown,
    { commentId: string; updates: Partial<SocialComment> }
  >({
    mutationFn: ({ commentId, updates }) => SocialCommentsService.updateComment(commentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialComments", postId] });
    },
  });

  return {
    comments: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    updateComment: updateCommentMutation.mutate,
    isUpdating: updateCommentMutation.isPending,
  };
}

/**
 * Hook pour récupérer les analytics d'un compte
 */
export function useSocialAnalytics(accountId?: string, startDate?: string, endDate?: string) {
  const query = useQuery<SocialAnalytics[]>({
    queryKey: ["socialAnalytics", accountId, startDate, endDate],
    queryFn: () =>
      accountId
        ? SocialAnalyticsService.getAccountAnalytics(accountId, startDate, endDate)
        : Promise.resolve([]),
    enabled: !!accountId,
    staleTime: 1000 * 30,
    retry: 2,
    refetchInterval: 20_000,
    refetchOnWindowFocus: "always",
  });

  return {
    analytics: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

/**
 * Hook pour récupérer les comptes d'une plateforme spécifique
 */
export function usePlatformAccounts(platform: SocialPlatform) {
  const { user } = useAuth();

  const query = useQuery<SocialAccount[]>({
    queryKey: ["platformAccounts", user?.id, platform],
    queryFn: () =>
      user ? SocialAccountsService.getAccountsByPlatform(user.id, platform) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 1000 * 60,
    retry: 2,
  });

  return {
    accounts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useSeoOptimization(input?: SeoOptimizationInput) {
  const query = useQuery<SeoOptimizationResponse>({
    queryKey: ["seoOptimization", input?.handle, input?.niche, input?.platform],
    queryFn: async () => {
      if (!input) throw new Error("SEO optimization input is required");
      return fetchSeoOptimization(input);
    },
    enabled: false,
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });

  return {
    seoOptimization: query.data || null,
    isLoading: query.isFetching,
    error: query.error,
    refresh: query.refetch,
    analyze: async () => query.refetch(),
  };
}

export function useSyncAccounts(accountId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    accounts,
    isLoading: accountsLoading,
    error: accountsError,
  } = useSocialAccounts() as {
    accounts: SocialAccount[];
    isLoading: boolean;
    error: unknown;
  };

  const accountIds = useMemo<string[]>(() => {
    if (accountId) return [accountId];
    return accounts.map((account) => account.id);
  }, [accountId, accounts]);

  const enabled = !!user?.id && accountIds.length > 0;

  const query = useQuery<SyncJob[]>({
    queryKey: ["syncAccounts", user?.id, accountIds.join(",")],
    queryFn: async () => {
      if (!enabled) return [];
      const { data, error } = await (supabase.from("sync_jobs" as any) as any)
        .select("*")
        .in("account_id", accountIds)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      return (data || []) as SyncJob[];
    },
    enabled,
    staleTime: 1000 * 15,
    retry: 2,
    refetchInterval: 15_000,
  });

  const scheduleMutation = useMutation<
    SyncJob[],
    unknown,
    {
      accountId?: string;
      platform?: SocialPlatform;
      jobType?: "analytics" | "posts" | "comments" | "accounts";
    }
  >({
    mutationFn: async ({
      accountId: targetAccountId,
      platform,
      jobType = "analytics",
    }: {
      accountId?: string;
      platform?: SocialPlatform;
      jobType?: "analytics" | "posts" | "comments" | "accounts";
    }) => {
      const targetIds = targetAccountId ? [targetAccountId] : accountIds;
      if (targetIds.length === 0) {
        throw new Error("No account selected for synchronization");
      }

      const jobs = targetIds.map((id) => ({
        account_id: id,
        platform: platform || accounts.find((account) => account.id === id)?.platform || null,
        job_type: jobType,
        payload: { requested_by: user?.id, requested_at: new Date().toISOString() },
        scheduled_at: new Date().toISOString(),
        status: "pending" as const,
      })) as Array<{
        account_id: string;
        platform: SocialPlatform | null;
        job_type: "analytics" | "posts" | "comments" | "accounts";
        payload: Record<string, unknown>;
        scheduled_at: string;
        status: "pending";
      }>;

      const { data, error } = await (supabase.from("sync_jobs" as any) as any)
        .insert(jobs)
        .select();
      if (error) throw error;
      return (data || []) as SyncJob[];
    },
    onMutate: async (newSync: {
      accountId?: string;
      platform?: SocialPlatform;
      jobType?: "analytics" | "posts" | "comments" | "accounts";
    }) => {
      await queryClient.cancelQueries({
        queryKey: ["syncAccounts", user?.id, accountIds.join(",")],
      });
      const previousData = queryClient.getQueryData<SyncJob[]>([
        "syncAccounts",
        user?.id,
        accountIds.join(","),
      ]);
      if (previousData) {
        queryClient.setQueryData<SyncJob[]>(
          ["syncAccounts", user?.id, accountIds.join(",")],
          [
            ...previousData,
            ...accountIds.map(
              (id) =>
                ({
                  id: `temp-${id}-${Date.now()}`,
                  account_id: id,
                  platform:
                    newSync.platform ||
                    accounts.find((account) => account.id === id)?.platform ||
                    null,
                  job_type: newSync.jobType || "analytics",
                  payload: { requested_by: user?.id, requested_at: new Date().toISOString() },
                  status: "pending" as const,
                  scheduled_at: new Date().toISOString(),
                  retries: 0,
                  max_retries: 5,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }) as SyncJob,
            ),
          ],
        );
      }
      return { previousData };
    },
    onError: (
      _error: unknown,
      _variables: {
        accountId?: string;
        platform?: SocialPlatform;
        jobType?: "analytics" | "posts" | "comments" | "accounts";
      },
      context: any,
    ) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["syncAccounts", user?.id, accountIds.join(",")],
          context.previousData,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syncAccounts", user?.id, accountIds.join(",")] });
    },
  });

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
