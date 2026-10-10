// Komponen IndikatorToken: menampilkan saldo kredit token AI pengguna dan popover rincian biaya simulasi.
import React, { useState } from 'react';
import { Coins, Info, HelpCircle } from 'lucide-react';

interface PropertiIndikatorToken {
  saldo: number;
}

export const IndikatorToken: React.FC<PropertiIndikatorToken> = ({ saldo }) => {
  const [bukaDetail, setBukaDetail] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setBukaDetail(!bukaDetail)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors focus-visible:outline-amber-600"
        title="Klik untuk melihat rincian biaya token simulasi"
      >
        <Coins className="w-4 h-4 text-amber-600" />
        <span>{saldo} Token</span>
        <HelpCircle className="w-3.5 h-3.5 text-amber-500 opacity-70" />
      </button>

      {bukaDetail && (
        <div className="absolute right-0 mt-2 w-72 p-4 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-600" /> Saldo Token Anda
            </span>
            <span className="text-sm font-extrabold text-amber-600">{saldo}</span>
          </div>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Token digunakan untuk menjalankan analisis CV dan simulasi wawancara AI.
          </p>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>Analisis CV & Role:</span>
              <span className="font-semibold text-slate-900">5 Token</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>Simulasi Mode Teks:</span>
              <span className="font-semibold text-slate-900">10 Token</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>Simulasi Mode Suara:</span>
              <span className="font-semibold text-slate-900">15 Token</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Simulasi Video & Avatar:</span>
              <span className="font-semibold text-slate-900">25 Token</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] text-brand-600 font-medium">
            <Info className="w-3.5 h-3.5" />
            <span>Butuh tambahan token? Hubungi tim CSM.</span>
          </div>
        </div>
      )}
    </div>
  );
};
