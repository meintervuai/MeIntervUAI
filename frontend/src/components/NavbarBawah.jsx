import { NavLink } from 'react-router-dom';
import IkonHome from './icons/IkonHome';
import IkonCv from './icons/IkonCv';
import IkonSimulasi from './icons/IkonSimulasi';
import IkonLowongan from './icons/IkonLowongan';
import IkonProfil from './icons/IkonProfil';
import { pakaiBahasa } from '../contexts/KonteksBahasa';

/**
 * Bottom navigation (mobile-first, tersembunyi di ≥md).
 * Semua item target sentuh ≥ 44×44px (NFR-10).
 */
export default function NavbarBawah() {
  const { t } = pakaiBahasa();

  const item = [
    { ke: '/home', label: t.navigasi.beranda, Ikon: IkonHome, segera: false },
    { ke: '/pembuat-cv', label: t.navigasi.cv, Ikon: IkonCv, segera: true },
    { ke: '/simulasi', label: t.navigasi.simulasi, Ikon: IkonSimulasi, segera: true },
    { ke: '/lowongan', label: t.navigasi.lowongan, Ikon: IkonLowongan, segera: true },
    { ke: '/profil', label: t.navigasi.profil, Ikon: IkonProfil, segera: false },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-batu-200 bg-white/95 backdrop-blur md:hidden"
      aria-label="Navigasi bawah"
    >
      <div className="mx-auto flex w-full max-w-md items-stretch justify-between px-1 pb-aman">
        {item.map(({ ke, label, Ikon, segera }) => (
          <NavLink
            key={ke}
            to={ke}
            className={({ isActive }) =>
              `relative flex min-h-[56px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-semibold transition-colors ${
                isActive ? 'text-oranye-600' : 'text-batu-500 hover:text-batu-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Ikon className="h-6 w-6" />
                  {segera && (
                    <span
                      className="absolute -right-1 -top-0.5 h-1.5 w-1.5 rounded-full bg-oranye-400"
                      title={t.umum.segera}
                    />
                  )}
                </span>
                <span className={isActive ? '' : 'font-medium'}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}