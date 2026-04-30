import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const SELECT = `
  order_id, quantity_kg, price_per_kg, notes, status, created_at,
  users ( user_id, full_name, email ),
  traders ( trader_id, shop_name, city, contact_phone, contact_whatsapp ),
  date_types ( date_type_id, name_ar, name_en, category )
`;

// GET /api/orders?user_id=xxx   → user's own orders
// GET /api/orders?trader_id=xxx → trader's incoming orders
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId   = searchParams.get('user_id');
  const traderId = searchParams.get('trader_id');

  if (!userId && !traderId) {
    return NextResponse.json({ error: 'user_id or trader_id required' }, { status: 400 });
  }

  const query = supabaseAdmin
    .from('orders')
    .select(SELECT)
    .order('created_at', { ascending: false });

  const { data, error } = await (userId
    ? query.eq('user_id', userId)
    : query.eq('trader_id', traderId!));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/orders
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, trader_id, date_type_id, quantity_kg, price_per_kg, notes } = body;

  if (!user_id || !trader_id || !date_type_id || !quantity_kg) {
    return NextResponse.json(
      { error: 'user_id, trader_id, date_type_id, quantity_kg are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({ user_id, trader_id, date_type_id, quantity_kg, price_per_kg: price_per_kg ?? null, notes: notes ?? null })
    .select(SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
