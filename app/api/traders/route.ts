import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/traders
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city   = searchParams.get('city');
  const search = searchParams.get('search');
  const userId = searchParams.get('user_id');
  const admin  = searchParams.get('admin') === 'true'; // admin=true → return all statuses

  // Admin: return all traders regardless of status (uses service role key)
  if (admin) {
    const { data, error } = await supabaseAdmin
      .from('traders')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Trader looking up their own profile
  if (userId) {
    const { data, error } = await supabase
      .from('traders')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  // Public: active traders only
  let query = supabase
    .from('traders')
    .select('*')
    .eq('status', 'active')
    .order('rating', { ascending: false });

  if (city)   query = query.ilike('city', `%${city}%`);
  if (search) query = query.ilike('shop_name', `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/traders
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('traders')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
}
