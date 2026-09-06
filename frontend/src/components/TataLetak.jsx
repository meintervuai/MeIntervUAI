import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import IkonLogo from './icons/IkonLogo';
import IkonKeluar from './icons/IkonKeluar';
import IkonKuota from './icons/IkonKuota';
import NavbarBawah from './NavbarBawah';
import { pakaiBahasa } from '../contexts/KonteksBahasa';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import { pakaiKuota } from '../hooks/pakai_kuota';
import { inisial, namaDepan } from '../utils/pemformat';

/**
 * Kerangka tata letak terproteksi (mobile-first & desktop-adapted):
 * - Mobile: header ringkas + konten + bottom navigation (NavbarBawah)
 * - Desktop: header lengkap dengan navigasi horizontal, indikator kuota,
 *   pengalih bahasa, status profil, dan tombol keluar.
 */
export default function TataLetak() {
  const { t, bahasa, gantiBahasa } = pakaiBahasa();
  const { profil, keluar } = pakaiOtentikasi();
  const { kuota } = pakaiKuota();
  const navigate = useNavigate();

  const tautan = [
    { ke: '/home', label: t.navigasi.beranda },
    { ke: '/pembuat-cv', label: t.navigasi.cv },
    { ke: '/simulasi', label: t.navigasi.simulasi },
    { ke: '/lowongan', label: t.navigasi.lowongan },
    { ke: '/profil', label: t.navigasi.profil },
  ];

  async function tanganiKeluar() {
    try {
      await keluar();
      navigate('/masuk', { replace: true });
    } catch (galat) {
      console.warn('Gagal keluar:', galat.message);
    }
  }

  const sisaKuota = kuota?.sisa ?? 20;
  const batasKuota = kuota?.batas ?? 20;
  const namaPanggilan = namaDepan(profil?.nama_lengkap) || 'Pengguna';

  return (
    <div className="min-h-dvh bg-latar text-batu-800 antialiased flex flex-col">
      {/* Header Utama Sticky */}
      <header className="sticky top-0 z-30 border-b border-batu-200 bg-white/95 px-4 py-2.5 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          {/* Sisi Kiri: Logo & Identitas */}
          <Link to="/home" className="flex items-center gap-2.5 focus-visible:ring-2">
            <IkonLogo className="h-8 w-8 text-oranye-600 sm:h-9 sm:w-9" />
            <div className="leading-none">
              <span className="font-display text-base font-extrabold tracking-tight text-batu-900 sm:text-lg">
                {t.umum.appName}
              </span>
              <p className="hidden text-[11px] font-medium text-batu-500 sm:block">
                {t.umum.tagline}
              </p>
            </div>
          </Link>

          {/* Sisi Tengah: Navigasi Desktop (≥md) */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Navigasi desktop"
          >
            {tautan.map((item) => (
              <NavLink
                key={item.ke}
                to={item.ke}
                className={({ isActive }) =>
                  `rounded-tombol px-3.5 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-oranye-50 text-oranye-700 shadow-xs'
                      : 'text-batu-600 hover:bg-batu-100 hover:text-batu-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Sisi Kanan: Kontrol Cepat (Kuota, Bahasa, Profil & Keluar) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indikator Kuota Cepat */}
            <Link
              to="/home"
              title={`Sisa ${sisaKuota} dari ${batasKuota} panggilan AI hari ini`}
              className="flex items-center gap-1.5 rounded-full border border-oranye-200 bg-oranye-50/80 px-2.5 py-1 text-xs font-bold text-oranye-800 transition-colors hover:bg-oranye-100"
            >
              <IkonKuota className="h-3.5 w-3.5 text-oranye-600" />
              <span className="tabular-nums">{sisaKuota}/{batasKuota}</span>
              <span className="hidden lg:inline text-[10px] font-semibold text-oranye-600 uppercase tracking-wide">
                Kuota
              </span>
            </Link>

            {/* Pengalih Bahasa */}
            <div className="flex items-center rounded-full border border-batu-200 bg-batu-50 p-0.5 text-[11px] font-bold text-batu-600">
              <button
                type="button"
                onClick={() => gantiBahasa('id')}
                className={`rounded-full px-2 py-0.5 transition-colors ${
                  bahasa === 'id' ? 'bg-white text-oranye-700 shadow-xs' : 'hover:text-batu-900'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => gantiBahasa('en')}
                className={`rounded-full px-2 py-0.5 transition-colors ${
                  bahasa === 'en' ? 'bg-white text-oranye-700 shadow-xs' : 'hover:text-batu-900'
                }`}
              >
                EN
              </button>
            </div>

            {/* Profil Ringkas & Tombol Keluar (Desktop) */}
            <div className="hidden items-center gap-2 pl-1 sm:flex">
              <Link
                to="/profil"
                className="flex items-center gap-2 rounded-full border border-batu-200 bg-white py-1 pl-1 pr-3 text-xs font-semibold text-batu-700 shadow-xs transition-colors hover:border-batu-300 hover:bg-batu-50"
              >
                {profil?.url_avatar ? (
                  <img
                    src={profil.url_avatar}
                    alt={namaPanggilan}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-oranye-600 text-[11px] font-extrabold text-white">
                    {inisial(profil?.nama_lengkap)}
                  </span>
                )}
                <span className="max-w-[100px] truncate">{namaPanggilan}</span>
              </Link>

              <button
                type="button"
                onClick={tanganiKeluar}
                title="Keluar dari akun"
                className="flex h-8 w-8 items-center justify-center rounded-full text-batu-400 transition-colors hover:bg-red-50 hover:text-bahaya"
                aria-label="Keluar"
              >
                <IkonKeluar className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Kontainer Halaman Utama */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Navigasi Bawah khusus Mobile (<md) */}
      <NavbarBawah />
    </div>
  );
}