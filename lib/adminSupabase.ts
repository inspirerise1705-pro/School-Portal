import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL as string;
const serviceRoleKey  = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined;

// Privileged client — used ONLY for admin operations (create/invite teachers).
// Requires VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file.
// Falls back to null if not configured; UI shows manual-SQL fallback in that case.
export const adminSupabase = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
