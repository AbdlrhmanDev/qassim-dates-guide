-- ============================================================
-- Migration 010: Additional Traders, Exhibitions, Date Types
-- ============================================================

-- ============================================================
-- NEW DATE TYPES
-- ============================================================
INSERT INTO date_types (name_ar, name_en, description_ar, description_en, season, category, calories)
VALUES
  ('الرزيز',    'Raziz',
   'تمر صغير الحجم ذو لون بني داكن وطعم حلو مركز، يُحصد في موسم الربيع',
   'Small dark-brown date with concentrated sweetness, harvested in spring season',
   'الربيع', 'dried', 112),

  ('النبوت السيف', 'Nabut Al-Sayf',
   'تمر أصفر اللون ذو قوام طري ورائحة عطرية مميزة من منطقة القصيم',
   'Yellow soft date with a distinctive aromatic fragrance from the Qassim region',
   'الصيف', 'fresh', 108),

  ('الحلوة',    'Hilwa',
   'تمر حلو الطعم جداً ذو لون ذهبي، يُستخدم في صناعة الحلويات التقليدية',
   'Extremely sweet golden date used in traditional confectionery',
   'الصيف', 'premium', 135),

  ('الشلبي',    'Shalabi',
   'تمر بني متوسط الحجم بنكهة متوازنة بين الحلاوة والمرارة الخفيفة',
   'Medium brown date with a balanced flavor between sweetness and slight bitterness',
   'الخريف', 'dried', 119),

  ('الربيعة',   'Rabia',
   'تمر طازج بلون أصفر مائل للخضرة، يُقطف في بداية الموسم ويُعرف بطعمه المنعش',
   'Fresh yellowish-green date harvested at the start of the season, known for its refreshing taste',
   'الصيف', 'fresh', 95),

  ('الوصيلة',   'Waseela',
   'تمر منقوع في الدبس الطبيعي، غني بالمعادن والسكريات الطبيعية',
   'Date soaked in natural date molasses, rich in minerals and natural sugars',
   'الخريف', 'premium', 142),

  ('الخضري',    'Khadri',
   'تمر داكن اللون ذو قوام طري ومرن، يحتفظ برطوبته لفترة طويلة',
   'Dark-colored date with a soft and flexible texture that retains moisture for long periods',
   'الصيف', 'dried', 122),

  ('الدباس',    'Dabbas',
   'تمر إماراتي أصيل متوفر في القصيم، لونه بني فاتح وطعمه كريمي',
   'Authentic Emirati date available in Qassim, light brown with a creamy taste',
   'الصيف', 'premium', 131)
ON CONFLICT DO NOTHING;

-- ============================================================
-- NEW TRADERS
-- ============================================================
INSERT INTO traders (shop_name, description, contact_phone, contact_whatsapp, city, verified, status, rating, rating_count)
VALUES
  -- Buraydah traders
  ('مزرعة الأمير للتمور',
   'متخصصون في تمر السكري الفاخر المباشر من المزرعة إلى المستهلك، بجودة مضمونة وأسعار تنافسية',
   '0535969582', '0535969582',
   'بريدة', TRUE, 'active', 4.8, 24),

  ('تمور الراشد الذهبية',
   'أكثر من 30 عاماً في تجارة التمور، نوفر أجود أنواع الخلاص والسكري بالجملة والتجزئة',
   '0535969582', '0535969582',
   'بريدة', TRUE, 'active', 4.7, 31),

  ('مؤسسة العتيبي للتمور',
   'تمور طازجة مباشرة من بساتيننا في القصيم، نصدر لأكثر من 15 دولة حول العالم',
   '0535969582', '0535969582',
   'بريدة', TRUE, 'active', 4.9, 47),

  ('بيت التمور الفاخر',
   'وجهتك الأولى لتمور الهدايا والمناسبات، تغليف فاخر وتوصيل لجميع مناطق المملكة',
   '0535969582', '0535969582',
   'بريدة', FALSE, 'active', 4.5, 18),

  -- Unayzah traders
  ('مزرعة الحربي للتمور',
   'تمور عضوية 100% بدون إضافات كيميائية، مزروعة وفق أساليب الزراعة التقليدية',
   '0535969582', '0535969582',
   'عنيزة', TRUE, 'active', 4.6, 22),

  ('النخيل الذهبي - عنيزة',
   'متخصصون في تمر البرحي الطازج والمجدول، نوفر عروض الجملة للمطاعم والفنادق',
   '0535969582', '0535969582',
   'عنيزة', TRUE, 'active', 4.7, 29),

  ('تمور القصيم الأصيلة',
   'نجمع بين الأصالة والحداثة في تقديم أجود التمور القصيمية بطرق تعبئة حديثة',
   '0535969582', '0535969582',
   'عنيزة', FALSE, 'active', 4.3, 11),

  -- Riyadh/other
  ('دار التمور الملكية',
   'متجر متخصص بتمور الهدايا الفاخرة والمشكلة، بصناديق وتغليف من أرقى المستويات',
   '0535969582', '0535969582',
   'الرياض', TRUE, 'active', 4.8, 56),

  ('الصفوة للتمور',
   'نقدم أفضل تمور منطقة القصيم بأسعار المنتج مباشرةً، مع ضمان الجودة وخدمة التوصيل',
   '0535969582', '0535969582',
   'الرياض', FALSE, 'active', 4.4, 15),

  ('تمور القلعة',
   'متخصصون في التمور المجففة والمعلبة الصالحة للتصدير، نمتلك شهادات الجودة الدولية',
   '0535969582', '0535969582',
   'المدينة المنورة', TRUE, 'active', 4.6, 33),

  ('مزارع ابن سلمان',
   'مزرعة عائلية عريقة تضم أكثر من 2000 نخلة، تنتج تمر الخلاص والصقعي الأصيل',
   '0535969582', '0535969582',
   'بريدة', TRUE, 'active', 4.9, 61),

  ('تمور المدينة الخضراء',
   'نقدم تشكيلة متنوعة من تمور القصيم والمدينة المنورة بمعايير جودة عالية',
   '0535969582', '0535969582',
   'المدينة المنورة', FALSE, 'active', 4.2, 9)
