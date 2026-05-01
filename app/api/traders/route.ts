import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin, requireAuth, isAuthError } from '@/lib/auth-guard';

// GET /api/traders
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city   = searchParams.get('city');
  const search = searchParams.get('search');
  const userId = searchParams.get('user_id');
  const admin  = searchParams.get('admin') === 'true';

  // Admin: return all traders regardless of status — requires auth
  if (admin) {
    const guard = await requireAdmin(req);
    if (isAuthError(guard)) return guard;

    const { data, error } = await supabaseAdmin
      .from('traders')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Failed to fetch traders' }, { status: 500 });
    return NextResponse.json(data);
  }

  // Trader looking up their own profile — requires auth, must be same user
  if (userId) {
    const guard = await requireAuth(req);
    if (isAuthError(guard)) return guard;
    if (guard.role !== 'admin' && guard.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { data, error } = await supabase
      .from('traders')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return NextResponse.json({ error: 'Trader not found' }, { status: 404 });
    return NextResponse.json(data);
  }

  // Public: active traders only
  let query = supabase
    .from('traders')
    .select('*')
    .eq('status', 'active')
    .order('rating', { ascending: false });

  if (city)   query = query.ilike('city', `%${city}%`);
  if (search) query = query.ilike('shop_name', `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch traders' }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/traders — admin only
export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (isAuthError(guard)) return guard;

  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('traders')
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create trader' }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
