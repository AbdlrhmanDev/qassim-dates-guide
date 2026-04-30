import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/dashboard/stats  — admin overview
export async function GET() {
  const [
    usersRes,
    tradersRes,
    dateTypesRes,
    salesRes,
    recentTradersRes,
    recentSalesRes,
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('traders').select('status', { count: 'exact' }),
    supabaseAdmin.from('date_types').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('sales').select('total_price'),
    supabaseAdmin
      .from('traders')
      .select('shop_name, city, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('sales')
      .select('total_price, sale_date, quantity_kg, date_types(name_ar, name_en), traders(shop_name)')
      .order('sale_date', { ascending: false })
      .limit(5),
  ]);

  const traders = tradersRes.data ?? [];
  const pendingTraders = traders.filter((t: any) => t.status === 'pending').length;
  const activeTraders  = traders.filter((t: any) => t.status === 'active').length;

  const revenue = (salesRes.data ?? []).reduce(
    (sum: number, s: any) => sum + (Number(s.total_price) || 0),
    0
  );

  return NextResponse.json({
    users:          usersRes.count  ?? 0,
    traders:        traders.length,
    activeTraders,
    pendingTraders,
    dateTypes:      dateTypesRes.count ?? 0,
    salesCount:     salesRes.data?.length ?? 0,
    revenue,
    recentTraders:  recentTradersRes.data  ?? [],
    recentSales:    recentSalesRes.data    ?? [],
  });
}
