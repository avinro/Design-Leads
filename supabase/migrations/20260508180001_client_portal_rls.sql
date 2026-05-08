-- PRO-36: RLS helpers and policies for client portal tables
-- Pattern: permissive policies only — RLS denies by default when no policy matches.
-- No restrictive deny-all here; that only belongs on public-access tables like contact_submissions.

-- ─── Helper functions (SECURITY DEFINER, stable) ─────────────────────────────
-- Marked STABLE so Postgres can cache the result within a single statement.
-- search_path is pinned to avoid search_path injection.

create or replace function public.is_account_owner(p_account_id uuid)
returns boolean language sql stable security definer
set search_path = public, auth as $$
  select exists (
    select 1 from public.accounts
    where id = p_account_id and owner_id = auth.uid()
  );
$$;

create or replace function public.is_account_member(p_account_id uuid)
returns boolean language sql stable security definer
set search_path = public, auth as $$
  select exists (
    select 1 from public.account_members
    where account_id = p_account_id
      and user_id = auth.uid()
      and joined_at is not null
  );
$$;

-- Returns the caller's role for a given account, or NULL if not a member.
create or replace function public.account_role(p_account_id uuid)
returns text language sql stable security definer
set search_path = public, auth as $$
  select role
  from public.account_members
  where account_id = p_account_id
    and user_id = auth.uid()
    and joined_at is not null;
$$;

create or replace function public.is_project_owner(p_project_id uuid)
returns boolean language sql stable security definer
set search_path = public, auth as $$
  select exists (
    select 1 from public.projects
    where id = p_project_id and owner_id = auth.uid()
  );
$$;

-- ─── accounts ─────────────────────────────────────────────────────────────────

alter table public.accounts enable row level security;

-- Owner has full access
create policy "accounts: owner full access"
  on public.accounts
  for all
  to authenticated
  using     (is_account_owner(id))
  with check (is_account_owner(id));

-- Members can read their own account row
create policy "accounts: member read"
  on public.accounts
  for select
  to authenticated
  using (is_account_member(id));

-- ─── account_members ──────────────────────────────────────────────────────────

alter table public.account_members enable row level security;

-- Any confirmed member of the account can see the member list
create policy "account_members: member read"
  on public.account_members
  for select
  to authenticated
  using (is_account_member(account_id) or is_account_owner(account_id));

-- Only owner or admin can insert / delete members (invite and remove)
create policy "account_members: owner or admin write"
  on public.account_members
  for all
  to authenticated
  using (
    is_account_owner(account_id) or
    account_role(account_id) = 'admin'
  )
  with check (
    is_account_owner(account_id) or
    account_role(account_id) = 'admin'
  );

-- ─── projects ─────────────────────────────────────────────────────────────────

alter table public.projects enable row level security;

-- Owner (account owner or project owner) has full access
create policy "projects: owner full access"
  on public.projects
  for all
  to authenticated
  using (
    is_account_owner(account_id) or
    owner_id = auth.uid()
  )
  with check (
    is_account_owner(account_id) or
    owner_id = auth.uid()
  );

-- Any account member can read projects
create policy "projects: member read"
  on public.projects
  for select
  to authenticated
  using (is_account_member(account_id));

-- Admin and member roles can update projects (but not delete)
create policy "projects: admin/member update"
  on public.projects
  for update
  to authenticated
  using     (account_role(account_id) in ('admin', 'member'))
  with check (account_role(account_id) in ('admin', 'member'));

-- ─── milestones ───────────────────────────────────────────────────────────────

alter table public.milestones enable row level security;

-- Owner has full access
create policy "milestones: owner full access"
  on public.milestones
  for all
  to authenticated
  using     (is_account_owner(account_id))
  with check (is_account_owner(account_id));

-- Members can read
create policy "milestones: member read"
  on public.milestones
  for select
  to authenticated
  using (is_account_member(account_id));

-- Admin/member can create and update milestones
create policy "milestones: admin/member write"
  on public.milestones
  for insert
  to authenticated
  with check (account_role(account_id) in ('admin', 'member'));

create policy "milestones: admin/member update"
  on public.milestones
  for update
  to authenticated
  using     (account_role(account_id) in ('admin', 'member'))
  with check (account_role(account_id) in ('admin', 'member'));

-- ─── deliverables ─────────────────────────────────────────────────────────────

alter table public.deliverables enable row level security;

-- Owner has full access
create policy "deliverables: owner full access"
  on public.deliverables
  for all
  to authenticated
  using     (is_account_owner(account_id))
  with check (is_account_owner(account_id));

-- All confirmed members can read deliverables
create policy "deliverables: member read"
  on public.deliverables
  for select
  to authenticated
  using (is_account_member(account_id));

-- Only admin/member (not viewer) can create or update deliverables
create policy "deliverables: admin/member write"
  on public.deliverables
  for insert
  to authenticated
  with check (account_role(account_id) in ('admin', 'member'));

create policy "deliverables: admin/member update"
  on public.deliverables
  for update
  to authenticated
  using     (account_role(account_id) in ('admin', 'member'))
  with check (account_role(account_id) in ('admin', 'member'));

create policy "deliverables: admin/member delete"
  on public.deliverables
  for delete
  to authenticated
  using (account_role(account_id) in ('admin', 'member'));

-- ─── comments ─────────────────────────────────────────────────────────────────

alter table public.comments enable row level security;

-- Owner has full access
create policy "comments: owner full access"
  on public.comments
  for all
  to authenticated
  using     (is_account_owner(account_id))
  with check (is_account_owner(account_id));

-- Members and admins can read comments
create policy "comments: member read"
  on public.comments
  for select
  to authenticated
  using (is_account_member(account_id));

-- Only non-viewer members can post comments
create policy "comments: non-viewer insert"
  on public.comments
  for insert
  to authenticated
  with check (account_role(account_id) in ('admin', 'member'));

-- Authors can edit their own comments; admins can edit any
create policy "comments: author or admin update"
  on public.comments
  for update
  to authenticated
  using (
    author_id = auth.uid() or
    account_role(account_id) = 'admin'
  )
  with check (
    author_id = auth.uid() or
    account_role(account_id) = 'admin'
  );

-- Authors can delete their own comments; admins can delete any
create policy "comments: author or admin delete"
  on public.comments
  for delete
  to authenticated
  using (
    author_id = auth.uid() or
    account_role(account_id) = 'admin'
  );

-- ─── intake_forms ─────────────────────────────────────────────────────────────

alter table public.intake_forms enable row level security;

-- Owner has full access
create policy "intake_forms: owner full access"
  on public.intake_forms
  for all
  to authenticated
  using     (is_account_owner(account_id))
  with check (is_account_owner(account_id));

-- Members can read their intake form
create policy "intake_forms: member read"
  on public.intake_forms
  for select
  to authenticated
  using (is_account_member(account_id));

-- Members (not viewer) can submit responses (update only, owner inserts the form)
create policy "intake_forms: non-viewer update"
  on public.intake_forms
  for update
  to authenticated
  using     (account_role(account_id) in ('admin', 'member'))
  with check (account_role(account_id) in ('admin', 'member'));
