import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/dashboard/user-stats?user_id=xxx
export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get('user_id');
  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const [
    userRes,
    commentsRes,
    traderRatingsRes,
    recentCommentsRes,
    topTradersRes,
    exhibitionsRes,
    ordersRes,
  ] = await Promise.all([
    // User profile
    supabaseAdmin
      .from('users')
      .select('full_name, email, created_at, role')
      .eq('user_id', userId)
      .single(),

    // Total comments this user posted
    supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),

    // Trader ratings this user submitted (voter_key = user_id for logged-in)
    supabaseAdmin
      .from('trader_ratings')
      .select('stars, created_at, traders(shop_name, city, rating)')
      .eq('voter_key', userId)
      .order('created_at', { ascending: false }),

    // Recent comments with target labels
    supabaseAdmin
      .from('comments')
      .select('comment_id, content, target_type, target_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Top active traders for discovery
    supabaseAdmin
      .from('traders')
      .select('trader_id, shop_name, city, rating, rating_count, verified')
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .limit(4),

    // Upcoming / active exhibitions
    supabaseAdmin
      .from('exhibitions')
      .select('exhibition_id, name_ar, name_en, city, start_date, end_date, status')
      .in('status', ['upcoming', 'active'])
      .order('start_date', { ascending: true })
      .limit(3),

    // User's orders count
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  return NextResponse.json({
    user:               userRes.data ?? null,
    commentsCount:      commentsRes.count ?? 0,
    traderRatings:      traderRatingsRes.data ?? [],
    recentComments:     recentCommentsRes.data ?? [],
    topTraders:         topTradersRes.data ?? [],
    exhibitions:        exhibitionsRes.data ?? [],
    ordersCount:        ordersRes.count ?? 0,
  });
}
