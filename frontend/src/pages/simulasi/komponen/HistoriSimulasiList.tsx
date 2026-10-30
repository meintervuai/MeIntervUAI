// HistoriSimulasiList.tsx - Daftar Riwayat Sesi Simulasi & Laporan Evaluasi
import React from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { useBahasa } from '../../../i18n';
import { Clock, FileText, ChevronRight, Award } from 'lucide-react';

export interface HistoriSimulasiItem {
  id: string;
  sesi_id?: string;
  target_role: string;
  mode_simulasi: string;
  skor_keseluruhan: number;
  persentil?: number;
  skor_car?: number;
  skor_komunikasi?: number;
  skor_teknis?: number;
  skor_bahasa_tubuh?: number;
  kontak_mata_rata_rata?: number;
  catatan_postur?: string;
  kutipan_bina?: string;
  durasi_formatted?: string;
  riwayat_pertanyaan?: any[];
  riwayat_chat?: any[];
  tanggal: string;
}

interface PropertiHistoriSimulasi {
  daftarHistori: HistoriSimulasiItem[];
  sedangMemuat: boolean;
  onPilihItem: (item: HistoriSimulasiItem) => void;
  onMulaiBaru: () => void;
}

export const HistoriSimulasiList: React.FC<PropertiHistoriSimulasi> = ({
  daftarHistori,
  sedangMemuat,
  onPilihItem,
  onMulaiBaru,
}) => {
  const { t } = useBahasa();

  if (sedangMemuat) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-stone-200 rounded-lg w-1/3" />
        <div className="space-y-3">
          <div className="h-24 bg-white rounded-2xl border border-stone-200" />
          <div className="h-24 bg-white rounded-2xl border border-stone-200" />
          <div className="h-24 bg-white rounded-2xl border border-stone-200" />
        </div>
      </div>
    );
  }

  if (daftarHistori.length === 0) {
    return (
      <Kartu className="p-8 sm:p-12 text-center bg-white border border-stone-200/90 rounded-3xl space-y-5 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center mx-auto shadow-xs">
          <FileText className="w-7 h-7" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
            {t.simulasiWawancara.historiKosongJudul}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            {t.simulasiWawancara.historiKosongDesc}
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onMulaiBaru}
            className="px-6 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs min-h-[44px] shadow-sm shadow-orange-700/20 transition-all cursor-pointer"
          >
            {t.simulasiWawancara.tabPersiapan}
          </button>
        </div>
      </Kartu>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="space-y-1">
        <h2 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
          {t.simulasiWawancara.historiJudul}
        </h2>
        <p className="text-xs text-stone-500">
          {t.simulasiWawancara.historiSubjudul}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {daftarHistori.map((item) => {
          const isLulus = item.skor_keseluruhan >= 70;
          return (
            <div
              key={item.id}
              onClick={() => onPilihItem(item)}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    isLulus
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-stone-900 group-hover:text-orange-700 transition-colors truncate">
                      {item.target_role}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                      {item.mode_simulasi}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {item.tanggal}
                    </span>
                    {item.durasi_formatted && (
                      <span className="text-stone-400 text-[11px]">
                        {item.durasi_formatted}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    {t.simulasiWawancara.skorBadge}
                  </span>
                  <span
                    className={`text-lg sm:text-xl font-extrabold ${
                      isLulus ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {item.skor_keseluruhan}/100
                  </span>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-stone-50 group-hover:bg-orange-50 border border-stone-200 group-hover:border-orange-200 text-stone-700 group-hover:text-orange-800 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px]"
                >
                  <span>{t.simulasiWawancara.tombolLihatLaporan}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-700 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
