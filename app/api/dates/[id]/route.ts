import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Params = { params: Promise<{ id: string }> };

// GET /api/dates/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('date_types')
    .select('*')
    .eq('date_type_id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Date type not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

// PATCH /api/dates/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = await req.json();

  const { data, error } = await supabase
    .from('date_types')
    .update(body)
    .eq('date_type_id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

// DELETE /api/dates/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await supabase
    .from('date_types')
    .delete()
    .eq('date_type_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
