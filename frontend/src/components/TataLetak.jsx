import { Outlet, NavLink } from 'react-router-dom';
import IkonLogo from './icons/IkonLogo';
import NavbarBawah from './NavbarBawah';
import { pakaiBahasa } from '../contexts/KonteksBahasa';

/**
 * Kerangka halaman terproteksi (mobile-first):
 * - header sticky (logo + navigasi desktop)
 * - konten
 * - bottom navigation (khas mobile, tersembunyi di ≥md)
 */
export default function TataLetak() {
  const { t } = pakaiBahasa();

  const tautan = [
    { ke: '/home', label: t.navigasi.beranda },
    { ke: '/pembuat-cv', label: t.navigasi.cv },
    { ke: '/simulasi', label: t.navigasi.simulasi },
    { ke: '/lowongan', label: t.navigasi.lowongan },
    { ke: '/profil', label: t.navigasi.profil },
  ];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col md:max-w-2xl lg:max-w-5xl">
      <header className="sticky top-0 z-20 border-b border-batu-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IkonLogo className="h-9 w-9" />
            <div className="leading-tight">
              <p className="font-display text-sm font-extrabold tracking-tight text-batu-800">
                {t.umum.appName}
              </p>
              <p className="text-[11px] text-batu-500">{t.umum.tagline}</p>
            </div>
          </div>

          {/* Navigasi horizontal — hanya desktop */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {tautan.map((item) => (
              <NavLink
                key={item.ke}
                to={item.ke}
                className={({ isActive }) =>
                  `rounded-tombol px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-oranye-50 text-oranye-700'
                      : 'text-batu-600 hover:bg-batu-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4 md:pb-10">{<Outlet />}</main>

      <NavbarBawah />
    </div>
  );
}