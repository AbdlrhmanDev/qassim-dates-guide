import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

type Params = { params: Promise<{ id: string }> };

// PATCH /api/users/:id — update role or name
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await adminClient
    .from('users')
    .update(body)
    .eq('user_id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE /api/users/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  // Delete from auth too
  await adminClient.auth.admin.deleteUser(id);

  const { error } = await adminClient.from('users').delete().eq('user_id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
