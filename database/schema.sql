create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text unique not null,
  anonymous_name text not null,
  avatar_seed text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_profile_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active','expired','removed'))
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_profile_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, profile_id)
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  storage_key text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists posts_expires_at_idx on posts(expires_at);
create index if not exists posts_created_at_idx on posts(created_at desc);
create index if not exists comments_post_id_idx on comments(post_id);
create index if not exists media_post_id_idx on media(post_id);
create index if not exists likes_post_id_idx on likes(post_id);

create or replace function get_active_posts()
returns table (
  id uuid,
  content text,
  created_at timestamptz,
  expires_at timestamptz,
  anonymous_name text,
  like_count bigint,
  comment_count bigint
)
language sql
security definer
as $$
  select
    p.id,
    p.content,
    p.created_at,
    p.expires_at,
    pr.anonymous_name,
    (select count(*) from likes l where l.post_id = p.id)::bigint,
    (select count(*) from comments c where c.post_id = p.id and c.expires_at > now())::bigint
  from posts p
  join profiles pr on pr.id = p.author_profile_id
  where p.status = 'active' and p.expires_at > now()
  order by p.created_at desc
  limit 50;
$$;

create or replace function expire_post(target_post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from comments where post_id = target_post_id;
  delete from likes where post_id = target_post_id;
  delete from media where post_id = target_post_id;
  delete from posts where id = target_post_id and expires_at <= now();
end;
$$;

-- Backup cleanup. Enable pg_cron in Supabase Dashboard if available,
-- then create a scheduled job that calls:
-- select expire_post(id) from posts where expires_at <= now() limit 500;

alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table media enable row level security;

-- Public reads should be served through controlled server endpoints.
-- Do not expose the service-role client to the browser.
