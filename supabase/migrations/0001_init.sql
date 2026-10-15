create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  display_name text,
  birth_year int,
  household_size int,
  income_type text check (income_type in ('salary','freelance','both')),
  monthly_income numeric,
  other_income numeric default 0,
  pay_day int,
  retire_age int,
  post_retire_income numeric,
  monthly_essentials numeric,
  lang text default 'th' check (lang in ('th','en')),
  onboarded_at timestamptz,
  created_at timestamptz default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('upload','voice','form','sample')),
  file_name text,
  page int,
  line_text text,
  confidence numeric,
  created_at timestamptz default now()
);

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lender text not null,
  type text not null check (type in ('credit_card','personal','car','home','student','informal')),
  label text not null,
  balance numeric not null check (balance >= 0),
  rate_pct numeric,
  min_payment numeric not null default 0 check (min_payment >= 0),
  due_day int check (due_day between 1 and 31),
  term_months_left int,
  status text not null default 'user_stated' check (status in ('verified','needs_review','user_stated')),
  source_id uuid references public.sources(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  month text not null,
  inputs jsonb not null,
  result jsonb not null,
  created_at timestamptz default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  masked_payload jsonb,
  created_at timestamptz default now()
);

create index on public.sources (user_id);
create index on public.debts (user_id);
create index on public.debts (user_id, lender);
create index on public.debts (user_id, type);
create index on public.plans (user_id);
create index on public.messages (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.sources enable row level security;
alter table public.debts enable row level security;
alter table public.plans enable row level security;
alter table public.messages enable row level security;

create policy "own rows" on public.profiles for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.sources  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.debts    for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.plans    for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.messages for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
