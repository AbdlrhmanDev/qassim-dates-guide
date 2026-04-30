-- ============================================================
-- Migration 011: Seed trader_products for all traders
-- Links each trader to the date types they sell, with prices and stock
-- ============================================================

-- We use CTEs to look up trader_id and date_type_id by name,
-- so this migration works even if UUIDs differ across environments.

WITH
  -- ── Date type IDs ──────────────────────────────────────────
  dt AS (
    SELECT date_type_id, name_en FROM date_types
  ),
  -- ── Trader IDs ─────────────────────────────────────────────
  tr AS (
    SELECT trader_id, shop_name FROM traders
  )

INSERT INTO trader_products (trader_id, date_type_id, price_per_kg, stock_kg, available, notes)

-- ================================================================
-- 1. مزرعة الأمير للتمور  (Buraydah) — specialises in Sukkary
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('مزرعة الأمير للتمور', 'Sukkary',  35.00, 500, TRUE,  'درجة أولى - مباشر من المزرعة'),
  ('مزرعة الأمير للتمور', 'Khalas',   28.00, 300, TRUE,  'خلاص ممتاز - الموسم الجديد'),
  ('مزرعة الأمير للتمور', 'Medjool',  60.00, 150, TRUE,  'مجهول فاخر للهدايا'),
  ('مزرعة الأمير للتمور', 'Barhi',    22.00, 200, TRUE,  'برحي طازج - محدود الكمية'),
  ('مزرعة الأمير للتمور', 'Raziz',    18.00, 100, FALSE, 'خارج الموسم حالياً')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 2. تمور الراشد الذهبية  (Buraydah) — specialises in Khalas
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('تمور الراشد الذهبية', 'Khalas',   26.00, 800, TRUE,  'خلاص ذهبي درجة ممتازة'),
  ('تمور الراشد الذهبية', 'Sukkary',  32.00, 600, TRUE,  'سكري بريدة الأصيل'),
  ('تمور الراشد الذهبية', 'Segae',    20.00, 400, TRUE,  'صقعي طازج من القصيم'),
  ('تمور الراشد الذهبية', 'Safawi',   24.00, 350, TRUE,  'صفاوي مجفف عالي الجودة'),
  ('تمور الراشد الذهبية', 'Khadri',   22.00, 250, TRUE,  'خضري طري - مثالي للتصدير'),
  ('تمور الراشد الذهبية', 'Mabroom',  30.00, 200, TRUE,  'مبروم فاخر بالجملة')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 3. مؤسسة العتيبي للتمور  (Buraydah) — large exporter
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('مؤسسة العتيبي للتمور', 'Sukkary',  38.00, 2000, TRUE,  'سكري تصديري - معبأ بمعايير دولية'),
  ('مؤسسة العتيبي للتمور', 'Khalas',   30.00, 1500, TRUE,  'خلاص درجة أولى للتصدير'),
  ('مؤسسة العتيبي للتمور', 'Ajwa',     75.00,  500, TRUE,  'عجوة المدينة الأصيلة'),
  ('مؤسسة العتيبي للتمور', 'Medjool',  65.00,  800, TRUE,  'مجهول كبير الحجم للتصدير'),
  ('مؤسسة العتيبي للتمور', 'Mabroom',  35.00,  600, TRUE,  'مبروم طويل مثالي للهدايا'),
  ('مؤسسة العتيبي للتمور', 'Safawi',   28.00,  700, TRUE,  'صفاوي معبأ بالكيلو والكرتون'),
  ('مؤسسة العتيبي للتمور', 'Khadri',   25.00,  400, FALSE, 'نفد المخزون - قريباً')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 4. بيت التمور الفاخر  (Buraydah) — gift boxes
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('بيت التمور الفاخر', 'Sukkary',  45.00, 300, TRUE, 'سكري فاخر في علب هدايا مميزة'),
  ('بيت التمور الفاخر', 'Ajwa',     85.00, 150, TRUE, 'عجوة فاخرة - علب ذهبية للمناسبات'),
  ('بيت التمور الفاخر', 'Medjool',  70.00, 200, TRUE, 'مجهول ملكي - تغليف VIP'),
  ('بيت التمور الفاخر', 'Waseela',  50.00, 100, TRUE, 'وصيلة مع المكسرات - هدايا فاخرة'),
  ('بيت التمور الفاخر', 'Hilwa',    40.00, 180, TRUE, 'حلوة بالتغليف الكلاسيكي')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 5. مزرعة الحربي للتمور  (Unayzah) — organic
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('مزرعة الحربي للتمور', 'Sukkary',          40.00, 400, TRUE, 'سكري عضوي بدون مبيدات'),
  ('مزرعة الحربي للتمور', 'Nabut Al-Sayf',    25.00, 250, TRUE, 'نبوت السيف الطازج - الموسم الجديد'),
  ('مزرعة الحربي للتمور', 'Rabia',            18.00, 300, TRUE, 'ربيعة طازجة - محدودة الكمية'),
  ('مزرعة الحربي للتمور', 'Barhi',            22.00, 350, TRUE, 'برحي عضوي طازج'),
  ('مزرعة الحربي للتمور', 'Khalas',           30.00, 200, TRUE, 'خلاص عضوي بشهادة معتمدة'),
  ('مزرعة الحربي للتمور', 'Shalabi',          20.00, 150, FALSE,'موسمي - يتوفر في الخريف')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 6. النخيل الذهبي - عنيزة  — Barhi & Medjool specialist
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('النخيل الذهبي - عنيزة', 'Barhi',   24.00, 600, TRUE, 'برحي طازج للمطاعم والفنادق'),
  ('النخيل الذهبي - عنيزة', 'Medjool', 62.00, 400, TRUE, 'مجهول فاخر - عروض الجملة'),
  ('النخيل الذهبي - عنيزة', 'Sukkary', 36.00, 500, TRUE, 'سكري عنيزة الأصيل'),
  ('النخيل الذهبي - عنيزة', 'Khalas',  28.00, 300, TRUE, 'خلاص ذهبي درجة أولى'),
  ('النخيل الذهبي - عنيزة', 'Dabbas',  32.00, 200, TRUE, 'دباس أصيل - كميات محدودة')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 7. تمور القصيم الأصيلة  (Unayzah)
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('تمور القصيم الأصيلة', 'Sukkary',  33.00, 350, TRUE, 'سكري فاخر بتغليف حديث'),
  ('تمور القصيم الأصيلة', 'Segae',    19.00, 450, TRUE, 'صقعي طازج من مزارعنا'),
  ('تمور القصيم الأصيلة', 'Raziz',    16.00, 200, TRUE, 'رزيز موسمي بسعر المنتج'),
  ('تمور القصيم الأصيلة', 'Khalas',   27.00, 300, TRUE, 'خلاص ممتاز - الموسم الجديد')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 8. دار التمور الملكية  (Riyadh) — premium gift
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('دار التمور الملكية', 'Sukkary',  50.00, 500, TRUE, 'سكري فاخر - علب ملكية'),
  ('دار التمور الملكية', 'Ajwa',     90.00, 300, TRUE, 'عجوة أصيلة - هدايا مميزة'),
  ('دار التمور الملكية', 'Medjool',  72.00, 250, TRUE, 'مجهول ملكي - أكبر الأحجام'),
  ('دار التمور الملكية', 'Waseela',  55.00, 150, TRUE, 'وصيلة فاخرة بالمكسرات'),
  ('دار التمور الملكية', 'Hilwa',    45.00, 200, TRUE, 'حلوة فاخرة - علب هدايا'),
  ('دار التمور الملكية', 'Mabroom',  38.00, 180, TRUE, 'مبروم طويل - تغليف فاخر'),
  ('دار التمور الملكية', 'Khadri',   28.00, 220, FALSE,'نفد المخزون - توقعات الأسبوع القادم')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 9. الصفوة للتمور  (Riyadh)
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('الصفوة للتمور', 'Sukkary',  34.00, 400, TRUE, 'سكري بسعر المنتج مباشرة'),
  ('الصفوة للتمور', 'Khalas',   27.00, 350, TRUE, 'خلاص ذهبي - الموسم الجديد'),
  ('الصفوة للتمور', 'Segae',    19.00, 300, TRUE, 'صقعي طازج من القصيم'),
  ('الصفوة للتمور', 'Barhi',    21.00, 250, TRUE, 'برحي طازج محدود'),
  ('الصفوة للتمور', 'Safawi',   23.00, 200, TRUE, 'صفاوي جاف عالي الجودة')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 10. تمور القلعة  (Madinah) — export grade dried dates
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('تمور القلعة', 'Ajwa',     80.00, 1000, TRUE, 'عجوة المدينة الأصيلة - درجة تصديرية'),
  ('تمور القلعة', 'Safawi',   26.00,  800, TRUE, 'صفاوي مجفف - معبأ بأوزان مختلفة'),
  ('تمور القلعة', 'Khadri',   24.00,  600, TRUE, 'خضري مجفف - صالح للتصدير'),
  ('تمور القلعة', 'Mabroom',  33.00,  500, TRUE, 'مبروم جاف طويل - تصديري'),
  ('تمور القلعة', 'Sukkary',  40.00,  400, TRUE, 'سكري مجفف مُعلَّب'),
  ('تمور القلعة', 'Dabbas',   30.00,  300, FALSE,'دباس - الموسم القادم')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 11. مزارع ابن سلمان  (Buraydah) — family farm, highest rated
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('مزارع ابن سلمان', 'Khalas',          29.00, 1200, TRUE, 'خلاص ابن سلمان الشهير - حصاد هذا العام'),
  ('مزارع ابن سلمان', 'Segae',           21.00,  900, TRUE, 'صقعي أصيل من مزرعتنا العريقة'),
  ('مزارع ابن سلمان', 'Sukkary',         37.00,  800, TRUE, 'سكري فاخر - تربية طبيعية'),
  ('مزارع ابن سلمان', 'Nabut Al-Sayf',   23.00,  400, TRUE, 'نبوت السيف - موسم 2026'),
  ('مزارع ابن سلمان', 'Raziz',           17.00,  300, TRUE, 'رزيز موسمي بسعر المزرعة'),
  ('مزارع ابن سلمان', 'Barhi',           20.00,  500, TRUE, 'برحي طازج يومياً'),
  ('مزارع ابن سلمان', 'Rabia',           16.00,  350, FALSE,'ربيعة - موسمي ينتهي قريباً')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

