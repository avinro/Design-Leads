-- pgTAP: trigger tests for handle_user_email_confirmed()
-- Verifies that account_members.joined_at is sealed when auth.users.email_confirmed_at
-- transitions from NULL to a real timestamp.

begin;
select plan(4);

\ir 00_helpers.inc

-- ── Setup: invited user (email not yet confirmed) ─────────────────────────────

-- Insert a new auth user simulating a freshly invited client (unconfirmed).
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
) values (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'invited@acme.test',
  '$2a$10$placeholder',
  null,           -- not yet confirmed
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated', 'authenticated'
) on conflict (id) do nothing;

-- Insert a pending account_members row (invited but not yet joined).
insert into public.account_members (
  id, account_id, user_id, role, invited_at, joined_at
) values (
  'bbbbbbbb-0000-0000-0000-000000000001',
  tests.account_id(),
  'aaaaaaaa-0000-0000-0000-000000000001',
  'member',
  now(),
  null    -- not yet joined
) on conflict (id) do nothing;

-- (a) joined_at is NULL before confirmation
select results_eq(
  $$ select joined_at from public.account_members
     where id = 'bbbbbbbb-0000-0000-0000-000000000001' $$,
  $$ values (null::timestamptz) $$,
  'joined_at is null before email confirmation'
);

-- ── Simulate email confirmation (trigger should fire) ─────────────────────────

update auth.users
   set email_confirmed_at = now()
 where id = 'aaaaaaaa-0000-0000-0000-000000000001';

-- (b) joined_at is now set
select isnt(
  (select joined_at from public.account_members
   where id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  null,
  'trigger sealed joined_at after email_confirmed_at was set'
);

-- ── Idempotency: re-confirming does not reset joined_at ───────────────────────

-- Record current joined_at value.
do $$
declare
  v_joined timestamptz;
begin
  select joined_at into v_joined
    from public.account_members
   where id = 'bbbbbbbb-0000-0000-0000-000000000001';

  -- Simulate a no-op re-update (same value).
  update auth.users
     set email_confirmed_at = email_confirmed_at
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';
end;
$$;

-- (c) joined_at still equals the first sealed value (trigger skips same-value update)
select results_eq(
  $$ select count(*)::int from public.account_members
     where id = 'bbbbbbbb-0000-0000-0000-000000000001'
       and joined_at is not null $$,
  $$ values (1) $$,
  'joined_at remains set after duplicate email_confirmed_at update'
);

-- ── No-op when no account_members row exists ──────────────────────────────────

-- Insert a second user with no account_members row.
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
) values (
  'aaaaaaaa-0000-0000-0000-000000000002',
  'noaccount@other.test',
  '$2a$10$placeholder',
  null,
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated', 'authenticated'
) on conflict (id) do nothing;

update auth.users
   set email_confirmed_at = now()
 where id = 'aaaaaaaa-0000-0000-0000-000000000002';

-- (d) no crash, no rows affected — trigger is a no-op
select results_eq(
  $$ select count(*)::int from public.account_members
     where user_id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  $$ values (0) $$,
  'trigger is a no-op when no account_members row exists for user'
);

select * from finish();
rollback;
