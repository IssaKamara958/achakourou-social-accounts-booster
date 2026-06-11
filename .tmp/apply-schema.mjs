import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString:
    "postgresql://postgres:Aramedieng2002.@db.jaqotacitljdsurbcrtx.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

const SQL = `
-- ================================================================
-- MIGRATION 1: Core tables (idempotent)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  email varchar,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform varchar NOT NULL,
  username varchar NOT NULL,
  connected boolean NOT NULL DEFAULT false,
  access_token varchar NOT NULL DEFAULT '',
  refresh_token varchar,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT social_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  social_account_id uuid,
  content text NOT NULL DEFAULT '',
  topic text,
  hook text,
  cta text,
  viral_score numeric DEFAULT 0,
  status varchar NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  social_account_id uuid,
  status varchar NOT NULL DEFAULT 'pending',
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sync_jobs_pkey PRIMARY KEY (id)
);

-- Add missing columns if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='social_accounts' AND column_name='connected') THEN
    ALTER TABLE public.social_accounts ADD COLUMN connected boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='topic') THEN
    ALTER TABLE public.posts ADD COLUMN topic text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='hook') THEN
    ALTER TABLE public.posts ADD COLUMN hook text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='cta') THEN
    ALTER TABLE public.posts ADD COLUMN cta text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='viral_score') THEN
    ALTER TABLE public.posts ADD COLUMN viral_score numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sync_jobs' AND column_name='payload') THEN
    ALTER TABLE public.sync_jobs ADD COLUMN payload jsonb;
  END IF;
END$$;

-- ================================================================
-- MIGRATION 2: trigger handle_new_user
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ================================================================
-- MIGRATION 3: get_sync_jobs RPC
-- ================================================================

CREATE OR REPLACE FUNCTION get_sync_jobs(uid uuid)
RETURNS SETOF sync_jobs
LANGUAGE sql AS $$
  SELECT * FROM sync_jobs
  WHERE user_id = uid
     OR payload->>'user_id' = uid::text
  ORDER BY created_at DESC;
$$;

-- ================================================================
-- MIGRATION 4: Missing tables
-- ================================================================

CREATE TABLE IF NOT EXISTS public.trends (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hashtag varchar NOT NULL,
  topic varchar,
  viral_score numeric NOT NULL DEFAULT 0,
  growth numeric DEFAULT 0,
  platform varchar DEFAULT 'tiktok',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trends_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name varchar NOT NULL,
  handle varchar,
  niche varchar,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.generated_scripts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid,
  topic text NOT NULL DEFAULT '',
  hook text,
  content text,
  cta text,
  viral_score numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT generated_scripts_pkey PRIMARY KEY (id),
  CONSTRAINT generated_scripts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE,
  CONSTRAINT generated_scripts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.social_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  social_account_id uuid,
  metric_name varchar NOT NULL,
  metric_value numeric DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_analytics_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.sync_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  sync_job_id uuid,
  action varchar NOT NULL,
  status varchar NOT NULL DEFAULT 'ok',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sync_audit_logs_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.ai_optimization_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cache_key varchar NOT NULL,
  result jsonb NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_optimization_cache_pkey PRIMARY KEY (id),
  UNIQUE (user_id, cache_key)
);

-- ================================================================
-- MIGRATION 5: Enable RLS on all tables
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_optimization_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies (CREATE IF NOT EXISTS via DO blocks)
DO $$
BEGIN
  -- profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_select') THEN
    CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_insert') THEN
    CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_update') THEN
    CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  -- social_accounts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_accounts' AND policyname='sa_all') THEN
    CREATE POLICY sa_all ON public.social_accounts USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  -- posts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='posts_all') THEN
    CREATE POLICY posts_all ON public.posts USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  -- sync_jobs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sync_jobs' AND policyname='sj_all') THEN
    CREATE POLICY sj_all ON public.sync_jobs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  -- trends: public readable
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trends' AND policyname='trends_read') THEN
    CREATE POLICY trends_read ON public.trends FOR SELECT USING (true);
  END IF;
  -- clients
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clients' AND policyname='clients_all') THEN
    CREATE POLICY clients_all ON public.clients USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  -- generated_scripts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='generated_scripts' AND policyname='gs_all') THEN
    CREATE POLICY gs_all ON public.generated_scripts USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  -- social_analytics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_analytics' AND policyname='analytics_all') THEN
    CREATE POLICY analytics_all ON public.social_analytics USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  -- sync_audit_logs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sync_audit_logs' AND policyname='sal_all') THEN
    CREATE POLICY sal_all ON public.sync_audit_logs USING (auth.uid() = user_id);
  END IF;
  -- ai_optimization_cache
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_optimization_cache' AND policyname='aoc_all') THEN
    CREATE POLICY aoc_all ON public.ai_optimization_cache USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- ================================================================
-- Seed: a few sample trends so dashboard is non-empty
-- ================================================================

INSERT INTO public.trends (hashtag, topic, viral_score, growth, platform)
SELECT * FROM (VALUES
  ('#senegal', 'Culture & Lifestyle', 91, 34, 'tiktok'),
  ('#dakar', 'Lifestyle urbain', 87, 28, 'tiktok'),
  ('#tiktokafrique', 'Créateurs africains', 85, 41, 'tiktok'),
  ('#buzzsn', 'Buzz Sénégal', 82, 22, 'instagram'),
  ('#digitalmarketing', 'Marketing digital', 78, 19, 'tiktok'),
  ('#africa', 'Afrique en général', 76, 31, 'tiktok'),
  ('#créateur', 'Création de contenu', 74, 17, 'instagram'),
  ('#entrepreneuriat', 'Business & Finances', 72, 26, 'tiktok'),
  ('#côteivoire', 'Côte d Ivoire', 71, 15, 'tiktok'),
  ('#abidjan', 'Lifestyle Abidjan', 69, 12, 'instagram')
) AS t(hashtag, topic, viral_score, growth, platform)
WHERE NOT EXISTS (SELECT 1 FROM public.trends LIMIT 1);
`;

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase");
    await client.query(SQL);
    console.log("All migrations applied successfully!");
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log("Tables:", res.rows.map(r => r.table_name).join(", "));
  } catch (err) {
    console.error("Migration error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
