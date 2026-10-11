// Base Layout Autentikasi Split-Screen (Executive Orange & Zero-Scroll Desktop):
// Komponen pembungkus seragam untuk seluruh modul autentikasi: Masuk, Daftar, OTP, dan Lupa Sandi.

import React from 'react';
import { useBahasa } from '../../i18n';
import { Globe, Check } from 'lucide-react';

interface PropsBaseAuth {
  children: React.ReactNode;
}

export const BaseAuth: React.FC<PropsBaseAuth> = ({ children }) => {
  const { bahasa, setBahasa, t } = useBahasa();

  return (
    <div className="h-screen w-full flex flex-col lg:grid lg:grid-cols-2 bg-[#fdfbf7] overflow-hidden select-none">
      {/* Sisi Kiri: Panel Visual Tema Executive Orange (Khusus Desktop & Tablet) */}
      <div className="relative hidden h-full flex-col bg-gradient-to-br from-orange-700 via-orange-800 to-orange-950 p-8 xl:p-12 text-white lg:flex justify-between overflow-hidden shadow-inner">
        {/* Brand Logo di Kiri Atas */}
        <div className="relative z-10 flex items-center gap-2.5 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-white text-orange-800 flex items-center justify-center font-black text-sm shadow-sm">
            MI
          </div>
          <span className="tracking-tight text-white font-extrabold text-xl">
            MeIntervU<span className="text-orange-200">AI</span>
          </span>
        </div>

        {/* Ilustrasi & Highlight Nilai Utama */}
        <div className="relative z-10 my-auto py-4 space-y-5 max-w-md">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/15">
            <img
              src="/illustrations/interview.svg"
              alt="Simulasi Wawancara AI"
              className="w-full max-h-44 object-contain filter drop-shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-white leading-tight">
              {t.auth.showcaseJudul}
            </h2>
            <p className="text-xs xl:text-sm text-orange-100/90 leading-relaxed max-w-[48ch]">
              {t.auth.showcaseDesc}
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            {t.auth.fiturPoin.map((poin, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-orange-100">
                <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span><strong className="text-white font-semibold">{poin.judul}:</strong> {poin.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kutipan Testimonial Kandidat */}
        <div className="relative z-10 border-t border-orange-600/60 pt-4">
          <blockquote className="space-y-1">
            <p className="text-xs xl:text-sm text-orange-100 italic leading-relaxed max-w-[48ch]">
              &ldquo;{t.auth.kutipanShowcase}&rdquo;
            </p>
            <footer className="text-xs text-orange-200 font-medium">
              {t.auth.penulisShowcase}
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Sisi Kanan: Formulir Autentikasi (1 Layar Penuh Tanpa Scrollbar di Desktop) */}
      <div className="h-full flex flex-col justify-between p-4 sm:p-8 lg:p-8 overflow-y-auto lg:overflow-hidden relative">
        {/* Header Baris Atas: Logo Mobile & Switcher Bahasa */}
        <div className="flex items-center justify-between w-full max-w-[380px] mx-auto shrink-0 pb-2">
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-700 text-white flex items-center justify-center font-black text-xs">
              MI
            </div>
            <span className="tracking-tight text-stone-900 font-extrabold text-base">
              MeIntervU<span className="text-orange-700">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="inline-flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm">
              <Globe className="w-3 h-3 text-stone-500 ml-1" />
              <button
                type="button"
                onClick={() => setBahasa('id')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded min-h-[26px] transition-colors ${
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
                className={`px-1.5 py-0.5 text-xs font-bold rounded min-h-[26px] transition-colors ${
                  bahasa === 'en'
                    ? 'bg-orange-700 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Konten Halaman Auth */}
        {children}

        {/* Footer Tautan Kebijakan & Privasi */}
        <div className="pt-2 text-center text-[10px] text-stone-500 shrink-0">
          {t.auth.disclaimerKetentuan}
        </div>
      </div>
    </div>
  );
};
