-- Likes and comments for recipes.
-- Run this once in the Supabase SQL editor.
-- Safe to run again if the first attempt stopped at set_updated_at.

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  unique (user_id, recipe_id)
);

alter table public.likes enable row level security;

grant select, insert, delete
on table public.likes
to anon, authenticated;

create index if not exists likes_recipe_id_idx on public.likes (recipe_id);
create index if not exists likes_user_id_idx on public.likes (user_id);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000)
);

alter table public.comments enable row level security;

grant select, insert, update, delete
on table public.comments
to anon, authenticated;

create index if not exists comments_recipe_id_idx on public.comments (recipe_id, created_at);
create index if not exists comments_user_id_idx on public.comments (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists comments_set_updated_at on public.comments;

create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create or replace function public.keep_comment_target()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is distinct from old.user_id
     or new.recipe_id is distinct from old.recipe_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Only the comment text can be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists comments_keep_target on public.comments;

create trigger comments_keep_target
before update on public.comments
for each row execute function public.keep_comment_target();

drop policy if exists "likes are publicly readable" on public.likes;
drop policy if exists "users insert their own likes" on public.likes;
drop policy if exists "users delete their own likes" on public.likes;
drop policy if exists "comments are publicly readable" on public.comments;
drop policy if exists "users insert their own comments" on public.comments;
drop policy if exists "users update their own comments" on public.comments;
drop policy if exists "users delete their own comments" on public.comments;

create policy "likes are publicly readable"
on public.likes
for select
to anon, authenticated
using (true);

create policy "users insert their own likes"
on public.likes
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "users delete their own likes"
on public.likes
for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "comments are publicly readable"
on public.comments
for select
to anon, authenticated
using (true);

create policy "users insert their own comments"
on public.comments
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "users update their own comments"
on public.comments
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "users delete their own comments"
on public.comments
for delete
to authenticated
using (user_id = (select auth.uid()));
