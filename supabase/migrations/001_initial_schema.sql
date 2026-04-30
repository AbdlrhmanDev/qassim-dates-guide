-- ============================================================
-- Qassim Dates Guide - Initial Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email     TEXT UNIQUE NOT NULL,
  role      TEXT NOT NULL DEFAULT 'user'
              CHECK (role IN ('user', 'admin', 'trader')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. TRADERS
-- ============================================================
CREATE TABLE IF NOT EXISTS traders (
  trader_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(user_id) ON DELETE SET NULL,
  shop_name        TEXT NOT NULL,
  description      TEXT,
  contact_phone    TEXT,
  contact_whatsapp TEXT,
  city             TEXT,
  image_url        TEXT,
  rating           NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  verified         BOOLEAN DEFAULT FALSE,
  status           TEXT DEFAULT 'active'
                     CHECK (status IN ('active', 'pending', 'suspended')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ADMINS
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  admin_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
  permissions JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. DATE_TYPES (أنواع التمور)
-- ============================================================
CREATE TABLE IF NOT EXISTS date_types (
  date_type_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image_url     TEXT,
  season        TEXT,
  category      TEXT DEFAULT 'premium'
                  CHECK (category IN ('premium', 'fresh', 'dried')),
  calories      INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. EXHIBITIONS (المعارض)
-- ============================================================
CREATE TABLE IF NOT EXISTS exhibitions (
  exhibition_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar        TEXT NOT NULL,
  name_en        TEXT NOT NULL,
  city           TEXT NOT NULL,
  place          TEXT,
  start_date     DATE,
  end_date       DATE,
  time_info      TEXT,
  description_ar TEXT,
  description_en TEXT,
  status         TEXT DEFAULT 'upcoming'
                   CHECK (status IN ('upcoming', 'active', 'ended')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. SALES (المبيعات)
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  sale_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id      UUID REFERENCES traders(trader_id) ON DELETE SET NULL,
  date_type_id   UUID REFERENCES date_types(date_type_id) ON DELETE SET NULL,
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  price_per_unit NUMERIC(10,2) NOT NULL CHECK (price_per_unit > 0),
  total_price    NUMERIC(10,2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  sale_date      DATE DEFAULT CURRENT_DATE,
  market_name    TEXT,
  status         TEXT DEFAULT 'confirmed'
                   CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. COMMENTS (التعليقات)
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  comment_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(user_id) ON DELETE CASCADE,
  target_type TEXT NOT NULL
                CHECK (target_type IN ('date_type', 'trader', 'exhibition')),
  target_id   UUID NOT NULL,
  content     TEXT NOT NULL CHECK (char_length(content) > 0),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_traders_user_id     ON traders(user_id);
CREATE INDEX IF NOT EXISTS idx_traders_city        ON traders(city);
CREATE INDEX IF NOT EXISTS idx_admins_user_id      ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_trader_id     ON sales(trader_id);
CREATE INDEX IF NOT EXISTS idx_sales_date_type_id  ON sales(date_type_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date     ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_comments_user_id    ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_target     ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_status  ON exhibitions(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE traders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins      ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_types  ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales       ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments    ENABLE ROW LEVEL SECURITY;

-- PUBLIC read access (date_types, traders, exhibitions, comments)
CREATE POLICY "public_read_date_types"  ON date_types  FOR SELECT USING (true);
CREATE POLICY "public_read_traders"     ON traders     FOR SELECT USING (status = 'active');
CREATE POLICY "public_read_exhibitions" ON exhibitions FOR SELECT USING (true);
CREATE POLICY "public_read_comments"    ON comments    FOR SELECT USING (true);

-- Users can read their own data
CREATE POLICY "users_read_own"   ON users FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Traders can manage their own sales
CREATE POLICY "traders_manage_own_sales" ON sales
  FOR ALL USING (
    trader_id IN (
      SELECT trader_id FROM traders WHERE user_id::text = auth.uid()::text
    )
  );

-- Users can manage their own comments
CREATE POLICY "users_manage_own_comments" ON comments
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Admins can see all data (via service role key on the backend)

-- ============================================================
-- SEED DATA - أنواع التمور الأساسية
-- ============================================================
INSERT INTO date_types (name_ar, name_en, description_ar, description_en, season, category, calories)
VALUES
  ('السكري',    'Sukkary',    'ملك التمور السعودية، طعم حلو مميز وقوام طري',      'King of Saudi dates, distinctively sweet taste with soft texture', 'الصيف', 'premium', 130),
  ('الخلاص',   'Khalas',     'تمر ذهبي اللون بطعم كراميل رائع',                    'Golden-colored date with amazing caramel taste',                  'الصيف', 'premium', 125),
  ('الصقعي',   'Segae',      'تمر بني فاتح بنكهة خفيفة مميزة',                    'Light brown date with a distinctive mild flavor',                 'الخريف','fresh',   115),
  ('العجوة',   'Ajwa',       'تمر المدينة المنورة المشهور بفوائده الصحية',          'Madinah date famous for its health benefits',                    'الصيف', 'premium', 120),
  ('المبروم',  'Mabroom',    'تمر طويل وطري ذو طعم حلو مميز',                     'Long and soft date with a distinctive sweet taste',               'الصيف', 'premium', 128),
  ('الصفاوي',  'Safawi',     'تمر داكن اللون غني بالعناصر الغذائية',               'Dark-colored date rich in nutrients',                            'الخريف','dried',   118),
  ('المجهول',  'Medjool',    'تمر ملكي كبير الحجم بطعم شهي',                      'Large royal date with a delicious taste',                         'الصيف', 'premium', 277),
  ('البرحي',   'Barhi',      'تمر طازج بطعم كريمي فريد',                           'Fresh date with a unique creamy taste',                          'الصيف', 'fresh',   110)
ON CONFLICT DO NOTHING;

-- Seed exhibitions
INSERT INTO exhibitions (name_ar, name_en, city, place, start_date, end_date, time_info, description_ar, description_en, status)
VALUES
  ('مهرجان بريدة للتمور', 'Buraydah Dates Festival',
   'بريدة', 'ساحة المهرجان الرئيسية',
   '2025-08-15', '2025-09-15', '6:00 ص - 10:00 م',
   'أكبر سوق للتمور في العالم، يجمع المزارعين والتجار من جميع أنحاء المملكة',
   'The world''s largest date market, bringing together farmers and traders from across the Kingdom',
   'upcoming'),
  ('معرض التمور الدولي', 'International Dates Exhibition',
   'الرياض', 'مركز الرياض للمعارض',
   '2025-10-01', '2025-10-05', '9:00 ص - 9:00 م',
   'معرض دولي يعرض أجود أنواع التمور السعودية للأسواق العالمية',
   'International exhibition showcasing the finest Saudi dates for global markets',
   'upcoming'),
  ('مهرجان عنيزة للتمور', 'Unayzah Dates Festival',
   'عنيزة', 'الحديقة المركزية',
   '2025-08-20', '2025-09-20', '4:00 م - 11:00 م',
   'مهرجان محلي يحتفل بموسم حصاد التمور مع فعاليات ثقافية متنوعة',
   'Local festival celebrating the date harvest season with various cultural events',
   'active')
ON CONFLICT DO NOTHING;
