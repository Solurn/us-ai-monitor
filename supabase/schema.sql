create extension if not exists citext;
create extension if not exists pgcrypto;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  display_name text not null default '',
  role text not null default 'member' check (role in ('member', 'admin')),
  status text not null default 'inactive' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_permissions (
  member_id uuid not null references public.members(id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (member_id, feature_key),
  check (feature_key in (
    'us_events',
    'us_learning',
    'us_watchlist',
    'tw_insider',
    'tw_self_report',
    'tw_financial_report',
    'tw_ir_summary',
    'tw_revenue',
    'daily_briefing'
  ))
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  admin_email citext not null,
  action text not null,
  target_email citext not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;
alter table public.member_permissions enable row level security;
alter table public.audit_logs enable row level security;

create index if not exists members_email_idx on public.members (email);
create index if not exists member_permissions_member_id_idx on public.member_permissions (member_id);
create index if not exists audit_logs_target_email_idx on public.audit_logs (target_email);

-- The Vercel API uses SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- Browser clients should not query these tables directly.
