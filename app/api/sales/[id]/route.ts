import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin, isAuthError } from '@/lib/auth-guard';

type Params = { params: Promise<{ id: string }> };

// DELETE /api/sales/:id — admin only
export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req);
  if (isAuthError(guard)) return guard;

  const { id } = await params;
  const { error } = await supabaseAdmin.from('sales').delete().eq('sale_id', id);
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 400 });
  return NextResponse.json({ success: true });
}
