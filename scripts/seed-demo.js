/**
 * Demo Data Seed Script
 * ---------------------
 * Reads credentials from .env.local and creates 3 demo accounts.
 *
 * Before running:
 *   1. Go to Supabase Dashboard → Authentication → Settings
 *      → Disable "Enable email confirmations"
 *   2. Run:  node scripts/seed-demo.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY          = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const SERVICE_ROLE_KEY  = process.env.SERVICE_ROLE_KEY;

// Validate env vars
if (!SUPABASE_URL || !ANON_KEY) {
  console.error('\n❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in .env\n');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing SERVICE_ROLE_KEY in .env.local\n');
  console.error('   Add:  SERVICE_ROLE_KEY=your_service_role_key\n');
  process.exit(1);
}

// Admin client — bypasses RLS and email confirmation
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Regular client (kept for reference)
const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Use adminClient for all table inserts — bypasses RLS
const db = adminClient;

// ─── Demo accounts ────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { email: 'user@demo.com',   password: 'demo123456', meta: { full_name: 'Ahmed Al-Qahtani',    role: 'user'   } },
  { email: 'trader@demo.com', password: 'demo123456', meta: { full_name: 'Mohammed Al-Abdullah', role: 'trader' } },
  { email: 'admin@demo.com',  password: 'demo123456', meta: { full_name: 'System Admin',         role: 'admin'  } },
];

const DEMO_TRADER = {
  shop_name:        'Al-Abdullah Farms',
  description:      'Family farms specializing in Sukkary and Khalas dates for over 50 years',
  contact_phone:    '+966501234567',
  contact_whatsapp: '+966501234567',
  city:             'بريدة',
  rating:           4.9,
  verified:         true,
  status:           'active',
};

const DEMO_DATE_TYPES = [
  { name_ar: 'السكري',  name_en: 'Sukkary', description_ar: 'ملك التمور السعودية، طعم حلو مميز',   description_en: 'King of Saudi dates, distinctively sweet',   season: 'الصيف',  category: 'premium', calories: 130 },
  { name_ar: 'الخلاص', name_en: 'Khalas',  description_ar: 'تمر ذهبي بطعم كراميل رائع',          description_en: 'Golden date with amazing caramel taste',     season: 'الصيف',  category: 'premium', calories: 125 },
  { name_ar: 'الصقعي', name_en: 'Segae',   description_ar: 'تمر بني فاتح بنكهة خفيفة مميزة',     description_en: 'Light brown date with mild distinctive flavor', season: 'الخريف', category: 'fresh',   calories: 115 },
  { name_ar: 'العجوة', name_en: 'Ajwa',    description_ar: 'تمر المدينة المشهور بفوائده الصحية',  description_en: 'Famous Madinah date known for health benefits', season: 'الصيف',  category: 'premium', calories: 120 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const log  = (msg) => console.log(`  ✓ ${msg}`);
const warn = (msg) => console.warn(`  ✗ ${msg}`);

async function createOrGetUser(demo) {
  // Try to create
  const { data, error } = await adminClient.auth.admin.createUser({
    email:         demo.email,
    password:      demo.password,
    user_metadata: demo.meta,
    email_confirm: true,
  });

  if (!error) {
    log(`Created: ${demo.email}  (${demo.meta.role})`);
    return data.user;
  }

  if (error.message.includes('already registered') || error.message.includes('already been registered')) {
    warn(`${demo.email} already exists — fetching existing`);
    const { data: list } = await adminClient.auth.admin.listUsers();
    return list?.users?.find(u => u.email === demo.email) ?? null;
  }

  warn(`Failed to create ${demo.email}: ${error.message}`);
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌴  Seeding Qassim Dates demo data...`);
  console.log(`    URL: ${SUPABASE_URL}\n`);

  // 1. Auth users
  console.log('── Auth Users ──────────────────────────────');
  const createdUsers = {};
  for (const demo of DEMO_USERS) {
    const user = await createOrGetUser(demo);
    if (user) createdUsers[demo.meta.role] = user;
  }

  // 2. Sync public.users (our custom users table, separate from auth.users)
  //    FK constraints on traders/comments reference public.users.user_id
  console.log('\n── Public Users Table ──────────────────────');
  for (const [role, authUser] of Object.entries(createdUsers)) {
    const demo = DEMO_USERS.find(d => d.meta.role === role);
    const { error } = await db.from('users').upsert({
      user_id:   authUser.id,
      full_name: demo.meta.full_name,
      email:     demo.email,
      role:      role,
    }, { onConflict: 'user_id' });
    if (error) warn(`public.users (${role}): ${error.message}`);
    else log(`Synced public.users: ${demo.email}`);
  }

  // 3. Date types
  console.log('\n── Date Types ──────────────────────────────');
  const { data: existing } = await db.from('date_types').select('date_type_id').limit(1);
  let firstDateTypeId = null;

  if (!existing?.length) {
    const { data: rows, error } = await db.from('date_types').insert(DEMO_DATE_TYPES).select('date_type_id');
    if (error) warn(`Date types: ${error.message}`);
    else {
      firstDateTypeId = rows[0].date_type_id;
      log(`Inserted ${rows.length} date types`);
    }
  } else {
    firstDateTypeId = existing[0].date_type_id;
    log('Date types already exist — skipping');
  }

  // 4. Trader profile
  console.log('\n── Trader Profile ──────────────────────────');
  let traderId = null;
  if (createdUsers['trader']) {
    const { data: row, error } = await db
      .from('traders')
      .insert({ ...DEMO_TRADER, user_id: createdUsers['trader'].id })
      .select('trader_id')
      .single();

    if (error) warn(`Trader: ${error.message}`);
    else {
      traderId = row.trader_id;
      log(`Trader profile: ${DEMO_TRADER.shop_name}`);
    }
  }

  // 5. Sales
  console.log('\n── Sales ───────────────────────────────────');
  if (traderId && firstDateTypeId) {
    const sales = [
      { quantity: 100, price_per_unit: 45.00, market_name: 'سوق بريدة المركزي', status: 'confirmed', days_ago: 0  },
      { quantity: 50,  price_per_unit: 60.00, market_name: 'سوق عنيزة',         status: 'confirmed', days_ago: 7  },
      { quantity: 200, price_per_unit: 35.00, market_name: 'سوق بريدة المركزي', status: 'pending',   days_ago: 14 },
    ].map(({ days_ago, ...s }) => ({
      ...s,
      trader_id:    traderId,
      date_type_id: firstDateTypeId,
      sale_date:    new Date(Date.now() - days_ago * 86400000).toISOString().split('T')[0],
    }));

    const { error } = await db.from('sales').insert(sales);
    if (error) warn(`Sales: ${error.message}`);
    else log(`Inserted ${sales.length} demo sales`);
  } else {
    warn('Skipping sales — missing trader or date type');
  }

  // 6. Comments
  console.log('\n── Comments ────────────────────────────────');
  if (createdUsers['user'] && firstDateTypeId) {
    const { error } = await db.from('comments').insert([
      { user_id: createdUsers['user'].id, target_type: 'date_type', target_id: firstDateTypeId, content: 'تمر السكري لا يُضاهى في طعمه وجودته!' },
      { user_id: createdUsers['user'].id, target_type: 'date_type', target_id: firstDateTypeId, content: 'Excellent quality, highly recommend the Sukkary dates!' },
    ]);
    if (error) warn(`Comments: ${error.message}`);
    else log('Inserted 2 demo comments');
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log('✅  Done! Login with these credentials at /login:\n');
  console.log('  Role    Email              Password');
  console.log('  ------  -----------------  -----------');
  console.log('  user    user@demo.com      demo123456');
  console.log('  trader  trader@demo.com    demo123456');
  console.log('  admin   admin@demo.com     demo123456');
  console.log('');
}

main().catch(console.error);
