-- Add rating columns to trader_products
ALTER TABLE trader_products
  ADD COLUMN IF NOT EXISTS rating       NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER      DEFAULT 0;

-- Table to record individual ratings (one per device per product)
CREATE TABLE IF NOT EXISTS product_ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES trader_products(id) ON DELETE CASCADE,
  anon_key   TEXT NOT NULL,
  stars      SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, anon_key)
);

ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist, then recreate
DROP POLICY IF EXISTS "public_read_ratings"   ON product_ratings;
DROP POLICY IF EXISTS "public_insert_ratings" ON product_ratings;
DROP POLICY IF EXISTS "public_update_ratings" ON product_ratings;

CREATE POLICY "public_read_ratings"   ON product_ratings FOR SELECT USING (true);
CREATE POLICY "public_insert_ratings" ON product_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_ratings" ON product_ratings FOR UPDATE USING (true);
