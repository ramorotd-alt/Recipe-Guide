-- Two starting tables for Recipe Guide.
-- Run this file once in the Supabase SQL editor.
-- Do not run the earlier multi-table script.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_name text not null unique check (char_length(btrim(user_name)) between 2 and 30),
  full_name text check (full_name is null or char_length(btrim(full_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.profiles
TO anon, authenticated;

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  ingredients text not null,
  instructions text not null,
  cooking_time integer not null check (cooking_time between 1 and 1440),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  category text not null check (char_length(btrim(category)) between 1 and 40)
);

alter table public.recipes enable row level security;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.recipes
TO anon, authenticated;

create index recipes_user_id_idx on public.recipes (user_id);
create index recipes_category_idx on public.recipes (category);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  candidate := left(
    regexp_replace(split_part(lower(coalesce(new.email, 'member')), '@', 1), '[^a-z0-9_]', '', 'g'),
    20
  );
  if candidate = '' then
    candidate := 'member';
  end if;
  if exists (select 1 from public.profiles where user_name = candidate) then
    candidate := candidate || '_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  insert into public.profiles (id, user_name)
  values (new.id, candidate)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create policy "profiles are publicly readable"
on public.profiles
for select
to anon, authenticated
using (true);

create policy "users update their own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "recipes are publicly readable"
on public.recipes
for select
to anon, authenticated
using (true);

create policy "users insert their own recipes"
on public.recipes
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "users update their own recipes"
on public.recipes
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "users delete their own recipes"
on public.recipes
for delete
to authenticated
using (user_id = (select auth.uid()));
