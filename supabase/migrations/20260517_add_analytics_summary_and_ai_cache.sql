-- Migration : Table de résumés analytiques pour dashboard

CREATE TABLE IF NOT EXISTS public.social_analytics_summary (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL,
  date date NOT NULL,
  total_reach integer DEFAULT 0,
  total_impressions integer DEFAULT 0,
  total_engagement integer DEFAULT 0,
  total_likes integer DEFAULT 0,
  total_comments integer DEFAULT 0,
  total_shares integer DEFAULT 0,
  total_saves integer DEFAULT 0,
  total_clicks integer DEFAULT 0,
  total_watch_time integer DEFAULT 0,
  average_engagement_rate real DEFAULT 0,
  net_followers_change integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_account_summary FOREIGN KEY (account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  CONSTRAINT unique_account_date_summary UNIQUE (account_id, date)
);

CREATE INDEX IF NOT EXISTS idx_social_analytics_summary_account_date ON public.social_analytics_summary(account_id, date);
CREATE INDEX IF NOT EXISTS idx_social_analytics_summary_date ON public.social_analytics_summary(date);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_analytics_summary_updated_at BEFORE UPDATE ON public.social_analytics_summary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
