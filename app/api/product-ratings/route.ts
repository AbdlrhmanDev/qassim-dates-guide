import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isAuthError } from '@/lib/auth-guard';

// POST /api/product-ratings — authenticated users only; voter identity always from JWT
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const { product_id, stars } = await req.json();

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
  }
  const starsNum = Number(stars);
  if (!starsNum || starsNum < 1 || starsNum > 5) {
    return NextResponse.json({ error: 'stars must be between 1 and 5' }, { status: 400 });
  }

  // anon_key is always the verified JWT identity — never from request body
  const anon_key = guard.id;

  const { error: upsertError } = await supabaseAdmin
    .from('product_ratings')
    .upsert({ product_id, anon_key, stars: starsNum }, { onConflict: 'product_id,anon_key' });

  if (upsertError) {
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
  }

  const { data: rows, error: aggError } = await supabaseAdmin
    .from('product_ratings')
    .select('stars')
    .eq('product_id', product_id);

  if (aggError) return NextResponse.json({ error: 'Failed to compute rating' }, { status: 500 });

  const rating_count = rows.length;
  const rating = rating_count > 0
    ? Math.round((rows.reduce((s, r) => s + r.stars, 0) / rating_count) * 100) / 100
    : 0;

  const { error: updateError } = await supabaseAdmin
    .from('trader_products')
    .update({ rating, rating_count })
    .eq('id', product_id);

  if (updateError) return NextResponse.json({ error: 'Failed to update product rating' }, { status: 500 });

  return NextResponse.json({ rating, rating_count });
}
