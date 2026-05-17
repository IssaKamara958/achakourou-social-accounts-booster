# Architecture — Moteur de synchronisation

## Objectif

Définir l'architecture pour la synchronisation intelligente multi-plateformes : tâches périodiques, edge functions, files d'attente, retry, observabilité.

## Composants principaux

- Database (Supabase / Postgres)
  - Tables: `sync_jobs`, `social_posts_sync`, `social_comments_sync`, `social_analytics_sync`, `sync_audit_logs`
  - Indexes pour recherches par `account_id`, `status`, `scheduled_at`
  - RLS : accès strict (service_role pour workers, policies pour users)

- Sync worker
  - Lit `sync_jobs`, locke la job, exécute fetch/transform, écrit les entités dans tables de sync
  - Retry exponentiel, backoff, max_retries

- Scheduler / Cron
  - Planifie jobs périodiques (ex: toutes les 5/15/60 minutes)

- Queue (optionnel)
  - Redis / Postgres LISTEN/NOTIFY pour découplage et scalabilité

- Edge functions
  - Endpoints sécurisés pour lancer sync on-demand et recevoir webhooks

- Frontend
  - Hooks React (`useSyncStatus`) pour afficher état en temps réel

## Flux simplifié

1. Le Scheduler planifie une `sync_job` (type: posts/comments/analytics).
2. Le Worker locke la job, appelle l'API externe (tokens côté serveur uniquement), transforme et stocke.
3. En cas d'erreur : retry automatique avec backoff; journaliser dans `sync_audit_logs`.
4. Front reçoit updates realtime et affiche progression.

## Sécurité et bonnes pratiques

- Ne jamais exposer `service_role` ou tokens côté client.
- Chiffrer tokens sensibles (KMS) et n'utiliser que côté serveur.
- Appliquer RLS et vérification d'auth sur tous les endpoints.

## Observabilité

- Logs structurés, métriques (success/fail), alerting sur échecs répétés.

## Prochaines étapes

- Implémenter le `SyncService` côté serveur
- Ajouter edge functions et scheduler
- Ajouter hooks React côté client
