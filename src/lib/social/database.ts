// Service de gestion des comptes sociaux (CRUD) via Supabase
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase/types";

type SocialAccount = Database["public"]["Tables"]["social_accounts"]["Row"];
type SocialAccountInsert = Database["public"]["Tables"]["social_accounts"]["Insert"];
type SocialAccountUpdate = Database["public"]["Tables"]["social_accounts"]["Update"];

type SocialPost = Database["public"]["Tables"]["posts"]["Row"];
type SocialPostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type SocialPostUpdate = Database["public"]["Tables"]["posts"]["Update"];

type SyncJob = Database["public"]["Tables"]["sync_jobs"]["Row"];
type SyncJobInsert = Database["public"]["Tables"]["sync_jobs"]["Insert"];
type SyncJobUpdate = Database["public"]["Tables"]["sync_jobs"]["Update"];

export class SocialAccountsService {
  /**
   * Crée un nouveau compte social connecté
   */
  static async createAccount(accountData: SocialAccountInsert) {
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
  static async updateAccount(accountId: string, updates: SocialAccountUpdate) {
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
    const updates: SocialAccountUpdate = { access_token: accessToken };
    if (refreshToken) updates.refresh_token = refreshToken;
    if (expiresAt) updates.expires_at = expiresAt;

    return this.updateAccount(accountId, updates);
  }

  /**
   * Supprime un compte social
   */
  static async deleteAccount(accountId: string) {
    const { error } = await supabase.from("social_accounts").delete().eq("id", accountId);

    if (error) throw error;
  }
}

export class SocialPostsService {
  /**
   * Crée une nouvelle publication
   */
  static async createPost(postData: SocialPostInsert) {
    const { data, error } = await supabase
      .from("posts")
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
    let query = supabase.from("posts").select("*").eq("social_account_id", accountId);

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
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Met à jour une publication
   */
  static async updatePost(postId: string, updates: SocialPostUpdate) {
    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Supprime une publication
   */
  static async deletePost(postId: string) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) throw error;
  }
}

export class SyncJobsService {
  /**
   * Crée un nouveau job de synchronisation
   */
  static async createJob(jobData: SyncJobInsert) {
    const { data, error } = await supabase
      .from("sync_jobs")
      .insert([jobData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Met à jour un job de synchronisation
   */
  static async updateJob(jobId: string, updates: SyncJobUpdate) {
    const { data, error } = await supabase
      .from("sync_jobs")
      .update(updates)
      .eq("id", jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default {
  SocialAccountsService,
  SocialPostsService,
  SyncJobsService,
};
