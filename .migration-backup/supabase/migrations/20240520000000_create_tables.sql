-- Create the profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone NULL,
  email character varying NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Create the social_accounts table
CREATE TABLE public.social_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform character varying NOT NULL,
  username character varying NOT NULL,
  access_token character varying NOT NULL,
  refresh_token character varying,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT social_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id)
);

-- Create the posts table
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  social_account_id uuid NOT NULL,
  content text NOT NULL,
  status character varying NOT NULL,
  scheduled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id),
  CONSTRAINT posts_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts (id)
);

-- Create the sync_jobs table
CREATE TABLE public.sync_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  social_account_id uuid NOT NULL,
  status character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sync_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT sync_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id),
  CONSTRAINT sync_jobs_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Enable read for users based on user_id" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on email" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for social_accounts
CREATE POLICY "Enable all access for users based on user_id" ON public.social_accounts USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create policies for posts
CREATE POLICY "Enable all access for users based on user_id" ON public.posts USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create policies for sync_jobs
CREATE POLICY "Enable all access for users based on user_id" ON public.sync_jobs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
