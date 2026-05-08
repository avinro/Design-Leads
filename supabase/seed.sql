-- PRO-36 seed: 1 account, 1 owner + 2 members, 1 project, 3 milestones,
-- 5 deliverables, 2 comments, 1 intake form.
-- UUIDs are fixed so pgTAP tests can reference them by constant.

-- ─── Users ────────────────────────────────────────────────────────────────────
-- Supabase CLI local stack allows direct inserts into auth.users for testing.

insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
) values
  (
    '00000000-0000-0000-0000-000000000001',
    'owner@acme.test',
    '$2a$10$placeholder',
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Acme Owner"}',
    'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'admin@acme.test',
    '$2a$10$placeholder',
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Acme Admin"}',
    'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'viewer@acme.test',
    '$2a$10$placeholder',
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Acme Viewer"}',
    'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000099',
    'stranger@other.test',
    '$2a$10$placeholder',
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Stranger"}',
    'authenticated', 'authenticated'
  )
on conflict (id) do nothing;

-- ─── Account ──────────────────────────────────────────────────────────────────

insert into public.accounts (id, owner_id, name, plan) values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Acme Co',
  'starter'
) on conflict (id) do nothing;

-- ─── Account members ──────────────────────────────────────────────────────────

insert into public.account_members (id, account_id, user_id, role, joined_at) values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'admin',
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'viewer',
    now()
  )
on conflict (id) do nothing;

-- ─── Project ──────────────────────────────────────────────────────────────────

insert into public.projects (id, account_id, owner_id, name, description, current_phase) values (
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Brand redesign',
  'Full visual identity refresh for Acme Co.',
  'design'
) on conflict (id) do nothing;

-- ─── Milestones ───────────────────────────────────────────────────────────────
-- account_id is populated automatically via trigger, but providing it here
-- avoids ordering dependencies if seed runs outside trigger context.

insert into public.milestones (id, project_id, account_id, name, status, display_order) values
  (
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Discovery workshop',
    'done',
    1
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Visual identity v1',
    'in_progress',
    2
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Final delivery package',
    'upcoming',
    3
  )
on conflict (id) do nothing;

-- ─── Deliverables ─────────────────────────────────────────────────────────────

insert into public.deliverables (id, milestone_id, account_id, type, title, file_path, external_link, status, uploaded_at) values
  (
    '50000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'file',
    'Discovery report PDF',
    'deliverables/10000000/30000000/discovery-report.pdf',
    null,
    'published',
    now() - interval '10 days'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'link',
    'Moodboard (Figma)',
    null,
    'https://figma.com/file/example-moodboard',
    'approved',
    now() - interval '8 days'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'link',
    'Logo concepts v1 (Figma)',
    null,
    'https://figma.com/file/example-logo-v1',
    'draft',
    now() - interval '2 days'
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    '40000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'file',
    'Brand guidelines draft',
    'deliverables/10000000/30000000/brand-guidelines-draft.pdf',
    null,
    'published',
    now() - interval '1 day'
  ),
  (
    '50000000-0000-0000-0000-000000000005',
    '40000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'file',
    'Final assets ZIP',
    'deliverables/10000000/30000000/final-assets.zip',
    null,
    'draft',
    null
  )
on conflict (id) do nothing;

-- ─── Comments ─────────────────────────────────────────────────────────────────

insert into public.comments (id, account_id, milestone_id, deliverable_id, author_id, body) values
  (
    '60000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    null,
    '50000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'The logo concepts look great! Could we see a version with a darker palette?'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000002',
    null,
    '00000000-0000-0000-0000-000000000001',
    'Working on the darker palette variant — will upload by EOD Friday.'
  )
on conflict (id) do nothing;

-- ─── Intake form ──────────────────────────────────────────────────────────────

insert into public.intake_forms (id, project_id, account_id, schema, responses, submitted_at) values (
  '70000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '{
    "fields": [
      {"name": "business_context", "label": "What does your company do?", "type": "textarea"},
      {"name": "problem",          "label": "Problem to solve",           "type": "textarea"},
      {"name": "target_audience",  "label": "Target audience",           "type": "text"},
      {"name": "success_metrics",  "label": "How will we know this worked?", "type": "textarea"}
    ]
  }'::jsonb,
  '{
    "business_context": "We sell premium outdoor gear to adventure enthusiasts.",
    "problem":          "Our current brand looks outdated and does not reflect our premium positioning.",
    "target_audience":  "25–45 year olds who value quality and sustainability.",
    "success_metrics":  "Net Promoter Score increase by 10 points within 6 months of rebrand."
  }'::jsonb,
  now() - interval '5 days'
) on conflict (id) do nothing;

-- ─── System owner (PRO-37) ────────────────────────────────────────────────────
-- owner_id (00000000-0000-0000-0000-000000000001) is the platform system owner
-- in local dev. Mirrors the single production row to be seeded post-deploy.
insert into public.system_owners (user_id) values
  ('00000000-0000-0000-0000-000000000001')
on conflict do nothing;
