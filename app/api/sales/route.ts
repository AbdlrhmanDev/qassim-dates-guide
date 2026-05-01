import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isAuthError } from '@/lib/auth-guard';

// GET /api/sales — traders see own; admin sees all
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const { searchParams } = new URL(req.url);
  const traderId = searchParams.get('trader_id');

  // Non-admins may only see their own trader's sales
  if (guard.role !== 'admin' && traderId) {
    const { data: traderRow } = await supabaseAdmin
      .from('traders').select('user_id').eq('trader_id', traderId).single();
    if (!traderRow || traderRow.user_id !== guard.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  let query = supabaseAdmin
    .from('sales')
    .select(`*, traders ( shop_name, city ), date_types ( name_ar, name_en )`)
    .order('sale_date', { ascending: false });

  if (traderId) query = query.eq('trader_id', traderId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/sales — authenticated traders only
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const body = await req.json();

  // Verify the trader_id in the body belongs to this user (unless admin)
  if (guard.role !== 'admin' && body.trader_id) {
    const { data: traderRow } = await supabaseAdmin
      .from('traders').select('user_id').eq('trader_id', body.trader_id).single();
    if (!traderRow || traderRow.user_id !== guard.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { data, error } = await supabaseAdmin.from('sales').insert(body).select().single();
  if (error) return NextResponse.json({ error: 'Failed to create sale' }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
