// Service OAuth pour les intégrations sociales
// Gère la connexion, le refresh des tokens et les permis

import { OAuthConfig, OAuthToken, SocialAuthResponse, SocialAccount } from './types';

export class OAuthService {
  // Configuration OAuth (à charger depuis les variables d'environnement)
  private static configs: Record<string, OAuthConfig> = {
    facebook: {
      client_id: import.meta.env.VITE_FACEBOOK_APP_ID || '',
      client_secret: import.meta.env.VITE_FACEBOOK_APP_SECRET || '',
      redirect_uri: `${window.location.origin}/auth/callback/facebook`,
      scope: ['pages_read_engagement', 'pages_read_user_content', 'pages_manage_metadata', 'pages_manage_posts'],
    },
    instagram: {
      client_id: import.meta.env.VITE_INSTAGRAM_APP_ID || '',
      client_secret: import.meta.env.VITE_INSTAGRAM_APP_SECRET || '',
      redirect_uri: `${window.location.origin}/auth/callback/instagram`,
      scope: ['instagram_graph_user_profile', 'instagram_graph_user_media'],
    },
    tiktok: {
      client_id: import.meta.env.VITE_TIKTOK_CLIENT_KEY || '',
      client_secret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || '',
      redirect_uri: `${window.location.origin}/auth/callback/tiktok`,
      scope: ['user.info.basic', 'video.list', 'video.publish'],
    },
  };

  /**
   * Génère l'URL de connexion OAuth pour une plateforme
   */
  static getAuthUrl(platform: 'facebook' | 'instagram' | 'tiktok'): string {
    const config = this.configs[platform];
    if (!config.client_id) {
      throw new Error(`Configuration manquante pour ${platform}`);
    }

    const baseUrls = {
      facebook: 'https://www.facebook.com/v19.0/dialog/oauth',
      instagram: 'https://api.instagram.com/oauth/authorize', // Instagram utilise Facebook
      tiktok: 'https://www.tiktok.com/v1/oauth/authorize',
    };

    const params = new URLSearchParams({
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      scope: config.scope.join(' '),
      response_type: 'code',
      state: this.generateState(),
    });

    // Instagram utilise le même endpoint que Facebook
    if (platform === 'instagram') {
      params.set('scope', 'instagram_graph_user_profile,instagram_graph_user_media');
    }

    return `${baseUrls[platform]}?${params.toString()}`;
  }

  /**
   * Échange le code d'autorisation contre un token
   */
  static async exchangeCodeForToken(
    platform: 'facebook' | 'instagram' | 'tiktok',
    code: string
  ): Promise<OAuthToken> {
    const config = this.configs[platform];

    const tokenEndpoints = {
      facebook: 'https://graph.facebook.com/v19.0/oauth/access_token',
      instagram: 'https://graph.instagram.com/v19.0/access_token',
      tiktok: 'https://open.tiktokapis.com/v1/oauth/token',
    };

    const body = new FormData();
    body.append('client_id', config.client_id);
    body.append('client_secret', config.client_secret);
    body.append('redirect_uri', config.redirect_uri);
    body.append('code', code);

    if (platform === 'tiktok') {
      body.append('grant_type', 'authorization_code');
    }

    const response = await fetch(tokenEndpoints[platform], {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      throw new Error(`Erreur OAuth ${platform}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Rafraîchit un token expiré
   */
  static async refreshToken(
    platform: 'facebook' | 'instagram' | 'tiktok',
    refreshToken: string
  ): Promise<OAuthToken> {
    const config = this.configs[platform];

    const refreshEndpoints = {
      facebook: 'https://graph.facebook.com/v19.0/oauth/access_token',
      instagram: 'https://graph.instagram.com/v19.0/refresh_access_token',
      tiktok: 'https://open.tiktokapis.com/v1/oauth/token',
    };

    const body = new FormData();
    body.append('client_id', config.client_id);
    body.append('client_secret', config.client_secret);
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', refreshToken);

    const response = await fetch(refreshEndpoints[platform], {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      throw new Error(`Erreur refresh ${platform}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Vérifie si un token est expiré
   */
  static isTokenExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  /**
   * Génère un state aléatoire pour la sécurité OAuth
   */
  private static generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Révoque l'accès pour une plateforme
   */
  static async revokeAccess(
    platform: 'facebook' | 'instagram' | 'tiktok',
    accessToken: string
  ): Promise<boolean> {
    const revokeEndpoints = {
      facebook: 'https://graph.facebook.com/me/permissions',
      instagram: 'https://graph.instagram.com/me/permissions',
      tiktok: 'https://open.tiktokapis.com/v1/oauth/revoke',
    };

    try {
      const response = await fetch(`${revokeEndpoints[platform]}?access_token=${accessToken}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error(`Erreur lors de la révocation pour ${platform}:`, error);
      return false;
    }
  }

  /**
   * Valide le state retourné par le provider OAuth
   */
  static validateState(state: string): boolean {
    const storedState = sessionStorage.getItem('oauth_state');
    if (!storedState || storedState !== state) {
      return false;
    }
    sessionStorage.removeItem('oauth_state');
    return true;
  }
}

export default OAuthService;
