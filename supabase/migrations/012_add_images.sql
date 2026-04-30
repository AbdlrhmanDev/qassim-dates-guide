-- ============================================================
-- Migration 012: Add images to date_types, traders, trader_products
-- All images are from Unsplash (free, high-quality)
-- ============================================================

-- ============================================================
-- DATE TYPES — product images
-- ============================================================
UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1625236927574-c2a1b4c91279?w=600&q=80'
WHERE name_en = 'Sukkary';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600&q=80'
WHERE name_en = 'Khalas';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80'
WHERE name_en = 'Segae';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=600&q=80'
WHERE name_en = 'Ajwa';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1609450753476-3f5f3e04e79d?w=600&q=80'
WHERE name_en = 'Mabroom';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1595236254668-9dc30e75f51b?w=600&q=80'
WHERE name_en = 'Safawi';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1607183201864-03d2667e7428?w=600&q=80'
WHERE name_en = 'Medjool';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=600&q=80'
WHERE name_en = 'Barhi';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&q=80'
WHERE name_en = 'Raziz';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&q=80'
WHERE name_en = 'Nabut Al-Sayf';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1625236927574-c2a1b4c91279?w=600&q=80'
WHERE name_en = 'Hilwa';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1595236254668-9dc30e75f51b?w=600&q=80'
WHERE name_en = 'Shalabi';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=600&q=80'
WHERE name_en = 'Rabia';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1609450753476-3f5f3e04e79d?w=600&q=80'
WHERE name_en = 'Waseela';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=600&q=80'
WHERE name_en = 'Khadri';

UPDATE date_types SET image_url = 'https://images.unsplash.com/photo-1607183201864-03d2667e7428?w=600&q=80'
WHERE name_en = 'Dabbas';

-- ============================================================
-- TRADERS — shop / farm images
-- ============================================================
UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&q=80'
WHERE shop_name = 'مزرعة الأمير للتمور';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?w=400&q=80'
WHERE shop_name = 'تمور الراشد الذهبية';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&q=80'
WHERE shop_name = 'مؤسسة العتيبي للتمور';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1607183201864-03d2667e7428?w=400&q=80'
WHERE shop_name = 'بيت التمور الفاخر';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1625236927574-c2a1b4c91279?w=400&q=80'
WHERE shop_name = 'مزرعة الحربي للتمور';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=400&q=80'
WHERE shop_name = 'النخيل الذهبي - عنيزة';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80'
WHERE shop_name = 'تمور القصيم الأصيلة';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1595236254668-9dc30e75f51b?w=400&q=80'
WHERE shop_name = 'دار التمور الملكية';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=400&q=80'
WHERE shop_name = 'الصفوة للتمور';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1609450753476-3f5f3e04e79d?w=400&q=80'
WHERE shop_name = 'تمور القلعة';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400&q=80'
WHERE shop_name = 'مزارع ابن سلمان';

UPDATE traders SET image_url = 'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?w=400&q=80'
WHERE shop_name = 'تمور المدينة الخضراء';

-- ============================================================
-- TRADER PRODUCTS — inherit image from date_type
-- Each product gets the same photo as its date variety
-- ============================================================
UPDATE trader_products tp
SET image_url = dt.image_url
FROM date_types dt
WHERE tp.date_type_id = dt.date_type_id
  AND dt.image_url IS NOT NULL;
