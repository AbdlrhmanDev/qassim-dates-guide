-- Add rating_count to traders (rating column already exists)
ALTER TABLE traders
  ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Individual rating records per device/user per trader
CREATE TABLE IF NOT EXISTS trader_ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id  UUID NOT NULL REFERENCES traders(trader_id) ON DELETE CASCADE,
  voter_key  TEXT NOT NULL,   -- user_id (logged-in) OR anon UUID (visitor)
  stars      SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trader_id, voter_key)
);

ALTER TABLE trader_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_trader_ratings"   ON trader_ratings;
DROP POLICY IF EXISTS "public_insert_trader_ratings" ON trader_ratings;
DROP POLICY IF EXISTS "public_update_trader_ratings" ON trader_ratings;

CREATE POLICY "public_read_trader_ratings"   ON trader_ratings FOR SELECT USING (true);
CREATE POLICY "public_insert_trader_ratings" ON trader_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_trader_ratings" ON trader_ratings FOR UPDATE USING (true);
