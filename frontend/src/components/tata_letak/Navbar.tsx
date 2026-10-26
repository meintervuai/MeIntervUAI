import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IndikatorToken } from '../ui/IndikatorToken';
import { useBahasa } from '../../i18n';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Briefcase, 
  Video, 
  Settings, 
  LogOut,
  Globe
} from 'lucide-react';

interface PropertiNavbar {
  pengguna: any;
  onKeluar: () => void;
}

export const Navbar: React.FC<PropertiNavbar> = ({ pengguna, onKeluar }) => {
  const [menuMobileTerbuka, setMenuMobileTerbuka] = useState(false);
  const location = useLocation();
  const { bahasa, setBahasa } = useBahasa();

  const isActive = (path: string) => location.pathname === path;

  // Halaman masuk / daftar tidak menampilkan header navigasi
  if (location.pathname === '/masuk') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-[#fffbf7]/95 backdrop-blur-md border-b border-orange-200/90 shadow-[0_1px_3px_rgba(234,88,12,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand (Executive Orange MeIntervUAI) */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-stone-900 group">
              <div className="w-8 h-8 rounded-xl bg-orange-700 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-orange-700/30 group-hover:bg-orange-800 transition-colors">
                MI
              </div>
              <span className="tracking-tight text-stone-900 font-extrabold">MeIntervU<span className="text-orange-800">AI</span></span>
            </Link>

            {/* Desktop Navigation (Hanya untuk pengguna login) */}
            {pengguna && (
              <nav className="hidden md:flex items-center gap-1.5">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    isActive('/') ? 'text-white bg-orange-700 shadow-sm shadow-orange-700/25' : 'text-stone-800 hover:text-orange-800 hover:bg-orange-100/70'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/cv"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    isActive('/cv') ? 'text-white bg-orange-700 shadow-sm shadow-orange-700/25' : 'text-stone-800 hover:text-orange-800 hover:bg-orange-100/70'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CV</span>
                </Link>
                <Link
                  to="/job"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    isActive('/job') ? 'text-white bg-orange-700 shadow-sm shadow-orange-700/25' : 'text-stone-800 hover:text-orange-800 hover:bg-orange-100/70'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Job</span>
                </Link>
                <Link
                  to="/simulasi"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    isActive('/simulasi') ? 'text-white bg-orange-700 shadow-sm shadow-orange-700/25' : 'text-stone-800 hover:text-orange-800 hover:bg-orange-100/70'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Simulasi</span>
                </Link>
                <Link
                  to="/pengaturan"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    isActive('/pengaturan') ? 'text-white bg-orange-700 shadow-sm shadow-orange-700/25' : 'text-stone-800 hover:text-orange-800 hover:bg-orange-100/70'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Pengaturan</span>
                </Link>
              </nav>
            )}
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="inline-flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm">
              <Globe className="w-3.5 h-3.5 text-stone-500 ml-1" />
              <button
                type="button"
                onClick={() => setBahasa('id')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded min-h-[24px] transition-colors ${
                  bahasa === 'id'
                    ? 'bg-orange-700 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setBahasa('en')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded min-h-[24px] transition-colors ${
                  bahasa === 'en'
                    ? 'bg-orange-700 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                EN
              </button>
            </div>

            {pengguna ? (
              <>
                <IndikatorToken saldo={pengguna.saldo_token || 100} />
                <button
                  onClick={onKeluar}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/masuk"
                  className="px-5 py-2 text-sm font-bold rounded-xl bg-orange-700 text-white hover:bg-orange-800 transition-all shadow-sm shadow-orange-700/25"
                >
                  Masuk / Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Language Switcher */}
            <div className="inline-flex items-center gap-0.5 bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setBahasa('id')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                  bahasa === 'id' ? 'bg-orange-700 text-white' : 'text-stone-600'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setBahasa('en')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                  bahasa === 'en' ? 'bg-orange-700 text-white' : 'text-stone-600'
                }`}
              >
                EN
              </button>
            </div>

            {pengguna && <IndikatorToken saldo={pengguna.saldo_token || 100} />}
            <button
              onClick={() => setMenuMobileTerbuka(!menuMobileTerbuka)}
              className="p-2 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-orange-100/60 focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuMobileTerbuka ? <X className="w-6 h-6 text-stone-900" /> : <Menu className="w-6 h-6 text-stone-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuMobileTerbuka && (
        <div className="md:hidden border-t border-orange-200 bg-[#fffbf7] px-4 pt-3 pb-8 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto safe-padding-x shadow-lg">
          {pengguna ? (
            <>
              <Link
                to="/"
                onClick={() => setMenuMobileTerbuka(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold ${
                  isActive('/') ? 'text-white bg-orange-600' : 'text-stone-700 hover:bg-orange-100/60'
                }`}
              >
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link
                to="/cv"
                onClick={() => setMenuMobileTerbuka(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold ${
                  isActive('/cv') ? 'text-white bg-orange-600' : 'text-stone-700 hover:bg-orange-100/60'
                }`}
              >
                <FileText className="w-4 h-4" /> CV ATS Builder
              </Link>
              <Link
                to="/job"
                onClick={() => setMenuMobileTerbuka(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold ${
                  isActive('/job') ? 'text-white bg-orange-600' : 'text-stone-700 hover:bg-orange-100/60'
                }`}
              >
                <Briefcase className="w-4 h-4" /> Lowongan Kerja
              </Link>
              <Link
                to="/simulasi"
                onClick={() => setMenuMobileTerbuka(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold ${
                  isActive('/simulasi') ? 'text-white bg-orange-600' : 'text-stone-700 hover:bg-orange-100/60'
                }`}
              >
                <Video className="w-4 h-4" /> Simulasi Wawancara
              </Link>
              <Link
                to="/pengaturan"
                onClick={() => setMenuMobileTerbuka(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold ${
                  isActive('/pengaturan') ? 'text-white bg-orange-600' : 'text-stone-700 hover:bg-orange-100/60'
                }`}
              >
                <Settings className="w-4 h-4" /> Pengaturan Akun
              </Link>
              <button
                onClick={() => {
                  setMenuMobileTerbuka(false);
                  onKeluar();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" /> Keluar Akun
              </button>
            </>
          ) : (
            <div className="pt-2">
              <Link
                to="/masuk"
                onClick={() => setMenuMobileTerbuka(false)}
                className="w-full block text-center px-4 py-3 text-sm font-bold rounded-xl bg-orange-600 text-white hover:bg-orange-700 shadow-sm"
              >
                Masuk / Daftar ke MeIntervUAI
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
