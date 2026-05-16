// Service de synchronisation multi-plateforme
// Gère la récupération de données depuis les APIs sociales

import { SocialAccountsService, SocialPostsService, SocialCommentsService, SocialAnalyticsService } from './database';
import { FacebookAPI, InstagramAPI, TikTokAPI } from './platforms';
import { SocialAccount, SocialPlatform } from './types';
import { supabase } from '@/integrations/supabase';

export class SocialSyncService {
  /**
   * Synchronise tous les comptes d'un utilisateur
   */
  static async syncUserAccounts(userId: string): Promise<void> {
    const accounts = await SocialAccountsService.getUserAccounts(userId);
    
    for (const account of accounts) {
      if (account.connected) {
        await this.syncAccount(account);
      }
    }
  }

  /**
   * Synchronise un compte spécifique
   */
  static async syncAccount(account: SocialAccount): Promise<void> {
    try {
      // Vérifier si le token est expiré
      if (this.isTokenExpired(account.token_expires_at)) {
        if (account.refresh_token) {
          await this.refreshAccountToken(account);
        } else {
          // Token expiré et pas de refresh token disponible
          await SocialAccountsService.setConnected(account.id, false);
          console.warn(`Token expiré pour ${account.account_name}`);
          return;
        }
      }

      // Récupérer les données selon la plateforme
      switch (account.platform) {
        case 'facebook':
          await this.syncFacebookAccount(account);
          break;
        case 'instagram':
          await this.syncInstagramAccount(account);
          break;
        case 'tiktok':
          await this.syncTikTokAccount(account);
          break;
      }

      // Mettre à jour la date de dernière sync
      await SocialAccountsService.updateLastSync(account.id);
    } catch (error) {
      console.error(`Erreur synchronisation ${account.platform}:`, error);
      await this.logSyncError(account.id, error as Error);
    }
  }

  /**
   * Synchronise un compte Facebook
   */
  private static async syncFacebookAccount(account: SocialAccount): Promise<void> {
    const api = new FacebookAPI(account.access_token);

    // Récupérer les posts
    const posts = await api.getPagePosts(account.account_id);
    for (const post of posts) {
      await this.syncFacebookPost(account, post);
    }

    // Récupérer les insights
    const insights = await api.getPageInsights(account.account_id);
    await this.recordAccountAnalytics(account, insights);
  }

  /**
   * Synchronise un post Facebook
   */
  private static async syncFacebookPost(account: SocialAccount, post: any): Promise<void> {
    // Chercher si le post existe déjà
    const existingPost = await supabase
      .from('social_posts')
      .select('id')
      .eq('account_id', account.id)
      .eq('external_post_id', post.id)
      .single();

    if (!existingPost.data) {
      // Créer un nouveau post
      await SocialPostsService.createPost({
        account_id: account.id,
        external_post_id: post.id,
        platform: 'facebook',
        caption: post.message || post.story || '',
        hashtags: this.extractHashtags(post.message || post.story || ''),
        media_urls: [],
        media_types: [],
        status: 'published',
        published_at: post.created_time,
        cross_posted: false,
        cross_posted_platforms: [],
        analytics: {
          likes: post.likes?.summary?.total_count || 0,
          shares: post.shares?.count || 0,
          permalink: post.permalink_url,
        },
        metadata: post,
      });
    } else {
      // Mettre à jour les analytics
      await SocialPostsService.updatePostAnalytics(existingPost.data.id, {
        likes: post.likes?.summary?.total_count || 0,
        shares: post.shares?.count || 0,
      });
    }

    // Synchroniser les commentaires
    if (existingPost.data?.id) {
      const comments = await new FacebookAPI(account.access_token).getPostComments(post.id);
      const syncedCount = await SocialCommentsService.syncComments(
        existingPost.data.id,
        comments
      );
      console.log(`Synced ${syncedCount} new comments for post ${post.id}`);
    }
  }

  /**
   * Synchronise un compte Instagram
   */
  private static async syncInstagramAccount(account: SocialAccount): Promise<void> {
    const api = new InstagramAPI(account.access_token, account.account_id);

    // Récupérer les médias
    const media = await api.getMedia();
    for (const item of media) {
      await this.syncInstagramMedia(account, item);
    }

    // Récupérer les insights du compte
    const insights = await api.getAccountInsights();
    await this.recordAccountAnalytics(account, insights);
  }

