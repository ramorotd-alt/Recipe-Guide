-- Recipe Guide initial database setup.
-- Run once in the Supabase SQL editor, or with `supabase db push` after linking this repo.
-- Email/password auth is assumed to be enabled. Signing up inserts a profile automatically.
-- The app should use the publishable (anon) key. Do not put the service-role key in the app.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.escape_like(input text)
returns text
language sql
immutable
as $$
  select replace(replace(replace(input, '\', '\\'), '%', '\%'), '_', '\_');
$$;

create or replace function public.slugify(source text)
returns text
language plpgsql
immutable
as $$
declare
  base text;
begin
  base := trim(both '-' from regexp_replace(lower(coalesce(source, '')), '[^a-z0-9]+', '-', 'g'));
  if base = '' then
    base := 'recipe';
  end if;
  return left(base, 80);
end;
$$;

create or replace function public.unique_recipe_slug(source text)
returns text
language plpgsql
as $$
declare
  base text := public.slugify(source);
  candidate text := base;
  suffix integer := 2;
begin
  while exists (select 1 from public.recipes where slug = candidate) loop
    candidate := left(base, 70) || '-' || suffix::text;
    suffix := suffix + 1;
  end loop;
  return candidate;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 40),
  avatar_path text check (
    avatar_path is null
    or (
      char_length(avatar_path) between 1 and 300
      and avatar_path !~ '\.\.'
      and avatar_path !~ '://'
      and avatar_path like id::text || '/%'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) between 2 and 40),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 3 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '' check (char_length(description) <= 2000),
  cover_image_path text check (
    cover_image_path is null
    or (
      char_length(cover_image_path) between 1 and 300
      and cover_image_path !~ '\.\.'
      and cover_image_path !~ '://'
      and cover_image_path like owner_id::text || '/%'
    )
  ),
  category_id uuid not null references public.categories (id) on delete restrict,
  prep_minutes integer not null check (prep_minutes between 0 and 1440),
  cook_minutes integer not null check (cook_minutes between 0 and 1440),
  servings integer not null check (servings between 1 and 100),
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint recipes_published_timestamp check (status <> 'published' or published_at is not null)
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position integer not null check (position between 1 and 40),
  amount text check (amount is null or char_length(amount) between 1 and 40),
  unit text check (unit is null or char_length(unit) between 1 and 40),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  note text check (note is null or char_length(note) <= 160),
  unique (recipe_id, position)
);

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position integer not null check (position between 1 and 40),
  instruction text not null check (char_length(btrim(instruction)) between 1 and 1000),
  unique (recipe_id, position)
);

create table public.recipe_dietary_tags (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  tag text not null check (tag in ('vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free')),
  primary key (recipe_id, tag)
);

create table public.product_events (
  id bigint generated always as identity primary key,
  event_name text not null check (
    event_name in (
      'recipe_published',
      'recipe_updated',
      'recipe_deleted',
      'search',
      'return_visit',
      'sign_up'
    )
  ),
  user_id uuid references public.profiles (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb check (octet_length(metadata::text) <= 1000),
  created_at timestamptz not null default now()
);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes (id) on delete set null,
  reporter_id uuid references public.profiles (id) on delete set null,
  reason text not null check (char_length(btrim(reason)) between 10 and 1000),
  created_at timestamptz not null default now()
);

