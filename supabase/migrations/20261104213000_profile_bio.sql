-- Add a bio to existing profiles tables.
-- Run this once in the Supabase SQL editor.
-- The original create-table script already includes bio for a new database.

alter table public.profiles
  add column if not exists bio text;

alter table public.profiles
  drop constraint if exists profiles_bio_check;

alter table public.profiles
  add constraint profiles_bio_check
  check (bio is null or char_length(btrim(bio)) between 1 and 500);