UNION ALL

-- ================================================================
-- 12. تمور المدينة الخضراء  (Madinah)
-- ================================================================
SELECT tr.trader_id, dt.date_type_id, price, stock, avail, note
FROM (VALUES
  ('تمور المدينة الخضراء', 'Ajwa',    78.00, 500, TRUE, 'عجوة المدينة المنورة - درجة أولى'),
  ('تمور المدينة الخضراء', 'Safawi',  24.00, 400, TRUE, 'صفاوي مزارع المدينة'),
  ('تمور المدينة الخضراء', 'Sukkary', 36.00, 300, TRUE, 'سكري قصيمي مميز'),
  ('تمور المدينة الخضراء', 'Khalas',  28.00, 250, TRUE, 'خلاص ذهبي متجدد'),
  ('تمور المدينة الخضراء', 'Khadri',  23.00, 200, TRUE, 'خضري طري محلي')
) AS v(shop, date_en, price, stock, avail, note)
JOIN tr ON tr.shop_name = v.shop
JOIN dt ON dt.name_en   = v.date_en

-- Also add products to the original traders from migration 001 seed
-- (Al-Abdullah Farms and others that were seeded without products)

ON CONFLICT (trader_id, date_type_id) DO UPDATE
  SET price_per_kg = EXCLUDED.price_per_kg,
      stock_kg     = EXCLUDED.stock_kg,
      available    = EXCLUDED.available,
      notes        = EXCLUDED.notes;
