select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
set role authenticated;

-- Should affect 0 rows (no error, just nothing changes)
update public.deliverables
set status = 'published'
where id = '50000000-0000-0000-0000-000000000005';

-- Confirm still 5 rows and that deliverable is still 'draft'
select id, title, status from public.deliverables order by created_at;