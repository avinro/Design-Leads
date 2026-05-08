-- pgTAP: RLS tests for public.comments
-- Key rules:
--   - All confirmed members can read comments.
--   - Only non-viewer members can insert comments.
--   - Authors or admins can update/delete their own comments.

begin;
select plan(14);

\ir 00_helpers.inc

-- (a) Owner reads all comments
select tests.authenticate_as(tests.owner_id());
select results_eq(
  $$ select count(*)::int from public.comments where account_id = tests.account_id() $$,
  $$ values (2) $$,
  'owner sees both comments'
);

-- (b) Admin reads comments
select tests.authenticate_as(tests.admin_id());
select results_eq(
  $$ select count(*)::int from public.comments where account_id = tests.account_id() $$,
  $$ values (2) $$,
  'admin member sees both comments'
);

-- (c) Viewer reads comments
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ select count(*)::int from public.comments where account_id = tests.account_id() $$,
  $$ values (2) $$,
  'viewer member sees both comments'
);

-- (d) Stranger sees none
select tests.authenticate_as(tests.stranger_id());
select results_eq(
  $$ select count(*)::int from public.comments $$,
  $$ values (0) $$,
  'stranger sees no comments'
);

-- (e) Anon sees none
select tests.logout();
select results_eq(
  $$ select count(*)::int from public.comments $$,
  $$ values (0) $$,
  'anon sees no comments'
);

-- (f) Owner can insert a comment on a milestone
select tests.authenticate_as(tests.owner_id());
select lives_ok(
  $$ insert into public.comments (account_id, milestone_id, author_id, body)
     values (tests.account_id(), tests.milestone_active_id(), tests.owner_id(), 'Owner comment') $$,
  'owner can insert comment'
);

-- (g) Admin member can insert a comment
select tests.authenticate_as(tests.admin_id());
select lives_ok(
  $$ insert into public.comments (account_id, milestone_id, author_id, body)
     values (tests.account_id(), tests.milestone_active_id(), tests.admin_id(), 'Admin comment') $$,
  'admin member can insert comment'
);

-- (h) Viewer cannot insert a comment
select tests.authenticate_as(tests.viewer_id());
select throws_ok(
  $$ insert into public.comments (account_id, milestone_id, author_id, body)
     values (tests.account_id(), tests.milestone_active_id(), tests.viewer_id(), 'Viewer comment') $$,
  '42501',
  'new row violates row-level security policy for table "comments"',
  'viewer cannot insert comment'
);

-- (i) Stranger cannot insert
select tests.authenticate_as(tests.stranger_id());
select throws_ok(
  $$ insert into public.comments (account_id, milestone_id, author_id, body)
     values (tests.account_id(), tests.milestone_active_id(), tests.stranger_id(), 'Stranger comment') $$,
  '42501',
  'new row violates row-level security policy for table "comments"',
  'stranger cannot insert comment'
);

-- (j) Author (admin) can update their own comment
select tests.authenticate_as(tests.admin_id());
select lives_ok(
  $$ update public.comments set body = 'Edited by author'
     where id = tests.comment_on_deliverable_id() $$,
  'comment author can update own comment'
);

-- (k) Owner can update any comment
select tests.authenticate_as(tests.owner_id());
select lives_ok(
  $$ update public.comments set body = 'Edited by owner'
     where id = tests.comment_on_deliverable_id() $$,
  'owner can update any comment'
);

-- (l) Viewer cannot update a comment they did not write (0 rows affected)
select tests.authenticate_as(tests.viewer_id());
select results_eq(
  $$ with upd as (
       update public.comments set body = 'Viewer edit attempt'
       where id = tests.comment_on_deliverable_id()
       returning id
     ) select count(*)::int from upd $$,
  $$ values (0) $$,
  'viewer cannot update another user comment'
);

-- (m) Author (admin) can delete their own comment
select tests.authenticate_as(tests.admin_id());
select lives_ok(
  $$ delete from public.comments where id = tests.comment_on_deliverable_id() $$,
  'comment author can delete own comment'
);

-- (n) Owner can delete any comment
select tests.authenticate_as(tests.owner_id());
select lives_ok(
  $$ delete from public.comments where id = tests.comment_on_milestone_id() $$,
  'owner can delete any comment'
);

select * from finish();
rollback;
