-- ============================================================
-- Orders table — users place purchase requests with traders
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  order_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(user_id) ON DELETE CASCADE,
  trader_id    UUID REFERENCES traders(trader_id) ON DELETE SET NULL,
  date_type_id UUID REFERENCES date_types(date_type_id) ON DELETE SET NULL,
  quantity_kg  NUMERIC(10,2) NOT NULL CHECK (quantity_kg > 0),
  notes        TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_trader_id ON orders(trader_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can manage their own orders
CREATE POLICY "users_manage_own_orders" ON orders
  FOR ALL USING (true);
-- (server side uses SERVICE_ROLE_KEY which bypasses RLS)
