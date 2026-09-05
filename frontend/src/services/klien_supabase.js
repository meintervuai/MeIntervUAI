import { createClient } from '@supabase/supabase-js';

// Klien Supabase (frontend) — memakai anon key + RLS, bukan service key.
const url = import.meta.env.VITE_SUPABASE_URL;
const kunciAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !kunciAnon) {
  throw new Error(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi di frontend/.env (salin dari .env root).',
  );
}

export const supabase = createClient(url, kunciAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});