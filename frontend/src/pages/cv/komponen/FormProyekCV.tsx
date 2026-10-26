// Komponen Tab: Proyek Portofolio (pages/cv/komponen/FormProyekCV.tsx)
import React from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { useBahasa } from '../../../i18n';
import { FolderGit2, Trash2 } from 'lucide-react';

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
          <button
            type="button"
            onClick={tambahProyek}
            className="text-xs text-orange-800 hover:text-orange-950 font-bold min-h-[36px] flex items-center px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
          >
            {t.cvBuilder.tambahProyek}
          </button>
        </div>

        {daftarProyek.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            Belum ada proyek portofolio. Tekan "{t.cvBuilder.tambahProyek}" untuk menambahkan karya unggulan Anda.
          </div>
        ) : (
          daftarProyek.map((proj, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => hapusProyek(idx)}
                className="absolute top-2.5 right-2.5 p-1 text-stone-400 hover:text-red-600 transition-colors"
                title={t.cvBuilder.hapusItem}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                <div>
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.namaProyek}</span>
                  <input
                    type="text"
                    value={proj.nama}
                    onChange={(e) => updateProyek(idx, 'nama', e.target.value)}
                    placeholder="Contoh: E-Commerce Web App"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.teknologiDigunakan}</span>
                  <input
                    type="text"
                    value={proj.teknologi}
                    onChange={(e) => updateProyek(idx, 'teknologi', e.target.value)}
                    placeholder="React, TypeScript, Tailwind, Node.js"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.cvBuilder.deskripsiProyek}</span>
                <textarea
                  rows={3}
                  value={proj.deskripsi}
                  onChange={(e) => updateProyek(idx, 'deskripsi', e.target.value)}
                  placeholder="Jelaskan peran, fitur utama, dan dampak terukur (misal: meningkatkan konversi 20%)..."
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
