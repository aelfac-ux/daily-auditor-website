create table public.article_feedback (
  id bigint generated always as identity primary key,
  article_slug text not null check (char_length(article_slug) between 1 and 160),
  rating smallint not null check (rating between 1 and 10),
  comment text check (comment is null or char_length(comment) <= 2000),
  created_at timestamptz not null default now()
);

alter table public.article_feedback enable row level security;

create policy "anyone can submit article feedback"
on public.article_feedback for insert
to anon, authenticated
with check (
  rating between 1 and 10
  and char_length(article_slug) between 1 and 160
  and (comment is null or char_length(comment) <= 2000)
);

create policy "site owner can read feedback"
on public.article_feedback for select
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'aelfa.c@gmail.com');

create index article_feedback_slug_created_idx
on public.article_feedback (article_slug, created_at desc);
