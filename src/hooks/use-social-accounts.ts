// Hooks React pour la gestion des comptes sociaux
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import {
  SocialAccountsService,
  SocialPostsService,
  SocialCommentsService,
  SocialAnalyticsService,
} from '@/lib/social/database';
import { SocialAccount, SocialPost, SocialPlatform } from '@/lib/social/types';

/**
 * Hook pour récupérer et gérer les comptes sociaux d'un utilisateur
 */
export function useSocialAccounts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['socialAccounts', user?.id],
    queryFn: () => (user ? SocialAccountsService.getUserAccounts(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const createAccountMutation = useMutation({
    mutationFn: (accountData) => SocialAccountsService.createAccount(accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts', user?.id] });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ accountId, updates }) => SocialAccountsService.updateAccount(accountId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts', user?.id] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (accountId: string) => SocialAccountsService.deleteAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts', user?.id] });
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

  const query = useQuery({
    queryKey: ['socialPosts', accountId],
    queryFn: () => (accountId ? SocialPostsService.getAccountPosts(accountId) : Promise.resolve([])),
    enabled: !!accountId,
  });

  const createPostMutation = useMutation({
    mutationFn: (postData) => SocialPostsService.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts', accountId] });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ postId, updates }) => SocialPostsService.updatePost(postId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts', accountId] });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: ({ postId, externalId }) => SocialPostsService.publishPost(postId, externalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts', accountId] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => SocialPostsService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts', accountId] });
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

  const query = useQuery({
    queryKey: ['socialComments', postId],
    queryFn: () => (postId ? SocialCommentsService.getPostComments(postId) : Promise.resolve([])),
    enabled: !!postId,
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, updates }) => SocialCommentsService.updateComment(commentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialComments', postId] });
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
  const query = useQuery({
    queryKey: ['socialAnalytics', accountId, startDate, endDate],
    queryFn: () =>
      accountId ? SocialAnalyticsService.getAccountAnalytics(accountId, startDate, endDate) : Promise.resolve([]),
    enabled: !!accountId,
  });

  return {
    analytics: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook pour récupérer les comptes d'une plateforme spécifique
 */
export function usePlatformAccounts(platform: SocialPlatform) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['platformAccounts', user?.id, platform],
    queryFn: () => (user ? SocialAccountsService.getAccountsByPlatform(user.id, platform) : Promise.resolve([])),
    enabled: !!user,
  });

  return {
    accounts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
