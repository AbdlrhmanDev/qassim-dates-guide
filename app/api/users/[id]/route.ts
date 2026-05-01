import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin, isAuthError } from '@/lib/auth-guard';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/users/:id — admin only; strict field allowlist prevents privilege escalation
export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req);
  if (isAuthError(guard)) return guard;

  const { id } = await params;
  const body = await req.json();

  // Allowlist — only these fields may be changed
  const allowed: Record<string, unknown> = {};
  if (typeof body.full_name === 'string') allowed.full_name = body.full_name.trim();
  if (typeof body.email     === 'string') allowed.email     = body.email.trim();
  const validRoles = ['user', 'admin', 'trader'];
  if (typeof body.role === 'string' && validRoles.includes(body.role)) {
    allowed.role = body.role;
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(allowed)
    .eq('user_id', id)
    .select('user_id, full_name, email, role, created_at')
    .single();

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE /api/users/:id — admin only
export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req);
  if (isAuthError(guard)) return guard;

  const { id } = await params;

  if (id === guard.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  await supabaseAdmin.auth.admin.deleteUser(id);
  const { error } = await supabaseAdmin.from('users').delete().eq('user_id', id);
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 400 });
  return NextResponse.json({ success: true });
}
