import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

// GET /api/trader-products?trader_id=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const traderId = searchParams.get('trader_id');

  if (!traderId) {
    return NextResponse.json({ error: 'trader_id required' }, { status: 400 });
  }

  const { data, error } = await adminSupabase
    .from('trader_products')
    .select(`*, date_types ( date_type_id, name_ar, name_en, category )`)
    .eq('trader_id', traderId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/trader-products
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await adminSupabase
    .from('trader_products')
    .insert(body)
    .select(`*, date_types ( date_type_id, name_ar, name_en, category )`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