create index recipes_owner_idx on public.recipes (owner_id);
create index recipes_category_idx on public.recipes (category_id);
create index recipes_published_feed_idx on public.recipes (published_at desc) where status = 'published';
create index recipes_title_trgm_idx on public.recipes using gin (title extensions.gin_trgm_ops);
create index recipes_description_trgm_idx on public.recipes using gin (description extensions.gin_trgm_ops);
create index recipe_ingredients_recipe_idx on public.recipe_ingredients (recipe_id);
create index recipe_ingredients_name_trgm_idx on public.recipe_ingredients using gin (name extensions.gin_trgm_ops);
create index recipe_steps_recipe_idx on public.recipe_steps (recipe_id);
create index recipe_dietary_tags_tag_idx on public.recipe_dietary_tags (tag);
create index product_events_name_created_idx on public.product_events (event_name, created_at desc);
create index content_reports_created_idx on public.content_reports (created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger recipes_set_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();

create or replace function public.limit_recipe_child_rows()
returns trigger
language plpgsql
as $$
declare
  row_count integer;
begin
  if tg_table_name = 'recipe_ingredients' then
    select count(*) into row_count
    from public.recipe_ingredients
    where recipe_id = new.recipe_id;
  else
    select count(*) into row_count
    from public.recipe_steps
    where recipe_id = new.recipe_id;
  end if;

  if row_count > 40 then
    raise exception 'A recipe can have at most 40 ingredients or steps';
  end if;

  return new;
end;
$$;

create trigger recipe_ingredients_limit
after insert on public.recipe_ingredients
for each row execute function public.limit_recipe_child_rows();

create trigger recipe_steps_limit
after insert on public.recipe_steps
for each row execute function public.limit_recipe_child_rows();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_name text;
begin
  chosen_name := left(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 40);
  if chosen_name = '' then
    chosen_name := left(split_part(coalesce(new.email, ''), '@', 1), 40);
  end if;
  if chosen_name = '' then
    chosen_name := 'Member';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, chosen_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.recipe_dietary_tags enable row level security;
alter table public.product_events enable row level security;
alter table public.content_reports enable row level security;

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

create policy "categories are publicly readable"
on public.categories
for select
to anon, authenticated
using (true);

create policy "published recipes are publicly readable"
on public.recipes
for select
to anon, authenticated
using (status = 'published' or owner_id = (select auth.uid()));

create policy "users insert their own recipes"
on public.recipes
for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "users update their own recipes"
on public.recipes
for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "users delete their own recipes"
on public.recipes
for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "ingredients of visible recipes are readable"
on public.recipe_ingredients
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
      and (recipes.status = 'published' or recipes.owner_id = (select auth.uid()))
  )
);

create policy "owners insert ingredients"
on public.recipe_ingredients
for insert
to authenticated
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.owner_id = (select auth.uid())
  )
);

create policy "owners update ingredients"
on public.recipe_ingredients
for update
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.owner_id = (select auth.uid())
  )
);

create policy "owners delete ingredients"
on public.recipe_ingredients
for delete
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.owner_id = (select auth.uid())
  )
);

create policy "steps of visible recipes are readable"
on public.recipe_steps
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and (recipes.status = 'published' or recipes.owner_id = (select auth.uid()))
  )
);

create policy "owners insert steps"
on public.recipe_steps
for insert
to authenticated
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.owner_id = (select auth.uid())
  )
);

create policy "owners update steps"
on public.recipe_steps
for update
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.owner_id = (select auth.uid())
  )
);

create policy "owners delete steps"
on public.recipe_steps
for delete
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.owner_id = (select auth.uid())
  )
);

create policy "dietary tags of visible recipes are readable"
on public.recipe_dietary_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_dietary_tags.recipe_id
      and (recipes.status = 'published' or recipes.owner_id = (select auth.uid()))
  )
);

create policy "owners insert dietary tags"
on public.recipe_dietary_tags
for insert
to authenticated
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_dietary_tags.recipe_id
      and recipes.owner_id = (select auth.uid())
  )
);

create policy "owners delete dietary tags"
on public.recipe_dietary_tags
for delete
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_dietary_tags.recipe_id
      and recipes.owner_id = (select auth.uid())
  )
);

create policy "anyone can submit a content report"
on public.content_reports
for insert
to anon, authenticated
with check (
  char_length(btrim(reason)) between 10 and 1000
  and (
    ((select auth.uid()) is null and reporter_id is null)
    or reporter_id = (select auth.uid())
  )
);

-- product_events has no client policies. Inserts go through record_product_event.

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

revoke all on public.profiles from anon, authenticated;
revoke all on public.categories from anon, authenticated;
revoke all on public.recipes from anon, authenticated;
revoke all on public.recipe_ingredients from anon, authenticated;
revoke all on public.recipe_steps from anon, authenticated;
revoke all on public.recipe_dietary_tags from anon, authenticated;
revoke all on public.product_events from anon, authenticated;
revoke all on public.content_reports from anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

