import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/register/trader
export async function POST(req: NextRequest) {
  const { email, password, fullName, shopName, phone, whatsapp, city } = await req.json();

  if (!email || !password || !fullName || !shopName || !city) {
    return NextResponse.json(
      { error: 'email, password, fullName, shopName, and city are required' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  // 1. Create auth user — send verification email, never auto-confirm
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name: fullName, role: 'trader' },
  });
  if (authError) return NextResponse.json({ error: 'Registration failed' }, { status: 400 });

  const authUserId = authData.user.id;

  // 2. Insert into public.users
  const { error: userErr } = await supabaseAdmin.from('users').insert({
    user_id:   authUserId,
    full_name: fullName.trim(),
    email:     email.trim().toLowerCase(),
    role:      'trader',
  });
  if (userErr) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId);
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
  }

  // 3. Insert trader profile (status pending — awaits admin approval)
  const { error: traderErr } = await supabaseAdmin.from('traders').insert({
    user_id:          authUserId,
    shop_name:        shopName.trim(),
    contact_phone:    phone    ?? null,
    contact_whatsapp: whatsapp ?? null,
    city:             city.trim(),
    status:           'pending',
  });
  if (traderErr) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId);
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
