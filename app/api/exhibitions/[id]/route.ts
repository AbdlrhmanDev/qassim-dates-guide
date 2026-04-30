import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

type Params = { params: Promise<{ id: string }> };

// PUT /api/exhibitions/:id  (admin write — service role bypasses RLS)
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from('exhibitions')
    .update(body)
    .eq('exhibition_id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE /api/exhibitions/:id  (admin write — service role bypasses RLS)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('exhibitions')
    .delete()
    .eq('exhibition_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
