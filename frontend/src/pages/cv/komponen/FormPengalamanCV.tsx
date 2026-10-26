// Komponen Tab: Riwayat Pengalaman Kerja (pages/cv/komponen/FormPengalamanCV.tsx)
import React from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { useBahasa } from '../../../i18n';
import { Briefcase, Trash2 } from 'lucide-react';

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
          <button
            type="button"
            onClick={tambahPengalaman}
            className="text-xs text-orange-800 hover:text-orange-950 font-bold min-h-[36px] flex items-center px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
          >
            {t.cvBuilder.tambahPengalaman}
          </button>
        </div>

        {daftarPengalaman.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            Belum ada pengalaman kerja / magang. Tekan "{t.cvBuilder.tambahPengalaman}" untuk menambahkan.
          </div>
        ) : (
          daftarPengalaman.map((exp, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => hapusPengalaman(idx)}
                className="absolute top-2.5 right-2.5 p-1 text-stone-400 hover:text-red-600 transition-colors"
                title={t.cvBuilder.hapusItem}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                <div>
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.namaPerusahaan}</span>
                  <input
                    type="text"
                    value={exp.perusahaan}
                    onChange={(e) => updatePengalaman(idx, 'perusahaan', e.target.value)}
                    placeholder="Contoh: PT Teknologi Bangsa"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.posisiJabatan}</span>
                  <input
                    type="text"
                    value={exp.posisi}
                    onChange={(e) => updatePengalaman(idx, 'posisi', e.target.value)}
                    placeholder="Contoh: Frontend Engineer"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.periodeWaktu}</span>
                <input
                  type="text"
                  value={exp.periode}
                  onChange={(e) => updatePengalaman(idx, 'periode', e.target.value)}
                  placeholder="Januari 2024 - Sekarang"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.deskripsiPekerjaan}</span>
                <textarea
                  rows={3}
                  value={exp.deskripsi}
                  onChange={(e) => updatePengalaman(idx, 'deskripsi', e.target.value)}
                  placeholder={t.cvBuilder.deskripsiPlaceholder}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white leading-relaxed"
                />
              </div>
            </div>
          ))
        )}
      </Kartu>
    </div>
  );
};
