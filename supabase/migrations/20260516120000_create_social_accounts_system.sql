-- Création des tables pour le système de gestion des comptes sociaux

-- Table: social_accounts (Comptes sociaux connectés)
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  platform text NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok')),
  account_name text NOT NULL,
  account_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamp with time zone,
  token_type text DEFAULT 'Bearer',
  scope text,
  connected boolean DEFAULT true,
  last_sync_at timestamp with time zone,
  profile_picture text,
  followers_count integer DEFAULT 0,
  verified boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_account UNIQUE (user_id, platform, account_id)
);

-- Table: social_posts (Publications sociales)
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL,
  external_post_id text,
  platform text NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok')),
  caption text,
  hashtags text[] DEFAULT ARRAY[]::text[],
  media_urls text[] DEFAULT ARRAY[]::text[],
  media_types text[] DEFAULT ARRAY[]::text[], -- 'image', 'video', 'carousel'
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone,
  cross_posted boolean DEFAULT false,
  cross_posted_platforms text[] DEFAULT ARRAY[]::text[],
  analytics jsonb DEFAULT '{}', -- engagement metrics
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE
);

-- Table: social_comments (Commentaires des publications)
CREATE TABLE IF NOT EXISTS public.social_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL,
  external_comment_id text,
  external_author_id text,
  author_username text NOT NULL,
  author_profile_picture text,
  content text NOT NULL,
  likes_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  sentiment text DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE
);

-- Table: social_analytics (Analytiques consolidées)
CREATE TABLE IF NOT EXISTS public.social_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL,
  post_id uuid,
  platform text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  engagement integer DEFAULT 0,
  engagement_rate real DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  saves integer DEFAULT 0,
  clicks integer DEFAULT 0,
  watch_time integer DEFAULT 0, -- en secondes
  video_views integer DEFAULT 0,
  followers_gained integer DEFAULT 0,
  followers_lost integer DEFAULT 0,
  net_followers_change integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES public.social_posts(id) ON DELETE SET NULL,
  CONSTRAINT unique_daily_stats UNIQUE (account_id, post_id, platform, date)
);

-- Table: social_sync_queue (Queue de synchronisation)
CREATE TABLE IF NOT EXISTS public.social_sync_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL,
  sync_type text NOT NULL CHECK (sync_type IN ('posts', 'comments', 'analytics', 'followers')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  last_attempted_at timestamp with time zone,
  retry_count integer DEFAULT 0,
  next_retry_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE
);

-- Table: ai_optimization_cache (Cache pour recommandations IA)
CREATE TABLE IF NOT EXISTS public.ai_optimization_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL,
  account_id uuid NOT NULL,
  optimization_type text NOT NULL, -- 'hooks', 'hashtags', 'posting_time', 'seo', 'cta'
  scores jsonb, -- scores d'optimisation
  recommendations jsonb, -- recommandations IA
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE
);

-- Activer RLS pour toutes les tables
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_optimization_cache ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour social_accounts
CREATE POLICY "Users can view their own social accounts" ON public.social_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social accounts" ON public.social_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social accounts" ON public.social_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social accounts" ON public.social_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour social_posts (via account_id)
CREATE POLICY "Users can view posts from their accounts" ON public.social_posts
  FOR SELECT USING (
    account_id IN (
      SELECT id FROM public.social_accounts 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create posts for their accounts" ON public.social_posts
  FOR INSERT WITH CHECK (
    account_id IN (
      SELECT id FROM public.social_accounts 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update posts from their accounts" ON public.social_posts
  FOR UPDATE USING (
    account_id IN (
      SELECT id FROM public.social_accounts 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete posts from their accounts" ON public.social_posts
  FOR DELETE USING (
    account_id IN (
      SELECT id FROM public.social_accounts 
      WHERE user_id = auth.uid()
    )
  );

-- Politiques RLS pour social_comments
CREATE POLICY "Users can view comments from their posts" ON public.social_comments
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM public.social_posts sp
      WHERE sp.account_id IN (
        SELECT id FROM public.social_accounts 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Politiques RLS pour social_analytics
CREATE POLICY "Users can view analytics from their accounts" ON public.social_analytics
  FOR SELECT USING (
    account_id IN (
      SELECT id FROM public.social_accounts 
      WHERE user_id = auth.uid()
    )
  );

-- Politiques RLS pour social_sync_queue
CREATE POLICY "Users can view sync queue from their accounts" ON public.social_sync_queue
  FOR SELECT USING (
    account_id IN (
      SELECT id FROM public.social_accounts 
      WHERE user_id = auth.uid()
    )
  );

-- Politiques RLS pour ai_optimization_cache
CREATE POLICY "Users can view ai optimization data from their posts" ON public.ai_optimization_cache
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM public.social_posts sp
      WHERE sp.account_id IN (
        SELECT id FROM public.social_accounts 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Index pour les performances
CREATE INDEX idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON public.social_accounts(platform);
CREATE INDEX idx_social_posts_account_id ON public.social_posts(account_id);
CREATE INDEX idx_social_posts_status ON public.social_posts(status);
CREATE INDEX idx_social_posts_published_at ON public.social_posts(published_at);
CREATE INDEX idx_social_comments_post_id ON public.social_comments(post_id);
CREATE INDEX idx_social_comments_created_at ON public.social_comments(created_at);
CREATE INDEX idx_social_analytics_account_id ON public.social_analytics(account_id);
CREATE INDEX idx_social_analytics_date ON public.social_analytics(date);
CREATE INDEX idx_sync_queue_account_id ON public.social_sync_queue(account_id);
CREATE INDEX idx_sync_queue_status ON public.social_sync_queue(status);
CREATE INDEX idx_ai_cache_post_id ON public.ai_optimization_cache(post_id);
CREATE INDEX idx_ai_cache_account_id ON public.ai_optimization_cache(account_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_comments_updated_at BEFORE UPDATE ON public.social_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_analytics_updated_at BEFORE UPDATE ON public.social_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_queue_updated_at BEFORE UPDATE ON public.social_sync_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
