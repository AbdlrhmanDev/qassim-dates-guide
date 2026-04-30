import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/top-products?limit=50
// Returns available products with rating > 0, sorted by rating DESC then rating_count DESC
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10));

  const { data, error } = await supabase
    .from('trader_products')
    .select(`
      id,
      price_per_kg,
      stock_kg,
      rating,
      rating_count,
      image_url,
      traders ( trader_id, shop_name, city, verified ),
      date_types ( date_type_id, name_ar, name_en, category )
    `)
    .eq('available', true)
    .gt('rating', 0)
    .order('rating', { ascending: false })
    .order('rating_count', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
