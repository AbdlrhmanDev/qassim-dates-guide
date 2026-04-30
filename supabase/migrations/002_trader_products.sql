-- ============================================================
-- Trader Products — links a trader to the date types they sell
-- ============================================================
CREATE TABLE IF NOT EXISTS trader_products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id     UUID NOT NULL REFERENCES traders(trader_id)    ON DELETE CASCADE,
  date_type_id  UUID NOT NULL REFERENCES date_types(date_type_id) ON DELETE CASCADE,
  price_per_kg  NUMERIC(10,2) NOT NULL CHECK (price_per_kg > 0),
  stock_kg      INTEGER        DEFAULT 0 CHECK (stock_kg >= 0),
  available     BOOLEAN        DEFAULT TRUE,
  notes         TEXT,
  created_at    TIMESTAMPTZ    DEFAULT NOW(),
  UNIQUE (trader_id, date_type_id)   -- one listing per date type per trader
);

CREATE INDEX IF NOT EXISTS idx_trader_products_trader   ON trader_products(trader_id);
CREATE INDEX IF NOT EXISTS idx_trader_products_datetype ON trader_products(date_type_id);

ALTER TABLE trader_products ENABLE ROW LEVEL SECURITY;

-- Anyone can read available products
CREATE POLICY "public_read_trader_products"
  ON trader_products FOR SELECT USING (available = TRUE);

-- Traders manage only their own rows (backend uses service role → all allowed)
