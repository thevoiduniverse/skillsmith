-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Skills
create table skills (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  content text not null default '',
  author_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  category text,
  tags text[] default '{}',
  fork_of uuid references skills(id) on delete set null,
  is_template boolean default false,
  usage_count integer default 0,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Test Cases
create table test_cases (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  prompt text not null,
  expected_behavior text not null,
  last_result_with_skill text,
  last_result_without_skill text,
  last_score integer check (last_score >= 0 and last_score <= 100),
  last_reasoning text,
  last_run_at timestamptz,
  created_at timestamptz default now()
);

-- API Usage (for rate limiting)
create table api_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  request_count integer not null default 1,
  endpoint text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_skills_author on skills(author_id);
create index idx_skills_visibility on skills(visibility) where visibility = 'public';
create index idx_skills_template on skills(is_template) where is_template = true;
create index idx_test_cases_skill on test_cases(skill_id);
create index idx_api_usage_user_date on api_usage(user_id, created_at);

-- RLS Policies
alter table skills enable row level security;
alter table test_cases enable row level security;
alter table api_usage enable row level security;
alter table profiles enable row level security;

-- Skills: users see own + public
create policy "Users read own skills" on skills for select using (author_id = auth.uid());
create policy "Users read public skills" on skills for select using (visibility = 'public');
create policy "Users insert own skills" on skills for insert with check (author_id = auth.uid());
create policy "Users update own skills" on skills for update using (author_id = auth.uid());
create policy "Users delete own skills" on skills for delete using (author_id = auth.uid());

-- Test cases: users manage test cases for own skills
create policy "Users manage own test cases" on test_cases for all
  using (skill_id in (select id from skills where author_id = auth.uid()));

-- Profiles: users read all, update own
create policy "Public profiles" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (id = auth.uid());
create policy "Users insert own profile" on profiles for insert with check (id = auth.uid());

-- Usage: users read own, insert own
create policy "Users read own usage" on api_usage for select using (user_id = auth.uid());
create policy "System insert usage" on api_usage for insert with check (true);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on skills
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger skills_updated_at
  before update on skills
  for each row execute procedure public.update_updated_at();
