-- Add price_per_kg column to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC(10,2);
