// Komponen Tab: Pengaturan & Konfigurasi Visual CV (pages/cv/komponen/FormPengaturanCV.tsx)
import React from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { useBahasa } from '../../../i18n';
import { 
  LayoutTemplate, 
  FileCheck, 
  Palette, 
  Type, 
  Check 
} from 'lucide-react';
import { 
  KonfigurasiVisualCV, 
  TemplateId, 
  UkuranMargin, 
  PRESET_WARNA_PROFESIONAL 
} from '../tipePengaturanCV';

interface PropertiFormPengaturanCV {
  konfigurasiVisual: KonfigurasiVisualCV;
  setKonfigurasiVisual: React.Dispatch<React.SetStateAction<KonfigurasiVisualCV>>;
  urlFotoProfilAkun?: string;
}

export const FormPengaturanCV: React.FC<PropertiFormPengaturanCV> = ({
  konfigurasiVisual,
  setKonfigurasiVisual,
  urlFotoProfilAkun,
}) => {
  const { t } = useBahasa();

  const handleUpdate = <K extends keyof KonfigurasiVisualCV>(kunci: K, nilai: KonfigurasiVisualCV[K]) => {
    setKonfigurasiVisual((prev) => ({
      ...prev,
      [kunci]: nilai,
    }));
  };

  const pilihTemplateOtomatis = (id: TemplateId) => {
    // Template dengan tradisi pasfoto resmi (BUMN, Europass, DIN 5008) otomatis mengaktifkan foto
    const butuhFoto = id === 'bumn_nasional' || id === 'europass_slate' || id === 'executive_din';
    // Standar posisi foto resmi:
    // - BUMN / Nasional: Kiri Atas (standar dokumen administrasi BKN & Z-pattern nasional)
    // - Europass & Executive DIN: Kanan Atas (standar DIN 5008 & Europass resmi)
    const posisiOtomatis: 'kiri' | 'kanan' = id === 'bumn_nasional' ? 'kiri' : 'kanan';

    setKonfigurasiVisual((prev) => ({
      ...prev,
      templateId: id,
      tampilkanFoto: butuhFoto,
      posisiFoto: posisiOtomatis,
      urlFoto: butuhFoto ? (prev.urlFoto || urlFotoProfilAkun || '') : prev.urlFoto,
    }));
  };

  const daftarTemplate: { id: TemplateId; nama: string; badge: string; desc: string }[] = [
    {
      id: 'ivy_classic',
      nama: t.cvBuilder.templateIvyClassic,
      badge: 'Harvard & Yale',
      desc: t.cvBuilder.templateIvyClassicDesc,
    },
    {
      id: 'tech_silicon',
      nama: t.cvBuilder.templateTechSilicon,
      badge: 'FAANG & Silicon Valley',
      desc: t.cvBuilder.templateTechSiliconDesc,
    },
    {
      id: 'bumn_nasional',
      nama: t.cvBuilder.templateBumnNasional,
      badge: 'FHCI BUMN & Kemnaker',
      desc: t.cvBuilder.templateBumnNasionalDesc,
    },
    {
      id: 'europass_slate',
      nama: t.cvBuilder.templateEuropass,
      badge: 'Uni Eropa No 2241',
      desc: t.cvBuilder.templateEuropassDesc,
    },
    {
      id: 'executive_din',
      nama: t.cvBuilder.templateExecutiveDin,
      badge: 'DIN 5008 & ISO 216',
      desc: t.cvBuilder.templateExecutiveDinDesc,
    },
    {
      id: 'modern_ats',
      nama: t.cvBuilder.templateModernAts,
      badge: 'Modern Clean ATS',
      desc: t.cvBuilder.templateModernAtsDesc,
    },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. PILIHAN 5 TEMPLATE STANDAR RESMI */}
      <Kartu className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
            <LayoutTemplate className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              {t.cvBuilder.pilihTemplateJudul}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              100% Arsitektur 1-Kolom Lolos Scanner ATS
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {daftarTemplate.map((tmpl) => {
            const isDipilih = konfigurasiVisual.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => pilihTemplateOtomatis(tmpl.id)}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 min-h-[72px] ${
                  isDipilih
                    ? 'border-orange-600 bg-orange-50/70 shadow-sm ring-1 ring-orange-600'
                    : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/60'
                }`}
              >
                {/* Visual Wireframe / Skeleton Mini Pratinjau Struktur Template */}
                <div className={`w-14 h-16 rounded-lg border p-1.5 flex flex-col justify-between shrink-0 transition-colors ${
                  isDipilih ? 'bg-white border-orange-400 shadow-sm' : 'bg-stone-50/90 border-stone-200'
                }`}>
                  {/* Skeleton Header */}
                  {tmpl.id === 'ivy_classic' && (
                    <div className="space-y-1">
                      <div className="w-8 h-1.5 bg-stone-700 mx-auto rounded-full" />
                      <div className="w-10 h-0.5 bg-stone-400 mx-auto rounded-full" />
                      <div className="w-full h-px bg-stone-300 mt-1" />
                    </div>
                  )}
                  {tmpl.id === 'tech_silicon' && (
                    <div className="space-y-1">
                      <div className="w-7 h-1.5 bg-stone-700 rounded-full" />
                      <div className="w-9 h-0.5 bg-stone-400 rounded-full" />
                      <div className="w-full h-1 bg-orange-200 rounded-sm mt-0.5" />
                    </div>
                  )}
                  {tmpl.id === 'bumn_nasional' && (
                    <div className="space-y-1">
                      <div className="flex items-start gap-1">
                        <div className="w-2.5 h-3 bg-stone-300 rounded-[2px] shrink-0" />
                        <div className="space-y-0.5 flex-1">
                          <div className="w-6 h-1 bg-stone-700 rounded-full" />
                          <div className="w-4 h-0.5 bg-stone-400 rounded-full" />
                        </div>
                      </div>
                      <div className="w-full h-px bg-stone-400" />
                    </div>
                  )}
                  {tmpl.id === 'europass_slate' && (
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-3 bg-orange-600 rounded-full" />
                          <div className="w-5 h-1 bg-stone-700 rounded-full" />
                        </div>
                        <div className="w-2.5 h-3 bg-stone-300 rounded-[2px] shrink-0" />
                      </div>
                    </div>
                  )}
                  {tmpl.id === 'executive_din' && (
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <div className="w-6 h-1 bg-stone-800 rounded-full" />
                        <div className="w-2.5 h-3 bg-stone-300 rounded-[2px] shrink-0" />
                      </div>
                      <div className="w-full h-1 bg-stone-200/90 rounded-sm" />
                    </div>
                  )}
                  {tmpl.id === 'modern_ats' && (
                    <div className="space-y-1">
                      <div className="w-8 h-1.5 bg-orange-600 rounded-full" />
                      <div className="w-10 h-0.5 bg-stone-400 rounded-full" />
                      <div className="w-6 h-1 bg-orange-200 rounded-sm mt-0.5" />
                    </div>
                  )}

                  {/* Skeleton Body Lines */}
                  <div className="space-y-0.5 pt-0.5">
                    <div className="w-full h-0.5 bg-stone-300 rounded-full" />
                    <div className="w-4/5 h-0.5 bg-stone-200 rounded-full" />
                    <div className="w-3/5 h-0.5 bg-stone-200 rounded-full" />
                  </div>
                </div>

                {/* Deskripsi & Nama Template */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        {tmpl.nama}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700">
                        {tmpl.badge}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isDipilih ? 'bg-orange-700 text-white shadow-sm' : 'border border-stone-300 bg-stone-50 text-transparent'
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {tmpl.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Kartu>

      {/* 2. FORMAT KERTAS & MARGIN */}
      <Kartu className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              {t.cvBuilder.formatKertasJudul}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Standar ISO 216 & Standar Amerika
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pilihan Kertas */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              Ukuran Kertas
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUpdate('ukuranKertas', 'a4')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all min-h-[44px] ${
                  konfigurasiVisual.ukuranKertas === 'a4'
                    ? 'border-orange-600 bg-orange-50 text-orange-800 font-bold'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                A4 (ISO 216)
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('ukuranKertas', 'letter')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all min-h-[44px] ${
                  konfigurasiVisual.ukuranKertas === 'letter'
                    ? 'border-orange-600 bg-orange-50 text-orange-800 font-bold'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                US Letter
              </button>
            </div>
          </div>

          {/* Pilihan Margin */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              {t.cvBuilder.marginLabel}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['kompak', 'standar', 'lega'] as UkuranMargin[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleUpdate('margin', m)}
                  className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-xl border text-center capitalize transition-all min-h-[44px] ${
                    konfigurasiVisual.margin === m
                      ? 'border-orange-600 bg-orange-50 text-orange-800 font-bold'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {m === 'kompak' ? '12 mm' : m === 'standar' ? '18 mm' : '24 mm'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Kartu>

      {/* 3. WARNA ELEMEN & HEADING ACCENT */}
      <Kartu className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              {t.cvBuilder.warnaElemenJudul}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pilih dari preset kurasi atau atur kode warna manual
            </p>
          </div>
        </div>

        {/* Preset Palet Warna */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-stone-800">
            {t.cvBuilder.warnaPresetLabel}
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_WARNA_PROFESIONAL.map((p) => {
              const aktif = konfigurasiVisual.warnaAksen.toLowerCase() === p.hex.toLowerCase();
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleUpdate('warnaAksen', p.hex)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 min-h-[64px] ${
                    aktif
                      ? 'border-orange-600 bg-orange-50/80 shadow-sm ring-1 ring-orange-600'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shadow-inner border border-black/10 shrink-0"
                    style={{ backgroundColor: p.hex }}
                  />
                  <span className="text-[10px] font-semibold text-stone-800 truncate w-full">
                    {p.nama.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Hex & Native Color Picker */}
        <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-3">
          <div>
            <span className="block text-xs font-bold text-stone-800">
              {t.cvBuilder.warnaManualLabel}
            </span>
            <span className="text-[11px] text-stone-500">
              Mendukung kode Hex (#RGB)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <input
                type="color"
                value={konfigurasiVisual.warnaAksen}
                onChange={(e) => handleUpdate('warnaAksen', e.target.value)}
                className="w-10 h-10 p-0.5 rounded-lg border border-stone-300 cursor-pointer bg-white"
              />
            </div>
            <input
              type="text"
              value={konfigurasiVisual.warnaAksen}
              onChange={(e) => handleUpdate('warnaAksen', e.target.value)}
              placeholder="#111827"
              className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-600 text-stone-900 bg-white"
            />
          </div>
        </div>
      </Kartu>

      {/* 4. SKALA UKURAN TEKS (TITLE, SUBTITLE, H1, H2/H3, BODY P) */}
      <Kartu className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              {t.cvBuilder.tipografiJudul}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pengaturan ukuran font dinamis dalam satuan pixel (px)
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Title (Nama) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-stone-800 font-semibold">
              <span>{t.cvBuilder.ukuranTitleLabel}</span>
              <span className="font-mono text-stone-900 font-bold bg-stone-100 px-2 py-0.5 rounded">
                {konfigurasiVisual.ukuranTitle} px
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={28}
              step={1}
              value={konfigurasiVisual.ukuranTitle}
              onChange={(e) => handleUpdate('ukuranTitle', Number(e.target.value))}
              className="w-full accent-orange-700 cursor-pointer"
            />
          </div>

          {/* Subtitle (Target Role) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-stone-800 font-semibold">
              <span>{t.cvBuilder.ukuranSubtitleLabel}</span>
              <span className="font-mono text-stone-900 font-bold bg-stone-100 px-2 py-0.5 rounded">
                {konfigurasiVisual.ukuranSubtitle} px
              </span>
            </div>
            <input
              type="range"
              min={12}
              max={16}
              step={1}
              value={konfigurasiVisual.ukuranSubtitle}
              onChange={(e) => handleUpdate('ukuranSubtitle', Number(e.target.value))}
              className="w-full accent-orange-700 cursor-pointer"
            />
          </div>

          {/* Heading Section H1 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-stone-800 font-semibold">
              <span>{t.cvBuilder.ukuranH1Label}</span>
              <span className="font-mono text-stone-900 font-bold bg-stone-100 px-2 py-0.5 rounded">
                {konfigurasiVisual.ukuranH1} px
              </span>
            </div>
            <input
              type="range"
              min={13}
              max={18}
              step={1}
              value={konfigurasiVisual.ukuranH1}
              onChange={(e) => handleUpdate('ukuranH1', Number(e.target.value))}
              className="w-full accent-orange-700 cursor-pointer"
            />
          </div>

          {/* Sub-Heading Pekerjaan/Edukasi H2/H3 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-stone-800 font-semibold">
              <span>{t.cvBuilder.ukuranH2H3Label}</span>
              <span className="font-mono text-stone-900 font-bold bg-stone-100 px-2 py-0.5 rounded">
                {konfigurasiVisual.ukuranH2H3} px
              </span>
            </div>
            <input
              type="range"
              min={11}
              max={14}
              step={1}
              value={konfigurasiVisual.ukuranH2H3}
              onChange={(e) => handleUpdate('ukuranH2H3', Number(e.target.value))}
              className="w-full accent-orange-700 cursor-pointer"
            />
          </div>

          {/* Body Text & Bullets P */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-stone-800 font-semibold">
              <span>{t.cvBuilder.ukuranBodyLabel}</span>
              <span className="font-mono text-stone-900 font-bold bg-stone-100 px-2 py-0.5 rounded">
                {konfigurasiVisual.ukuranBody} px
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={12}
              step={0.5}
              value={konfigurasiVisual.ukuranBody}
              onChange={(e) => handleUpdate('ukuranBody', Number(e.target.value))}
              className="w-full accent-orange-700 cursor-pointer"
            />
            <p className="text-[10px] text-stone-500 pt-0.5">
              *Batas minimum rekomendasi mesin ATS adalah 10px (~7.5pt) agar dokumen tetap dapat dipindai.
            </p>
          </div>
        </div>
      </Kartu>
    </div>
  );
};
