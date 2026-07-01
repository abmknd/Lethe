-- Waitlist columns required by the signup Edge Function.
-- Safe to apply repeatedly; existing rows backfill to NULL.

alter table public.waitlist add column if not exists source     text;
alter table public.waitlist add column if not exists country    text;
alter table public.waitlist add column if not exists name       text;
alter table public.waitlist add column if not exists created_at timestamptz not null default now();

-- Constrain source to the known funnel entry points. Existing NULL rows are unaffected.
alter table public.waitlist drop constraint if exists waitlist_source_check;
alter table public.waitlist add  constraint waitlist_source_check
  check (source is null or source in ('hero', 'signup', 'diagnostic', 'founding'));

-- Email is the natural key. Enforce uniqueness so 23505 is the canonical duplicate signal.
create unique index if not exists waitlist_email_unique on public.waitlist (lower(email));

create index if not exists waitlist_source_created_idx on public.waitlist (source, created_at desc);
