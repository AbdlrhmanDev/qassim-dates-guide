import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/sales
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const traderId = searchParams.get('trader_id');

  let query = supabase
    .from('sales')
    .select(`
      *,
      traders ( shop_name, city ),
      date_types ( name_ar, name_en )
    `)
    .order('sale_date', { ascending: false });

  if (traderId) {
    query = query.eq('trader_id', traderId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST /api/sales
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('sales')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
}
