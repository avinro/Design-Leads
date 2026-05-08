-- pgTAP: RLS tests for public.intake_forms
-- Key rules:
--   - All members can read.
--   - Only owner can insert (creates the form structure).
--   - Non-viewer members can update (submit responses).
--   - Viewers and strangers cannot mutate.

begin;
select plan(10);

\ir 00_helpers.inc

-- (a) Owner reads intake form
select tests.authenticate_as(tests.owner_id());
select results_eq(
  $$ select count(*)::int from public.intake_forms where account_id = tests.account_id() $$,
  $$ values (1) $$,
  'owner sees the intake form'
);

-- (b) Admin reads intake form
select tests.authenticate_as(tests.admin_id());
select results_eq(
  $$ select count(*)::int from public.intake_forms where account_id = tests.account_id() $$,
  $$ values (1) $$,
  'admin member sees the intake form'
);

-- (c) Viewer reads intake form
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ select count(*)::int from public.intake_forms where account_id = tests.account_id() $$,
  $$ values (1) $$,
  'viewer member sees the intake form'
);

-- (d) Stranger sees nothing
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ select count(*)::int from public.intake_forms $$,
  $$ values (0) $$,
  'stranger sees no intake forms'
);

-- (e) Anon sees nothing
select tests.logout();
select results_eq(
  $$ select count(*)::int from public.intake_forms $$,
  $$ values (0) $$,
  'anon sees no intake forms'
);

-- (f) Admin member can submit (update) responses
select tests.authenticate_as(tests.admin_id());
select lives_ok(
  $$ update public.intake_forms
     set responses = '{"business_context": "Updated by admin"}'::jsonb,
         submitted_at = now()
     where account_id = tests.account_id() $$,
  'admin member can submit intake form responses'
);

-- (g) Viewer cannot update the intake form (0 rows affected)
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ with upd as (
       update public.intake_forms
       set responses = '{"business_context": "Viewer attempt"}'::jsonb
       where account_id = tests.account_id()
       returning id
     ) select count(*)::int from upd $$,
  $$ values (0) $$,
  'viewer cannot update intake form'
);

-- (h) Stranger cannot update
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ with upd as (
       update public.intake_forms
       set responses = '{"business_context": "Stranger attempt"}'::jsonb
       where account_id = tests.account_id()
       returning id
     ) select count(*)::int from upd $$,
  $$ values (0) $$,
  'stranger cannot update intake form'
);

-- (i) Owner can insert a new intake form (add a second project first)
select tests.authenticate_as(tests.owner_id());
select lives_ok($test$
  do $$
  declare
    new_project_id uuid := gen_random_uuid();
  begin
    insert into public.projects (id, account_id, owner_id, name, current_phase)
    values (new_project_id, tests.account_id(), tests.owner_id(), 'Second project', 'discovery');

    insert into public.intake_forms (project_id, account_id, schema)
    values (new_project_id, tests.account_id(), '{}'::jsonb);
  end;
  $$;
$test$,
  'owner can insert an intake form'
);

-- (j) Viewer cannot insert an intake form
select tests.authenticate_as(tests.viewer_id());
select throws_ok(
  $$ insert into public.intake_forms (project_id, account_id, schema)
     values (tests.project_id(), tests.account_id(), '{}'::jsonb) $$,
  '42501',
  'new row violates row-level security policy for table "intake_forms"',
  'viewer cannot insert intake form'
);

select * from finish();
rollback;
