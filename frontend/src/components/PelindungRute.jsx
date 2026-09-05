import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import IkonLogo from './icons/IkonLogo';

/** Layar skeleton saat status sesi belum pasti (anti-slop: bukan spinner). */
function LayarMemuat() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-latar px-6">
      <IkonLogo className="h-14 w-14 animate-pulse" />
      <div className="h-3 w-40 animate-pulse rounded-full bg-batu-200" />
      <div className="h-3 w-24 animate-pulse rounded-full bg-batu-200" />
    </div>
  );
}

/** Penjaga rute: belum masuk → /masuk (simpan tujuan asal). */
export default function PelindungRute() {
  const { pengguna, memuat } = pakaiOtentikasi();
  const lokasi = useLocation();

  if (memuat) return <LayarMemuat />;
  if (!pengguna) {
    return <Navigate to="/masuk" replace state={{ dari: lokasi.pathname }} />;
  }
  return <Outlet />;
}