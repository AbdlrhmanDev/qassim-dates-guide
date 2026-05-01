import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin, isAuthError } from '@/lib/auth-guard';

// GET /api/exhibitions  (public — anon key is fine)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status     = searchParams.get('status');
  const pageParam  = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  const isPaginated = pageParam !== null;
  const page  = Math.max(1, parseInt(pageParam  ?? '1', 10));
  const limit = Math.max(1, parseInt(limitParam ?? '4', 10));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  let query = supabase
    .from('exhibitions')
    .select('*', isPaginated ? { count: 'exact' } : undefined)
    .order('start_date', { ascending: true });

  if (status)     query = query.eq('status', status);
  if (isPaginated) query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: 'Failed to fetch exhibitions' }, { status: 500 });
  if (isPaginated) return NextResponse.json({ data, total: count ?? 0 });
  return NextResponse.json(data);
}

// POST /api/exhibitions  (admin only)
export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (isAuthError(guard)) return guard;

  const body = await req.json();

  // Basic field validation
  if (!body.name_ar?.trim() || !body.name_en?.trim() || !body.city?.trim()) {
    return NextResponse.json({ error: 'name_ar, name_en, and city are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('exhibitions')
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create exhibition' }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
