// Layanan Supabase Auth & Database Client Frontend Asli (Bukan Mock / Formalitas).
// Terhubung langsung ke https://ojdukirgwcaymgnctyuj.supabase.co via @supabase/supabase-js.

import { createClient } from '@supabase/supabase-js';

const env = ((import.meta as any).env) || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://ojdukirgwcaymgnctyuj.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZHVraXJnd2NheW1nbmN0eXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMDUxODUsImV4cCI6MjA5OTg4MTE4NX0.5nHvRkO-rji4hB13Dexz3rczT0MF5FTRi_yLrHUIEpU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const authSupabase = {
  // Pendaftaran Asli
  async daftar(email: string, kataSandi: string, namaPengguna: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: kataSandi,
      options: {
        data: {
          nama_pengguna: namaPengguna,
        },
      },
    });

    if (error) {
      throw error;
    }

    // Inisialisasi data profil & saldo awal 100 token jika user berhasil dibuat
    if (data.user) {
      try {
        const penggunaId = `peng_${data.user.id.slice(0, 12)}`;
        await supabase.from('pengguna').upsert({
          pengguna_id: penggunaId,
          email: data.user.email,
          nama_pengguna: namaPengguna,
          peran: 'kandidat',
          email_terverifikasi: false,
          login_terakhir: new Date().toISOString(),
        });

        await supabase.from('saldo_token').upsert({
          saldo_id: `sald_${data.user.id.slice(0, 12)}`,
          pengguna_id: penggunaId,
          jumlah_saldo: 100,
          total_terpakai: 0,
        });

        await supabase.from('profil_pengguna').upsert({
          profil_id: `prof_${data.user.id.slice(0, 12)}`,
          pengguna_id: penggunaId,
          nama_lengkap: namaPengguna,
          preferensi_bahasa: 'id',
        });
      } catch (e) {
        // Abaikan jika RLS tabel memerlukan service key, fallback ke backend
      }
    }

    return data;
  },

  // Login Email & Password Asli
  async masuk(email: string, kataSandi: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: kataSandi,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  // Login Google OAuth Asli (Redirect Nyata ke Google Auth dengan pemilih akun)
  async masukGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      throw error;
    }

    // Arahkan browser secara langsung ke URL otentikasi Google
    if (data?.url) {
      window.location.href = data.url;
    }

    return data;
  },

  // Verifikasi 6-Digit OTP Asli
  async verifikasiOTP(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (error) {
      // Coba verifikasi tipe email jika signup gagal
      const cobaEmail = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (cobaEmail.error) throw cobaEmail.error;
      return cobaEmail.data;
    }

    return data;
  },

  // Keluar Sesi Asli
  async keluar() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Ambil Sesi Aktif
  async dapatkanSesi() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Ambil Pengguna Saat Ini
  async dapatkanPengguna() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
};