grant select on public.categories to anon, authenticated;

grant select on public.recipes to anon, authenticated;
grant insert, update, delete on public.recipes to authenticated;

grant select on public.recipe_ingredients to anon, authenticated;
grant insert, update, delete on public.recipe_ingredients to authenticated;

grant select on public.recipe_steps to anon, authenticated;
grant insert, update, delete on public.recipe_steps to authenticated;

grant select on public.recipe_dietary_tags to anon, authenticated;
grant insert, delete on public.recipe_dietary_tags to authenticated;

grant insert on public.content_reports to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Recipe writes as one transaction
-- ---------------------------------------------------------------------------

create or replace function public.save_recipe(
  p_recipe_id uuid,
  p_title text,
  p_description text,
  p_category_slug text,
  p_prep_minutes integer,
  p_cook_minutes integer,
  p_servings integer,
  p_ingredients jsonb,
  p_steps jsonb,
  p_dietary_tags text[]
)
returns table (id uuid, slug text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rid uuid;
  cid uuid;
  new_slug text;
  existing_owner uuid;
  attempt integer;
begin
  if uid is null then
    raise exception 'Sign in required';
  end if;

  if p_title is null or char_length(btrim(p_title)) < 3 or char_length(btrim(p_title)) > 120 then
    raise exception 'Title must be between 3 and 120 characters';
  end if;

  if p_description is null or char_length(p_description) > 2000 then
    raise exception 'Description must be 2000 characters or fewer';
  end if;

  if p_prep_minutes is null or p_prep_minutes < 0 or p_prep_minutes > 1440
    or p_cook_minutes is null or p_cook_minutes < 0 or p_cook_minutes > 1440
    or p_servings is null or p_servings < 1 or p_servings > 100 then
    raise exception 'Check the time and servings values';
  end if;

  select categories.id into cid from public.categories where categories.slug = p_category_slug;
  if cid is null then
    raise exception 'Choose a category';
  end if;

  if jsonb_typeof(p_ingredients) <> 'array'
    or jsonb_array_length(p_ingredients) < 1
    or jsonb_array_length(p_ingredients) > 40 then
    raise exception 'Add between 1 and 40 ingredients';
  end if;

  if jsonb_typeof(p_steps) <> 'array'
    or jsonb_array_length(p_steps) < 1
    or jsonb_array_length(p_steps) > 40 then
    raise exception 'Add between 1 and 40 steps';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_ingredients) as item
    where char_length(btrim(coalesce(item ->> 'name', ''))) = 0
      or char_length(btrim(coalesce(item ->> 'name', ''))) > 120
      or char_length(coalesce(item ->> 'amount', '')) > 40
      or char_length(coalesce(item ->> 'unit', '')) > 40
      or char_length(coalesce(item ->> 'note', '')) > 160
  ) then
    raise exception 'Check the ingredient fields';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_steps) as item
    where char_length(btrim(coalesce(item ->> 'instruction', ''))) = 0
      or char_length(btrim(coalesce(item ->> 'instruction', ''))) > 1000
  ) then
    raise exception 'Each step needs an instruction';
  end if;

  if coalesce(array_length(p_dietary_tags, 1), 0) > 5 then
    raise exception 'Choose up to 5 dietary labels';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_dietary_tags, '{}'::text[])) as tag
    where tag not in ('vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free')
  ) then
    raise exception 'Unknown dietary label';
  end if;

  if p_recipe_id is null then
    attempt := 0;
    loop
      new_slug := public.unique_recipe_slug(p_title);
      begin
        insert into public.recipes (
          owner_id,
          title,
          slug,
          description,
          category_id,
          prep_minutes,
          cook_minutes,
          servings,
          status,
          published_at
        )
        values (
          uid,
          btrim(p_title),
          new_slug,
          btrim(p_description),
          cid,
          p_prep_minutes,
          p_cook_minutes,
          p_servings,
          'published',
          now()
        )
        returning recipes.id into rid;
        exit;
      exception
        when unique_violation then
          attempt := attempt + 1;
          if attempt >= 5 then
            raise;
          end if;
      end;
    end loop;
  else
    select recipes.owner_id into existing_owner
    from public.recipes
    where recipes.id = p_recipe_id;

    if existing_owner is null then
      raise exception 'Recipe not found';
    end if;

    if existing_owner <> uid then
      raise exception 'You can only edit your own recipes';
    end if;

    update public.recipes
    set
      title = btrim(p_title),
      description = btrim(p_description),
      category_id = cid,
      prep_minutes = p_prep_minutes,
      cook_minutes = p_cook_minutes,
      servings = p_servings
    where recipes.id = p_recipe_id
      and recipes.owner_id = uid
    returning recipes.id, recipes.slug into rid, new_slug;

    if rid is null then
      raise exception 'You can only edit your own recipes';
    end if;

    delete from public.recipe_ingredients where recipe_id = rid;
    delete from public.recipe_steps where recipe_id = rid;
    delete from public.recipe_dietary_tags where recipe_id = rid;
  end if;

  insert into public.recipe_ingredients (recipe_id, position, amount, unit, name, note)
  select
    rid,
    ordinality::integer,
    nullif(btrim(item ->> 'amount'), ''),
    nullif(btrim(item ->> 'unit'), ''),
    btrim(item ->> 'name'),
    nullif(btrim(item ->> 'note'), '')
  from jsonb_array_elements(p_ingredients) with ordinality as ingredient(item, ordinality);

  insert into public.recipe_steps (recipe_id, position, instruction)
  select
    rid,
    ordinality::integer,
    btrim(item ->> 'instruction')
  from jsonb_array_elements(p_steps) with ordinality as step(item, ordinality);

  insert into public.recipe_dietary_tags (recipe_id, tag)
  select distinct rid, tag
  from unnest(coalesce(p_dietary_tags, '{}'::text[])) as tag
  where tag <> '';

  return query
  select recipes.id, recipes.slug
  from public.recipes
  where recipes.id = rid;
