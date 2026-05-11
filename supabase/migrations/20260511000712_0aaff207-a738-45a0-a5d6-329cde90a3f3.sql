
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  agency_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- clients
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  handle text,
  niche text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.clients enable row level security;
create policy "owner all clients" on public.clients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trends (shared, seeded)
create table public.trends (
  id uuid primary key default gen_random_uuid(),
  hashtag text not null,
  topic text not null,
  category text,
  viral_score int not null default 0,
  growth numeric not null default 0,
  description text,
  created_at timestamptz not null default now()
);
alter table public.trends enable row level security;
create policy "auth read trends" on public.trends for select to authenticated using (true);

-- generated_scripts
create table public.generated_scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  topic text not null,
  hook text not null,
  content text not null,
  cta text not null,
  viral_score int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.generated_scripts enable row level security;
create policy "owner all scripts" on public.generated_scripts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ai_generations (Quota tracking)
create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- 'script', 'seo', 'audit'
  created_at timestamptz not null default now()
);
alter table public.ai_generations enable row level security;
create policy "owner view usage" on public.ai_generations for select using (auth.uid() = user_id);

-- content_calendar
create table public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  script_id uuid references public.generated_scripts(id) on delete set null,
  scheduled_at timestamptz not null,
  status text default 'planned'
);
alter table public.content_calendar enable row level security;
create policy "owner all calendar" on public.content_calendar for all using (auth.uid() = user_id);

-- seo_reports
create table public.seo_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  keywords text[],
  optimization_tips text,
  score int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.seo_reports enable row level security;
create policy "owner all seo" on public.seo_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- seed trends
insert into public.trends (hashtag, topic, category, viral_score, growth, description) values
('#aitools', 'AI productivity hacks', 'Tech', 94, 312.5, 'Short demos of AI tools saving hours per week'),
('#moneytok', 'Side hustles 2026', 'Finance', 91, 245.8, 'Realistic side income breakdowns under 60s'),
('#cleantok', 'Satisfying cleaning routines', 'Lifestyle', 88, 180.2, 'Before/after fast-cuts with trending audio'),
('#bookrec', 'Book aesthetic stacks', 'Books', 82, 142.0, 'Cozy book recommendations with seasonal vibe'),
('#fitcheck', 'Outfit transitions', 'Fashion', 89, 210.4, 'Quick outfit reveals with hard beat drops'),
('#cooktok', '5-ingredient recipes', 'Food', 86, 165.7, 'Fast minimal recipes with overhead shots'),
('#startuplife', 'Founder day-in-life', 'Business', 78, 120.3, 'Behind-the-scenes building a startup'),
('#dogsoftiktok', 'Pet reaction skits', 'Pets', 92, 280.1, 'Voiceover skits with pet expressions'),
('#travelhacks', 'Budget travel tips', 'Travel', 84, 155.9, 'Hidden gems and price comparisons'),
('#studytok', 'Study with me', 'Education', 80, 138.4, 'Pomodoro lo-fi sessions with overlays');
