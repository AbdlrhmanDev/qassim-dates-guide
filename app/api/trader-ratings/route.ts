import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/trader-ratings
// Body: { trader_id, stars, user_id }
// Only authenticated users may rate traders
export async function POST(req: NextRequest) {
  const { trader_id, stars, user_id } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: 'Login required to rate' }, { status: 401 });
  }
  if (!trader_id || !stars) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const voter_key = user_id;
  if (stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'Stars must be 1–5' }, { status: 400 });
  }

  // Upsert: insert new or update existing rating for this voter on this trader
  const { error: upsertError } = await supabaseAdmin
    .from('trader_ratings')
    .upsert({ trader_id, voter_key, stars }, { onConflict: 'trader_id,voter_key' });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // Recompute average and count
  const { data: rows, error: aggError } = await supabaseAdmin
    .from('trader_ratings')
    .select('stars')
    .eq('trader_id', trader_id);

  if (aggError) {
    return NextResponse.json({ error: aggError.message }, { status: 500 });
  }

  const rating_count = rows.length;
  const rating = rating_count > 0
    ? Math.round((rows.reduce((s, r) => s + r.stars, 0) / rating_count) * 100) / 100
    : 0;

  // Update traders table
  const { error: updateError } = await supabaseAdmin
    .from('traders')
    .update({ rating, rating_count })
    .eq('trader_id', trader_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ rating, rating_count });
}
