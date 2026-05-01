import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/register/user
export async function POST(req: NextRequest) {
  const { email, password, fullName } = await req.json();

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: 'email, password, and fullName are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // sends verification email — never auto-confirm
    user_metadata: { full_name: fullName, role: 'user' },
  });
  if (authError) return NextResponse.json({ error: 'Registration failed' }, { status: 400 });

  const { error: userErr } = await supabaseAdmin.from('users').insert({
    user_id:   authData.user.id,
    full_name: fullName.trim(),
    email:     email.trim().toLowerCase(),
    role:      'user',
  });
  if (userErr) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
