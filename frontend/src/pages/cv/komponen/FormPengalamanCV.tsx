// Komponen Tab: Riwayat Pengalaman Kerja (pages/cv/komponen/FormPengalamanCV.tsx)
import React from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { KotakInput } from '../../../components/ui/KotakInput';
import { Tombol } from '../../../components/ui/Tombol';
import { useBahasa } from '../../../i18n';
import { Briefcase, Trash2, Plus } from 'lucide-react';

export interface ItemPengalaman {
  perusahaan: string;
  posisi: string;
  periode: string;
  deskripsi: string;
}

interface PropertiFormPengalamanCV {
  daftarPengalaman: ItemPengalaman[];
  setDaftarPengalaman: (items: ItemPengalaman[]) => void;
}

export const FormPengalamanCV: React.FC<PropertiFormPengalamanCV> = ({
  daftarPengalaman,
  setDaftarPengalaman,
}) => {
  const { t } = useBahasa();

  const tambahPengalaman = () => {
    setDaftarPengalaman([
      ...daftarPengalaman,
      { perusahaan: '', posisi: '', periode: '', deskripsi: '' },
    ]);
  };

  const hapusPengalaman = (idx: number) => {
    setDaftarPengalaman(daftarPengalaman.filter((_, i) => i !== idx));
  };

  const updatePengalaman = (idx: number, field: keyof ItemPengalaman, val: string) => {
    const baru = [...daftarPengalaman];
    baru[idx][field] = val;
    setDaftarPengalaman(baru);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <Kartu className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-orange-700" />
            <span>{t.cvBuilder.bagianPengalaman}</span>
          </h3>
          <Tombol
            varian="sekunder"
            ukuran="sm"
            onClick={tambahPengalaman}
            className="text-xs font-bold text-orange-900 border-orange-200 hover:bg-orange-50 min-h-[38px] px-3 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-orange-700" />
            <span>{t.cvBuilder.tambahPengalaman}</span>
          </Tombol>
        </div>

        {daftarPengalaman.length === 0 ? (
          <div className="text-center py-8 text-stone-500 text-xs">
            {t.cvBuilder.pengalamanKosong}
          </div>
        ) : (
          daftarPengalaman.map((exp, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => hapusPengalaman(idx)}
                className="absolute top-2.5 right-2.5 p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                title={t.cvBuilder.hapusItem}
                aria-label={t.cvBuilder.hapusItem}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <KotakInput
                    label={t.cvBuilder.namaPerusahaan}
                    value={exp.perusahaan}
                    onChange={(e) => updatePengalaman(idx, 'perusahaan', e.target.value)}
                    placeholder="Contoh: PT Teknologi Bangsa"
                  />
                </div>
                <div>
                  <KotakInput
                    label={t.cvBuilder.posisiJabatan}
                    value={exp.posisi}
                    onChange={(e) => updatePengalaman(idx, 'posisi', e.target.value)}
                    placeholder="Contoh: Frontend Engineer"
                  />
                </div>
              </div>
              <div>
                <KotakInput
                  label={t.cvBuilder.periodeWaktu}
                  value={exp.periode}
                  onChange={(e) => updatePengalaman(idx, 'periode', e.target.value)}
                  placeholder="Januari 2024 - Sekarang"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
                  {t.cvBuilder.deskripsiPekerjaan}
                </label>
                <textarea
                  rows={3}
                  value={exp.deskripsi}
                  onChange={(e) => updatePengalaman(idx, 'deskripsi', e.target.value)}
                  placeholder={t.cvBuilder.deskripsiPlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>
            </div>
          ))
        )}
      </Kartu>
    </div>
  );
};
