import { createClient } from '@supabase/supabase-js';

// Server-only admin client — uses SERVICE_ROLE_KEY which bypasses RLS.
// Never import this file from client components.
const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey   = process.env.SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
