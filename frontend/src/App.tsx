// Komponen App utama: mengelola sesi Supabase Auth asli, pemisahan CSM Publik vs Suite Navigasi (Home, CV, Job, Simulasi, Pengaturan).
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/tata_letak/Navbar';
import { Beranda } from './pages/Beranda';
import { CSMPublik } from './pages/CSMPublik';
import { MasukDaftar } from './pages/MasukDaftar';
import { Pengaturan } from './pages/Pengaturan';
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
    ['/csm', '/bantuan', '/masuk'].includes(location.pathname) ||
    (!pengguna && location.pathname === '/');

  if (isHalamanMandiri) {
    return <main className="min-h-screen bg-[#fdfbf7]">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-900 font-sans">
      <Navbar pengguna={pengguna} onKeluar={onKeluar} />
      <main className="flex-1">{children}</main>
      <footer className="bg-[#fffbf7] border-t border-orange-200/80 py-8 px-6 text-center text-xs text-stone-600">
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
      return JSON.parse(tersimpan);
    } else if (tersimpan) {
      localStorage.setItem('intervu_waktu_login', Date.now().toString());
      return JSON.parse(tersimpan);
    }
    return null;
  });

  useEffect(() => {
    const waktuLogin = localStorage.getItem('intervu_waktu_login');
    if (waktuLogin) {
      const selisih = Date.now() - parseInt(waktuLogin, 10);
      if (selisih > TIGA_PULUH_HARI_MS) {
        localStorage.removeItem('intervu_pengguna');
        localStorage.removeItem('intervu_waktu_login');
        localStorage.removeItem('intervu_ingatkan_saya');
        setPengguna(null);
        authSupabase.keluar().catch(() => {});
        return;
      }
    }

    authSupabase.dapatkanSesi().then((session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const namaUser = meta.full_name || meta.name || meta.nama_pengguna || session.user.email?.split('@')[0];
        const profil = {
          pengguna_id: `peng_${session.user.id.slice(0, 12)}`,
          email: session.user.email,
          nama_pengguna: namaUser,
          saldo_token: 100,
        };
        setPengguna(profil);
        localStorage.setItem('intervu_pengguna', JSON.stringify(profil));
        if (!localStorage.getItem('intervu_waktu_login')) {
          localStorage.setItem('intervu_waktu_login', Date.now().toString());
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const meta = session.user.user_metadata || {};
        const namaUser = meta.full_name || meta.name || meta.nama_pengguna || session.user.email?.split('@')[0];
        const profil = {
          pengguna_id: `peng_${session.user.id.slice(0, 12)}`,
          email: session.user.email,
          nama_pengguna: namaUser,
          saldo_token: 100,
        };
        setPengguna(profil);
        localStorage.setItem('intervu_pengguna', JSON.stringify(profil));
        localStorage.setItem('intervu_waktu_login', Date.now().toString());
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
    <Router>
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
                />
              ) : (
                <Navigate to="/masuk" replace />
              )
            }
          />

          {/* Rute Pusat Bantuan Mandiri MeIntervUAI */}
          <Route path="/csm" element={<CSMPublik />} />
          <Route path="/bantuan" element={<CSMPublik />} />

          {/* Rute Autentikasi Masuk & Daftar */}
          <Route
            path="/masuk"
            element={
              pengguna ? (
                <Navigate to="/" replace />
              ) : (
                <MasukDaftar onLoginSukses={tanganiLoginSukses} />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </KerangkaAplikasi>
    </Router>
  );
};

export default App;
