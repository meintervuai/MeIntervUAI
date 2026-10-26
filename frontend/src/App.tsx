// Komponen App utama: mengelola sesi Supabase Auth asli, pemisahan CSM Publik vs Suite Navigasi (Home, CV, Job, Simulasi, Pengaturan).
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/tata_letak/Navbar';
import { Beranda } from './pages/beranda/Beranda';
import { CSMPublik } from './pages/CSMPublik';
import { Pengaturan } from './pages/Pengaturan';
import { HalamanGalat } from './pages/HalamanGalat';
import { Masuk } from './pages/auth/Masuk';
import { Daftar } from './pages/auth/Daftar';
import { OTP } from './pages/auth/OTP';
import { LupaSandi } from './pages/auth/LupaSandi';
import { AturUlangSandi } from './pages/auth/AturUlangSandi';
import { authSupabase, supabase } from './services/supabase';

const SegeraHadir: React.FC<{ judul: string }> = ({ judul }) => (
  <div className="max-w-3xl mx-auto px-4 py-16 text-center">
    <div className="bg-white border border-slate-200/90 rounded-2xl p-10 shadow-sm space-y-3">
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">{judul}</h2>
      <p className="text-sm text-slate-500">
        Navigasi telah disiapkan. Halaman modul ini akan dibuka pada tahap berikutnya.
      </p>
    </div>
  </div>
);

const TIGA_PULUH_HARI_MS = 30 * 24 * 60 * 60 * 1000;

