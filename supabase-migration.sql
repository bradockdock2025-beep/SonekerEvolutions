-- =============================================================================
-- SONEKER — Commercial Schema Migration (idempotent — safe to re-run)
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- ── 1. Customers ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT        NOT NULL,
  billing_name       TEXT,
  billing_email      TEXT,
  stripe_customer_id TEXT        UNIQUE,
  free_usage_count   INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns that may be missing on re-run
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_name       TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_email      TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS free_usage_count   INTEGER NOT NULL DEFAULT 0;

-- ── 2. Plans ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS plans (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT          NOT NULL,
  slug             TEXT          UNIQUE NOT NULL,
  description      TEXT,
  features         JSONB         NOT NULL DEFAULT '[]',
  interval         TEXT,
  price            NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency         TEXT          NOT NULL DEFAULT 'eur',
  stripe_price_id  TEXT,
  discount_percent INTEGER       NOT NULL DEFAULT 0,
  is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
  display_order    INTEGER       NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_price_id  TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS discount_percent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS display_order    INTEGER NOT NULL DEFAULT 0;

-- ── 3. Subscriptions ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id            UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plan_id                UUID        NOT NULL REFERENCES plans(id),
  status                 TEXT        NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT        UNIQUE,
  cancel_at_period_end   BOOLEAN     NOT NULL DEFAULT FALSE,
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start   TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end     TIMESTAMPTZ;

-- ── 4. Usage Logs ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usage_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  mode          TEXT        NOT NULL,
  operation     TEXT        NOT NULL DEFAULT 'analyze',
  status        TEXT        NOT NULL,
  usage_before  INTEGER,
  usage_after   INTEGER,
  error         TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS error    TEXT;
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ── 5. Email Usage History ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_usage_history (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash       TEXT        UNIQUE NOT NULL,
  total_free_usage INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans               ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_usage_history ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies idempotently
DROP POLICY IF EXISTS "customers_select_own"        ON customers;
DROP POLICY IF EXISTS "plans_select_active"          ON plans;
DROP POLICY IF EXISTS "subscriptions_select_own"    ON subscriptions;
DROP POLICY IF EXISTS "usage_logs_select_own"       ON usage_logs;

CREATE POLICY "customers_select_own" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "plans_select_active" ON plans
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "usage_logs_select_own" ON usage_logs
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- ── 7. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_customers_user_id        ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id      ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer   ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status     ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_customer      ON usage_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_usage_hash         ON email_usage_history(email_hash);

-- ── 8. Updated_at trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at     ON customers;
DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS email_usage_updated_at   ON email_usage_history;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER email_usage_updated_at
  BEFORE UPDATE ON email_usage_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 9. Seed Plans (update on conflict) ───────────────────────────────────────

INSERT INTO plans (name, slug, description, features, interval, price, currency, stripe_price_id, discount_percent, is_active, display_order)
VALUES
  (
    'Free', 'free',
    'Começa gratuitamente sem cartão',
    '["3 análises gratuitas", "Extração de conhecimento", "Exportar PDF", "4 idiomas suportados"]',
    NULL, 0.00, 'usd', NULL, 0, TRUE, 0
  ),
  (
    'Pro Mensal', 'monthly',
    'Acesso ilimitado, cancela quando quiseres',
    '["Análises ilimitadas", "Extração de conhecimento", "Exportar PDF", "4 idiomas suportados", "Deep Search ilimitado", "Suporte prioritário"]',
    'month', 16.00, 'usd', 'price_1TEdIxKGipWz7ZHIZVrHFZiL', 0, TRUE, 1
  ),
  (
    'Pro Anual', 'annual',
    'Melhor valor — 2 meses grátis',
    '["Análises ilimitadas", "Extração de conhecimento", "Exportar PDF", "4 idiomas suportados", "Deep Search ilimitado", "Suporte prioritário", "2 meses grátis vs. mensal"]',
    'year', 120.00, 'usd', 'price_1TEdL5KGipWz7ZHIZYL77ssM', 17, TRUE, 2
  )
ON CONFLICT (slug) DO UPDATE SET
  name             = EXCLUDED.name,
  description      = EXCLUDED.description,
  features         = EXCLUDED.features,
  price            = EXCLUDED.price,
  currency         = EXCLUDED.currency,
  stripe_price_id  = COALESCE(EXCLUDED.stripe_price_id, plans.stripe_price_id),
  discount_percent = EXCLUDED.discount_percent,
  is_active        = EXCLUDED.is_active,
  display_order    = EXCLUDED.display_order;

-- ── 10. Analyses (Library) ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS analyses (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  video_id      TEXT        NOT NULL,
  video_title   TEXT        NOT NULL,
  channel       TEXT,
  thumbnail_url TEXT,
  niche         TEXT,
  niche_id      TEXT,
  card_count    INT         NOT NULL DEFAULT 0,
  result        JSONB       NOT NULL
);

-- Add user_id if table existed without it
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analyses_own" ON analyses;
CREATE POLICY "analyses_own" ON analyses
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created  ON analyses(created_at DESC);
-- Unique per user per video — upsert-safe
CREATE UNIQUE INDEX IF NOT EXISTS idx_analyses_user_video
  ON analyses(user_id, video_id) WHERE user_id IS NOT NULL;

-- =============================================================================
-- DONE. Safe to re-run at any time.
-- Next steps:
--   1. Replace stripe_price_id placeholders in the plans table with real Stripe price IDs
--   2. Add STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET to your .env
--   3. Configure Stripe webhook endpoint: /api/billing/webhook
-- =============================================================================
