import { createBrowserClient } from '@supabase/ssr';

// Note: Generic Database type omitted — Supabase JS v2.103 PostgREST v12
// requires auto-generated types from `supabase gen types`. Hand-written types
// are imported directly in each file that needs them.
export function createClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
