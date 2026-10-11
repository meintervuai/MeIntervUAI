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
  // Pendaftaran Asli Sesuai DB-05 (<prefix><YYYYMMDD><4digit>)
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
        const tgl = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const prefixHariIni = `user${tgl}`;

        // Ambil ID pengguna terakhir hari ini untuk nomor urut
        let nomorUrut = 0;
        try {
          const { data: listUser } = await supabase
            .from('pengguna')
            .select('pengguna_id')
            .like('pengguna_id', `${prefixHariIni}%`)
            .order('pengguna_id', { ascending: false })
            .limit(1);

          if (listUser && listUser.length > 0) {
            const idTerakhir = listUser[0].pengguna_id || '';
            const suffix = idTerakhir.slice(prefixHariIni.length);
            if (/^\d+$/.test(suffix)) {
              nomorUrut = parseInt(suffix, 10) + 1;
            }
          }
        } catch (_) {}

        const digitUrut = nomorUrut.toString().padStart(4, '0');
        const penggunaId = `user${tgl}${digitUrut}`;

        await supabase.from('pengguna').upsert({
          pengguna_id: penggunaId,
          email: data.user.email,
          nama_pengguna: namaPengguna,
          peran: 'kandidat',
          email_terverifikasi: false,
          login_terakhir: new Date().toISOString(),
          auth_user_id: data.user.id,
        });

        await supabase.from('saldo_token').upsert({
          saldo_id: `sald${tgl}${digitUrut}`,
          pengguna_id: penggunaId,
          jumlah_saldo: 100,
          total_terpakai: 0,
        });

        await supabase.from('profil_pengguna').upsert({
          profil_id: `prof${tgl}${digitUrut}`,
          pengguna_id: penggunaId,
          nama_lengkap: namaPengguna,
          preferensi_bahasa: 'id',
        });
      } catch (e) {
        // Fallback jika ditangani oleh service backend
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

  // Permintaan Reset Kata Sandi Asli
  async mintaResetKataSandi(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-sandi`,
    });
    if (error) throw error;
    return data;
  },

  // Sinkronisasi record database resmi (DB-05 format: user<YYYYMMDD><4digit-urut>)
  async sinkronkanPenggunaDatabase(userAuth: any) {
    if (!userAuth || !userAuth.email) return null;

    try {
      // 1. Cari pengguna berdasarkan email
      const { data: penggunaAda } = await supabase
        .from('pengguna')
        .select('*')
        .eq('email', userAuth.email)
        .limit(1);

      if (penggunaAda && penggunaAda.length > 0) {
        const p = penggunaAda[0];
        // Pastikan auth_user_id sinkron
        if (!p.auth_user_id) {
          await supabase.from('pengguna').update({ auth_user_id: userAuth.id }).eq('pengguna_id', p.pengguna_id);
        }
        return p;
      }

      // 2. Jika akun TIDAK ADA di tabel pengguna (misal telah dihapus oleh admin dari DB)
      // JANGAN buatkan akun baru secara otomatis! Akun yang dihapus harus dianggap tidak valid.
      return null;
    } catch (err) {
      console.error('Gagal verifikasi pengguna DB:', err);
      return null;
    }
  },
};
