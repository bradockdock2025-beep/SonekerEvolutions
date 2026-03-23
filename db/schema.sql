-- ══════════════════════════════════════════════════════════════════════════════
--  Soneker — Database Schema
--  Supabase SQL Editor → paste and run
-- ══════════════════════════════════════════════════════════════════════════════


-- ── 1. Extension: pg_cron (enable once via Supabase Dashboard) ────────────────
--  Dashboard → Database → Extensions → search "pg_cron" → Enable
--  (already enabled on most Supabase projects — skip if it is)


-- ── 2. Table ──────────────────────────────────────────────────────────────────

create table if not exists public.analyses (
  id            uuid          primary key default gen_random_uuid(),
  created_at    timestamptz   not null    default now(),
  expires_at    timestamptz   not null    default (now() + interval '48 hours'),
  video_id      text          not null,
  video_title   text          not null,
  channel       text,
  thumbnail_url text,
  niche         text,
  niche_id      text,
  card_count    int           not null    default 0,
  result        jsonb         not null
);

comment on table  public.analyses              is 'Soneker — one row per user-saved video analysis, auto-expires after 48 h';
comment on column public.analyses.expires_at   is 'Row is considered stale after this timestamp and purged by the cron job';
comment on column public.analyses.video_id     is 'YouTube video ID (11-char)';
comment on column public.analyses.result       is 'Full AnalysisResult JSON as returned by the analyze API';
comment on column public.analyses.card_count   is 'Denormalised card count for fast library listing without parsing result JSON';
comment on column public.analyses.niche_id     is 'Internal niche key e.g. business_finance';
comment on column public.analyses.niche        is 'Display niche name e.g. Negócios / Finanças';


-- ── 3. Indexes ────────────────────────────────────────────────────────────────

create index if not exists analyses_created_at_idx on public.analyses (created_at desc);
create index if not exists analyses_expires_at_idx  on public.analyses (expires_at);
create index if not exists analyses_video_id_idx    on public.analyses (video_id);


-- ── 4. Row Level Security ─────────────────────────────────────────────────────

alter table public.analyses enable row level security;

-- Service role (supabaseAdmin used in API routes) bypasses RLS automatically.
-- Public read is intentionally blocked — all access goes through API routes.


-- ── 5. Purge function ─────────────────────────────────────────────────────────
--  Called by the cron job. Deletes all rows whose 48-hour window has passed.

create or replace function public.purge_expired_analyses()
returns void
language sql
security definer
as $$
  delete from public.analyses
  where expires_at < now();
$$;

comment on function public.purge_expired_analyses is
  'Deletes analyses older than 48 hours. Invoked hourly by pg_cron.';


-- ── 6. Scheduled job — runs every hour ────────────────────────────────────────
--  Requires pg_cron extension to be enabled (see step 1).

select cron.schedule(
  'purge-expired-analyses',           -- job name (unique)
  '0 * * * *',                        -- every hour at :00
  $$ select public.purge_expired_analyses(); $$
);
