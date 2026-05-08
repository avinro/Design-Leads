-- pgTAP: RLS tests for public.milestones, public.deliverables
-- Key rule: viewer role cannot INSERT/UPDATE/DELETE deliverables.

begin;
select plan(16);

\ir 00_helpers.inc

-- ── milestones ────────────────────────────────────────────────────────────────

-- (a) Owner reads milestones
select tests.authenticate_as(tests.owner_id());
select results_eq(
  $$ select count(*)::int from public.milestones where account_id = tests.account_id() $$,
  $$ values (3) $$,
  'owner sees all 3 milestones'
);

-- (b) Member reads milestones
select tests.authenticate_as(tests.admin_id());
select results_eq(
  $$ select count(*)::int from public.milestones where account_id = tests.account_id() $$,
  $$ values (3) $$,
  'admin member sees all 3 milestones'
);

-- (c) Stranger sees none
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ select count(*)::int from public.milestones $$,
  $$ values (0) $$,
  'stranger sees no milestones'
);

-- ── deliverables ──────────────────────────────────────────────────────────────

-- (d) Owner reads all 5 deliverables
select tests.authenticate_as(tests.owner_id());
select results_eq(
  $$ select count(*)::int from public.deliverables where account_id = tests.account_id() $$,
  $$ values (5) $$,
  'owner sees all 5 deliverables'
);

-- (e) Admin sees all 5
select tests.authenticate_as(tests.admin_id());
select results_eq(
  $$ select count(*)::int from public.deliverables where account_id = tests.account_id() $$,
  $$ values (5) $$,
  'admin member sees all 5 deliverables'
);

-- (f) Viewer sees all 5 (read is allowed for all members)
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ select count(*)::int from public.deliverables where account_id = tests.account_id() $$,
  $$ values (5) $$,
  'viewer member sees all 5 deliverables'
);

-- (g) Stranger sees none
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ select count(*)::int from public.deliverables $$,
  $$ values (0) $$,
  'stranger sees no deliverables'
);

-- (h) Owner can insert a deliverable
select tests.authenticate_as(tests.owner_id());
select lives_ok(
  $$ insert into public.deliverables (milestone_id, account_id, type, title, external_link, status)
     values (tests.milestone_active_id(), tests.account_id(), 'link', 'Owner test link',
             'https://example.com', 'draft') $$,
  'owner can insert deliverable'
);

-- (i) Admin can insert a deliverable
select tests.authenticate_as(tests.admin_id());
select lives_ok(
  $$ insert into public.deliverables (milestone_id, account_id, type, title, external_link, status)
     values (tests.milestone_active_id(), tests.account_id(), 'link', 'Admin test link',
             'https://example.com/admin', 'draft') $$,
  'admin member can insert deliverable'
);

-- (j) Viewer cannot insert a deliverable
select tests.authenticate_as(tests.viewer_id());
select throws_ok(
  $$ insert into public.deliverables (milestone_id, account_id, type, title, external_link, status)
     values (tests.milestone_active_id(), tests.account_id(), 'link', 'Viewer test link',
             'https://example.com/viewer', 'draft') $$,
  '42501',
  'new row violates row-level security policy for table "deliverables"',
  'viewer cannot insert deliverable'
);

-- (k) Viewer cannot update a deliverable (affects 0 rows)
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ with upd as (
       update public.deliverables
       set status = 'published'
       where id = tests.deliverable_draft_id()
       returning id
     ) select count(*)::int from upd $$,
  $$ values (0) $$,
  'viewer update deliverable returns 0 rows (blocked by RLS)'
);

-- (l) Admin can update a deliverable
select tests.authenticate_as(tests.admin_id());
select lives_ok(
  $$ update public.deliverables set status = 'published'
     where id = tests.deliverable_draft_id() $$,
  'admin member can update deliverable'
);

-- (m) Viewer cannot delete a deliverable (affects 0 rows)
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ with del as (
       delete from public.deliverables
       where id = tests.deliverable_draft_id()
       returning id
     ) select count(*)::int from del $$,
  $$ values (0) $$,
  'viewer delete deliverable returns 0 rows (blocked by RLS)'
);

-- (n) Admin can delete a deliverable
select tests.authenticate_as(tests.admin_id());
select lives_ok(
  $$ delete from public.deliverables where id = tests.deliverable_draft_id() $$,
  'admin member can delete deliverable'
);

-- (o) Stranger cannot insert
select tests.authenticate_as(tests.stranger_id());
select throws_ok(
  $$ insert into public.deliverables (milestone_id, account_id, type, title, external_link, status)
     values (tests.milestone_active_id(), tests.account_id(), 'link', 'Stranger link',
             'https://example.com/stranger', 'draft') $$,
  '42501',
  'new row violates row-level security policy for table "deliverables"',
  'stranger cannot insert deliverable'
);

-- (p) Anon cannot read
select tests.logout();
select results_eq(
  $$ select count(*)::int from public.deliverables $$,
  $$ values (0) $$,
  'anon sees no deliverables'
);

select * from finish();
rollback;
