import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// POST /api/register/trader
export async function POST(req: NextRequest) {
  const { email, password, fullName, shopName, phone, whatsapp, city } = await req.json();

  // 1. Create auth user
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // skip email verification for now
    user_metadata: { full_name: fullName, role: 'trader' },
  });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const authUserId = authData.user.id;

  // 2. Insert into public.users (user_id = auth user id so RLS policies match)
  const { error: userErr } = await adminSupabase.from('users').insert({
    user_id:   authUserId,
    full_name: fullName,
    email,
    role:      'trader',
  });
  if (userErr) {
    // Rollback: delete auth user
    await adminSupabase.auth.admin.deleteUser(authUserId);
    return NextResponse.json({ error: userErr.message }, { status: 400 });
  }

  // 3. Insert trader profile
  const { error: traderErr } = await adminSupabase.from('traders').insert({
    user_id:          authUserId,
    shop_name:        shopName,
    contact_phone:    phone,
    contact_whatsapp: whatsapp,
    city,
    status:           'pending',
  });
  if (traderErr) {
    await adminSupabase.auth.admin.deleteUser(authUserId);
    return NextResponse.json({ error: traderErr.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
