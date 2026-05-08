-- PRO-37: trigger that seals account_members.joined_at when a user's email
-- is first confirmed by Supabase Auth.
--
-- Flow:
--   1. Owner invites a client → auth user created with email_confirmed_at = NULL,
--      account_members row inserted with joined_at = NULL.
--   2. Client clicks magic link → Supabase Auth sets email_confirmed_at = now().
--   3. This trigger fires AFTER UPDATE OF email_confirmed_at ON auth.users.
--   4. It finds the matching account_members rows (may be >1 if client belongs
--      to multiple accounts) and sets joined_at = now() on each.
--
-- The trigger is SECURITY DEFINER with a pinned search_path = '' so it runs
-- without relying on the caller's search path — required for triggers on
-- auth.users (a Supabase-managed schema).

create or replace function public.handle_user_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only act when email_confirmed_at transitions from NULL to a real timestamp.
  -- Guard against re-fires on other UPDATE columns.
  if NEW.email_confirmed_at is not null
     and (OLD.email_confirmed_at is null
          or OLD.email_confirmed_at is distinct from NEW.email_confirmed_at)
  then
    update public.account_members
       set joined_at = now()
     where user_id   = NEW.id
       and joined_at is null;
  end if;
  return NEW;
end;
$$;

-- Attach to auth.users. AFTER UPDATE OF email_confirmed_at avoids unnecessary
-- trigger invocations for every other column update on auth.users.
create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row
  execute function public.handle_user_email_confirmed();
