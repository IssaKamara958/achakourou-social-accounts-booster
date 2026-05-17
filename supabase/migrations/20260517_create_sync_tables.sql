-- Migration: créer tables pour le moteur de synchronisation
-- Ne pas exposer tokens ici ; stocker uniquement des références chiffrées

CREATE TABLE IF NOT EXISTS sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NULL,
  platform text NULL,
  job_type text NOT NULL, -- 'posts' | 'comments' | 'analytics' | 'accounts'
  payload jsonb NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | in_progress | completed | failed
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz NULL,
  last_error text NULL,
  retries int NOT NULL DEFAULT 0,
  max_retries int NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_jobs_status_scheduled ON sync_jobs (status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_account ON sync_jobs (account_id);

-- Tables de stockage sync (écrasables par jobs)
CREATE TABLE IF NOT EXISTS social_posts_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  external_id text NULL,
  data jsonb NOT NULL,
  source_platform text NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_sync_account ON social_posts_sync (account_id);

CREATE TABLE IF NOT EXISTS social_comments_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NULL,
  account_id uuid NULL,
  external_id text NULL,
  data jsonb NOT NULL,
  source_platform text NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_sync_post ON social_comments_sync (post_id);

CREATE TABLE IF NOT EXISTS social_analytics_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  metrics jsonb NOT NULL,
  window_start timestamptz NULL,
  window_end timestamptz NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

-- Table d'audit pour les actions du worker
CREATE TABLE IF NOT EXISTS sync_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NULL,
  level text NOT NULL, -- info | warn | error
  message text NOT NULL,
  meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Remarque: appliquer des policies RLS dans une migration séparée selon les besoins.