end;
$$;

revoke all on function public.save_recipe(uuid, text, text, text, integer, integer, integer, jsonb, jsonb, text[]) from public;
grant execute on function public.save_recipe(uuid, text, text, text, integer, integer, integer, jsonb, jsonb, text[]) to authenticated;

create or replace function public.search_published_recipes(
  search_text text default null,
  category_slug text default null,
  dietary_tag text default null,
  page_limit integer default 12,
  page_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  title text,
  description text,
  cover_image_path text,
  prep_minutes integer,
  cook_minutes integer,
  servings integer,
  published_at timestamptz,
  category_name text,
  category_slug text,
  author_name text,
  author_avatar_path text,
  dietary_tags text[],
  total_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with filtered as (
    select
      r.id,
      r.slug,
      r.title,
      r.description,
      r.cover_image_path,
      r.prep_minutes,
      r.cook_minutes,
      r.servings,
      r.published_at,
      c.name as category_name,
      c.slug as category_slug,
      p.display_name as author_name,
      p.avatar_path as author_avatar_path,
      coalesce(
        (
          select array_agg(t.tag order by t.tag)
          from public.recipe_dietary_tags as t
          where t.recipe_id = r.id
        ),
        '{}'::text[]
      ) as dietary_tags
    from public.recipes as r
    join public.categories as c on c.id = r.category_id
    join public.profiles as p on p.id = r.owner_id
    where r.status = 'published'
      and (category_slug is null or category_slug = '' or c.slug = category_slug)
      and (
        dietary_tag is null
        or dietary_tag = ''
        or exists (
          select 1
          from public.recipe_dietary_tags as t
          where t.recipe_id = r.id
            and t.tag = dietary_tag
        )
      )
      and (
        search_text is null
        or btrim(search_text) = ''
        or r.title ilike '%' || public.escape_like(btrim(search_text)) || '%' escape '\'
        or r.description ilike '%' || public.escape_like(btrim(search_text)) || '%' escape '\'
        or exists (
          select 1
          from public.recipe_ingredients as i
          where i.recipe_id = r.id
            and i.name ilike '%' || public.escape_like(btrim(search_text)) || '%' escape '\'
        )
      )
  )
  select
    filtered.id,
    filtered.slug,
    filtered.title,
    filtered.description,
    filtered.cover_image_path,
    filtered.prep_minutes,
    filtered.cook_minutes,
    filtered.servings,
    filtered.published_at,
    filtered.category_name,
    filtered.category_slug,
    filtered.author_name,
    filtered.author_avatar_path,
    filtered.dietary_tags,
    count(*) over () as total_count
  from filtered
  order by filtered.published_at desc
  limit least(greatest(coalesce(page_limit, 12), 1), 24)
  offset least(greatest(coalesce(page_offset, 0), 0), 10000);
$$;

revoke all on function public.search_published_recipes(text, text, text, integer, integer) from public;
grant execute on function public.search_published_recipes(text, text, text, integer, integer) to anon, authenticated;

create or replace function public.record_product_event(
  p_event_name text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  safe jsonb := '{}'::jsonb;
  uid uuid := auth.uid();
begin
  if p_event_name not in ('recipe_published', 'recipe_updated', 'recipe_deleted', 'search', 'return_visit', 'sign_up') then
    raise exception 'Unknown event';
  end if;

  if p_event_name in ('recipe_published', 'recipe_updated', 'recipe_deleted', 'sign_up') and uid is null then
    raise exception 'Sign in required';
  end if;

  if p_event_name = 'sign_up' and exists (
    select 1 from public.product_events
    where user_id = uid and event_name = 'sign_up'
  ) then
    return;
  end if;

  if p_metadata ? 'query' and jsonb_typeof(p_metadata -> 'query') = 'string' then
    safe := safe || jsonb_build_object('query', left(p_metadata ->> 'query', 80));
  end if;
  if p_metadata ? 'category' and jsonb_typeof(p_metadata -> 'category') = 'string' then
    safe := safe || jsonb_build_object('category', left(p_metadata ->> 'category', 40));
  end if;
  if p_metadata ? 'dietary' and jsonb_typeof(p_metadata -> 'dietary') = 'string' then
    safe := safe || jsonb_build_object('dietary', left(p_metadata ->> 'dietary', 40));
  end if;
  if p_metadata ? 'slug' and jsonb_typeof(p_metadata -> 'slug') = 'string' then
    safe := safe || jsonb_build_object('slug', left(p_metadata ->> 'slug', 120));
  end if;

  insert into public.product_events (event_name, user_id, metadata)
  values (p_event_name, uid, safe);
end;
$$;

revoke all on function public.record_product_event(text, jsonb) from public;
grant execute on function public.record_product_event(text, jsonb) to anon, authenticated;

revoke all on function public.escape_like(text) from public;
grant execute on function public.escape_like(text) to anon, authenticated;

revoke all on function public.slugify(text) from public;
grant execute on function public.slugify(text) to authenticated;

revoke all on function public.unique_recipe_slug(text) from public;
grant execute on function public.unique_recipe_slug(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'recipe-covers',
    'recipe-covers',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public read recipe covers"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'recipe-covers');

create policy "owners upload recipe covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'recipe-covers'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "owners update recipe covers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'recipe-covers'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'recipe-covers'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "owners delete recipe covers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'recipe-covers'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "public read avatars"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');

create policy "owners upload avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "owners update avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "owners delete avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- ---------------------------------------------------------------------------
-- Curated categories
-- ---------------------------------------------------------------------------

insert into public.categories (name, slug)
values
  ('Breakfast', 'breakfast'),
  ('Lunch', 'lunch'),
  ('Dinner', 'dinner'),
  ('Dessert', 'dessert'),
  ('Snack', 'snack'),
  ('Side', 'side'),
  ('Soup', 'soup'),
  ('Salad', 'salad'),
  ('Baking', 'baking'),
  ('Drink', 'drink');