const KerangkaAplikasi: React.FC<{
  pengguna: any;
  onKeluar: () => void;
  children: React.ReactNode;
}> = ({ pengguna, onKeluar, children }) => {
  const location = useLocation();
  const isHalamanMandiri =
    ['/csm', '/bantuan', '/masuk', '/daftar', '/otp', '/lupa-sandi', '/reset-sandi'].includes(location.pathname) ||
    (!pengguna && location.pathname === '/');

  if (isHalamanMandiri) {
    return <main className="min-h-screen bg-[#fdfbf7]">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-900 font-sans">
      <Navbar pengguna={pengguna} onKeluar={onKeluar} />
      <main className="flex-1">{children}</main>
      {/* Footer hanya untuk desktop (≥ 768px). Di mobile dihilangkan agar tidak bertabrakan dengan Bottom Navigation Bar */}
      <footer className="hidden md:block bg-[#fffbf7] border-t border-orange-200/80 py-8 px-6 text-center text-xs text-stone-600">
        <div className="max-w-xl mx-auto px-4">
          <p className="leading-relaxed max-w-[70ch] mx-auto">
            © 2026 MeIntervUAI. Platform Simulasi Wawancara Adaptif & CV ATS. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  const [pengguna, setPengguna] = useState<any>(() => {
    const tersimpan = localStorage.getItem('intervu_pengguna');
    const waktuLogin = localStorage.getItem('intervu_waktu_login');
    if (tersimpan && waktuLogin) {
      const selisih = Date.now() - parseInt(waktuLogin, 10);
      if (selisih > TIGA_PULUH_HARI_MS) {
        localStorage.removeItem('intervu_pengguna');
        localStorage.removeItem('intervu_waktu_login');
        localStorage.removeItem('intervu_ingatkan_saya');
        return null;
      }
      try {
        const parsed = JSON.parse(tersimpan);
        if (!parsed.email_terverifikasi) {
          localStorage.removeItem('intervu_pengguna');
          return null;
        }
        return parsed;
      } catch (_) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const validasiSesiDatabase = async () => {
      try {
        const session = await authSupabase.dapatkanSesi();
        if (!session?.user?.email) {
          // Tidak ada sesi auth aktif
          setPengguna(null);
          localStorage.removeItem('intervu_pengguna');
          localStorage.removeItem('intervu_waktu_login');
          localStorage.removeItem('intervu_ingatkan_saya');
          return;
        }

        // Cek secara ketat ke tabel database 'pengguna'
        const { data: dbUser, error } = await supabase
          .from('pengguna')
          .select('*')
          .eq('email', session.user.email)
          .limit(1)
          .maybeSingle();

        if (error || !dbUser) {
          // Akun sudah dihapus dari database atau tidak ditemukan
          // Tendang dan bersihkan sesi seketika!
          console.warn('Akun tidak terdaftar di database. Membersihkan sesi...');
          await authSupabase.keluar().catch(() => {});
          setPengguna(null);
          localStorage.removeItem('intervu_pengguna');
          localStorage.removeItem('intervu_waktu_login');
          localStorage.removeItem('intervu_ingatkan_saya');
          return;
        }

        // Akun ada, tapi belum verifikasi email
        if (!dbUser.email_terverifikasi) {
          console.warn('Akun belum verifikasi email. Menolak akses beranda...');
          await authSupabase.keluar().catch(() => {});
          setPengguna(null);
          localStorage.removeItem('intervu_pengguna');
          localStorage.removeItem('intervu_waktu_login');
          localStorage.removeItem('intervu_ingatkan_saya');
          return;
        }

        // Akun sah & terverifikasi
        setPengguna(dbUser);
        localStorage.setItem('intervu_pengguna', JSON.stringify(dbUser));
        if (!localStorage.getItem('intervu_waktu_login')) {
          localStorage.setItem('intervu_waktu_login', Date.now().toString());
        }
      } catch (err) {
        console.error('Gagal validasi sesi pengguna:', err);
        setPengguna(null);
        localStorage.removeItem('intervu_pengguna');
      }
    };

    validasiSesiDatabase();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        const { data: dbUser } = await supabase
          .from('pengguna')
          .select('*')
          .eq('email', session.user.email)
          .limit(1)
          .maybeSingle();

        if (dbUser && dbUser.email_terverifikasi) {
          setPengguna(dbUser);
          localStorage.setItem('intervu_pengguna', JSON.stringify(dbUser));
          localStorage.setItem('intervu_waktu_login', Date.now().toString());
        } else {
          // Akun tidak ada di DB atau belum verifikasi
          await authSupabase.keluar().catch(() => {});
          setPengguna(null);
          localStorage.removeItem('intervu_pengguna');
          localStorage.removeItem('intervu_waktu_login');
        }
      } else if (event === 'SIGNED_OUT') {
        setPengguna(null);
        localStorage.removeItem('intervu_pengguna');
        localStorage.removeItem('intervu_waktu_login');
        localStorage.removeItem('intervu_ingatkan_saya');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const tanganiLoginSukses = (dataPengguna: any, ingatkanSaya: boolean = true) => {
    setPengguna(dataPengguna);
    localStorage.setItem('intervu_pengguna', JSON.stringify(dataPengguna));
    localStorage.setItem('intervu_waktu_login', Date.now().toString());
    localStorage.setItem('intervu_ingatkan_saya', ingatkanSaya ? 'true' : 'false');
  };

  const tanganiKeluar = async () => {
    try {
      await authSupabase.keluar();
    } catch (e) {
      // Abaikan jika sudah keluar
    }
    setPengguna(null);
    localStorage.removeItem('intervu_pengguna');
    localStorage.removeItem('intervu_waktu_login');
    localStorage.removeItem('intervu_ingatkan_saya');
  };

  const perbaruiPengguna = (dataPengguna: any) => {
    setPengguna(dataPengguna);
    localStorage.setItem('intervu_pengguna', JSON.stringify(dataPengguna));
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <KerangkaAplikasi pengguna={pengguna} onKeluar={tanganiKeluar}>
        <Routes>
          {/* Rute Beranda: Halaman Mandiri jika belum login, Studio Kesiapan jika sudah login */}
          <Route
            path="/"
            element={
              pengguna ? (
                <Beranda
                  pengguna={pengguna}
                  onPerbaruiPengguna={perbaruiPengguna}
                />
              ) : (
                <CSMPublik />
              )
            }
          />

          {/* Rute CV ATS (Navigasi Disiapkan) */}
          <Route
            path="/cv"
            element={
              pengguna ? (
                <SegeraHadir judul="Modul Pembuat CV ATS" />
              ) : (
                <Navigate to="/masuk" replace />
              )
            }
          />

          {/* Rute Job / Loker (Navigasi Disiapkan) */}
          <Route
            path="/job"
            element={
              pengguna ? (
                <SegeraHadir judul="Modul Rekomendasi Lowongan Kerja" />
              ) : (
                <Navigate to="/masuk" replace />
              )
            }
          />

          {/* Rute Simulasi Wawancara (Navigasi Disiapkan) */}
          <Route
            path="/simulasi"
            element={
              pengguna ? (
                <SegeraHadir judul="Modul Studio Simulasi Wawancara" />
              ) : (
                <Navigate to="/masuk" replace />
              )
            }
          />

          {/* Rute Pengaturan Akun */}
          <Route
            path="/pengaturan"
            element={
              pengguna ? (
                <Pengaturan
                  pengguna={pengguna}
                  onPerbaruiPengguna={perbaruiPengguna}
                  onKeluar={tanganiKeluar}
                />
              ) : (
                <Navigate to="/masuk" replace />
              )
            }
          />

          {/* Rute Pusat Bantuan Mandiri MeIntervUAI */}
          <Route path="/csm" element={<CSMPublik />} />
          <Route path="/bantuan" element={<CSMPublik />} />

          {/* Rute Autentikasi Modular (pages/auth) */}
          <Route
            path="/masuk"
            element={
              pengguna ? (
                <Navigate to="/" replace />
              ) : (
                <Masuk onLoginSukses={tanganiLoginSukses} />
              )
            }
          />
          <Route
            path="/daftar"
            element={
              pengguna ? (
                <Navigate to="/" replace />
              ) : (
                <Daftar />
              )
            }
          />
          <Route
            path="/otp"
            element={
              pengguna ? (
                <Navigate to="/" replace />
              ) : (
                <OTP />
              )
            }
          />
          <Route
            path="/lupa-sandi"
            element={
              pengguna ? (
                <Navigate to="/" replace />
              ) : (
                <LupaSandi />
              )
            }
          />

          {/* Rute Reset Kata Sandi Baru */}
          <Route path="/reset-sandi" element={<AturUlangSandi />} />

          <Route path="*" element={<HalamanGalat />} />
        </Routes>
      </KerangkaAplikasi>
    </Router>
  );
};

export default App;
