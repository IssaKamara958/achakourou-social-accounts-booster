// Types TypeScript pour les intégrations sociales

export type SocialPlatform = "facebook" | "instagram" | "tiktok";

export type PostStatus = "draft" | "scheduled" | "published" | "failed";

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  account_name: string;
  account_id: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  token_type: string;
  scope?: string;
  connected: boolean;
  last_sync_at?: string;
  profile_picture?: string;
  followers_count: number;
  verified: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  account_id: string;
  external_post_id?: string;
  platform: SocialPlatform;
  caption?: string;
  hashtags: string[];
  media_urls: string[];
  media_types: string[];
  status: PostStatus;
  scheduled_at?: string;
  published_at?: string;
  cross_posted: boolean;
  cross_posted_platforms: SocialPlatform[];
  analytics: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SocialComment {
  id: string;
  post_id: string;
  external_comment_id?: string;
  external_author_id?: string;
  author_username: string;
  author_profile_picture?: string;
  content: string;
  likes_count: number;
  replies_count: number;
  sentiment: "positive" | "neutral" | "negative";
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SocialAnalytics {
  id: string;
  account_id: string;
  post_id?: string;
  platform: SocialPlatform;
  date: string;
  reach: number;
  impressions: number;
  engagement: number;
  engagement_rate: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  watch_time: number;
  video_views: number;
  followers_gained: number;
  followers_lost: number;
  net_followers_change: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OAuthConfig {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope: string[];
}

export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

export interface SocialAuthResponse {
  success: boolean;
  message: string;
  account?: SocialAccount;
  error?: string;
}

export interface SyncQueueItem {
  id: string;
  account_id: string;
  sync_type: "posts" | "comments" | "analytics" | "followers";
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  last_attempted_at?: string;
  retry_count: number;
  next_retry_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIOptimizationRecommendations {
  hooks_score: number;
  hooks_suggestions: string[];
  hashtags_score: number;
  hashtags_suggestions: string[];
  posting_time_score: number;
  optimal_posting_times: string[];
  seo_score: number;
  seo_suggestions: string[];
  cta_score: number;
  cta_suggestions: string[];
  overall_viral_score: number;
  audience_engagement_prediction: number;
  estimated_reach: number;
}
