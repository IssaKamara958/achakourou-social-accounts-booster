# Achakourou Social Accounts Booster

**Plateforme SaaS de croissance sociale propulsée par Issa KAMARA, Entrepreneur Independant & Informaticien, Developpeur spécialisé Dev-Web Frontend — conçue pour les créateurs de contenus, marketeur influenceurs investi dans la propagation de VERITE à l'Etat PURE au Sénégal particuliairement et en Afrique.**

Générez des scripts viraux TikTok, Instagram et Facebook, analysez les tendances en temps réel, planifiez vos publications et gérez vos clients depuis un tableau de bord unifié.

---

## Fonctionnalités

### Génération de Contenu IA
- Scripts multi-plateformes (TikTok, Instagram, Facebook, Hashtags, SEO)
- Sélecteur de ton et de niche
- Score viral automatique
- Historique complet dans la bibliothèque de scripts

### Analyse de Tendances
- Tendances filtrées par plateforme
- Score de viralité en temps réel
- Catégorisation par niche

### Publisher & Scheduler
- Création de posts multi-plateforme
- File d'attente de publication
- Planification avec sélecteur de date/heure
- Gestion des statuts (brouillon, planifié, publié)

### Analytics
- KPI : vues, likes, engagement, abonnés
- Graphiques Area Chart hebdomadaires
- Répartition par plateforme (Pie Chart)
- Taux d'engagement par contenu

### Gestion Multi-Clients
- Annuaire clients avec niche et notes
- Sélecteur client dans le générateur
- Scripts liés à chaque client

### Comptes Sociaux
- Connexion TikTok, Instagram, Facebook
- Statut de connexion en temps réel

### SEO Pages
- Génération automatique de pages SEO
- Slug SEO friendly
- Meta title et description IA

### Booster
- Score de performance animé
- Meilleurs horaires de publication
- Insights audience par plateforme

### Paramètres
- Profil utilisateur
- Clés API
- Gestion du plan (Free/Pro/Agency)
- Notifications

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript |
| Routing | TanStack Router (file-based) |
| Data Fetching | TanStack Query v5 |
| Build | Vite 6 |
| Styles | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| IA | AI SDK (OpenAI / Gemini) |

---

## Installation Locale

### Prérequis
- Node.js >= 20
- npm ou pnpm
- Compte Supabase (gratuit sur supabase.com)

### 1. Cloner le projet

```bash
git clone <repo-url>
cd achakourou-booster-ai
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env
```

Remplir `.env` :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

### 3. Lancer en développement

```bash
npm run dev
```

Application disponible sur `http://localhost:5000`.

---

## Configuration Supabase

### Tables Requises

```sql
-- Profiles (auto-créé via trigger)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text, email text, avatar_url text,
  bio text, country text,
  free_plan boolean DEFAULT true,
  tiktok_creator boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL, handle text, niche text, notes text,
  created_at timestamptz DEFAULT now()
);

-- Scripts générés
CREATE TABLE generated_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  topic text NOT NULL, hook text NOT NULL,
  content text NOT NULL, cta text NOT NULL,
  viral_score int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tendances
CREATE TABLE trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL, hashtag text NOT NULL,
  viral_score int DEFAULT 0, growth numeric DEFAULT 0,
  category text, description text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Comptes sociaux
CREATE TABLE social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL, username text,
  connected boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Posts / Publisher
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text, hook text, hashtags text[],
  status text DEFAULT 'draft', scheduled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- SEO Pages
CREATE TABLE seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  slug text NOT NULL, title text, meta_description text,
  content text, indexed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Quotas IA
CREATE TABLE ai_usage_quotas (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  daily_count int DEFAULT 0,
  last_reset timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### RLS (Row Level Security)

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: own" ON profiles USING (auth.uid() = id);
CREATE POLICY "clients: own" ON clients USING (auth.uid() = user_id);
CREATE POLICY "scripts: own" ON generated_scripts USING (auth.uid() = user_id);
CREATE POLICY "social_accounts: own" ON social_accounts USING (auth.uid() = user_id);
CREATE POLICY "posts: own" ON posts USING (auth.uid() = user_id);
CREATE POLICY "seo_pages: own" ON seo_pages USING (auth.uid() = user_id);
CREATE POLICY "quotas: own" ON ai_usage_quotas USING (auth.uid() = user_id);
CREATE POLICY "trends: public read" ON trends FOR SELECT USING (true);
```

### Trigger Auto-Profile

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | Oui |
| `VITE_SUPABASE_ANON_KEY` | Clé anon publique Supabase | Oui |

---

## Build Production

```bash
npm run build
```

Les fichiers compilés sont dans `dist/`. Vite optimise automatiquement le code splitting, tree shaking et la minification.

---

## Déploiement

### Replit Deploy
1. Cliquer sur **Deploy** dans Replit
2. Type : **Static** — build `npm run build` — dossier `dist`
3. Ajouter les Secrets Replit (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

### Autres plateformes
Compatible Vercel, Netlify, Cloudflare Pages — déployer le dossier `dist`.

---

## Architecture

```
src/
├── components/
│   ├── ui/                  # Composants Shadcn/Radix (atomiques)
│   └── app-sidebar.tsx      # Sidebar navigation
├── integrations/
│   └── supabase/            # Client + types DB complets
├── lib/
│   ├── auth.tsx             # AuthProvider + useAuth hook
│   └── utils.ts             # Utilitaires (cn, etc.)
├── routes/
│   ├── index.tsx            # Landing page
│   ├── login.tsx            # Authentification
│   ├── app.tsx              # Layout protégé (auth guard)
│   ├── app.index.tsx        # Dashboard + KPIs
│   ├── app.generator.tsx    # Générateur IA multi-plateforme
│   ├── app.trends.tsx       # Explorer de tendances
│   ├── app.scripts.tsx      # Bibliothèque scripts
│   ├── app.clients.tsx      # Gestion clients
│   ├── app.analytics.tsx    # Analytics & charts
│   ├── app.social.tsx       # Comptes sociaux
│   ├── app.publisher.tsx    # Publisher & scheduler
│   ├── app.seo.tsx          # SEO pages generator
│   ├── app.booster.tsx      # Score booster
│   └── app.settings.tsx     # Paramètres compte
└── styles.css               # Design system (oklch + brand gradients)
```

---

## Roadmap

- [ ] Intégration API TikTok officielle (publish direct)
- [ ] Intégration Instagram Graph API
- [ ] Intégration Facebook API
- [ ] Worker de scheduling automatique (cron)
- [ ] Paiements Stripe / abonnements
- [ ] Notifications push et email
- [ ] Analytics avancé (cohortes, rétention)
- [ ] Export CSV/PDF
- [ ] Mode white-label pour agences
- [ ] App mobile Expo/React Native
- [ ] Génération d'images IA pour thumbnails
- [ ] A/B testing automatique des hooks

---

## Licence

Propriétaire — © 2026 CHACKOR ORGANISATION => Achakourou Digital Sérvices. Tous droits réservés.
