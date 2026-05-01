-- ============================================================
-- Migration 013: Fix overly permissive RLS policies
-- ============================================================

-- ── trader_ratings ────────────────────────────────────────────
-- Before: anyone could insert/update any voter_key
-- After:  only authenticated users whose auth.uid() matches voter_key

DROP POLICY IF EXISTS "public_insert_trader_ratings" ON trader_ratings;
DROP POLICY IF EXISTS "public_update_trader_ratings" ON trader_ratings;

CREATE POLICY "auth_insert_trader_ratings"
  ON trader_ratings FOR INSERT
  WITH CHECK (auth.uid()::text = voter_key);

CREATE POLICY "auth_update_own_trader_rating"
  ON trader_ratings FOR UPDATE
  USING (auth.uid()::text = voter_key);

-- ── product_ratings ───────────────────────────────────────────
-- Before: anyone could insert/update any anon_key
-- After:  only authenticated users whose auth.uid() matches anon_key

DROP POLICY IF EXISTS "public_insert_ratings" ON product_ratings;
DROP POLICY IF EXISTS "public_update_ratings" ON product_ratings;

CREATE POLICY "auth_insert_product_ratings"
  ON product_ratings FOR INSERT
  WITH CHECK (auth.uid()::text = anon_key);

CREATE POLICY "auth_update_own_product_rating"
  ON product_ratings FOR UPDATE
  USING (auth.uid()::text = anon_key);

-- ── orders ────────────────────────────────────────────────────
-- Before: USING (true) — anyone could read all orders via anon key
-- After:  users see only their own orders; service role bypasses for API use

DROP POLICY IF EXISTS "users_manage_own_orders" ON orders;

CREATE POLICY "users_manage_own_orders" ON orders
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ── exhibitions ───────────────────────────────────────────────
-- Read is already public (fine for a public listing).
-- Write (INSERT/UPDATE/DELETE) should be blocked for anon key —
-- the application enforces admin-only via the API layer, but this
-- adds a DB-level safety net.

DROP POLICY IF EXISTS "public_write_exhibitions" ON exhibitions;

CREATE POLICY "admin_write_exhibitions"
  ON exhibitions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id::text = auth.uid()::text
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id::text = auth.uid()::text
        AND users.role = 'admin'
    )
  );
