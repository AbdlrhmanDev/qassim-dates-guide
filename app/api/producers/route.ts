import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin, isAuthError } from '@/lib/auth-guard';

// GET /api/producers — public
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const page   = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit  = Math.min(100, Number(searchParams.get('limit') ?? 20));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('producers')
    .select('*', { count: 'exact' })
    .order('company_name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(
      `company_name.ilike.%${search}%,manager_name.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch producers' }, { status: 500 });
  return NextResponse.json({ data, total: count ?? 0, page, limit });
}

// POST /api/producers — admin only
export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (isAuthError(guard)) return guard;

  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('producers')
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: 'Failed to create producer' }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
