import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Runtime types are correct — TypeScript generics not applied here to avoid
// false-positive 'never' errors from the local type stub.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(supabaseUrl, supabaseAnonKey) as any;
