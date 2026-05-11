# 🚀 Achakourou TikTok AI Growth Platform

**Achakourou Digital Services — Dev Issa KAMARA**

Achakourou est un SaaS IA de pointe conçu pour automatiser la croissance organique sur TikTok. Utilisant l'IA Gemini 1.5 Flash, la plateforme génère des scripts à haute rétention, analyse les tendances en temps réel et audite le SEO des profils.

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: TanStack Router (File-based)
- **State & Data**: TanStack Query (React Query)
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **IA**: Google Gemini API (Flash 1.5)
- **Hosting**: Netlify / Cloudflare Pages

## 📁 Structure du Projet

- `/src/routes`: Gestion des pages et de l'architecture des routes.
- `/supabase/functions`: Logique métier IA (Edge Functions Deno).
- `/src/integrations`: Connecteurs API et client Supabase.
- `/src/components`: UI Components réutilisables.

## 🚀 Installation & Setup

1. **Cloner le projet**
2. **Installer les dépendances** : `bun install`
3. **Variables d'environnement** : Copier `.env.example` vers `.env` et remplir :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. **Lancer le dev** : `bun dev`

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables.
- Validation des quotas IA (10 gén/jour pour les comptes FREE).
- Middleware d'authentification pour les routes protégées.

---
*© 2026 Achakourou Digital Services.*