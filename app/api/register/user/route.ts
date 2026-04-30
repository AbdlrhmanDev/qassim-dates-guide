import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// POST /api/register/user
export async function POST(req: NextRequest) {
  const { email, password, fullName } = await req.json();

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'user' },
  });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const { error: userErr } = await adminSupabase.from('users').insert({
    user_id:   authData.user.id,
    full_name: fullName,
    email,
    role:      'user',
  });
  if (userErr) {
    await adminSupabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: userErr.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
