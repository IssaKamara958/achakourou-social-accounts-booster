// Services API pour interagir avec les plateformes sociales
// Gère les requêtes aux APIs Graph des plateformes

import type { SocialAccount, SocialPost, SocialComment, SocialAnalytics } from "./types";

export class FacebookAPI {
  private accessToken: string;
  private baseUrl = "https://graph.facebook.com/v19.0";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Récupère les informations du profil utilisateur
   */
  async getUserProfile(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/me?fields=id,name,picture,email&access_token=${this.accessToken}`,
    );
    if (!response.ok) throw new Error("Erreur récupération profil Facebook");
    return response.json();
  }

  /**
   * Récupère les pages gérées par l'utilisateur
   */
  async getPages(): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/me/accounts?fields=id,name,picture,followers_count&access_token=${this.accessToken}`,
    );
    if (!response.ok) throw new Error("Erreur récupération pages Facebook");
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Récupère les posts d'une page
   */
  async getPagePosts(pageId: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/${pageId}/posts?fields=id,created_time,message,story,permalink_url,shares,likes.summary(total_count)&access_token=${this.accessToken}`,
    );
    if (!response.ok) throw new Error("Erreur récupération posts Facebook");
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Crée un post sur une page
   */
  async createPost(pageId: string, message: string, mediaUrls?: string[]): Promise<any> {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("access_token", this.accessToken);

    if (mediaUrls && mediaUrls.length > 0) {
      formData.append("link", mediaUrls[0]);
    }

    const response = await fetch(`${this.baseUrl}/${pageId}/feed`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Erreur création post Facebook");
    return response.json();
  }

  /**
   * Supprime un post
   */
  async deletePost(postId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${postId}?access_token=${this.accessToken}`, {
      method: "DELETE",
    });
    return response.ok;
  }

  /**
   * Récupère les insights/analytics d'une page
   */
  async getPageInsights(pageId: string, since?: string, until?: string): Promise<any> {
    const params = new URLSearchParams({
      fields: "page_impressions,page_engaged_users,page_post_engagements,page_fans",
      access_token: this.accessToken,
    });

    if (since) params.append("since", since);
    if (until) params.append("until", until);

    const response = await fetch(`${this.baseUrl}/${pageId}/insights?${params}`);
    if (!response.ok) throw new Error("Erreur récupération insights Facebook");
    return response.json();
  }

  /**
   * Récupère les commentaires d'un post
   */
  async getPostComments(postId: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/${postId}/comments?fields=id,message,from,created_time,like_count&access_token=${this.accessToken}`,
    );
    if (!response.ok) throw new Error("Erreur récupération commentaires Facebook");
    const data = await response.json();
    return data.data || [];
  }
}

export class InstagramAPI {
  private accessToken: string;
  private baseUrl = "https://graph.instagram.com/v19.0";
  private businessAccountId: string;

  constructor(accessToken: string, businessAccountId: string) {
    this.accessToken = accessToken;
    this.businessAccountId = businessAccountId;
  }

  /**
   * Récupère le profil utilisateur
   */
  async getUserProfile(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/me?fields=id,username,name,biography,website,profile_picture_url,followers_count&access_token=${this.accessToken}`,
    );
    if (!response.ok) throw new Error("Erreur récupération profil Instagram");
    return response.json();
  }

  /**
   * Récupère les posts d'un compte Business
   */
  async getMedia(): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/${this.businessAccountId}/media?fields=id,caption,media_type,media_url,timestamp,permalink,like_count,comments_count&access_token=${this.accessToken}`,
    );
    if (!response.ok) throw new Error("Erreur récupération médias Instagram");
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Crée un post Instagram (nécessite approbation préalable)
   */
  async createPost(caption: string, mediaUrl: string, mediaType: "IMAGE" | "VIDEO"): Promise<any> {
    // Créer un container d'abord
    const containerResponse = await fetch(
      `${this.baseUrl}/${this.businessAccountId}/media?` +
        `image_url=${encodeURIComponent(mediaUrl)}&` +
        `media_type=${mediaType}&` +
        `caption=${encodeURIComponent(caption)}&` +
        `access_token=${this.accessToken}`,
      { method: "POST" },
    );

    if (!containerResponse.ok) throw new Error("Erreur création container Instagram");
    const container = await containerResponse.json();

    // Publier le container
    const publishResponse = await fetch(
      `${this.baseUrl}/${this.businessAccountId}/media_publish?` +
        `creation_id=${container.id}&` +
        `access_token=${this.accessToken}`,
      { method: "POST" },
    );

    if (!publishResponse.ok) throw new Error("Erreur publication Instagram");
    return publishResponse.json();
  }

  /**
   * Supprime un post
   */
  async deletePost(mediaId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${mediaId}?access_token=${this.accessToken}`, {
      method: "DELETE",
    });
    return response.ok;
  }

  /**
   * Récupère les insights d'un média
   */
  async getMediaInsights(mediaId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/${mediaId}/insights?fields=engagement,impressions,reach,saved,video_views&access_token=${this.accessToken}`,
    );
    if (!response.ok) throw new Error("Erreur récupération insights Instagram");
    return response.json();
  }

  /**
   * Récupère les commentaires d'un média
   */
  async getMediaComments(mediaId: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/${mediaId}/comments?fields=id,text,from,timestamp,like_count&access_token=${this.accessToken}`,
    );
    if (!response.ok) throw new Error("Erreur récupération commentaires Instagram");
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Récupère les insights du compte Business
   */
  async getAccountInsights(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/${this.businessAccountId}/insights?fields=impressions,reach,profile_views,follower_count&access_token=${this.accessToken}`,
    );
    if (!response.ok) throw new Error("Erreur récupération insights compte Instagram");
    return response.json();
  }
}

export class TikTokAPI {
  private accessToken: string;
  private baseUrl = "https://open.tiktokapis.com/v1";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Récupère les informations utilisateur
   */
  async getUserInfo(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/user/info/`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    if (!response.ok) throw new Error("Erreur récupération utilisateur TikTok");
    return response.json();
  }

  /**
   * Récupère la liste des vidéos de l'utilisateur
   */
  async getUserVideos(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/video/list/`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    if (!response.ok) throw new Error("Erreur récupération vidéos TikTok");
    const data = await response.json();
    return data.data?.videos || [];
  }

  /**
   * Crée une vidéo (upload)
   */
  async uploadVideo(file: File, title: string, description: string): Promise<any> {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);
    formData.append("description", description);

    const response = await fetch(`${this.baseUrl}/video/upload/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Erreur upload vidéo TikTok");
    return response.json();
  }

  /**
   * Supprime une vidéo
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/video/delete/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ video_id: videoId }),
    });
    return response.ok;
  }

  /**
   * Récupère les analytics vidéo
   */
  async getVideoAnalytics(videoId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/video/query/?fields=id,create_time,view_count,like_count,comment_count,share_count&video_id=${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );
    if (!response.ok) throw new Error("Erreur récupération analytics TikTok");
    return response.json();
  }

  /**
   * Récupère les commentaires d'une vidéo
   */
  async getVideoComments(videoId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/video/comments/?video_id=${videoId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    if (!response.ok) throw new Error("Erreur récupération commentaires TikTok");
    const data = await response.json();
    return data.data?.comments || [];
  }
}

export default {
  FacebookAPI,
  InstagramAPI,
  TikTokAPI,
};
