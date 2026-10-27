// Komponen Tab: Pengaturan & Konfigurasi Visual CV (pages/cv/komponen/FormPengaturanCV.tsx)
import React, { useState } from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { useBahasa } from '../../../i18n';
import { 
  LayoutTemplate, 
  FileCheck, 
  Palette, 
  Type, 
  Check,
  Lock,
  Info
} from 'lucide-react';
import { 
  KonfigurasiVisualCV, 
  TemplateId, 
  UkuranMargin, 
  JenisFontCV,
  PRESET_WARNA_PROFESIONAL 
} from '../tipePengaturanCV';

interface PropertiFormPengaturanCV {
  konfigurasiVisual: KonfigurasiVisualCV;
  setKonfigurasiVisual: React.Dispatch<React.SetStateAction<KonfigurasiVisualCV>>;
  urlFotoProfilAkun?: string;
}

type SubTabPengaturan = 'template' | 'kertas' | 'warna' | 'tipografi';

export const FormPengaturanCV: React.FC<PropertiFormPengaturanCV> = ({
  konfigurasiVisual,
  setKonfigurasiVisual,
  urlFotoProfilAkun,
}) => {
  const { t } = useBahasa();
  const [subTabAktif, setSubTabAktif] = useState<SubTabPengaturan>('template');

  const handleUpdate = <K extends keyof KonfigurasiVisualCV>(kunci: K, nilai: KonfigurasiVisualCV[K]) => {
    setKonfigurasiVisual((prev) => ({
      ...prev,
      [kunci]: nilai,
    }));
  };

  const pilihTemplateOtomatis = (id: TemplateId) => {
    const butuhFoto = id === 'bumn_nasional' || id === 'europass_slate' || id === 'executive_din' || id === 'modern_ats';
    const posisiOtomatis: 'kiri' | 'kanan' = (id === 'bumn_nasional' || id === 'modern_ats') ? 'kiri' : 'kanan';

    // Sesuaikan font default baku sesuai template jika template mewajibkan
    let fontDefault: JenisFontCV = 'inter';
    if (id === 'ivy_classic') {
      fontDefault = 'times';
    } else if (id === 'executive_din') {
      fontDefault = 'roboto';
    } else if (id === 'tech_silicon' || id === 'modern_ats' || id === 'bumn_nasional' || id === 'europass_slate') {
      fontDefault = 'inter';
    }

    setKonfigurasiVisual((prev) => ({
      ...prev,
      templateId: id,
      tampilkanFoto: butuhFoto,
      posisiFoto: posisiOtomatis,
      jenisFont: id === 'ivy_classic' ? 'times' : (prev.jenisFont || fontDefault),
      // Harvard OCS monokrom wajib
      warnaAksen: id === 'ivy_classic' ? '#111827' : prev.warnaAksen,
      warnaHeading: id === 'ivy_classic' ? '#111827' : prev.warnaHeading,
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

  // Aturan batasan template
  const isIvyClassic = konfigurasiVisual.templateId === 'ivy_classic';
  const isDin = konfigurasiVisual.templateId === 'executive_din';
  const templateTerpilih = daftarTemplate.find((t) => t.id === konfigurasiVisual.templateId) || daftarTemplate[0];

  // Opsi Font Family yang diizinkan untuk template terpilih
  const daftarFont: { id: JenisFontCV; nama: string; kategori: 'serif' | 'sans' }[] = [
    { id: 'inter', nama: t.cvBuilder.fontInter, kategori: 'sans' },
    { id: 'roboto', nama: t.cvBuilder.fontRoboto, kategori: 'sans' },
    { id: 'times', nama: t.cvBuilder.fontTimes, kategori: 'serif' },
    { id: 'georgia', nama: t.cvBuilder.fontGeorgia, kategori: 'serif' },
    { id: 'garamond', nama: t.cvBuilder.fontGaramond, kategori: 'serif' },
  ];

  const fontYangTersedia = isIvyClassic 
    ? daftarFont.filter((f) => f.kategori === 'serif') 
    : daftarFont;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* SUB-NAVIGASI TAB PENGATURAN HORIZONTAL */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-2xl border border-stone-200 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setSubTabAktif('template')}
          className={`flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[44px] cursor-pointer ${
            subTabAktif === 'template'
              ? 'bg-white text-orange-900 shadow-sm border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <LayoutTemplate className="w-4 h-4 text-orange-700" />
          <span>{t.cvBuilder.subTabTemplate}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTabAktif('kertas')}
          className={`flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[44px] cursor-pointer ${
            subTabAktif === 'kertas'
              ? 'bg-white text-orange-900 shadow-sm border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <FileCheck className="w-4 h-4 text-orange-700" />
          <span>{t.cvBuilder.subTabKertas}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTabAktif('warna')}
          className={`flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[44px] cursor-pointer ${
            subTabAktif === 'warna'
              ? 'bg-white text-orange-900 shadow-sm border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <Palette className="w-4 h-4 text-orange-700" />
          <span>{t.cvBuilder.subTabWarna}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTabAktif('tipografi')}
          className={`flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[44px] cursor-pointer ${
            subTabAktif === 'tipografi'
              ? 'bg-white text-orange-900 shadow-sm border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <Type className="w-4 h-4 text-orange-700" />
          <span>{t.cvBuilder.subTabTipografi}</span>
        </button>
      </div>

      {/* KONTEN TAB 1: BENTO GRID TEMPLATE (RESPONSIF & SKETSA KARTU) */}
      {subTabAktif === 'template' && (
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
                {t.cvBuilder.arsitekturScannerAtsBadge}
              </p>
            </div>
          </div>

          {/* Tata Letak Bento Grid Responsif (1 kol pada ponsel kecil, 2 kol pada tablet, 3 kol pada laptop/desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {daftarTemplate.map((tmpl) => {
              const isDipilih = konfigurasiVisual.templateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => pilihTemplateOtomatis(tmpl.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 min-h-[108px] cursor-pointer ${
                    isDipilih
                      ? 'border-orange-600 bg-orange-50/70 shadow-sm ring-1 ring-orange-600'
                      : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3 w-full">
                    {/* Visual Wireframe / Skeleton Mini Pratinjau Struktur Template */}
                    <div className={`w-12 h-14 rounded-lg border p-1.5 flex flex-col justify-between shrink-0 transition-colors ${
                      isDipilih ? 'bg-white border-orange-400 shadow-sm' : 'bg-stone-50/90 border-stone-200'
                    }`}>
                      {/* Skeleton Header */}
                      {tmpl.id === 'ivy_classic' && (
                        <div className="space-y-1">
                          <div className="w-7 h-1 bg-stone-800 mx-auto rounded-full" />
                          <div className="w-8 h-0.5 bg-stone-400 mx-auto rounded-full" />
                          <div className="w-full h-px bg-stone-300 mt-1" />
                        </div>
                      )}
                      {tmpl.id === 'tech_silicon' && (
                        <div className="space-y-1">
                          <div className="w-6 h-1 bg-stone-800 rounded-full" />
                          <div className="w-8 h-0.5 bg-stone-400 rounded-full" />
                          <div className="w-full h-0.5 bg-orange-400 rounded-sm mt-0.5" />
                        </div>
                      )}
                      {tmpl.id === 'bumn_nasional' && (
                        <div className="space-y-1">
                          <div className="flex items-start gap-1">
                            <div className="w-2.5 h-3 bg-stone-400 rounded-[1px] shrink-0" />
                            <div className="space-y-0.5 flex-1">
                              <div className="w-5 h-1 bg-stone-800 rounded-full" />
                              <div className="w-3 h-0.5 bg-stone-400 rounded-full" />
                            </div>
                          </div>
                          <div className="w-full h-px bg-stone-400" />
                        </div>
                      )}
                      {tmpl.id === 'europass_slate' && (
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-0.5">
                              <div className="w-1 h-3 bg-orange-600 rounded-full" />
                              <div className="w-4 h-1 bg-stone-800 rounded-full" />
                            </div>
                            <div className="w-2.5 h-3 bg-stone-400 rounded-[1px] shrink-0" />
                          </div>
                        </div>
                      )}
                      {tmpl.id === 'executive_din' && (
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <div className="w-5 h-1 bg-stone-800 rounded-full" />
                            <div className="w-2.5 h-3 bg-stone-400 rounded-[1px] shrink-0" />
                          </div>
                          <div className="w-full h-0.5 bg-stone-300 rounded-sm" />
                        </div>
                      )}
                      {tmpl.id === 'modern_ats' && (
                        <div className="flex h-full gap-1 items-stretch -m-1">
                          <div className="w-3.5 bg-stone-800 rounded-l p-0.5 flex flex-col items-center gap-0.5">
                            <div className="w-2 h-2 rounded-full bg-stone-300" />
                            <div className="w-1.5 h-0.5 bg-stone-500 rounded-full" />
                          </div>
                          <div className="flex-1 py-1 pr-1 space-y-0.5">
                            <div className="w-5 h-0.5 bg-stone-900 rounded-full" />
                            <div className="w-3 h-0.5 bg-stone-400 rounded-full" />
                            <div className="w-full h-px bg-stone-200" />
                          </div>
                        </div>
                      )}

                      {/* Skeleton Body Lines */}
                      {tmpl.id !== 'modern_ats' && (
                        <div className="space-y-0.5 pt-0.5">
                          <div className="w-full h-0.5 bg-stone-300 rounded-full" />
                          <div className="w-4/5 h-0.5 bg-stone-200 rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Judul & Badge Template */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {tmpl.nama}
                        </span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isDipilih ? 'bg-orange-700 text-white shadow-xs' : 'border border-stone-300 bg-stone-50 text-transparent'
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      </div>
                      <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 mt-1">
                        {tmpl.badge}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Kotak Info Dinamis Terpusat: Keterangan Template yang Sedang Terpilih */}
          <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-orange-950">
                {templateTerpilih.nama} — {templateTerpilih.badge}
              </span>
              <p className="text-[11px] text-stone-700 mt-0.5 leading-relaxed">
                {templateTerpilih.desc}
              </p>
            </div>
          </div>
        </Kartu>
      )}

      {/* KONTEN TAB 2: FORMAT KERTAS & MARGIN */}
      {subTabAktif === 'kertas' && (
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
                {t.cvBuilder.standarKertasSubjudul}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pilihan Kertas */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800">
                {t.cvBuilder.formatKertasJudul}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdate('ukuranKertas', 'a4')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all min-h-[44px] cursor-pointer ${
                    konfigurasiVisual.ukuranKertas === 'a4'
                      ? 'border-orange-600 bg-orange-50 text-orange-800 font-bold'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  A4 (ISO 216)
                </button>
                <button
                  type="button"
                  disabled={isDin}
                  onClick={() => handleUpdate('ukuranKertas', 'letter')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all min-h-[44px] cursor-pointer ${
                    isDin ? 'opacity-40 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400' :
                    konfigurasiVisual.ukuranKertas === 'letter'
                      ? 'border-orange-600 bg-orange-50 text-orange-800 font-bold'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  US Letter {isDin && '(DIN Wajib A4)'}
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
                    className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-xl border text-center capitalize transition-all min-h-[44px] cursor-pointer ${
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
      )}

      {/* KONTEN TAB 3: SKEMA WARNA ELEMEN (AKSEN, HEADING, GARIS, TEKS) */}
      {subTabAktif === 'warna' && (
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
                {t.cvBuilder.pilihPresetWarnaSubjudul}
              </p>
            </div>
          </div>

          {/* Jika Template Ivy Classic: Terkunci Monokrom Wajib Sesuai Standar Harvard OCS */}
          {isIvyClassic ? (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                <Lock className="w-4 h-4 text-stone-600" />
                <span>{t.cvBuilder.warnaTerkunciMonokrom}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.cvBuilder.warnaTerkunciDesc}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-7 h-7 rounded-lg bg-[#111827] border border-black/20 shadow-xs" />
                <span className="text-xs font-mono font-bold text-stone-800">#111827 (Classic Noir)</span>
              </div>
            </div>
          ) : (
            <>
              {/* Preset Palet Warna Aksen */}
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
                        onClick={() => {
                          handleUpdate('warnaAksen', p.hex);
                          handleUpdate('warnaHeading', p.hex);
                        }}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 min-h-[64px] cursor-pointer ${
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

              {/* Rincian Pewarnaan Spesifik Elemen (Heading H1/H2, Garis Divider, Teks Isi) */}
              <div className="pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Warna Heading */}
                <div className="space-y-1.5 p-3 rounded-xl bg-stone-50/70 border border-stone-200">
                  <label className="block text-xs font-bold text-stone-800">
                    {t.cvBuilder.warnaHeadingLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={konfigurasiVisual.warnaHeading || konfigurasiVisual.warnaAksen}
                      onChange={(e) => handleUpdate('warnaHeading', e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg border border-stone-300 cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={konfigurasiVisual.warnaHeading || konfigurasiVisual.warnaAksen}
                      onChange={(e) => handleUpdate('warnaHeading', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-lg border border-stone-300 text-stone-900 bg-white focus:outline-none focus:ring-1 focus:ring-orange-600"
                    />
                  </div>
                </div>

                {/* 2. Warna Garis Divider */}
                <div className="space-y-1.5 p-3 rounded-xl bg-stone-50/70 border border-stone-200">
                  <label className="block text-xs font-bold text-stone-800">
                    {t.cvBuilder.warnaGarisLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={konfigurasiVisual.warnaGaris || '#d1d5db'}
                      onChange={(e) => handleUpdate('warnaGaris', e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg border border-stone-300 cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={konfigurasiVisual.warnaGaris || '#d1d5db'}
                      onChange={(e) => handleUpdate('warnaGaris', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-lg border border-stone-300 text-stone-900 bg-white focus:outline-none focus:ring-1 focus:ring-orange-600"
                    />
                  </div>
                </div>

                {/* 3. Warna Teks Body */}
                <div className="space-y-1.5 p-3 rounded-xl bg-stone-50/70 border border-stone-200">
                  <label className="block text-xs font-bold text-stone-800">
                    {t.cvBuilder.warnaTeksLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={konfigurasiVisual.warnaTeks || '#1f2937'}
                      onChange={(e) => handleUpdate('warnaTeks', e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg border border-stone-300 cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={konfigurasiVisual.warnaTeks || '#1f2937'}
                      onChange={(e) => handleUpdate('warnaTeks', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-lg border border-stone-300 text-stone-900 bg-white focus:outline-none focus:ring-1 focus:ring-orange-600"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </Kartu>
      )}

      {/* KONTEN TAB 4: TIPOGRAFI, PILIHAN FONT & INPUT ANGKA UKURAN */}
      {subTabAktif === 'tipografi' && (
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
                {t.cvBuilder.pengaturanFontPixelSubjudul}
              </p>
            </div>
          </div>

          {/* PEMILIH KELUARGA FONT (FONT FAMILY) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-stone-50/70 border border-stone-200">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-bold text-stone-900">
                {t.cvBuilder.jenisFontLabel}
              </label>
              {isIvyClassic && (
                <span className="text-[10px] font-semibold text-orange-900 bg-orange-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {t.cvBuilder.fontTerkunciOtomatis}
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              {t.cvBuilder.jenisFontBantuan}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
              {fontYangTersedia.map((f) => {
                const aktif = (konfigurasiVisual.jenisFont || (isIvyClassic ? 'times' : 'inter')) === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleUpdate('jenisFont', f.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 min-h-[44px] cursor-pointer ${
                      aktif
                        ? 'border-orange-600 bg-orange-50/80 text-orange-900 font-bold shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className={`text-xs truncate ${f.kategori === 'serif' ? 'font-serif' : 'font-sans'}`}>
                      {f.nama}
                    </span>
                    {aktif && <Check className="w-3.5 h-3.5 text-orange-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* INPUT ANGKA FONT SIZE (BUKAN SLIDER INPUT RANGE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {/* Title (Nama) */}
            <div className="space-y-1.5 p-3 rounded-xl border border-stone-200 bg-white">
              <label className="block text-xs font-bold text-stone-800">
                {t.cvBuilder.ukuranTitleLabel}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={28}
                  step={1}
                  value={konfigurasiVisual.ukuranTitle || 24}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleUpdate('ukuranTitle', val ? Math.min(Math.max(val, 20), 28) : 24);
                  }}
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600 bg-stone-50/50 min-h-[44px]"
                />
                <span className="text-xs font-semibold text-stone-500 shrink-0">px (20-28)</span>
              </div>
            </div>

            {/* Subtitle (Target Role) */}
            <div className="space-y-1.5 p-3 rounded-xl border border-stone-200 bg-white">
              <label className="block text-xs font-bold text-stone-800">
                {t.cvBuilder.ukuranSubtitleLabel}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={12}
                  max={16}
                  step={1}
                  value={konfigurasiVisual.ukuranSubtitle || 14}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleUpdate('ukuranSubtitle', val ? Math.min(Math.max(val, 12), 16) : 14);
                  }}
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600 bg-stone-50/50 min-h-[44px]"
                />
                <span className="text-xs font-semibold text-stone-500 shrink-0">px (12-16)</span>
              </div>
            </div>

            {/* Heading Section H1 */}
            <div className="space-y-1.5 p-3 rounded-xl border border-stone-200 bg-white">
              <label className="block text-xs font-bold text-stone-800">
                {t.cvBuilder.ukuranH1Label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={13}
                  max={18}
                  step={1}
                  value={konfigurasiVisual.ukuranH1 || 14}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleUpdate('ukuranH1', val ? Math.min(Math.max(val, 13), 18) : 14);
                  }}
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600 bg-stone-50/50 min-h-[44px]"
                />
                <span className="text-xs font-semibold text-stone-500 shrink-0">px (13-18)</span>
              </div>
            </div>

            {/* Sub-Heading H2 / H3 */}
            <div className="space-y-1.5 p-3 rounded-xl border border-stone-200 bg-white">
              <label className="block text-xs font-bold text-stone-800">
                {t.cvBuilder.ukuranH2H3Label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={11}
                  max={14}
                  step={1}
                  value={konfigurasiVisual.ukuranH2H3 || 12}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleUpdate('ukuranH2H3', val ? Math.min(Math.max(val, 11), 14) : 12);
                  }}
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600 bg-stone-50/50 min-h-[44px]"
                />
                <span className="text-xs font-semibold text-stone-500 shrink-0">px (11-14)</span>
              </div>
            </div>

            {/* Body Text & Bullets P */}
            <div className="space-y-1.5 p-3 rounded-xl border border-stone-200 bg-white">
              <label className="block text-xs font-bold text-stone-800">
                {t.cvBuilder.ukuranBodyLabel}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={12}
                  step={0.5}
                  value={konfigurasiVisual.ukuranBody || 11}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleUpdate('ukuranBody', val ? Math.min(Math.max(val, 10), 12) : 11);
                  }}
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600 bg-stone-50/50 min-h-[44px]"
                />
                <span className="text-xs font-semibold text-stone-500 shrink-0">px (10-12)</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 pt-1">
            {t.cvBuilder.catatanBatasMinAts}
          </p>
        </Kartu>
      )}
    </div>
  );
};
