-- Add image_url column to trader_products
ALTER TABLE trader_products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Storage bucket for product images
-- Run this in Supabase SQL editor OR create the bucket manually in the dashboard:
--
-- In Supabase Dashboard → Storage → New bucket:
--   Name: product-images
--   Public: YES (so images are accessible without auth)
--
-- Then add this storage policy so traders can upload:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

