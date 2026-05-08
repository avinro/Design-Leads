-- pgTAP: RLS tests for public.accounts and public.account_members

begin;
select plan(14);

\ir 00_helpers.inc

-- ── accounts ──────────────────────────────────────────────────────────────────

-- (a) Owner reads their account
select tests.authenticate_as(tests.owner_id());
select results_eq(
  $$ select count(*)::int from public.accounts where id = tests.account_id() $$,
  $$ values (1) $$,
  'owner can read their account row'
);

-- (b) Account member (admin) can read the account row
select tests.authenticate_as(tests.admin_id());
select results_eq(
  $$ select count(*)::int from public.accounts where id = tests.account_id() $$,
  $$ values (1) $$,
  'admin member can read account row'
);

-- (c) Viewer member can read the account row
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ select count(*)::int from public.accounts where id = tests.account_id() $$,
  $$ values (1) $$,
  'viewer member can read account row'
);

-- (d) Stranger sees nothing
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ select count(*)::int from public.accounts $$,
  $$ values (0) $$,
  'stranger sees no account rows'
);

-- (e) Anon sees nothing
select tests.logout();
select results_eq(
  $$ select count(*)::int from public.accounts $$,
  $$ values (0) $$,
  'anon sees no account rows'
);

-- ── account_members ───────────────────────────────────────────────────────────

-- (f) Owner reads member list
select tests.authenticate_as(tests.owner_id());
select results_eq(
  $$ select count(*)::int from public.account_members where account_id = tests.account_id() $$,
  $$ values (2) $$,
  'owner sees all account members'
);

-- (g) Admin reads member list
select tests.authenticate_as(tests.admin_id());
select results_eq(
  $$ select count(*)::int from public.account_members where account_id = tests.account_id() $$,
  $$ values (2) $$,
  'admin member sees member list'
);

-- (h) Viewer reads member list
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ select count(*)::int from public.account_members where account_id = tests.account_id() $$,
  $$ values (2) $$,
  'viewer member sees member list'
);

-- (i) Stranger sees no members
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ select count(*)::int from public.account_members $$,
  $$ values (0) $$,
  'stranger sees no account_members rows'
);

-- (j) Owner can insert a new member
select tests.authenticate_as(tests.owner_id());
select lives_ok(
  $$ insert into public.account_members (account_id, user_id, role, joined_at)
     values (tests.account_id(), tests.stranger_id(), 'viewer', now()) $$,
  'owner can add a member'
);

-- (k) Admin can also insert a member (cleanup first)
delete from public.account_members
  where account_id = tests.account_id() and user_id = tests.stranger_id();

select tests.authenticate_as(tests.admin_id());
select lives_ok(
  $$ insert into public.account_members (account_id, user_id, role, joined_at)
     values (tests.account_id(), tests.stranger_id(), 'viewer', now()) $$,
  'admin can add a member'
);

-- (l) Viewer cannot insert a member
delete from public.account_members
  where account_id = tests.account_id() and user_id = tests.stranger_id();

select tests.authenticate_as(tests.viewer_id());
select throws_ok(
  $$ insert into public.account_members (account_id, user_id, role, joined_at)
     values (tests.account_id(), tests.stranger_id(), 'viewer', now()) $$,
  '42501',
  'new row violates row-level security policy for table "account_members"',
  'viewer cannot add a member'
);

-- (m) Stranger cannot insert into any account
select tests.authenticate_as(tests.stranger_id());
select throws_ok(
  $$ insert into public.account_members (account_id, user_id, role, joined_at)
     values (tests.account_id(), tests.stranger_id(), 'viewer', now()) $$,
  '42501',
  'new row violates row-level security policy for table "account_members"',
  'stranger cannot add members'
);

-- (n) Anon cannot insert
select tests.logout();
select throws_ok(
  $$ insert into public.account_members (account_id, user_id, role, joined_at)
     values (tests.account_id(), tests.stranger_id(), 'viewer', now()) $$,
  '42501',
  'new row violates row-level security policy for table "account_members"',
  'anon cannot add members'
);

select * from finish();
rollback;
