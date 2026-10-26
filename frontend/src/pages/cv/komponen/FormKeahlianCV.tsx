// Komponen Tab: Daftar Keahlian Teknis & Non-Teknis (pages/cv/komponen/FormKeahlianCV.tsx)
import React, { useState } from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { Tombol } from '../../../components/ui/Tombol';
import { useBahasa } from '../../../i18n';
import { Wrench } from 'lucide-react';

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
  const [inputKeahlian, setInputKeahlian] = useState('');

  const tambahKeahlian = () => {
    if (!inputKeahlian.trim()) return;
    const split = inputKeahlian
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !daftarKeahlian.includes(s));
    setDaftarKeahlian([...daftarKeahlian, ...split]);
    setInputKeahlian('');
  };

  const hapusKeahlian = (nama: string) => {
    setDaftarKeahlian(daftarKeahlian.filter((k) => k !== nama));
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <Kartu className="p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-orange-700" />
          <span>{t.cvBuilder.bagianKeahlian}</span>
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputKeahlian}
            onChange={(e) => setInputKeahlian(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                tambahKeahlian();
              }
            }}
            placeholder={
              templateId === 'tech_silicon'
                ? 'Contoh: Python, TypeScript, React, Docker, PostgreSQL'
                : templateId === 'bumn_nasional'
                ? 'Contoh: Manajemen Proyek, Analisis Risiko, Negosiasi Bisnis, Pelaporan Keuangan'
                : templateId === 'europass_slate'
                ? 'Contoh: English (C1), Bahasa Indonesia (Mother Tongue), DigComp Information Processing'
                : t.cvBuilder.keahlianPlaceholder
            }
            className="flex-1 px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
          />
          <Tombol
            varian="sekunder"
            ukuran="sm"
            onClick={tambahKeahlian}
            className="text-xs font-bold min-h-[44px] px-4 rounded-xl border-stone-300"
          >
            {t.cvBuilder.tambahKeahlian}
          </Tombol>
        </div>
        <p className="text-[11px] text-stone-500">
          {templateId === 'tech_silicon'
            ? 'Tip Tech ATS: Masukkan rumpun bahasa pemrograman, framework, database, dan developer tools Anda.'
            : templateId === 'bumn_nasional'
            ? 'Tip BUMN: Utamakan kompetensi teknis pekerjaan, sertifikasi profesi, dan kapabilitas kepemimpinan.'
            : templateId === 'europass_slate'
            ? 'Tip Europass: Cantumkan bahasa dengan standar CEFR dan keterampilan digital sesuai kerangka kerja Uni Eropa.'
            : t.cvBuilder.keahlianTip}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {daftarKeahlian.length === 0 ? (
            <span className="text-stone-400 text-xs italic">
              {t.cvBuilder.keahlianKosong}
            </span>
          ) : (
            daftarKeahlian.map((k, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200 hover:bg-stone-200/70 transition-colors"
              >
                <span>{k}</span>
                <button
                  type="button"
                  onClick={() => hapusKeahlian(k)}
                  className="text-stone-400 hover:text-red-600 font-bold ml-1 text-sm leading-none"
                  title={t.cvBuilder.hapusItem}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </Kartu>
    </div>
  );
};
