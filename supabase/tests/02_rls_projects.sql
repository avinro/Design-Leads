-- pgTAP: RLS tests for public.projects

begin;
select plan(10);

\ir 00_helpers.inc

-- (a) Owner reads their project
select tests.authenticate_as(tests.owner_id());
select results_eq(
  $$ select count(*)::int from public.projects where id = tests.project_id() $$,
  $$ values (1) $$,
  'owner can read their project'
);

-- (b) Admin member reads the project
select tests.authenticate_as(tests.admin_id());
select results_eq(
  $$ select count(*)::int from public.projects where id = tests.project_id() $$,
  $$ values (1) $$,
  'admin member can read project'
);

-- (c) Viewer member reads the project
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ select count(*)::int from public.projects where id = tests.project_id() $$,
  $$ values (1) $$,
  'viewer member can read project'
);

-- (d) Stranger sees no projects
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ select count(*)::int from public.projects $$,
  $$ values (0) $$,
  'stranger sees no projects'
);

-- (e) Anon sees no projects
select tests.logout();
select results_eq(
  $$ select count(*)::int from public.projects $$,
  $$ values (0) $$,
  'anon sees no projects'
);

-- (f) Owner can update project
select tests.authenticate_as(tests.owner_id());
select lives_ok(
  $$ update public.projects set description = 'Updated by owner' where id = tests.project_id() $$,
  'owner can update project'
);

-- (g) Admin member can update project
select tests.authenticate_as(tests.admin_id());
select lives_ok(
  $$ update public.projects set description = 'Updated by admin' where id = tests.project_id() $$,
  'admin member can update project'
);

-- (h) Viewer cannot update project (UPDATE silently affects 0 rows via RLS)
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ with upd as (
       update public.projects set description = 'Viewer attempt'
       where id = tests.project_id()
       returning id
     ) select count(*)::int from upd $$,
  $$ values (0) $$,
  'viewer update returns 0 affected rows (blocked by RLS)'
);

-- (i) Stranger cannot update
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ with upd as (
       update public.projects set description = 'Stranger attempt'
       where id = tests.project_id()
       returning id
     ) select count(*)::int from upd $$,
  $$ values (0) $$,
  'stranger update returns 0 affected rows'
);

-- (j) Owner can delete project (restore it after)
select tests.authenticate_as(tests.owner_id());
select lives_ok(
  $$ delete from public.projects where id = tests.project_id() $$,
  'owner can delete project'
);
-- Deletion cascades in the test transaction; rollback will restore everything.

select * from finish();
rollback;
