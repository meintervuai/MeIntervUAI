// Komponen App utama: mengelola routing antarmuka dan status session pengguna aktif.
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/tata_letak/Navbar';
import { Beranda } from './pages/Beranda';
import { CSMPublik } from './pages/CSMPublik';
import { MasukDaftar } from './pages/MasukDaftar';
import { Pengaturan } from './pages/Pengaturan';

export const App: React.FC = () => {
  const [pengguna, setPengguna] = useState<any>(() => {
    const tersimpan = localStorage.getItem('intervu_pengguna');
    return tersimpan ? JSON.parse(tersimpan) : null;
  });

  const tanganiLoginSukses = (dataPengguna: any) => {
    setPengguna(dataPengguna);
    localStorage.setItem('intervu_pengguna', JSON.stringify(dataPengguna));
  };

  const tanganiKeluar = () => {
    setPengguna(null);
    localStorage.removeItem('intervu_pengguna');
  };

  const perbaruiPengguna = (dataPengguna: any) => {
    setPengguna(dataPengguna);
    localStorage.setItem('intervu_pengguna', JSON.stringify(dataPengguna));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar pengguna={pengguna} onKeluar={tanganiKeluar} />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <Beranda
                  pengguna={pengguna}
                  onPerbaruiPengguna={perbaruiPengguna}
                />
              }
            />
            <Route path="/bantuan" element={<CSMPublik />} />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <p>© 2026 IntervU AI. Platform Simulasi Wawancara Adaptif & CV ATS. Seluruh hak cipta dilindungi.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
