create extension if not exists pgcrypto;
create table if not exists public.analytics_config (id boolean primary key default true check (id), hash_secret text not null default encode(gen_random_bytes(32), 'hex'));
insert into public.analytics_config (id) values (true) on conflict (id) do nothing;
alter table public.analytics_config enable row level security;

create table if not exists public.article_views (
  id bigint generated always as identity primary key,
  article_slug text not null check (article_slug ~ '^day-[0-9]+-[a-z0-9-]+$'),
  visitor_hash text not null,
  viewed_hour timestamptz not null default date_trunc('hour', now()),
  created_at timestamptz not null default now(),
  unique (article_slug, visitor_hash, viewed_hour)
);
alter table public.article_views enable row level security;
create index if not exists article_views_slug_created_idx on public.article_views (article_slug, created_at desc);

create or replace function public.record_article_view(p_article_slug text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare request_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb; client_ip text; secret text; inserted_count integer;
begin
  if p_article_slug is null or p_article_slug !~ '^day-[0-9]+-[a-z0-9-]+$' then raise exception 'invalid article slug'; end if;
  client_ip := split_part(coalesce(request_headers ->> 'cf-connecting-ip', request_headers ->> 'x-forwarded-for', request_headers ->> 'x-real-ip', 'unknown'), ',', 1);
  select hash_secret into secret from public.analytics_config where id = true;
  insert into public.article_views (article_slug, visitor_hash, viewed_hour)
  values (p_article_slug, encode(digest(trim(client_ip) || ':' || secret, 'sha256'), 'hex'), date_trunc('hour', now()))
  on conflict (article_slug, visitor_hash, viewed_hour) do nothing;
  get diagnostics inserted_count = row_count; return inserted_count = 1;
end; $$;

create or replace function public.get_popular_articles(p_limit integer default 4)
returns table (article_slug text, view_count bigint) language sql security definer set search_path = public as $$
  select v.article_slug, count(*)::bigint from public.article_views v where v.created_at >= now() - interval '30 days'
  group by v.article_slug order by count(*) desc, max(v.created_at) desc limit least(greatest(coalesce(p_limit, 4), 1), 10); $$;

create or replace function public.get_article_view_stats()
returns table (article_slug text, total_views bigint, views_24h bigint, views_7d bigint, last_viewed_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'aelfa.c@gmail.com' then raise exception 'not authorized'; end if;
  return query select v.article_slug, count(*)::bigint,
    count(*) filter (where v.created_at >= now() - interval '24 hours')::bigint,
    count(*) filter (where v.created_at >= now() - interval '7 days')::bigint, max(v.created_at)
    from public.article_views v group by v.article_slug order by count(*) desc;
end; $$;

revoke all on public.analytics_config, public.article_views from anon, authenticated;
grant execute on function public.record_article_view(text) to anon, authenticated;
grant execute on function public.get_popular_articles(integer) to anon, authenticated;
grant execute on function public.get_article_view_stats() to authenticated;
