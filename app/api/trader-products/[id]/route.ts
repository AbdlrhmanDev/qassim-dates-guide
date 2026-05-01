import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isAuthError } from '@/lib/auth-guard';

type Params = { params: Promise<{ id: string }> };

async function verifyProductOwner(productId: string, userId: string, role: string): Promise<boolean> {
  if (role === 'admin') return true;
  const { data } = await supabaseAdmin
    .from('trader_products')
    .select('traders(user_id)')
    .eq('id', productId)
    .single();
  const ownerUserId = (data?.traders as { user_id?: string } | null)?.user_id;
  return ownerUserId === userId;
}

// PATCH /api/trader-products/:id — own trader or admin
export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const { id } = await params;
  const isOwner = await verifyProductOwner(id, guard.id, guard.role);
  if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from('trader_products')
    .update(body)
    .eq('id', id)
    .select(`*, date_types ( date_type_id, name_ar, name_en, category )`)
    .single();

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE /api/trader-products/:id — own trader or admin
export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const { id } = await params;
  const isOwner = await verifyProductOwner(id, guard.id, guard.role);
  if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await supabaseAdmin.from('trader_products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 400 });
  return NextResponse.json({ success: true });
}
