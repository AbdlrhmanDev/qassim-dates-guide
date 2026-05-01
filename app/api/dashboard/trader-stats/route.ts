import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isAuthError } from '@/lib/auth-guard';

// GET /api/dashboard/trader-stats — trader sees own stats; admin sees any
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const requestedUserId = new URL(req.url).searchParams.get('user_id');
  if (!requestedUserId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  // Non-admins may only access their own stats
  if (guard.role !== 'admin' && requestedUserId !== guard.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: trader, error: traderErr } = await supabaseAdmin
    .from('traders')
    .select('trader_id, shop_name, city, rating, rating_count, verified, status')
    .eq('user_id', requestedUserId)
    .single();

  if (traderErr || !trader) {
    return NextResponse.json({ error: 'Trader not found' }, { status: 404 });
  }

  const traderId = trader.trader_id;

  const [productsRes, salesRes, topProductsRes, recentSalesRes] = await Promise.all([
    supabaseAdmin
      .from('trader_products')
      .select('*', { count: 'exact', head: true })
      .eq('trader_id', traderId),
    supabaseAdmin
      .from('sales')
      .select('total_price, quantity_kg')
      .eq('trader_id', traderId),
    supabaseAdmin
      .from('trader_products')
      .select('price_per_kg, rating, rating_count, date_types(name_ar, name_en, category)')
      .eq('trader_id', traderId)
      .order('rating', { ascending: false })
      .limit(4),
    supabaseAdmin
      .from('sales')
      .select('sale_date, quantity_kg, total_price, date_types(name_ar, name_en), market_name')
      .eq('trader_id', traderId)
      .order('sale_date', { ascending: false })
      .limit(5),
  ]);

  const revenue = (salesRes.data ?? []).reduce(
    (sum: number, s: { total_price: string | number }) => sum + (Number(s.total_price) || 0),
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