  /**
   * Synchronise un média Instagram
   */
  private static async syncInstagramMedia(account: SocialAccount, media: any): Promise<void> {
    const existingPost = await supabase
      .from('social_posts')
      .select('id')
      .eq('account_id', account.id)
      .eq('external_post_id', media.id)
      .single();

    if (!existingPost.data) {
      await SocialPostsService.createPost({
        account_id: account.id,
        external_post_id: media.id,
        platform: 'instagram',
        caption: media.caption || '',
        hashtags: this.extractHashtags(media.caption || ''),
        media_urls: [media.media_url],
        media_types: [media.media_type.toLowerCase()],
        status: 'published',
        published_at: media.timestamp,
        cross_posted: false,
        cross_posted_platforms: [],
        analytics: {
          likes: media.like_count || 0,
          comments: media.comments_count || 0,
          permalink: media.permalink,
        },
        metadata: media,
      });
    }

    // Synchroniser les commentaires
    if (existingPost.data?.id) {
      const comments = await new InstagramAPI(account.access_token, account.account_id).getMediaComments(
        media.id
      );
      await SocialCommentsService.syncComments(existingPost.data.id, comments);
    }
  }

  /**
   * Synchronise un compte TikTok
   */
  private static async syncTikTokAccount(account: SocialAccount): Promise<void> {
    const api = new TikTokAPI(account.access_token);

    // Récupérer les vidéos
    const videos = await api.getUserVideos();
    for (const video of videos) {
      await this.syncTikTokVideo(account, video);
    }
  }

  /**
   * Synchronise une vidéo TikTok
   */
  private static async syncTikTokVideo(account: SocialAccount, video: any): Promise<void> {
    const existingPost = await supabase
      .from('social_posts')
      .select('id')
      .eq('account_id', account.id)
      .eq('external_post_id', video.video_id)
      .single();

    if (!existingPost.data) {
      const analytics = await new TikTokAPI(account.access_token).getVideoAnalytics(video.video_id);

      await SocialPostsService.createPost({
        account_id: account.id,
        external_post_id: video.video_id,
        platform: 'tiktok',
        caption: video.title || '',
        hashtags: this.extractHashtags(video.title || ''),
        media_urls: [video.video_url],
        media_types: ['video'],
        status: 'published',
        published_at: new Date(video.create_time * 1000).toISOString(),
        cross_posted: false,
        cross_posted_platforms: [],
        analytics: {
          views: analytics.view_count || 0,
          likes: analytics.like_count || 0,
          comments: analytics.comment_count || 0,
          shares: analytics.share_count || 0,
        },
        metadata: video,
      });
    }
  }

  /**
   * Enregistre les analytics du compte
   */
  private static async recordAccountAnalytics(account: SocialAccount, insights: any): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Chercher si l'entrée d'aujourd'hui existe
    const existing = await supabase
      .from('social_analytics')
      .select('id')
      .eq('account_id', account.id)
      .eq('date', today)
      .single();

    const analyticsData = {
      account_id: account.id,
      post_id: null,
      platform: account.platform,
      date: today,
      reach: insights.reach || 0,
      impressions: insights.impressions || 0,
      engagement: insights.engagement || 0,
      followers_gained: insights.followers_gained || 0,
      followers_lost: insights.followers_lost || 0,
      metadata: insights,
    };

    if (existing.data) {
      await SocialAnalyticsService.updateDailyAnalytics(existing.data.id, analyticsData);
    } else {
      await SocialAnalyticsService.recordAnalytics(analyticsData);
    }
  }

  /**
   * Rafraîchit le token d'accès
   */
  private static async refreshAccountToken(account: SocialAccount): Promise<void> {
    try {
      // Importer ici pour éviter les imports circulaires
      const { OAuthService } = await import('./oauth');

      if (!account.refresh_token) {
        throw new Error('No refresh token available');
      }

      const newToken = await OAuthService.refreshToken(account.platform, account.refresh_token);
      await SocialAccountsService.updateToken(
        account.id,
        newToken.access_token,
        newToken.refresh_token,
        newToken.expires_in ? new Date(Date.now() + newToken.expires_in * 1000).toISOString() : undefined
      );
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un token est expiré
   */
  private static isTokenExpired(expiresAt: string | null | undefined): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  /**
   * Extrait les hashtags d'un texte
   */
  private static extractHashtags(text: string): string[] {
    const hashtags = text.match(/#\w+/g) || [];
    return [...new Set(hashtags)]; // Remove duplicates
  }

  /**
   * Enregistre une erreur de synchronisation
   */
  private static async logSyncError(accountId: string, error: Error): Promise<void> {
    try {
      await supabase
        .from('social_sync_queue')
        .insert({
          account_id: accountId,
          sync_type: 'posts',
          status: 'failed',
          error_message: error.message,
          retry_count: 0,
          next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Retry in 5 minutes
        });
    } catch (err) {
      console.error('Error logging sync error:', err);
    }
  }
}

export default SocialSyncService;
