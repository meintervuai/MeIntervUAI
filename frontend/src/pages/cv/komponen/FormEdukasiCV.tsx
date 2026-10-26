// Komponen Tab: Riwayat Pendidikan Formal (pages/cv/komponen/FormEdukasiCV.tsx)
import React from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { useBahasa } from '../../../i18n';
import { GraduationCap, Trash2 } from 'lucide-react';

export interface ItemEdukasi {
  institusi: string;
  jurusan: string;
  gelar: string;
  tahun: string;
  ipk: string;
}

interface PropertiFormEdukasiCV {
  daftarEdukasi: ItemEdukasi[];
  setDaftarEdukasi: (items: ItemEdukasi[]) => void;
}

export const FormEdukasiCV: React.FC<PropertiFormEdukasiCV> = ({
  daftarEdukasi,
  setDaftarEdukasi,
}) => {
  const { t } = useBahasa();

  const tambahEdukasi = () => {
    setDaftarEdukasi([
      ...daftarEdukasi,
      { institusi: '', jurusan: '', gelar: '', tahun: '', ipk: '' },
    ]);
  };

  const hapusEdukasi = (idx: number) => {
    setDaftarEdukasi(daftarEdukasi.filter((_, i) => i !== idx));
  };

  const updateEdukasi = (idx: number, field: keyof ItemEdukasi, val: string) => {
    const baru = [...daftarEdukasi];
    baru[idx][field] = val;
    setDaftarEdukasi(baru);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <Kartu className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-orange-700" />
            <span>{t.cvBuilder.bagianEdukasi}</span>
          </h3>
          <button
            type="button"
            onClick={tambahEdukasi}
            className="text-xs text-orange-800 hover:text-orange-950 font-bold min-h-[36px] flex items-center px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
          >
            {t.cvBuilder.tambahEdukasi}
          </button>
        </div>

        {daftarEdukasi.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            Belum ada data pendidikan. Tekan "{t.cvBuilder.tambahEdukasi}" di atas.
          </div>
        ) : (
          daftarEdukasi.map((edu, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => hapusEdukasi(idx)}
                className="absolute top-2.5 right-2.5 p-1 text-stone-400 hover:text-red-600 transition-colors"
                title={t.cvBuilder.hapusItem}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                <div>
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.namaKampus}</span>
                  <input
                    type="text"
                    value={edu.institusi}
                    onChange={(e) => updateEdukasi(idx, 'institusi', e.target.value)}
                    placeholder="Contoh: Universitas Indonesia"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.jurusan}</span>
                  <input
                    type="text"
                    value={edu.jurusan}
                    onChange={(e) => updateEdukasi(idx, 'jurusan', e.target.value)}
                    placeholder="Contoh: Ilmu Komputer / Teknik Informatika"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.gelar}</span>
                  <input
                    type="text"
                    value={edu.gelar}
                    onChange={(e) => updateEdukasi(idx, 'gelar', e.target.value)}
                    placeholder="Contoh: Sarjana Komputer (S.Kom)"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.tahunLulus}</span>
                    <input
                      type="text"
                      value={edu.tahun}
                      onChange={(e) => updateEdukasi(idx, 'tahun', e.target.value)}
                      placeholder="2021 - 2025"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.nilaiIpk}</span>
                    <input
                      type="text"
                      value={edu.ipk}
                      onChange={(e) => updateEdukasi(idx, 'ipk', e.target.value)}
                      placeholder="3.85 / 4.00"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </Kartu>
    </div>
  );
};
