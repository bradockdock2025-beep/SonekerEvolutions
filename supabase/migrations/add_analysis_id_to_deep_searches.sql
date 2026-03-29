-- Migration: link deep_searches to analyses via analysis_id FK
-- Run this in the Supabase SQL editor

ALTER TABLE deep_searches
  ADD COLUMN IF NOT EXISTS analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL;

-- Index for fast lookup by analysis
CREATE INDEX IF NOT EXISTS deep_searches_analysis_id_idx ON deep_searches(analysis_id);
