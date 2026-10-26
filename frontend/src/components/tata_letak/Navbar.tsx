// Komponen Navbar & Mobile App Bottom Navigation Bar MeIntervUAI
// Mematuhi arsitektur Mobile-Native:
// 1. Desktop (md:flex): Topbar navigasi tradisional dengan logo, links, token, dan bahasa.
// 2. Mobile (md:hidden): 
//    - Compact Top Header (Logo, Token pill, Switcher bahasa)
//    - Persistent Bottom App Navigation Bar (Home, CV, Job, Simulasi, Akun) di thumb zone dengan safe-area padding.

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IndikatorToken } from '../ui/IndikatorToken';
import { useBahasa } from '../../i18n';
import { 
  Home, 
  FileText, 
  Briefcase, 
  Video, 
  Settings, 
  LogOut
} from 'lucide-react';

interface PropertiNavbar {
  pengguna: any;
  onKeluar: () => void;
}

export const Navbar: React.FC<PropertiNavbar> = ({ pengguna, onKeluar }) => {
  const location = useLocation();
  const { t } = useBahasa();

  const isActive = (path: string) => location.pathname === path;

  // Halaman autentikasi tidak menggunakan navigasi aplikasi
  if (location.pathname === '/masuk' || location.pathname === '/daftar') {
    return null;
  }

  const menuNavigasi = [
    { label: t.nav.beranda, path: '/', icon: Home },
    { label: t.nav.cv, path: '/cv', icon: FileText },
    { label: t.nav.lowongan, path: '/job', icon: Briefcase },
    { label: t.nav.simulasi, path: '/simulasi', icon: Video },
    { label: t.nav.pengaturan, path: '/pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* 1. TOP HEADER (Desktop full nav, Mobile clean utility header) */}
      <header className="sticky top-0 z-40 bg-[#fdfbf7] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 relative">
            {/* Left: Brand Logo (Desktop) / Page Title (Mobile) */}
            <div className="flex items-center gap-3">
              {/* Mobile View: Clean App Header */}
              <div className="flex md:hidden items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-700 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  MI
                </div>
                <span className="font-bold text-stone-900 text-base">
                  {location.pathname === '/pengaturan' 
                    ? t.nav.pengaturan 
                    : location.pathname === '/cv' 
                    ? t.nav.cv 
                    : location.pathname === '/job' 
                    ? t.nav.lowongan 
                    : location.pathname === '/simulasi' 
                    ? t.nav.simulasi 
                    : 'MeIntervUAI'}
                </span>
              </div>

              {/* Desktop View: Full Brand Logo */}
              <Link to="/" className="hidden md:flex items-center gap-2 group shrink-0">
                <div className="w-8 h-8 rounded-xl bg-orange-700 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-orange-800 transition-colors">
                  MI
                </div>
                <span className="tracking-tight text-stone-900 font-extrabold text-lg">
                  MeIntervU<span className="text-orange-700">AI</span>
                </span>
              </Link>
            </div>

            {/* Center: Desktop Menu Tabs (≥ 768px, Posisi Tengah Sempurna) */}
            {pengguna && (
              <nav className="hidden md:flex items-center justify-center gap-1 sm:gap-1.5 absolute left-1/2 -translate-x-1/2">
                {menuNavigasi.map((item) => {
                  const Icon = item.icon;
                  const aktif = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 min-h-[38px] relative whitespace-nowrap shrink-0 ${
                        aktif
                          ? 'text-orange-950 bg-orange-100/70 shadow-sm border border-orange-200/60 font-bold'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${aktif ? 'text-orange-700 stroke-[2.2px]' : 'text-stone-500'}`} />
                      <span className="whitespace-nowrap">{item.label}</span>
                      {aktif && (
                        <span className="absolute -bottom-[9px] sm:-bottom-[13px] left-3 right-3 h-[2.5px] bg-orange-700 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right: Right Controls (Token, Logout / Auth CTA) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap">
              {pengguna ? (
                <>
                  <div className="shrink-0 whitespace-nowrap">
                    <IndikatorToken saldo={pengguna.saldo_token || 100} />
                  </div>

                  {/* Desktop Logout Button */}
                  <button
                    type="button"
                    onClick={onKeluar}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors min-h-[36px]"
                    title={t.nav.keluar}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.nav.keluar}</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/masuk"
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-orange-700 text-white hover:bg-orange-800 transition-all shadow-sm shadow-orange-700/25 min-h-[36px] sm:min-h-[40px] flex items-center"
                >
                  {t.nav.ctaMasuk}
                </Link>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* 2. MOBILE APP BOTTOM NAVIGATION BAR (Khusus Mobile < 768px - Native App Experience) */}
      {pengguna && (
        <nav 
          aria-label="Navigasi Bawah Aplikasi Mobile"
          className="fixed md:hidden bottom-0 left-0 right-0 z-50 bg-[#fdfbf7] border-t border-stone-200 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]"
        >
          <div className="grid grid-cols-5 h-16 items-center px-1">
            {menuNavigasi.map((item) => {
              const Icon = item.icon;
              const aktif = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center gap-1 py-1 h-full select-none transition-colors relative min-h-[44px] ${
                    aktif
                      ? 'text-orange-800 font-bold'
                      : 'text-stone-500 hover:text-stone-800 font-medium'
                  }`}
                >
                  {/* Active Indicator Top Pill */}
                  {aktif && (
                    <span className="absolute top-0 w-8 h-1 bg-orange-700 rounded-full" />
                  )}
                  <Icon className={`w-5 h-5 ${aktif ? 'stroke-[2.5px] text-orange-700' : 'stroke-[1.8px]'}`} />
                  <span className="text-[10px] leading-none tracking-tight truncate max-w-[56px]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
};