ON CONFLICT DO NOTHING;

-- ============================================================
-- NEW EXHIBITIONS
-- ============================================================
INSERT INTO exhibitions (name_ar, name_en, city, place, start_date, end_date, time_info, description_ar, description_en, status)
VALUES
  ('سوق التمور الأسبوعي بريدة',
   'Buraydah Weekly Date Market',
   'بريدة',
   'سوق التمور المركزي - بريدة',
   '2026-06-01', '2026-06-07',
   '6:00 ص - 2:00 م يومياً',
   'السوق الأسبوعي الشهير في بريدة الذي يجذب التجار والمشترين من جميع مناطق المملكة لشراء أجود التمور بأسعار المنتج',
   'The famous weekly market in Buraydah attracting traders and buyers from across the Kingdom to purchase the finest dates at producer prices',
   'upcoming'),

  ('معرض التمور العضوية',
   'Organic Dates Exhibition',
   'الرياض',
   'مركز الملك عبدالعزيز الدولي للمؤتمرات',
   '2026-05-10', '2026-05-13',
   '10:00 ص - 8:00 م',
   'أول معرض متخصص في التمور العضوية والزراعة المستدامة، يجمع منتجي التمور العضوية من القصيم ومناطق المملكة',
   'The first exhibition specialized in organic dates and sustainable farming, gathering organic date producers from Qassim and across the Kingdom',
   'upcoming'),

  ('مهرجان حصاد النخيل',
   'Palm Harvest Festival',
   'عنيزة',
   'منتزه العروبة - عنيزة',
   '2026-07-15', '2026-07-25',
   '5:00 م - 12:00 م',
   'احتفالية سنوية تُقام في موسم الحصاد تتضمن جولات في المزارع ومسابقات التمور وفعاليات ترفيهية وثقافية للعائلات',
   'Annual celebration held during harvest season featuring farm tours, date competitions, and entertainment and cultural activities for families',
   'upcoming'),

  ('ملتقى تجار التمور الخليجي',
   'Gulf Date Traders Summit',
   'الرياض',
   'فندق فورسيزونز - الرياض',
   '2026-09-05', '2026-09-07',
   '9:00 ص - 6:00 م',
   'ملتقى سنوي يجمع كبار تجار التمور من دول الخليج العربي لبحث فرص الاستثمار وتطوير صادرات التمور السعودية',
   'Annual summit bringing together major date traders from Gulf Arab countries to explore investment opportunities and develop Saudi date exports',
   'upcoming'),

  ('معرض جدة الدولي للتمور',
   'Jeddah International Dates Fair',
   'جدة',
   'مركز جدة للمؤتمرات والمعارض',
   '2026-11-20', '2026-11-24',
   '11:00 ص - 9:00 م',
   'معرض دولي يستقطب المشترين والمستوردين من 40 دولة لتذوق واستيراد أجود التمور السعودية والخليجية',
   'International fair attracting buyers and importers from 40 countries to taste and import the finest Saudi and Gulf dates',
   'upcoming'),

  ('يوم التمور العالمي - القصيم',
   'World Date Day - Qassim Edition',
   'بريدة',
   'ساحة الأمير فيصل - بريدة',
   '2026-06-28', '2026-06-28',
   '4:00 م - 11:00 م',
   'احتفال يومي بمناسبة يوم التمور العالمي يتضمن عروضاً للمنتجات ومسابقات وأنشطة ترفيهية مجانية للجميع',
   'One-day celebration for World Date Day featuring product showcases, competitions, and free entertainment activities for everyone',
   'active'),

  ('ورشة فن صناعة التمور',
   'Art of Date Making Workshop',
   'عنيزة',
   'دار الثقافة - عنيزة',
   '2026-05-05', '2026-05-06',
   '9:00 ص - 4:00 م',
   'ورشة عملية تعليمية تشمل فنون تصنيع منتجات التمور كالدبس والتمر بالمكسرات والحلويات التقليدية',
   'Practical educational workshop covering the arts of producing date products such as molasses, stuffed dates, and traditional confectionery',
   'upcoming')
ON CONFLICT DO NOTHING;
