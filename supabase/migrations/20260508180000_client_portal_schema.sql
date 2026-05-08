-- PRO-36: Client portal data model
-- Tables: accounts, account_members, projects, milestones, deliverables, comments, intake_forms
-- account_id is denormalized on milestones, deliverables, comments via triggers for performant RLS

-- ─── Shared: updated_at trigger ──────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── accounts ─────────────────────────────────────────────────────────────────

create table public.accounts (
  id          uuid        primary key default gen_random_uuid(),
  owner_id    uuid        not null references auth.users(id) on delete restrict,
  name        text        not null check (length(name) between 1 and 200),
  plan        text        not null default 'free' check (plan in ('free', 'starter', 'pro')),
  settings    jsonb       not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index accounts_owner_id_idx on public.accounts (owner_id);

create trigger set_accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

-- ─── account_members ──────────────────────────────────────────────────────────

create table public.account_members (
  id          uuid        primary key default gen_random_uuid(),
  account_id  uuid        not null references public.accounts(id) on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  role        text        not null check (role in ('admin', 'member', 'viewer')),
  invited_at  timestamptz not null default now(),
  joined_at   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (account_id, user_id)
);

create index account_members_account_id_idx on public.account_members (account_id);
create index account_members_user_id_idx    on public.account_members (user_id);

create trigger set_account_members_updated_at
  before update on public.account_members
  for each row execute function public.set_updated_at();

-- ─── projects ─────────────────────────────────────────────────────────────────

create table public.projects (
  id             uuid        primary key default gen_random_uuid(),
  account_id     uuid        not null references public.accounts(id) on delete cascade,
  owner_id       uuid        references auth.users(id) on delete set null,
  name           text        not null check (length(name) between 1 and 200),
  description    text,
  current_phase  text        not null default 'discovery'
                   check (current_phase in ('discovery', 'research', 'design', 'validation', 'delivery')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index projects_account_id_idx on public.projects (account_id);
create index projects_owner_id_idx   on public.projects (owner_id);

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ─── milestones ───────────────────────────────────────────────────────────────

create table public.milestones (
  id             uuid        primary key default gen_random_uuid(),
  project_id     uuid        not null references public.projects(id) on delete cascade,
  account_id     uuid        not null,  -- denormalized from projects via trigger
  name           text        not null check (length(name) between 1 and 200),
  description    text,
  due_at         timestamptz,
  status         text        not null default 'upcoming'
                   check (status in ('upcoming', 'in_progress', 'done')),
  display_order  int         not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index milestones_project_id_idx  on public.milestones (project_id);
create index milestones_account_id_idx  on public.milestones (account_id);

create trigger set_milestones_updated_at
  before update on public.milestones
  for each row execute function public.set_updated_at();

-- Populate account_id from the parent project on insert/update
create or replace function public.sync_milestone_account_id()
returns trigger language plpgsql as $$
begin
  select account_id into new.account_id
  from public.projects
  where id = new.project_id;
  return new;
end;
$$;

create trigger sync_milestone_account_id
  before insert or update of project_id on public.milestones
  for each row execute function public.sync_milestone_account_id();

-- ─── deliverables ─────────────────────────────────────────────────────────────

create table public.deliverables (
  id             uuid        primary key default gen_random_uuid(),
  milestone_id   uuid        not null references public.milestones(id) on delete cascade,
  account_id     uuid        not null,  -- denormalized from milestones via trigger
  type           text        not null check (type in ('file', 'link')),
  title          text        not null check (length(title) between 1 and 200),
  file_path      text,
  external_link  text,
  status         text        not null default 'draft'
                   check (status in ('draft', 'published', 'approved', 'rejected')),
  uploaded_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- exactly one of file_path / external_link must be set, matching the type
  check (
    (type = 'file'  and file_path     is not null and external_link is null) or
    (type = 'link'  and external_link is not null and file_path     is null)
  )
);

create index deliverables_milestone_id_idx on public.deliverables (milestone_id);
create index deliverables_account_id_idx   on public.deliverables (account_id);

create trigger set_deliverables_updated_at
  before update on public.deliverables
  for each row execute function public.set_updated_at();

-- Populate account_id from the parent milestone on insert/update
create or replace function public.sync_deliverable_account_id()
returns trigger language plpgsql as $$
begin
  select account_id into new.account_id
  from public.milestones
  where id = new.milestone_id;
  return new;
end;
$$;

create trigger sync_deliverable_account_id
  before insert or update of milestone_id on public.deliverables
  for each row execute function public.sync_deliverable_account_id();

-- ─── comments ─────────────────────────────────────────────────────────────────
-- Uses concrete nullable FKs (not polymorphic target_type/target_id) to preserve
-- referential integrity and enable ON DELETE CASCADE.
-- CHECK ensures exactly one target is set.

create table public.comments (
  id              uuid        primary key default gen_random_uuid(),
  account_id      uuid        not null,  -- denormalized via trigger
  milestone_id    uuid        references public.milestones(id)   on delete cascade,
  deliverable_id  uuid        references public.deliverables(id) on delete cascade,
  author_id       uuid        not null references auth.users(id) on delete restrict,
  body            text        not null check (length(body) between 1 and 10000),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- exactly one target must be set
  check (
    (milestone_id is not null)::int + (deliverable_id is not null)::int = 1
  )
);

create index comments_milestone_id_idx   on public.comments (milestone_id);
create index comments_deliverable_id_idx on public.comments (deliverable_id);
create index comments_account_id_idx     on public.comments (account_id);
create index comments_author_id_idx      on public.comments (author_id);

create trigger set_comments_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- Populate account_id from the resolved parent (milestone or deliverable)
create or replace function public.sync_comment_account_id()
returns trigger language plpgsql as $$
begin
  if new.milestone_id is not null then
    select account_id into new.account_id
    from public.milestones where id = new.milestone_id;
  else
    select account_id into new.account_id
    from public.deliverables where id = new.deliverable_id;
  end if;
  return new;
end;
$$;

create trigger sync_comment_account_id
  before insert or update of milestone_id, deliverable_id on public.comments
  for each row execute function public.sync_comment_account_id();

-- ─── intake_forms ─────────────────────────────────────────────────────────────

create table public.intake_forms (
  id            uuid        primary key default gen_random_uuid(),
  project_id    uuid        not null unique references public.projects(id) on delete cascade,
  account_id    uuid        not null,  -- denormalized from projects via trigger
  schema        jsonb       not null default '{}'::jsonb,
  responses     jsonb,
  submitted_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index intake_forms_project_id_idx  on public.intake_forms (project_id);
create index intake_forms_account_id_idx  on public.intake_forms (account_id);

create trigger set_intake_forms_updated_at
  before update on public.intake_forms
  for each row execute function public.set_updated_at();

-- Populate account_id from the parent project on insert/update
create or replace function public.sync_intake_form_account_id()
returns trigger language plpgsql as $$
begin
  select account_id into new.account_id
  from public.projects
  where id = new.project_id;
  return new;
end;
$$;

create trigger sync_intake_form_account_id
  before insert or update of project_id on public.intake_forms
  for each row execute function public.sync_intake_form_account_id();
