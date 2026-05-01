import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase-admin';

export interface GuardedUser {
  id: string;
  role: string;
}

/**
 * Verify the Bearer token from the Authorization header.
 * Role is always read from public.users (server-controlled), never from user_metadata.
 * Returns a GuardedUser on success, or a NextResponse (401/403) on failure.
 */
export async function requireAuth(
  req: NextRequest
): Promise<GuardedUser | NextResponse> {
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Always source role from the server-controlled public.users table
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return { id: user.id, role: profile?.role ?? 'user' };
}

/**
 * Require a verified admin user.
 * Returns GuardedUser on success, NextResponse (401/403) on failure.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<GuardedUser | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (result.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return result;
}

/** Type guard — true when requireAuth/requireAdmin returned an error response */
export function isAuthError(
  result: GuardedUser | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
