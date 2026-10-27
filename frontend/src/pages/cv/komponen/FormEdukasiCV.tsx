// Komponen Tab: Riwayat Pendidikan Formal (pages/cv/komponen/FormEdukasiCV.tsx)
import React from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { KotakInput } from '../../../components/ui/KotakInput';
import { Tombol } from '../../../components/ui/Tombol';
import { useBahasa } from '../../../i18n';
import { GraduationCap, Trash2, Plus } from 'lucide-react';

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
          <Tombol
            varian="sekunder"
            ukuran="sm"
            onClick={tambahEdukasi}
            className="text-xs font-bold text-orange-900 border-orange-200 hover:bg-orange-50 min-h-[38px] px-3 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-orange-700" />
            <span>{t.cvBuilder.tambahEdukasi}</span>
          </Tombol>
        </div>

        {daftarEdukasi.length === 0 ? (
          <div className="text-center py-8 text-stone-500 text-xs">
            {t.cvBuilder.edukasiKosong}
          </div>
        ) : (
          daftarEdukasi.map((edu, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => hapusEdukasi(idx)}
                className="absolute top-2.5 right-2.5 p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                title={t.cvBuilder.hapusItem}
                aria-label={t.cvBuilder.hapusItem}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <KotakInput
                    label={t.cvBuilder.namaKampus}
                    value={edu.institusi}
                    onChange={(e) => updateEdukasi(idx, 'institusi', e.target.value)}
                    placeholder="Contoh: Universitas Indonesia"
                    autoComplete="organization"
                  />
                </div>
                <div>
                  <KotakInput
                    label={t.cvBuilder.jurusan}
                    value={edu.jurusan}
                    onChange={(e) => updateEdukasi(idx, 'jurusan', e.target.value)}
                    placeholder="Contoh: Ilmu Komputer / Teknik Informatika"
                  />
                </div>
                <div>
                  <KotakInput
                    label={t.cvBuilder.gelar}
                    value={edu.gelar}
                    onChange={(e) => updateEdukasi(idx, 'gelar', e.target.value)}
                    placeholder="Contoh: Sarjana Komputer (S.Kom)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <KotakInput
                      label={t.cvBuilder.tahunLulus}
                      value={edu.tahun}
                      onChange={(e) => updateEdukasi(idx, 'tahun', e.target.value)}
                      placeholder="2021 - 2025"
                    />
                  </div>
                  <div>
                    <KotakInput
                      label={t.cvBuilder.nilaiIpk}
                      value={edu.ipk}
                      onChange={(e) => updateEdukasi(idx, 'ipk', e.target.value)}
                      placeholder="3.85 / 4.00"
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
