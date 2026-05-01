import { supabase } from './supabase';

/**
 * Drop-in replacement for fetch() that automatically injects the current
 * Supabase access token as Authorization: Bearer <token>.
 *
 * Use this in all client components that call protected API routes.
 */
export async function authFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> ?? {}),
  };

  // Only set Content-Type for JSON — omit it for FormData so the browser
  // can set the correct multipart boundary automatically
  if (!(init.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return fetch(url, { ...init, headers });
}
