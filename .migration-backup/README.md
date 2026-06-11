# Achakourou Social Accounts Booster (ACAB)

Achakourou Social Accounts Booster est une plateforme SaaS de gestion de réseaux sociaux multi-plateformes, conçue pour centraliser, automatiser et optimiser votre présence en ligne. Elle intègre des outils d'IA pour la création de contenu, la migration entre plateformes, l'analyse SEO et la gestion publicitaire.

## ✨ Fonctionnalités Clés

- **Connexion Multi-Plateformes**: Connectez et gérez vos comptes Facebook, Instagram et TikTok depuis une seule interface.
- **Synchronisation Automatique**: Vos données (posts, statistiques, abonnés) sont synchronisées en arrière-plan.
- **Tableau de Bord Unifié**: Visualisez toutes vos statistiques et gérez vos comptes en temps réel.
- **Gestion de Contenu Avancée**: Uploadez, stockez et organisez votre contenu multimédia. Publiez ou programmez vos posts sur plusieurs plateformes.
- **Migration de Contenu**: Migrez facilement votre contenu (posts, et bientôt abonnés) d'un compte à un autre.
- **Studio IA**:
    - **Génération de contenu**: Créez des légendes, des hashtags et des scripts vidéo avec l'IA.
    - **Génération d'images**: Générez des visuels uniques pour vos posts.
    - **Templates Intelligents**: Utilisez des modèles de contenu pré-conçus et optimisés par l'IA.
- **Analyse SEO**: Analysez le SEO de vos profils sociaux et obtenez des recommandations pour améliorer votre visibilité.
- **Gestion Publicitaire (Prochainement)**: Créez, gérez et optimisez vos campagnes publicitaires avec l'aide de l'IA.

## 🚀 Stack Technique

| Couche          | Technologie                                               |
| --------------- | --------------------------------------------------------- |
| **Frontend**    | Next.js, React, TypeScript, TailwindCSS, shadcn/ui        |
| **State Mgmt**  | Zustand, TanStack Query                                   |
| **Backend**     | NestJS, TypeScript                                        |
| **Base de Données** | PostgreSQL, Prisma ORM                                    |
| **Cache & Jobs**| Redis, BullMQ                                             |
| **Stockage Fichiers** | MinIO (compatible S3)                                     |
| **Temps Réel**    | WebSockets (Socket.io)                                    |
| **Authentification** | JWT, OAuth2 (Passport.js)                                 |
| **IA & LLM**      | OpenAI API                                                |
| **Déploiement**   | Docker, GitHub Actions                                    |

## 🏁 Démarrage Rapide

### Pré-requis

- [Node.js](https://nodejs.org/en/) >= 18.0
- [Docker](https://www.docker.com/get-started) et Docker Compose
- Un compte [OpenAI](https://platform.openai.com/) pour les fonctionnalités d'IA.

### 1. Installation

1.  **Clonez le dépôt :**
    ```bash
    git clone https://github.com/IssaKamara958/achakourou-social-accounts-booster.git
    cd achakourou-social-accounts-booster
    ```

2.  **Configurez les variables d'environnement :**
    Créez un fichier `.env` à la racine du projet en copiant `.env.example`. Remplissez les variables, notamment pour la base de données, les clés API OpenAI et les clés des fournisseurs OAuth.

    ```bash
    cp .env.example .env
    ```

3.  **Installez les dépendances :**
    ```bash
    # Dans le dossier backend
    cd backend
    npm install

    # Dans le dossier frontend
    cd ../frontend
    npm install
    ```

### 2. Lancement

1.  **Démarrez les services avec Docker :**
    À la racine du projet, lancez PostgreSQL, Redis et MinIO.
    ```bash
    docker-compose up -d
    ```

2.  **Appliquez les migrations de la base de données :**
    ```bash
    cd backend
    npx prisma migrate dev
    ```

3.  **Démarrez les serveurs :**
    - **Backend API (port 3001) :**
      ```bash
      # Dans le terminal 1 (dossier backend)
      npm run start:dev
      ```
    - **Frontend App (port 3000) :**
      ```bash
      # Dans le terminal 2 (dossier frontend)
      npm run dev
      ```

4.  **Accédez à l'application :**
    Ouvrez votre navigateur et allez sur [http://localhost:3000](http://localhost:3000).

## 📄 API

La documentation de l'API Backend est générée automatiquement avec Swagger et est disponible à l'adresse suivante lorsque le serveur est en cours d'exécution :
[http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## 🗺️ Roadmap

- **Phase 1 (MVP)**: Authentification, connexion des comptes, publication simple.
- **Phase 2 (Sync)**: Synchronisation des données en arrière-plan, tableau de bord temps réel.
- **Phase 3 (Contenu Avancé)**: Bibliothèque multimédia, planification, formats complexes.
- **Phase 4 (Migration)**: Moteur de migration cross-plateforme.
- **Phase 5 (IA)**: Génération de contenu, templates IA.
- **Phase 6 (SEO & Ads)**: Analyse SEO, gestion des publicités.
