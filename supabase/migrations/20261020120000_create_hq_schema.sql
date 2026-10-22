-- CareWays HQ schema: areas, missions, tasks, content, inbox_items.
-- The app reads/writes only from the server with the secret key (bypasses RLS).
-- anon/authenticated get no grants and an explicit deny policy.

-- ---------------------------------------------------------------------------
-- updated_at trigger

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- areas

create table public.areas (
  id text primary key
    check (id in ('missions', 'programs', 'communications', 'partners', 'fundraising', 'operations', 'documents', 'ideas')),
  name text not null,
  description text not null default '',
  emoji text not null default '',
  sort_order int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- missions

create table public.missions (
  id text primary key default gen_random_uuid()::text,
  seq bigint generated always as identity unique,
  slug text not null unique,
  name text not null,
  country text not null check (country in ('GT', 'SV', 'CO', 'EC')),
  status text not null
    check (status in ('development', 'early-planning', 'planning', 'confirmed', 'in-field', 'completed')),
  date_start date,
  date_end date,
  date_precision text check (date_precision in ('day', 'month')),
  date_label text not null default 'TBD',
  planning_start date not null,
  progress smallint not null default 0 check (progress between 0 and 100),
  next_step text not null default '',
  cover_image text not null default '',
  city text not null default '',
  lead text not null default '',
  partners text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint missions_dates_all_or_none check (
    (date_start is null and date_end is null and date_precision is null)
    or (date_start is not null and date_end is not null and date_precision is not null)
  ),
  constraint missions_dates_order check (date_end >= date_start)
);

-- ---------------------------------------------------------------------------
-- tasks

create table public.tasks (
  id text primary key default gen_random_uuid()::text,
  seq bigint generated always as identity unique,
  title text not null check (char_length(title) between 1 and 200),
  status text not null default 'todo' check (status in ('todo', 'doing', 'waiting', 'done')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due date,
  mission_id text references public.missions (id) on delete set null,
  area_id text references public.areas (id) on delete set null,
  owner text,
  completed_at date,
  waiting_who text,
  waiting_since date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_waiting_pair check ((waiting_who is null) = (waiting_since is null))
);

create index tasks_mission_id_idx on public.tasks (mission_id);
create index tasks_area_id_idx on public.tasks (area_id);
create index tasks_status_due_idx on public.tasks (status, due);

-- ---------------------------------------------------------------------------
-- content

create table public.content (
  id text primary key default gen_random_uuid()::text,
  seq bigint generated always as identity unique,
  title text not null check (char_length(title) between 1 and 200),
  type text not null check (type in ('social-post', 'newsletter')),
  platform text not null check (platform in ('instagram', 'linkedin', 'email', 'facebook')),
  -- Local wall-clock time, mapped to/from `YYYY-MM-DDTHH:mm`.
  publish_at timestamp not null,
  status text not null default 'ideation'
    check (status in ('ideation', 'writing', 'drafting', 'review', 'scheduled', 'published')),
  mission_id text references public.missions (id) on delete set null,
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_mission_id_idx on public.content (mission_id);
create index content_publish_at_idx on public.content (publish_at);

-- ---------------------------------------------------------------------------
-- inbox_items

create table public.inbox_items (
  id text primary key default gen_random_uuid()::text,
  kind text not null check (kind in ('note', 'contact')),
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inbox_items_created_at_idx on public.inbox_items (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers

create trigger areas_set_updated_at before update on public.areas
  for each row execute function public.set_updated_at();
create trigger missions_set_updated_at before update on public.missions
  for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger content_set_updated_at before update on public.content
  for each row execute function public.set_updated_at();
create trigger inbox_items_set_updated_at before update on public.inbox_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Security: server-only access. RLS on, explicit deny for client roles, no grants.

alter table public.areas enable row level security;
alter table public.missions enable row level security;
alter table public.tasks enable row level security;
alter table public.content enable row level security;
alter table public.inbox_items enable row level security;

create policy "deny client roles" on public.areas
  as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny client roles" on public.missions
  as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny client roles" on public.tasks
  as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny client roles" on public.content
  as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny client roles" on public.inbox_items
  as restrictive for all to anon, authenticated using (false) with check (false);

revoke all on public.areas, public.missions, public.tasks, public.content, public.inbox_items
  from anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
