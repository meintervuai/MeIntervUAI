import { supabase } from './klien_supabase';

/** Masuk via Google OAuth; setelah sukses diarahkan ke /home. */
export async function masukDenganGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/home`,
      queryParams: { prompt: 'select_account' },
    },
  });
}

/** Keluar dari sesi. */
export async function keluar() {
  return supabase.auth.signOut();
}

/** Ambil sesi aktif (atau null). */
export async function ambilSesi() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Dengarkan perubahan sesi (masuk/keluar/refresh token). Kembalikan fungsi berhenti. */
export function dengarPerubahanSesi(tanggapan) {
  const { data } = supabase.auth.onAuthStateChange((_acara, sesi) => tanggapan(sesi));
  return () => data.subscription.unsubscribe();
}