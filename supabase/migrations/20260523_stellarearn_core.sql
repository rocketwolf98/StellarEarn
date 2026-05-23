-- StellarEarn core schema for Supabase
-- Covers API ingestion for users, gigs, submissions, wallet auth challenges, and transactions.

create extension if not exists pgcrypto;

-- ==============================
-- Enums
-- ==============================
do $$ begin
  create type public.account_status as enum ('pending', 'active', 'suspended', 'closed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.auth_provider_type as enum ('sep10', 'email');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.activity_type as enum (
    'account_created',
    'trustline_added',
    'payment_sent',
    'payment_received',
    'balance_updated',
    'minimum_balance_alert',
    'error'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.transaction_status as enum (
    'pending_signature',
    'signed',
    'submitted',
    'confirmed',
    'failed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.network_type as enum ('testnet', 'mainnet');
exception when duplicate_object then null;
end $$;

-- ==============================
-- Core tables
-- ==============================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  username text not null,
  role text not null default 'earner' check (role in ('earner', 'sponsor')),
  stellar_public_key text not null,
  auth_provider public.auth_provider_type,
  account_status public.account_status default 'pending',
  account_created_at timestamptz default now(),
  sep10_challenge_xdr text,
  sep10_challenge_created_at timestamptz,
  wallet_verified_at timestamptz,
  last_login_at timestamptz,
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_unique unique (email),
  constraint users_username_unique unique (username),
  constraint users_wallet_unique unique (stellar_public_key)
);

create table if not exists public.gigs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  org text not null,
  initials text not null,
  description text not null,
  desc_short text,
  prize_php numeric(14,2) not null,
  reward_amount numeric(18,7) not null,
  reward_unit text not null default 'USDC',
  fee_xlm numeric(18,7) not null default 0,
  type text not null default 'bounty' check (type in ('bounty', 'project', 'grant')),
  skill text not null,
  deadline_at timestamptz not null,
  submissions integer not null default 0,
  featured boolean not null default false,
  live boolean not null default true,
  status text not null default 'open' check (status in ('open', 'pending_review', 'closed', 'paid')),
  sponsor_name text,
  sponsor_wallet text,
  payment_tx_hash text,
  paid_at timestamptz,
  paid_by_user_id uuid references public.users(id) on delete set null,
  created_by_user_id uuid not null references public.users(id) on delete restrict,
  bg text,
  color text,
  deliverables text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gig_submissions (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  worker_user_id uuid not null references public.users(id) on delete cascade,
  worker_name text,
  submission_url text not null,
  description text,
  notes text,
  twitter_url text,
  status text not null default 'pending_review' check (status in ('pending_review', 'approved', 'rejected')),
  approved_by_user_id uuid references public.users(id) on delete set null,
  payout_tx_hash text,
  approved_at timestamptz,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  gig_id uuid references public.gigs(id) on delete set null,
  submission_id uuid references public.gig_submissions(id) on delete set null,
  stellar_public_key text not null,
  tx_hash text not null unique,
  network public.network_type not null default 'testnet',
  status public.transaction_status not null default 'submitted',
  operation text not null,
  amount_stroops bigint,
  asset_code text,
  asset_issuer text,
  metadata jsonb not null default '{}'::jsonb,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_amount_non_negative check (amount_stroops is null or amount_stroops >= 0)
);

create table if not exists public.wallet_auth_challenges (
  id uuid primary key default gen_random_uuid(),
  stellar_public_key text not null,
  challenge_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.account_activity (
  id bigint generated by default as identity primary key,
  stellar_account_id text not null,
  activity_type public.activity_type not null,
  description text not null,
  txn_hash text,
  ledger_sequence bigint,
  data jsonb,
  recorded_at timestamptz not null default now()
);

-- ==============================
-- Indexes
-- ==============================
create index if not exists idx_users_wallet on public.users(stellar_public_key);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_gigs_live_status on public.gigs(live, status);
create index if not exists idx_gig_submissions_gig on public.gig_submissions(gig_id);
create index if not exists idx_gig_submissions_worker on public.gig_submissions(worker_user_id);
create index if not exists idx_transactions_user on public.transactions(user_id);
create index if not exists idx_transactions_hash on public.transactions(tx_hash);
create index if not exists idx_wallet_auth_wallet on public.wallet_auth_challenges(stellar_public_key);
create index if not exists idx_wallet_auth_expiry on public.wallet_auth_challenges(expires_at);
create index if not exists idx_account_activity_wallet on public.account_activity(stellar_account_id, recorded_at desc);

-- ==============================
-- Trigger helpers
-- ==============================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.bump_gig_submission_counter()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.gigs
      set submissions = submissions + 1,
          updated_at = now()
    where id = new.gig_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.gigs
      set submissions = greatest(submissions - 1, 0),
          updated_at = now()
    where id = old.gig_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_gigs_set_updated_at on public.gigs;
create trigger trg_gigs_set_updated_at
before update on public.gigs
for each row execute function public.set_updated_at();

drop trigger if exists trg_transactions_set_updated_at on public.transactions;
create trigger trg_transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

drop trigger if exists trg_gig_submission_counter on public.gig_submissions;
create trigger trg_gig_submission_counter
after insert or delete on public.gig_submissions
for each row execute function public.bump_gig_submission_counter();

-- ==============================
-- RLS
-- ==============================
alter table public.users enable row level security;
alter table public.gigs enable row level security;
alter table public.gig_submissions enable row level security;
alter table public.transactions enable row level security;
alter table public.wallet_auth_challenges enable row level security;
alter table public.account_activity enable row level security;

-- NOTE: These permissive policies are for hackathon velocity.
-- Tighten to authenticated user ownership checks before production.

drop policy if exists users_read_all on public.users;
create policy users_read_all on public.users
for select using (true);

drop policy if exists users_write_all on public.users;
create policy users_write_all on public.users
for all using (true) with check (true);

drop policy if exists gigs_read_all on public.gigs;
create policy gigs_read_all on public.gigs
for select using (true);

drop policy if exists gigs_write_all on public.gigs;
create policy gigs_write_all on public.gigs
for all using (true) with check (true);

drop policy if exists submissions_read_all on public.gig_submissions;
create policy submissions_read_all on public.gig_submissions
for select using (true);

drop policy if exists submissions_write_all on public.gig_submissions;
create policy submissions_write_all on public.gig_submissions
for all using (true) with check (true);

drop policy if exists transactions_read_all on public.transactions;
create policy transactions_read_all on public.transactions
for select using (true);

drop policy if exists transactions_write_all on public.transactions;
create policy transactions_write_all on public.transactions
for all using (true) with check (true);

drop policy if exists wallet_auth_write_all on public.wallet_auth_challenges;
create policy wallet_auth_write_all on public.wallet_auth_challenges
for all using (true) with check (true);

drop policy if exists activity_read_all on public.account_activity;
create policy activity_read_all on public.account_activity
for select using (true);

drop policy if exists activity_write_all on public.account_activity;
create policy activity_write_all on public.account_activity
for insert with check (true);
