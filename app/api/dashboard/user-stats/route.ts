import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isAuthError } from '@/lib/auth-guard';

// GET /api/dashboard/user-stats — users see only their own stats; admins may see any
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const requestedId = new URL(req.url).searchParams.get('user_id');
  if (!requestedId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  // Non-admins may only access their own stats
  if (guard.role !== 'admin' && requestedId !== guard.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [
    userRes,
    commentsRes,
    traderRatingsRes,
    recentCommentsRes,
    topTradersRes,
    exhibitionsRes,
    ordersRes,
  ] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('full_name, email, created_at, role')
      .eq('user_id', requestedId)
      .single(),
    supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', requestedId),
    supabaseAdmin
      .from('trader_ratings')
      .select('stars, created_at, traders(shop_name, city, rating)')
      .eq('voter_key', requestedId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('comments')
      .select('comment_id, content, target_type, target_id, created_at')
      .eq('user_id', requestedId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('traders')
      .select('trader_id, shop_name, city, rating, rating_count, verified')
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .limit(4),
    supabaseAdmin
      .from('exhibitions')
      .select('exhibition_id, name_ar, name_en, city, start_date, end_date, status')
      .in('status', ['upcoming', 'active'])
      .order('start_date', { ascending: true })
      .limit(3),
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', requestedId),
  ]);

  return NextResponse.json({
    user:           userRes.data ?? null,
    commentsCount:  commentsRes.count ?? 0,
    traderRatings:  traderRatingsRes.data ?? [],
    recentComments: recentCommentsRes.data ?? [],
    topTraders:     topTradersRes.data ?? [],
    exhibitions:    exhibitionsRes.data ?? [],
    ordersCount:    ordersRes.count ?? 0,
  });
}
