import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isAuthError } from '@/lib/auth-guard';

const SELECT = `
  order_id, quantity_kg, price_per_kg, notes, status, created_at,
  users ( user_id, full_name, email ),
  traders ( trader_id, shop_name, city, contact_phone, contact_whatsapp ),
  date_types ( date_type_id, name_ar, name_en, category )
`;

// GET /api/orders?user_id=xxx  OR  ?trader_id=xxx
// Callers may only see their own orders; admins see any
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const { searchParams } = new URL(req.url);
  const userId   = searchParams.get('user_id');
  const traderId = searchParams.get('trader_id');

  if (!userId && !traderId) {
    return NextResponse.json({ error: 'user_id or trader_id required' }, { status: 400 });
  }

  // Non-admins may only see their own orders
  if (guard.role !== 'admin') {
    if (userId && userId !== guard.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (traderId) {
      const { data: traderRow } = await supabaseAdmin
        .from('traders').select('user_id').eq('trader_id', traderId).single();
      if (!traderRow || traderRow.user_id !== guard.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  const query = supabaseAdmin
    .from('orders')
    .select(SELECT)
    .order('created_at', { ascending: false });

  const { data, error } = await (userId
    ? query.eq('user_id', userId)
    : query.eq('trader_id', traderId!));

  if (error) return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/orders — authenticated users only; user_id always from JWT
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const body = await req.json();
  const { trader_id, date_type_id, quantity_kg, price_per_kg, notes } = body;

  if (!trader_id || !date_type_id || !quantity_kg) {
    return NextResponse.json(
      { error: 'trader_id, date_type_id, quantity_kg are required' },
      { status: 400 }
    );
  }

  const qty = Number(quantity_kg);
  if (isNaN(qty) || qty <= 0) {
    return NextResponse.json({ error: 'quantity_kg must be a positive number' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id:      guard.id,   // always from the verified JWT
      trader_id,
      date_type_id,
      quantity_kg:  qty,
      price_per_kg: price_per_kg ?? null,
      notes:        notes        ?? null,
    })
    .select(SELECT)
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create order' }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
