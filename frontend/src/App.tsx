import { Routes, Route, Navigate } from 'react-router-dom';
import { KonteksOtentikasi } from './contexts/KonteksOtentikasi';
import { KonteksBahasa } from './contexts/KonteksBahasa';
import { KonteksKuota } from './contexts/KonteksKuota';
import Beranda from './pages/Beranda';
import Masuk from './pages/Masuk';
import Home from './pages/Home';
import Profil from './pages/Profil';
import Segera from './pages/Segera';
import TataLetak from './components/TataLetak';
import PelindungRute from './components/PelindungRute';

// Rute: struktur_file.md §8 — default bahasa Indonesia, mobile-first.
export default function App() {
  return (
    <KonteksOtentikasi>
      <KonteksBahasa>
        <KonteksKuota>
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/masuk" element={<Masuk />} />

            <Route element={<PelindungRute />}>
              <Route element={<TataLetak />}>
                <Route path="/home" element={<Home />} />
                <Route path="/profil" element={<Profil />} />
                {/* Rute M1 lanjutan — sementara "Segera Hadir" */}
                <Route path="/pembuat-cv" element={<Segera judul="Pembuat CV" />} />
                <Route path="/cv/:id" element={<Segera judul="Editor CV" />} />
                <Route path="/analisis-cv" element={<Segera judul="Analisis CV" />} />
                <Route path="/analisis-cv/:id" element={<Segera judul="Analisis CV" />} />
                <Route path="/simulasi" element={<Segera judul="Simulasi Wawancara" />} />
                <Route path="/lowongan" element={<Segera judul="Lowongan Kerja" />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </KonteksKuota>
      </KonteksBahasa>
    </KonteksOtentikasi>
  );
}