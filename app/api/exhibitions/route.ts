import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/exhibitions  (public — anon key is fine)
// Supports optional ?page=&limit= for pagination; returns { data, total } when page is provided.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const pageParam = searchParams.get('page');
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

  if (status) query = query.eq('status', status);
  if (isPaginated) query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (isPaginated) return NextResponse.json({ data, total: count ?? 0 });
  return NextResponse.json(data);
}

// POST /api/exhibitions  (admin write — service role bypasses RLS)
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from('exhibitions')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
}
