-- pgTAP: RLS tests for public.system_owners and is_system_owner()

begin;
select plan(6);

\ir 00_helpers.inc

-- ── Direct table access (should always be blocked) ────────────────────────────

-- (a) Anon cannot read system_owners
select tests.logout();
select results_eq(
  $$ select count(*)::int from public.system_owners $$,
  $$ values (0) $$,
  'anon cannot read system_owners (deny-all RLS)'
);

-- (b) Authenticated non-owner cannot read system_owners
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ select count(*)::int from public.system_owners $$,
  $$ values (0) $$,
  'stranger cannot read system_owners (deny-all RLS)'
);

-- (c) Even owner_id cannot read the table directly (deny-all is restrictive)
select tests.authenticate_as(tests.owner_id());
select results_eq(
  $$ select count(*)::int from public.system_owners $$,
  $$ values (0) $$,
  'owner cannot read system_owners directly (restrictive deny-all)'
);

-- ── is_system_owner() via RPC ──────────────────────────────────────────────────
-- Seed data (seed.sql) inserts owner_id into system_owners for local dev.

-- (d) owner_id returns true
select tests.authenticate_as(tests.owner_id());
select results_eq(
  $$ select public.is_system_owner() $$,
  $$ values (true) $$,
  'is_system_owner() returns true for seeded owner'
);

-- (e) admin_id (account member, not system owner) returns false
select tests.authenticate_as(tests.admin_id());
select results_eq(
  $$ select public.is_system_owner() $$,
  $$ values (false) $$,
  'is_system_owner() returns false for non-system-owner member'
);

-- (f) stranger returns false
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ select public.is_system_owner() $$,
  $$ values (false) $$,
  'is_system_owner() returns false for stranger'
);

select * from finish();
rollback;
