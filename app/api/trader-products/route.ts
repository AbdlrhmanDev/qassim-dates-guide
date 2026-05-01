import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isAuthError } from '@/lib/auth-guard';

// GET /api/trader-products?trader_id=xxx — public
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const traderId = searchParams.get('trader_id');

  if (!traderId) {
    return NextResponse.json({ error: 'trader_id required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('trader_products')
    .select(`*, date_types ( date_type_id, name_ar, name_en, category )`)
    .eq('trader_id', traderId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/trader-products — authenticated traders or admin
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const body = await req.json();

  // Verify that the trader_id in the body belongs to this user (unless admin)
  if (guard.role !== 'admin' && body.trader_id) {
    const { data: traderRow } = await supabaseAdmin
      .from('traders').select('user_id').eq('trader_id', body.trader_id).single();
    if (!traderRow || traderRow.user_id !== guard.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from('trader_products')
    .insert(body)
    .select(`*, date_types ( date_type_id, name_ar, name_en, category )`)
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create product' }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
