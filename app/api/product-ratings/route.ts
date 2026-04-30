import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/product-ratings
// Body: { product_id, stars, user_id }
// Only authenticated users may rate products
export async function POST(req: NextRequest) {
  const { product_id, stars, user_id } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: 'Login required to rate' }, { status: 401 });
  }
  if (!product_id || !stars) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const anon_key = user_id;
  if (stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'Stars must be 1–5' }, { status: 400 });
  }

  // Upsert rating (insert or update if same device rated before)
  const { error: upsertError } = await supabaseAdmin
    .from('product_ratings')
    .upsert({ product_id, anon_key, stars }, { onConflict: 'product_id,anon_key' });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // Recompute average and count
  const { data: rows, error: aggError } = await supabaseAdmin
    .from('product_ratings')
    .select('stars')
    .eq('product_id', product_id);

  if (aggError) {
    return NextResponse.json({ error: aggError.message }, { status: 500 });
  }

  const rating_count = rows.length;
  const rating = rating_count > 0
    ? Math.round((rows.reduce((s, r) => s + r.stars, 0) / rating_count) * 100) / 100
    : 0;

  // Update trader_products
  const { error: updateError } = await supabaseAdmin
    .from('trader_products')
    .update({ rating, rating_count })
    .eq('id', product_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ rating, rating_count });
}
