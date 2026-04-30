import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/dashboard/trader-stats?user_id=xxx
export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get('user_id');
  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  // Find this trader's record
  const { data: trader, error: traderErr } = await supabase
    .from('traders')
    .select('trader_id, shop_name, city, rating, rating_count, verified, status')
    .eq('user_id', userId)
    .single();

  if (traderErr || !trader) {
    return NextResponse.json({ error: 'Trader not found' }, { status: 404 });
  }

  const traderId = trader.trader_id;

  const [productsRes, salesRes, topProductsRes, recentSalesRes] = await Promise.all([
    supabase
      .from('trader_products')
      .select('*', { count: 'exact', head: true })
      .eq('trader_id', traderId),
    supabase
      .from('sales')
      .select('total_price, quantity_kg')
      .eq('trader_id', traderId),
    supabase
      .from('trader_products')
      .select('price_per_kg, rating, rating_count, date_types(name_ar, name_en, category)')
      .eq('trader_id', traderId)
      .order('rating', { ascending: false })
      .limit(4),
    supabase
      .from('sales')
      .select('sale_date, quantity_kg, total_price, date_types(name_ar, name_en), market_name')
      .eq('trader_id', traderId)
      .order('sale_date', { ascending: false })
      .limit(5),
  ]);

  const revenue = (salesRes.data ?? []).reduce(
    (sum, s: any) => sum + (Number(s.total_price) || 0),
    0
  );

  return NextResponse.json({
    trader,
    productsCount: productsRes.count ?? 0,
    salesCount:    salesRes.data?.length ?? 0,
    revenue,
    topProducts:   topProductsRes.data ?? [],
    recentSales:   recentSalesRes.data ?? [],
  });
}
