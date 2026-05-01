import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin, isAuthError } from '@/lib/auth-guard';

// GET /api/users — admin only
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (isAuthError(guard)) return guard;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('user_id, full_name, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  return NextResponse.json(data);
}
