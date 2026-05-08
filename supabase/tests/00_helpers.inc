-- Shared pgTAP helper: authenticate_as(user_id) -- Must run inside a BEGIN/ROLLBACK block in every
test file. -- Sets session-local JWT claims so RLS functions (auth.uid(), auth.role()) -- return the
right values for the simulated user. create schema if not exists tests; create or replace function
tests.authenticate_as(p_user_id uuid) returns void language plpgsql as $$ begin perform
set_config('role', 'authenticated', true); perform set_config('request.jwt.claim.sub',
p_user_id::text, true); perform set_config('request.jwt.claim.role', 'authenticated', true); perform
set_config('request.jwt.claims', json_build_object('sub', p_user_id, 'role', 'authenticated')::text,
true ); end; $$; create or replace function tests.logout() returns void language plpgsql as $$ begin
perform set_config('role', 'anon', true); perform set_config('request.jwt.claim.sub', '', true);
perform set_config('request.jwt.claim.role','anon', true); perform set_config('request.jwt.claims',
'{}', true); end; $$; -- Fixed UUIDs matching seed.sql create or replace function tests.owner_id()
returns uuid as $$ select '00000000-0000-0000-0000-000000000001'::uuid; $$ language sql immutable;
create or replace function tests.admin_id() returns uuid as $$ select
'00000000-0000-0000-0000-000000000002'::uuid; $$ language sql immutable; create or replace function
tests.viewer_id() returns uuid as $$ select '00000000-0000-0000-0000-000000000003'::uuid; $$
language sql immutable; create or replace function tests.stranger_id()returns uuid as $$ select
'00000000-0000-0000-0000-000000000099'::uuid; $$ language sql immutable; create or replace function
tests.account_id() returns uuid as $$ select '10000000-0000-0000-0000-000000000001'::uuid; $$
language sql immutable; create or replace function tests.project_id() returns uuid as $$ select
'30000000-0000-0000-0000-000000000001'::uuid; $$ language sql immutable; create or replace function
tests.milestone_done_id() returns uuid as $$ select '40000000-0000-0000-0000-000000000001'::uuid; $$
language sql immutable; create or replace function tests.milestone_active_id() returns uuid as $$
select '40000000-0000-0000-0000-000000000002'::uuid; $$ language sql immutable; create or replace
function tests.deliverable_draft_id() returns uuid as $$ select
'50000000-0000-0000-0000-000000000005'::uuid; $$ language sql immutable; create or replace function
tests.deliverable_published_id()returns uuid as $$ select
'50000000-0000-0000-0000-000000000001'::uuid; $$ language sql immutable; create or replace function
tests.comment_on_deliverable_id()returns uuid as $$ select
'60000000-0000-0000-0000-000000000001'::uuid; $$ language sql immutable; create or replace function
tests.comment_on_milestone_id() returns uuid as $$ select
'60000000-0000-0000-0000-000000000002'::uuid; $$ language sql immutable; grant usage on schema tests
to anon, authenticated; grant execute on all functions in schema tests to anon, authenticated;
