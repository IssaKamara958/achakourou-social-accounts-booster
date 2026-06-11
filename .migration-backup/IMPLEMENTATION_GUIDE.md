# ACAB - Achakourou Social Accounts Booster

## Documentation Complète - Phase 1 Implementation

### 📋 Table des Matières

1. [Aperçu du Projet](#aperçu)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup)
4. [Utilisation](#utilisation)
5. [API Reference](#api-reference)
6. [Variables d'Environnement](#variables)
7. [Déploiement](#déploiement)

---

## Aperçu

ACAB est une plateforme SaaS de gestion multi-réseaux sociaux propulsée par IA, permettant aux créateurs et entrepreneurs africains de:

✅ Connecter leurs comptes Facebook, Instagram, TikTok
✅ Gérer, publier et synchroniser du contenu
✅ Obtenir des recommandations IA en temps réel
✅ Analyser les performances consolidées
✅ Optimiser leurs contenus pour le référencement social

---

## Architecture

### Stack Technologique

**Frontend:**

- React 18 + TypeScript
- Vite (build)
- TanStack Router + TanStack Query
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)

**Backend:**

- Supabase (PostgreSQL + Auth + Realtime)
- Edge Functions (Deno)
- OAuth 2.0 (Facebook, Instagram, TikTok)

**AI/ML:**

- OpenAI GPT-3.5-turbo (ou compatible)
- Analyse NLP pour optimisation contenu

**Déploiement:**

- Netlify (Frontend)
- Supabase (Backend)

### Structure Base de Données

```
social_accounts (comptes connectés)
├── platform: 'facebook' | 'instagram' | 'tiktok'
├── access_token
├── refresh_token
└── metadata

social_posts (publications)
├── account_id (FK)
├── platform
├── caption, hashtags, media
├── status: 'draft' | 'scheduled' | 'published' | 'failed'
└── analytics (engagement metrics)

social_comments (commentaires)
├── post_id (FK)
├── author_username
├── sentiment: 'positive' | 'neutral' | 'negative'
└── metadata

social_analytics (métriques consolidées)
├── account_id (FK)
├── post_id (FK)
├── date
├── reach, impressions, engagement
└── followers_change

social_sync_queue (tâches synchronisation)
├── account_id (FK)
├── sync_type: 'posts' | 'comments' | 'analytics' | 'followers'
├── status: 'pending' | 'processing' | 'completed' | 'failed'
└── retry tracking

ai_optimization_cache (recommandations IA)
├── post_id (FK)
├── optimization_type
├── scores (hooks, hashtags, seo, cta, viral)
└── recommendations
```

---

## Setup & Installation

### Prérequis

- Node.js 20+
- PostgreSQL (via Supabase)
- Clés API: Facebook, Instagram, TikTok
- Clé OpenAI (pour AI features)

### Installation Locale

```bash
# 1. Cloner le repo
git clone <repo-url>
cd achakourou-social-accounts-booster

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local

# 4. Appliquer les migrations Supabase
supabase migration up

# 5. Déployer les Edge Functions
supabase functions deploy sync-social-accounts

# 6. Lancer le dev server
npm run dev
```

### Configuration Supabase

```bash
# Initialiser Supabase localement
supabase init

# Créer un nouveau projet
supabase projects create

# Lier le projet
supabase projects link
```

---

## Utilisation

### Connecter un Compte Social

```tsx
import { SocialAccountsManager } from "@/components/social/SocialAccountsManager";

export function MyPage() {
  return <SocialAccountsManager />;
}
```

### Récupérer les Comptes Connectés

```tsx
import { useSocialAccounts } from "@/hooks/use-social-accounts";

export function MyComponent() {
  const { accounts, isLoading, deleteAccount } = useSocialAccounts();

  return (
    <>
      {accounts.map((account) => (
        <div key={account.id}>
          <h3>{account.account_name}</h3>
          <p>{account.platform}</p>
          <p>{account.followers_count} followers</p>
        </div>
      ))}
    </>
  );
}
```

### Gérer les Publications

```tsx
import { useSocialPosts } from "@/hooks/use-social-accounts";

export function PostsComponent() {
  const { posts, createPost, publishPost, deletePost } = useSocialPosts(accountId);

  const handleCreate = () => {
    createPost({
      account_id: accountId,
      platform: "tiktok",
      caption: "Mon nouveau contenu",
      hashtags: ["#viral", "#content"],
      media_urls: [],
      media_types: [],
      status: "draft",
    });
  };

  return (
    <>
      <button onClick={handleCreate}>Créer Post</button>
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.caption}</p>
          <span>{post.status}</span>
        </div>
      ))}
    </>
  );
}
```

### Utiliser l'IA pour Optimisation

```tsx
import { AIOptimizationService } from "@/lib/social/ai-optimization";

// Générer des recommandations
const recommendations = await AIOptimizationService.analyzePost(
  "Ma publication...",
  ["#marketing", "#ia"],
  "tiktok",
);

console.log(recommendations.overall_viral_score); // 0-100
console.log(recommendations.cta_suggestions); // ['CTA1', 'CTA2']

// Générer des hashtags
const hashtags = await AIOptimizationService.generateHashtags("Ma publication", "instagram", 20);

// Générer une description SEO
const seoDescription = await AIOptimizationService.generateSEODescription(
  "Ma publication",
  "tiktok",
);

// Prédire le potentiel viral
const viralScore = await AIOptimizationService.predictViralPotential(
  "Ma publication",
  hashtags,
  "tiktok",
);
```

### Synchroniser les Comptes

```tsx
import { SocialSyncService } from "@/lib/social/sync";

// Synchroniser tous les comptes d'un utilisateur
await SocialSyncService.syncUserAccounts(userId);

// Synchroniser un compte spécifique
await SocialSyncService.syncAccount(account);
```

---

## API Reference

### Services Principaux

#### OAuthService

- `getAuthUrl(platform)` - Retourne l'URL d'authentification
- `exchangeCodeForToken(platform, code)` - Échange le code contre un token
- `refreshToken(platform, refreshToken)` - Rafraîchit le token
- `revokeAccess(platform, accessToken)` - Révoque l'accès

#### SocialAccountsService

- `createAccount(accountData)`
- `getUserAccounts(userId)`
- `updateAccount(accountId, updates)`
- `deleteAccount(accountId)`
- `setConnected(accountId, connected)`
- `updateToken(accountId, accessToken, refreshToken, expiresAt)`

#### SocialPostsService

- `createPost(postData)`
- `getAccountPosts(accountId, status?)`
- `updatePost(postId, updates)`
- `publishPost(postId, externalPostId?)`
- `schedulePost(postId, scheduledAt)`
- `deletePost(postId)`

#### AIOptimizationService

- `analyzePost(caption, hashtags, platform, analytics?)`
- `generateSEODescription(caption, platform)`
- `generateHashtags(caption, platform, count?)`
- `generateViralTitle(caption, platform)`
- `predictViralPotential(caption, hashtags, platform)`
- `analyzeSentimentAndCTA(caption, platform)`
- `getOptimalPostingTime(platform)`

---

## Variables d'Environnement

Créer `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# OAuth - Facebook
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret

# OAuth - Instagram (utilise le même app que Facebook)
VITE_INSTAGRAM_APP_ID=your_instagram_app_id
VITE_INSTAGRAM_APP_SECRET=your_instagram_app_secret

# OAuth - TikTok
VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key
VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# AI
VITE_AI_API_URL=https://api.openai.com/v1
VITE_OPENAI_API_KEY=your_openai_api_key

# Sync Cron
SYNC_CRON_SECRET=your_secret_key_for_cron

# Netlify
NETLIFY_AUTH_TOKEN=your_netlify_token
```

---

## Déploiement

### Sur Netlify

```bash
# 1. Connecter le repo
netlify init

# 2. Configurer les variables d'environnement dans Netlify UI
# Settings > Build & Deploy > Environment

# 3. Déployer
netlify deploy --prod
```

### Sur Supabase

```bash
# 1. Déployer les Edge Functions
supabase functions deploy sync-social-accounts --project-id=your_project_id

# 2. Configurer les variables d'environnement
supabase secrets set \
  SYNC_CRON_SECRET=your_secret \
  FACEBOOK_APP_ID=your_id \
  ...
```

### Configurer Cron Jobs

Sur Supabase, créer un cron job pour synchroniser périodiquement:

```bash
# Via Supabase CLI
supabase functions deploy sync-social-accounts \
  --project-id=your_project_id \
  --no-verify-jwt
```

---

## Prochaines Phases

### Phase 2 - Dashboard Business

- [ ] Analytics consolidés multi-réseaux
- [ ] Graphiques en temps réel
- [ ] KPI business
- [ ] Rapports exportables

### Phase 3 - PWA

- [ ] Installable mobile/desktop
- [ ] Offline mode
- [ ] Background sync
- [ ] Push notifications

### Phase 4 - Advanced Features

- [ ] AI Content Generation
- [ ] Scheduling avancé
- [ ] Team Collaboration
- [ ] White Label SaaS
- [ ] API Public

---

## Troubleshooting

### Token expiré

```
Error: "Token has expired"
→ Implémenter refresh token automatique (déjà intégré)
```

### API Rate Limit

```
Error: "Rate limit exceeded"
→ Implémenter backoff exponentiel dans sync service
```

### CORS Issues

```
Error: "CORS policy blocked"
→ Utiliser des Edge Functions au lieu d'appels directs
```

---

## Support & Contribution

Pour les issues ou questions:

- GitHub Issues: [project-issues]
- Email: support@achakourou.com
- Discord: [community-link]

---

**Dernière mise à jour:** Mai 2026
**Version:** 1.0.0-beta
**Mainteneur:** IssaKamara958
