// Exports principaux pour le système social
export type { SocialPlatform, SocialAccount, SocialPost, SocialComment, SocialAnalytics } from './types';

export { OAuthService } from './oauth';
export { FacebookAPI, InstagramAPI, TikTokAPI } from './platforms';
export { SocialAccountsService, SocialPostsService, SocialCommentsService, SocialAnalyticsService } from './database';
export {
  useSocialAccounts,
  useSocialPosts,
  useSocialComments,
  useSocialAnalytics,
  usePlatformAccounts,
} from '@/hooks/use-social-accounts';
