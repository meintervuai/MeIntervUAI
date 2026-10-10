// Komponen Navbar utama: menampilkan brand, status login, navigasi cepat, dan IndikatorToken.
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IndikatorToken } from '../ui/IndikatorToken';
import { Menu, X, LifeBuoy, Settings, Home, LogOut } from 'lucide-react';

interface PropertiNavbar {
  pengguna: any;
  onKeluar: () => void;
}

export const Navbar: React.FC<PropertiNavbar> = ({ pengguna, onKeluar }) => {
  const [menuMobileTerbuka, setMenuMobileTerbuka] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 group">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-base shadow-sm group-hover:bg-brand-700 transition-colors">
                IU
              </div>
              <span>IntervU <span className="text-brand-600">AI</span></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Beranda
              </Link>
              <Link
                to="/bantuan"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/bantuan') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                CSM & Bantuan
              </Link>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-4">
            {pengguna ? (
              <>
                <IndikatorToken saldo={pengguna.saldo_token || 100} />
                <Link
                  to="/pengaturan"
                  className={`p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
                    isActive('/pengaturan') ? 'bg-slate-100 text-brand-600' : ''
                  }`}
                  title="Pengaturan Akun"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                <button
                  onClick={onKeluar}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/bantuan"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <LifeBuoy className="w-4 h-4" /> Bantuan
                </Link>
                <Link
                  to="/masuk"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Masuk / Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {pengguna && <IndikatorToken saldo={pengguna.saldo_token || 100} />}
            <button
              onClick={() => setMenuMobileTerbuka(!menuMobileTerbuka)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuMobileTerbuka ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuMobileTerbuka && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMenuMobileTerbuka(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Home className="w-4 h-4" /> Beranda
          </Link>
          <Link
            to="/bantuan"
            onClick={() => setMenuMobileTerbuka(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LifeBuoy className="w-4 h-4" /> CSM & Bantuan Publik
          </Link>
          {pengguna ? (
            <>
              <Link
                to="/pengaturan"
                onClick={() => setMenuMobileTerbuka(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Settings className="w-4 h-4" /> Pengaturan Akun
              </Link>
              <button
                onClick={() => {
                  setMenuMobileTerbuka(false);
                  onKeluar();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </>
          ) : (
            <Link
              to="/masuk"
              onClick={() => setMenuMobileTerbuka(false)}
              className="w-full mt-2 block text-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700"
            >
              Masuk / Daftar
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
