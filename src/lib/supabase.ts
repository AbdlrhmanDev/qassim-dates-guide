import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// Intercept network-level fetch failures before supabase-js logs them.
// When the Supabase server is unreachable, supabase-js calls console.error()
// on the raw TypeError inside its _handleRequest catch block.
// Returning a 400 instead of throwing causes supabase to:
//   1. Skip that console.error call
//   2. Treat it as a non-retryable auth error
//   3. Clear any stored expired session, stopping the retry loop on future loads
const safeFetch: typeof fetch = (url, init) =>
  fetch(url, init).catch(() =>
    new Response('{"error":"network_error"}', {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  );

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { fetch: safeFetch },
  auth: {
    autoRefreshToken: false,
  },
});
