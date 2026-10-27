// Komponen Tab: Proyek Portofolio (pages/cv/komponen/FormProyekCV.tsx)
import React from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { KotakInput } from '../../../components/ui/KotakInput';
import { Tombol } from '../../../components/ui/Tombol';
import { useBahasa } from '../../../i18n';
import { FolderGit2, Trash2, Plus } from 'lucide-react';

export interface ItemProyek {
  nama: string;
  teknologi: string;
  deskripsi: string;
}

interface PropertiFormProyekCV {
  daftarProyek: ItemProyek[];
  setDaftarProyek: (items: ItemProyek[]) => void;
}

export const FormProyekCV: React.FC<PropertiFormProyekCV> = ({
  daftarProyek,
  setDaftarProyek,
}) => {
  const { t } = useBahasa();

  const tambahProyek = () => {
    setDaftarProyek([
      ...daftarProyek,
      { nama: '', teknologi: '', deskripsi: '' },
    ]);
  };

  const hapusProyek = (idx: number) => {
    setDaftarProyek(daftarProyek.filter((_, i) => i !== idx));
  };

  const updateProyek = (idx: number, field: keyof ItemProyek, val: string) => {
    const baru = [...daftarProyek];
    baru[idx][field] = val;
    setDaftarProyek(baru);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <Kartu className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-orange-700" />
            <span>{t.cvBuilder.bagianProyek}</span>
          </h3>
          <Tombol
            varian="sekunder"
            ukuran="sm"
            onClick={tambahProyek}
            className="text-xs font-bold text-orange-900 border-orange-200 hover:bg-orange-50 min-h-[38px] px-3 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-orange-700" />
            <span>{t.cvBuilder.tambahProyek}</span>
          </Tombol>
        </div>

        {daftarProyek.length === 0 ? (
          <div className="text-center py-8 text-stone-500 text-xs">
            {t.cvBuilder.proyekKosong}
          </div>
        ) : (
          daftarProyek.map((proj, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => hapusProyek(idx)}
                className="absolute top-2.5 right-2.5 p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                title={t.cvBuilder.hapusItem}
                aria-label={t.cvBuilder.hapusItem}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <KotakInput
                    label={t.cvBuilder.namaProyek}
                    value={proj.nama}
                    onChange={(e) => updateProyek(idx, 'nama', e.target.value)}
                    placeholder="Contoh: E-Commerce Web App"
                  />
                </div>
                <div>
                  <KotakInput
                    label={t.cvBuilder.teknologiDigunakan}
                    value={proj.teknologi}
                    onChange={(e) => updateProyek(idx, 'teknologi', e.target.value)}
                    placeholder="React, TypeScript, Tailwind, Node.js"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
                  {t.cvBuilder.deskripsiProyek}
                </label>
                <textarea
                  rows={3}
                  value={proj.deskripsi}
                  onChange={(e) => updateProyek(idx, 'deskripsi', e.target.value)}
                  placeholder={t.cvBuilder.proyekDeskripsiPlaceholder}
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
