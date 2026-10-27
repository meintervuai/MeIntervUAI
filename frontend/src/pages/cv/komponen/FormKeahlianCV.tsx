// Komponen Tab: Daftar Keahlian Dinamis Berbasis Template (pages/cv/komponen/FormKeahlianCV.tsx)
import React, { useState } from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { Tombol } from '../../../components/ui/Tombol';
import { useBahasa } from '../../../i18n';
import { Wrench, Plus, X } from 'lucide-react';

interface PropertiFormKeahlianCV {
  daftarKeahlian: string[];
  setDaftarKeahlian: (items: string[]) => void;
  templateId?: string;
}

export const FormKeahlianCV: React.FC<PropertiFormKeahlianCV> = ({
  daftarKeahlian,
  setDaftarKeahlian,
  templateId = 'ivy_classic',
}) => {
  const { t } = useBahasa();

  // Menentukan grup kategori keahlian berdasarkan template terpilih
  const dapatkanGrupKategori = (): Array<{ id: string; label: string; placeholder: string }> => {
    if (templateId === 'tech_silicon') {
      return [
        { id: 'languages', label: t.cvBuilder.kategoriTechLanguages, placeholder: 'Python, TypeScript, Go, Java, SQL' },
        { id: 'frameworks', label: t.cvBuilder.kategoriTechFrameworks, placeholder: 'React, Node.js, FastAPI, Next.js, Django' },
        { id: 'tools', label: t.cvBuilder.kategoriTechDevTools, placeholder: 'Git, Docker, Kubernetes, GitHub Actions, Linux' },
        { id: 'cloud_db', label: t.cvBuilder.kategoriTechCloudDb, placeholder: 'PostgreSQL, Redis, AWS, Google Cloud, Supabase' },
      ];
    }
    if (templateId === 'europass_slate') {
      return [
        { id: 'bahasa', label: t.cvBuilder.kategoriEuropassBahasa, placeholder: 'Bahasa Indonesia (Native), English (C1), Deutsch (B1)' },
        { id: 'digital', label: t.cvBuilder.kategoriEuropassDigital, placeholder: 'Data Analysis, Cloud Infrastructure, Agile Scrum' },
      ];
    }
    if (templateId === 'bumn_nasional') {
      return [
        { id: 'hard_skills', label: t.cvBuilder.kategoriBumnHardSkills, placeholder: 'Analisis Keuangan, Manajemen Proyek, Riset Pasar' },
        { id: 'soft_skills', label: t.cvBuilder.kategoriBumnSoftSkills, placeholder: 'Kepemimpinan Tim, Komunikasi Publik, Negosiasi Bisnis' },
        { id: 'bahasa', label: t.cvBuilder.kategoriBumnBahasa, placeholder: 'Bahasa Indonesia (Fasih), Bahasa Inggris (Aktif)' },
      ];
    }
    // Default untuk ivy_classic, modern_ats, executive_din
    return [
      { id: 'technical', label: t.cvBuilder.kategoriGeneralTechnical, placeholder: 'Data Analysis, Strategic Planning, Financial Modeling' },
      { id: 'languages', label: t.cvBuilder.kategoriGeneralLanguages, placeholder: 'English (Fluent), Indonesian (Native), Mandarin (Basic)' },
      { id: 'tools', label: t.cvBuilder.kategoriGeneralTools, placeholder: 'Microsoft Excel / PowerBI, Python, Figma, SAP' },
    ];
  };

  const grupKategori = dapatkanGrupKategori();

  // State input per kategori
  const [inputState, setInputState] = useState<Record<string, string>>({});

  // Helper parsing item keahlian: apakah format 'Kategori: Nilai' atau teks polos
  const parsingKeahlian = () => {
    const hasil: Record<string, string[]> = {};
    grupKategori.forEach((g) => {
      hasil[g.id] = [];
    });
    const tanpaKategori: string[] = [];

    daftarKeahlian.forEach((item) => {
      const idxTitikDua = item.indexOf(':');
      if (idxTitikDua !== -1) {
        const katNama = item.slice(0, idxTitikDua).trim();
        const nilai = item.slice(idxTitikDua + 1).trim();
        // Cocokkan nama kategori dengan id atau label
        const targetGrup = grupKategori.find(
          (g) => g.id.toLowerCase() === katNama.toLowerCase() || g.label.toLowerCase() === katNama.toLowerCase()
        );
        if (targetGrup) {
          if (!hasil[targetGrup.id].includes(nilai)) {
            hasil[targetGrup.id].push(nilai);
          }
        } else {
          // Jika tidak cocok dengan grup template saat ini, masukkan ke grup pertama atau tanpa kategori
          hasil[grupKategori[0].id]?.push(item);
        }
      } else {
        tanpaKategori.push(item);
      }
    });

    // Jika ada skill lama tanpa prefix kategori, kelompokkan ke kategori pertama
    if (tanpaKategori.length > 0 && grupKategori[0]) {
      tanpaKategori.forEach((item) => {
        if (!hasil[grupKategori[0].id].includes(item)) {
          hasil[grupKategori[0].id].push(item);
        }
      });
    }

    return hasil;
  };

  const keahlianTerkelompok = parsingKeahlian();

  // Serialisasi kembali ke daftarKeahlian string[] (format: 'Kategori: Nilai')
  const simpanPerubahan = (baru: Record<string, string[]>) => {
    const hasilString: string[] = [];
    grupKategori.forEach((g) => {
      const items = baru[g.id] || [];
      items.forEach((it) => {
        hasilString.push(`${g.label}: ${it}`);
      });
    });
    setDaftarKeahlian(hasilString);
  };

  const tambahItemKategori = (grupId: string) => {
    const teks = (inputState[grupId] || '').trim();
    if (!teks) return;

    const split = teks
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const salinan = { ...keahlianTerkelompok };
    if (!salinan[grupId]) salinan[grupId] = [];

    split.forEach((it) => {
      if (!salinan[grupId].includes(it)) {
        salinan[grupId].push(it);
      }
    });

    simpanPerubahan(salinan);
    setInputState((prev) => ({ ...prev, [grupId]: '' }));
  };

  const hapusItemKategori = (grupId: string, itemDihapus: string) => {
    const salinan = { ...keahlianTerkelompok };
    if (salinan[grupId]) {
      salinan[grupId] = salinan[grupId].filter((it) => it !== itemDihapus);
    }
    simpanPerubahan(salinan);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <Kartu className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                {t.cvBuilder.bagianKeahlian}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {templateId === 'tech_silicon'
                  ? t.cvBuilder.tipTechSilicon
                  : templateId === 'bumn_nasional'
                  ? t.cvBuilder.tipBumnNasional
                  : templateId === 'europass_slate'
                  ? t.cvBuilder.tipEuropassSlate
                  : templateId === 'executive_din'
                  ? t.cvBuilder.tipExecutiveDin
                  : t.cvBuilder.keahlianTip}
              </p>
            </div>
          </div>
        </div>

        {/* Daftar Grup Input Dinamis Sesuai Template Resmi */}
        <div className="space-y-4">
          {grupKategori.map((grup) => {
            const daftar = keahlianTerkelompok[grup.id] || [];
            return (
              <div
                key={grup.id}
                className="p-3.5 sm:p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800">
                    {grup.label}
                  </label>
                  <span className="text-[11px] font-mono text-stone-500">
                    {daftar.length} items
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputState[grup.id] || ''}
                    onChange={(e) =>
                      setInputState((prev) => ({ ...prev, [grup.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        tambahItemKategori(grup.id);
                      }
                    }}
                    placeholder={grup.placeholder}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
                  />
                  <Tombol
                    varian="sekunder"
                    ukuran="sm"
                    onClick={() => tambahItemKategori(grup.id)}
                    className="text-xs font-bold min-h-[42px] px-3.5 rounded-xl border-stone-300 flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.cvBuilder.tambahKeahlian}</span>
                  </Tombol>
                </div>

                {/* Tag Pills Terdaftar */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {daftar.length === 0 ? (
                    <span className="text-[11px] text-stone-400 italic">
                      {t.cvBuilder.keahlianKosong}
                    </span>
                  ) : (
                    daftar.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-stone-800 text-xs font-medium border border-stone-200 shadow-2xs hover:border-stone-300 transition-colors"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => hapusItemKategori(grup.id, item)}
                          className="text-stone-400 hover:text-red-600 transition-colors ml-0.5"
                          title={t.cvBuilder.hapusItem}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Kartu>
    </div>
  );
};
