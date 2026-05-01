import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isAuthError } from '@/lib/auth-guard';

// PATCH /api/orders/:id — buyer, trader, or admin; with status allowlist
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const { id } = await context.params;

  const { data: order, error: fetchErr } = await supabaseAdmin
    .from('orders')
    .select('user_id, trader_id, status')
    .eq('order_id', id)
    .single();

  if (fetchErr || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const isAdmin = guard.role === 'admin';
  const isBuyer = order.user_id === guard.id;

  let isTrader = false;
  if (!isAdmin && !isBuyer && order.trader_id) {
    const { data: traderRow } = await supabaseAdmin
      .from('traders').select('user_id').eq('trader_id', order.trader_id).single();
    isTrader = traderRow?.user_id === guard.id;
  }

  if (!isAdmin && !isBuyer && !isTrader) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const ALLOWED_STATUSES = ['cancelled', 'confirmed', 'delivered', 'pending'];
  if (!body.status || !ALLOWED_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
  }

  // Buyers may only cancel their own orders
  if (isBuyer && !isAdmin && body.status !== 'cancelled') {
    return NextResponse.json({ error: 'Users may only cancel their orders' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status: body.status })
    .eq('order_id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE /api/orders/:id — buyer or admin
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const { id } = await context.params;

  const { data: order, error: fetchErr } = await supabaseAdmin
    .from('orders')
    .select('user_id')
    .eq('order_id', id)
    .single();

  if (fetchErr || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (guard.role !== 'admin' && order.user_id !== guard.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from('orders').delete().eq('order_id', id);
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 400 });
  return NextResponse.json({ success: true });
}
