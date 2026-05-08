-- PRO-37: system_owners table, deny-all RLS, and is_system_owner() helper.
--
-- system_owners stores the UUIDs of users who have full platform-owner
-- privileges (access to /outreach, /owner/* routes, admin invite flow).
-- It is intentionally separate from account ownership in public.accounts,
-- which is per-client-account. One user row here means "the designer
-- running this installation" — typically a single row in production.
--
-- The table is protected by a restrictive deny-all policy so it is never
-- readable through the Data API or with a normal anon/authenticated client.
-- Applications must call the is_system_owner() RPC instead.

create table public.system_owners (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.system_owners enable row level security;

-- Restrictive deny-all: no role may select/insert/update/delete through the
-- API, even if a permissive policy exists elsewhere. The SECURITY DEFINER
-- function below bypasses RLS because it runs as the function owner.
create policy "system_owners: deny all"
  on public.system_owners
  as restrictive
  for all
  using (false);

-- is_system_owner() — callable via RPC by any authenticated user.
-- Returns true iff auth.uid() has a row in system_owners.
-- SECURITY DEFINER + pinned search_path to prevent injection.
-- STABLE so Postgres may cache the result within a single statement.
create or replace function public.is_system_owner()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.system_owners
    where user_id = (select auth.uid())
  );
$$;

-- Restrict the default PUBLIC grant; only authenticated users may call it.
revoke all on function public.is_system_owner() from public;
grant execute on function public.is_system_owner() to authenticated;

-- ─── Seed note ────────────────────────────────────────────────────────────────
-- After deploying to a new environment, seed the owner row once:
--
--   insert into public.system_owners (user_id)
--   values ('<uuid-from-auth-users>')
--   on conflict do nothing;
--
-- Local dev: added below as part of seed.sql, keyed to the fixed owner UUID.
