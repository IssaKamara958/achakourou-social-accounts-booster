// Service de gestion des comptes sociaux (CRUD) via Supabase
import { supabase } from "@/integrations/supabase";
import type { SocialAccount, SocialPost, SocialComment, SocialAnalytics } from "./types";

export class SocialAccountsService {
  /**
   * Crée un nouveau compte social connecté
   */
  static async createAccount(accountData: Omit<SocialAccount, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("social_accounts")
      .insert([accountData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Récupère tous les comptes sociaux d'un utilisateur
   */
  static async getUserAccounts(userId: string): Promise<SocialAccount[]> {
    const { data, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Récupère un compte spécifique
   */
  static async getAccount(accountId: string): Promise<SocialAccount> {
    const { data, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Récupère les comptes d'une plateforme spécifique
   */
  static async getAccountsByPlatform(userId: string, platform: string): Promise<SocialAccount[]> {
    const { data, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", platform);

    if (error) throw error;
    return data || [];
  }

  /**
   * Met à jour un compte social
   */
  static async updateAccount(accountId: string, updates: Partial<SocialAccount>) {
    const { data, error } = await supabase
      .from("social_accounts")
      .update(updates)
      .eq("id", accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mets à jour le token d'accès
   */
  static async updateToken(
    accountId: string,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: string,
  ) {
    const updates: any = { access_token: accessToken };
    if (refreshToken) updates.refresh_token = refreshToken;
    if (expiresAt) updates.token_expires_at = expiresAt;

    return this.updateAccount(accountId, updates);
  }

  /**
   * Mets à jour la date de dernière synchronisation
   */
  static async updateLastSync(accountId: string) {
    return this.updateAccount(accountId, {
      last_sync_at: new Date().toISOString(),
    });
  }

  /**
   * Supprime un compte social
   */
  static async deleteAccount(accountId: string) {
    const { error } = await supabase.from("social_accounts").delete().eq("id", accountId);

    if (error) throw error;
  }

  /**
   * Met à jour le statut de connexion
   */
  static async setConnected(accountId: string, connected: boolean) {
    return this.updateAccount(accountId, { connected });
  }

  /**
   * Mets à jour les followers count
   */
  static async updateFollowersCount(accountId: string, count: number) {
    return this.updateAccount(accountId, { followers_count: count });
  }

  /**
   * Mets à jour les données de profil
   */
  static async updateProfileData(
    accountId: string,
    profilePicture?: string,
    followersCount?: number,
    metadata?: Record<string, any>,
  ) {
    const updates: any = {};
    if (profilePicture) updates.profile_picture = profilePicture;
    if (followersCount !== undefined) updates.followers_count = followersCount;
    if (metadata) updates.metadata = metadata;

    return this.updateAccount(accountId, updates);
  }
}

export class SocialPostsService {
  /**
   * Crée une nouvelle publication
   */
  static async createPost(postData: Omit<SocialPost, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("social_posts")
      .insert([postData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Récupère les publications d'un compte
   */
  static async getAccountPosts(accountId: string, status?: string): Promise<SocialPost[]> {
    let query = supabase.from("social_posts").select("*").eq("account_id", accountId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Récupère une publication spécifique
   */
  static async getPost(postId: string): Promise<SocialPost> {
    const { data, error } = await supabase
      .from("social_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Met à jour une publication
   */
  static async updatePost(postId: string, updates: Partial<SocialPost>) {
    const { data, error } = await supabase
      .from("social_posts")
      .update(updates)
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Publié une publication
   */
  static async publishPost(postId: string, externalPostId?: string) {
    return this.updatePost(postId, {
      status: "published",
      published_at: new Date().toISOString(),
      external_post_id: externalPostId,
    });
  }

  /**
   * Programme une publication
   */
  static async schedulePost(postId: string, scheduledAt: string) {
    return this.updatePost(postId, {
      status: "scheduled",
      scheduled_at: scheduledAt,
    });
  }

  /**
   * Supprime une publication
   */
  static async deletePost(postId: string) {
    const { error } = await supabase.from("social_posts").delete().eq("id", postId);

    if (error) throw error;
  }

  /**
   * Mets à jour l'analytics d'une publication
   */
  static async updatePostAnalytics(postId: string, analytics: Record<string, any>) {
    return this.updatePost(postId, { analytics });
  }

  /**
   * Récupère les brouillons
   */
  static async getDrafts(accountId: string): Promise<SocialPost[]> {
    return this.getAccountPosts(accountId, "draft");
  }

  /**
   * Récupère les publications programmées
   */
  static async getScheduled(accountId: string): Promise<SocialPost[]> {
    return this.getAccountPosts(accountId, "scheduled");
  }

  /**
   * Récupère les publications publiées
   */
  static async getPublished(accountId: string): Promise<SocialPost[]> {
    return this.getAccountPosts(accountId, "published");
  }
}

export class SocialCommentsService {
  /**
   * Crée un commentaire
   */
  static async createComment(commentData: Omit<SocialComment, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("social_comments")
      .insert([commentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Récupère les commentaires d'une publication
   */
  static async getPostComments(postId: string): Promise<SocialComment[]> {
    const { data, error } = await supabase
      .from("social_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Met à jour un commentaire (sentiment, etc.)
   */
  static async updateComment(commentId: string, updates: Partial<SocialComment>) {
    const { data, error } = await supabase
      .from("social_comments")
      .update(updates)
      .eq("id", commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Synchronise les commentaires (ajoute les manquants)
   */
  static async syncComments(postId: string, externalComments: any[]) {
    const existing = await this.getPostComments(postId);
    const existingIds = new Set(existing.map((c) => c.external_comment_id));

    const newComments = externalComments.filter((ec) => !existingIds.has(ec.id));

    if (newComments.length > 0) {
      const commentsToInsert = newComments.map((comment) => ({
        post_id: postId,
        external_comment_id: comment.id,
        external_author_id: comment.author_id || comment.from?.id,
        author_username: comment.author_name || comment.from?.name || "Unknown",
        author_profile_picture: comment.profile_picture_url,
        content: comment.message || comment.text || "",
        likes_count: comment.likes || 0,
        sentiment: "neutral",
      }));

      const { error } = await supabase.from("social_comments").insert(commentsToInsert);

      if (error) throw error;
    }

    return newComments.length;
  }
}

export class SocialAnalyticsService {
  /**
   * Enregistre les analytics d'un compte
   */
  static async recordAnalytics(
    analyticsData: Omit<SocialAnalytics, "id" | "created_at" | "updated_at">,
  ) {
    const { data, error } = await supabase
      .from("social_analytics")
      .insert([analyticsData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Récupère les analytics d'un compte
   */
  static async getAccountAnalytics(
    accountId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<SocialAnalytics[]> {
    let query = supabase.from("social_analytics").select("*").eq("account_id", accountId);

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error } = await query.order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Récupère les analytics d'une publication
   */
  static async getPostAnalytics(postId: string): Promise<SocialAnalytics[]> {
    const { data, error } = await supabase
      .from("social_analytics")
      .select("*")
      .eq("post_id", postId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Mets à jour les analytics d'un jour
   */
  static async updateDailyAnalytics(analyticsId: string, updates: Partial<SocialAnalytics>) {
    const { data, error } = await supabase
      .from("social_analytics")
      .update(updates)
      .eq("id", analyticsId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Enregistre ou met à jour un résumé analytique quotidien
   */
  static async upsertAnalyticsSummary(
    accountId: string,
    date: string,
    summaryData: Partial<SocialAnalytics>,
  ) {
    const payload = {
      account_id: accountId,
      date,
      total_reach: summaryData.reach || 0,
      total_impressions: summaryData.impressions || 0,
      total_engagement: summaryData.engagement || 0,
      total_likes: summaryData.likes || 0,
      total_comments: summaryData.comments || 0,
      total_shares: summaryData.shares || 0,
      total_saves: summaryData.saves || 0,
      total_clicks: summaryData.clicks || 0,
      total_watch_time: summaryData.watch_time || 0,
      average_engagement_rate: summaryData.engagement_rate || 0,
      net_followers_change: summaryData.net_followers_change || 0,
      metadata: summaryData.metadata || {},
    };

    const { data, error } = await supabase
      .from("social_analytics_summary")
      .upsert(payload, { onConflict: ["account_id", "date"] })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default {
  SocialAccountsService,
  SocialPostsService,
  SocialCommentsService,
  SocialAnalyticsService,
};
