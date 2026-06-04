import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) { this.token = token; }

  // Auth
  register = (data: { email: string; password: string; name?: string }) =>
    this.client.post('/auth/register', data);
  login = (data: { email: string; password: string }) =>
    this.client.post('/auth/login', data);
  getMe = () => this.client.get('/auth/me');
  getSyncStatus = () => this.client.get('/auth/sync/status');

  // Social Accounts
  getAccounts = () => this.client.get('/accounts');
  getAccount = (id: string) => this.client.get(`/accounts/${id}`);
  getAccountStats = (id: string) => this.client.get(`/accounts/${id}/stats`);
  getAccountPosts = (id: string, page = 1) => this.client.get(`/accounts/${id}/posts?page=${page}`);
  getAccountFollowers = (id: string, page = 1) => this.client.get(`/accounts/${id}/followers?page=${page}`);
  disconnectAccount = (id: string) => this.client.delete(`/accounts/${id}`);

  // Content
  uploadAsset = (formData: FormData) =>
    this.client.post('/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  getLibrary = (params?: any) => this.client.get('/content/library', { params });
  publishContent = (data: any) => this.client.post('/content/publish', data);
  deleteAsset = (id: string) => this.client.delete(`/content/assets/${id}`);

  // Sync
  triggerSync = (accountId: string) => this.client.post(`/sync/trigger/${accountId}`);
  getSyncHistory = (accountId: string) => this.client.get(`/sync/history/${accountId}`);

  // Migration
  startMigration = (data: any) => this.client.post('/migration/start', data);
  getMigrations = () => this.client.get('/migration/list');

  // AI
  getTemplates = () => this.client.get('/ai/templates');
  generatePost = (data: any) => this.client.post('/ai/generate/post', data);
  generateVisual = (data: any) => this.client.post('/ai/generate/visual', data);
  generateScript = (data: any) => this.client.post('/ai/generate/script', data);
  applyTemplate = (data: any) => this.client.post('/ai/template/apply', data);

  // SEO
  analyzeSEO = (accountId: string) => this.client.post(`/seo/analyze/${accountId}`);
  getSEOHistory = (accountId: string) => this.client.get(`/seo/history/${accountId}`);
  generateHashtags = (niche: string) => this.client.post('/seo/hashtags', { niche });

  // Ads
  createCampaign = (data: any) => this.client.post('/ads/campaigns', data);
  getCampaigns = () => this.client.get('/ads/campaigns');
  launchCampaign = (id: string) => this.client.post(`/ads/campaigns/${id}/launch`);
  retouchAd = (id: string) => this.client.post(`/ads/campaigns/${id}/retouch`);
}

export const api = new ApiClient();