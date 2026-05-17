# Démarrer le moteur de synchronisation (local)

Prérequis

- Définir les variables d'environnement server-side :
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (ne jamais exposer côté client)
  - `SCHEDULE_SYNC_SECRET` (secret pour l'edge function)
  - `SYNC_CRON_SECRET` (si vous utilisez la fonction `sync-social-accounts`)

Start worker (dev):

```bash
# installer les dépendances si nécessaire
pnpm install

# exécuter Node REPL ou script qui importe runWorkerLoop
# Exemple rapide depuis un script node:
node -e "require('./build/src/lib/sync/worker').runWorkerLoop()"
```

Notes

- En production, exécuter `runWorkerLoop` dans un processus background (PM2, systemd, ou as a serverless worker).
- Préférez scheduler Cloud (Cloudflare Cron, Netlify Scheduled Functions, ou Supabase Scheduled Functions) pour planifier l'appel à `supabase/functions/sync-social-accounts`.
