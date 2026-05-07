-- Migration: contact_submissions
-- PRO-19 / F1-8 — Contact page with validated form and Supabase persistence.
--
-- Table stores visitor contact submissions.
-- RLS: deny-all by default. Server inserts use the service-role key which
-- bypasses RLS. A permissive owner-read policy will be added in a future
-- migration when owner auth/admin UI ships.

create extension if not exists "pgcrypto";

create table public.contact_submissions (
  id                   uuid        primary key default gen_random_uuid(),
  name                 text        not null,
  email                text        not null,
  company              text,
  message              text        not null,
  user_agent           text,
  -- Stored as text to avoid inet parse failures from malformed x-forwarded-for headers.
  ip_address           text,
  -- Tracks owner email notification delivery. 'pending' on insert, updated async.
  notification_status  text        not null default 'pending',
  notification_error   text,
  notified_at          timestamptz,
  created_at           timestamptz not null default now(),

  constraint name_length    check (char_length(name) between 1 and 200),
  constraint email_format   check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint company_length check (company is null or char_length(company) <= 200),
  constraint message_length check (char_length(message) between 20 and 5000),
  constraint notification_status_valid
    check (notification_status in ('pending', 'sent', 'failed'))
);

-- Primary chronological index for listing submissions.
create index contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

-- Secondary index for finding failed notifications that need retrying.
create index contact_submissions_notification_status_idx
  on public.contact_submissions (notification_status, created_at desc);

-- RLS: enabled with a deny-all restrictive policy.
-- Service-role key bypasses RLS, so server inserts/updates still work.
alter table public.contact_submissions enable row level security;

create policy "deny all by default"
  on public.contact_submissions
  as restrictive
  for all
  using (false);
