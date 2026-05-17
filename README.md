# Achakourou Social Accounts Booster (ACAB)

Achakourou Social Accounts Booster est une plateforme SaaS de gestion et optimisation des comptes sociaux, pensée pour les créateurs, les marketeurs et les petites équipes qui veulent piloter TikTok, Instagram et Facebook depuis un seul tableau de bord.

## Présentation

ACAB centralise :

- l'authentification OAuth des comptes sociaux,
- la synchronisation des publications,
- les analytics en temps réel,
- les recommandations SEO par IA,
- la supervision de l'état de connexion,
- un tableau de bord moderne compatible Netlify.

## MVP

- OAuth TikTok / Facebook / Instagram
- Dashboard analytics temps réel
- AI SEO Booster pour l'optimisation des profils et contenus
- Publication multi-réseaux et gestion de workflow
- Synchronisation sociale avec suivi des jobs
- Supervision de l'état de connexion et du backend
- Interface responsive et PWA ready
- Suivi sécurisé avec Supabase Auth + RLS

## Stack Technique

- Frontend : React 18 + TypeScript
- Routing : TanStack Router
- Data fetching : TanStack Query v5
- Build : Vite
- UI : Tailwind CSS + shadcn/ui
- Animations : Framer Motion
- Graphiques : Recharts
- Backend : Supabase (Auth, PostgreSQL, RLS)
- Déploiement : Netlify
- IA : AI SDK compatible OpenAI / Gemini

## Installation locale

### Prérequis

- Node.js >= 20
- npm
- Compte Supabase

### Installer le projet

```bash
git clone <repo-url>
cd achakourou-social-accounts-booster
npm install
```

### Variables d'environnement

Copiez le fichier d'exemple :

```bash
cp .env.example .env
```

Remplissez les variables principales :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

Variables optionnelles disponibles :

- `VITE_OPENAI_API_KEY`
- `VITE_AI_API_URL`
- `VITE_FACEBOOK_APP_SECRET`
- `VITE_INSTAGRAM_APP_SECRET`
- `VITE_TIKTOK_CLIENT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

### Lancer en développement

```bash
npm run dev
```

Ouvrez `http://localhost:5173`.

## Build production

```bash
npm run build
```

## Déploiement Netlify

1. Connectez le dépôt GitHub à Netlify.
2. Ajoutez les variables d'environnement dans Netlify.
3. Configurez la commande de build :

```bash
npm run build
```

4. Déployez :

```bash
netlify deploy --build --prod
```

> Assurez-vous que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont bien définis dans Netlify.

## Sécurité

- RLS activé sur les tables critiques.
- Authentification Supabase sécurisée.
- Secrets OAuth et API uniquement en variables d'environnement.
- Ne commitez jamais de `.env`, de clés privées ou de tokens.
- Utilisez `.env.example` comme gabarit.

## Architecture du projet

- `src/routes` : pages et routes de l'application
- `src/hooks` : hooks métier réutilisables
- `src/lib` : services, providers et utilitaires
- `src/integrations` : client Supabase et configuration
- `supabase/functions` : fonctions Edge Supabase
- `supabase/migrations` : schéma et migrations SQL
- `public` : manifest PWA, service worker, assets statiques

## Roadmap

- v1 : MVP stable avec auth, analytics, sync social et IA SEO
- v2 : multi-tenant, billing, plans Pro, rapports exportables
- v3 : collaboration équipe, notifications push, monitoring avancé
