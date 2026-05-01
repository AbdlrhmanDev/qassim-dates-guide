import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin, isAuthError } from '@/lib/auth-guard';

type Params = { params: Promise<{ id: string }> };

// PUT /api/producers/:id — admin only
export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req);
  if (isAuthError(guard)) return guard;

  const { id } = await params;
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('producers')
    .update(body)
    .eq('producer_id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE /api/producers/:id — admin only
export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req);
  if (isAuthError(guard)) return guard;

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from('producers')
    .delete()
    .eq('producer_id', id);
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 400 });
  return NextResponse.json({ success: true });
}
