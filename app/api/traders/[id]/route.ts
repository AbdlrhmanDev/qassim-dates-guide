import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

type Params = { params: Promise<{ id: string }> };

// GET /api/traders/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('traders')
    .select('*')
    .eq('trader_id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Trader not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

// PATCH /api/traders/:id  (admin — service role bypasses RLS)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from('traders')
    .update(body)
    .eq('trader_id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE /api/traders/:id  (admin — service role bypasses RLS)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await supabaseAdmin
    .from('traders')
    .delete()
    .eq('trader_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
