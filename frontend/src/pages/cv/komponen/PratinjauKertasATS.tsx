import React, { useState } from 'react';
import { User, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { useBahasa } from '../../../i18n';
import { ItemEdukasi } from './FormEdukasiCV';
import { ItemPengalaman } from './FormPengalamanCV';
import { ItemProyek } from './FormProyekCV';
import { KonfigurasiVisualCV } from '../tipePengaturanCV';

interface PropertiPratinjauKertasATS {
  namaLengkap: string;
  targetRole: string;
  emailKontak: string;
  teleponKontak: string;
  domisiliKontak: string;
  linkedinKontak: string;
  tempatTanggalLahir?: string;
  githubKontak?: string;
  portofolioKontak?: string;
  ringkasan: string;
  daftarEdukasi: ItemEdukasi[];
  daftarPengalaman: ItemPengalaman[];
  daftarProyek: ItemProyek[];
  daftarKeahlian: string[];
  konfigurasiVisual?: KonfigurasiVisualCV;
}

export const PratinjauKertasATS: React.FC<PropertiPratinjauKertasATS> = ({
  namaLengkap,
  targetRole,
  emailKontak,
  teleponKontak,
  domisiliKontak,
  linkedinKontak,
  tempatTanggalLahir = '',
  githubKontak = '',
  portofolioKontak = '',
  ringkasan,
  daftarEdukasi,
  daftarPengalaman,
  daftarProyek,
  daftarKeahlian,
  konfigurasiVisual,
}) => {
  const { t } = useBahasa();
  // State skala zoom (default 0.50 / 50% dengan range 50% - 150% kenaikan 10%)
  const [zoomScale, setZoomScale] = useState<number>(0.50);

  const perbesar = () => setZoomScale((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 1.5));
  const perkecil = () => setZoomScale((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.5));
  const resetNormal = () => setZoomScale(1.0);
  const resetKompak = () => setZoomScale(0.50);

  // Default values jika konfigurasiVisual belum dipassing
  const templateId = konfigurasiVisual?.templateId || 'ivy_classic';
  const ukuranKertas = konfigurasiVisual?.ukuranKertas || 'a4';
  const marginMode = konfigurasiVisual?.margin || 'standar';
  const warnaAksen = konfigurasiVisual?.warnaAksen || '#111827';
  // Clamping ukuran font sesuai standar resmi ATS (mencegah teks meledak / font size 0 atau 100)
  const sizeTitle = Math.min(Math.max(Number(konfigurasiVisual?.ukuranTitle) || 24, 20), 28);
  const sizeSubtitle = Math.min(Math.max(Number(konfigurasiVisual?.ukuranSubtitle) || 14, 12), 16);
  const sizeH1 = Math.min(Math.max(Number(konfigurasiVisual?.ukuranH1) || 14, 13), 18);
  const sizeH2H3 = Math.min(Math.max(Number(konfigurasiVisual?.ukuranH2H3) || 12, 11), 14);
  const sizeBody = Math.min(Math.max(Number(konfigurasiVisual?.ukuranBody) || 11, 10), 12);

  // Margin padding mapping (kompak: 12mm, standar: 18mm, lega: 24mm)
  const paddingClass = 
    marginMode === 'kompak' 
      ? 'p-4 sm:p-6' 
      : marginMode === 'lega' 
      ? 'p-8 sm:p-12' 
      : 'p-6 sm:p-10';

  // Warna elemen terperinci (fallback ke warnaAksen jika belum diatur)
  const warnaHeading = konfigurasiVisual?.warnaHeading || warnaAksen;
  const warnaGaris = konfigurasiVisual?.warnaGaris || (warnaAksen !== '#111827' ? warnaAksen : '#e5e7eb');
  const warnaTeks = konfigurasiVisual?.warnaTeks || '#1f2937';

  // Font family mapping
  const jenisFont = konfigurasiVisual?.jenisFont || (templateId === 'ivy_classic' ? 'times' : 'inter');
  const fontClass = 
    jenisFont === 'times' ? 'font-serif' :
    jenisFont === 'georgia' ? 'font-serif' :
    jenisFont === 'garamond' ? 'font-serif' :
    'font-sans';

  const fontFamilyStyle = 
    jenisFont === 'times' ? '"Times New Roman", Times, serif' :
    jenisFont === 'georgia' ? 'Georgia, serif' :
    jenisFont === 'garamond' ? 'Garamond, "Hoefler Text", Times, serif' :
    jenisFont === 'roboto' ? 'Roboto, sans-serif' :
    'Inter, system-ui, sans-serif';

  // Header alignment
  const isCenteredHeader = templateId === 'ivy_classic';

  // Toolbar Kontrol Zoom Ringkas & Ergonomis (Menampilkan persentase dinamis yang aktif)
  const bilahKontrolZoom = (
    <div className="flex items-center justify-between gap-2 p-2 mb-3 bg-stone-100/90 rounded-xl border border-stone-200/90 print:hidden select-none">
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-600 font-bold px-1">{t.cvBuilder.tabPratinjau}</span>
        <span className="text-xs font-mono font-bold text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs">
          {Math.round(zoomScale * 100)}%
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={perkecil}
          disabled={zoomScale <= 0.5}
          title={t.cvBuilder.zoomOutLabel}
          className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={perbesar}
          disabled={zoomScale >= 1.5}
          title={t.cvBuilder.zoomInLabel}
          className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={resetKompak}
          title={t.cvBuilder.zoomFitLabel}
          className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer flex items-center gap-1 shadow-2xs ${
            zoomScale === 0.50
              ? 'bg-orange-50 border-orange-300 text-orange-900'
              : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
          }`}
        >
          <Maximize2 className="w-3 h-3" />
          <span>50%</span>
        </button>

        <button
          type="button"
          onClick={resetNormal}
          title={t.cvBuilder.zoomResetLabel}
          className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer flex items-center gap-1 shadow-2xs ${
            zoomScale === 1.0
              ? 'bg-orange-50 border-orange-300 text-orange-900'
              : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
          }`}
        >
          <RotateCcw className="w-3 h-3" />
          <span>100%</span>
        </button>
      </div>
    </div>
  );

  // Dimensi fisik lembar dokumen asli (A4 ISO 216: 210mm x 297mm, US Letter: 8.5in x 11in)
  const lebarKertasMm = ukuranKertas === 'letter' ? 215.9 : 210;
  const tinggiKertasMm = ukuranKertas === 'letter' ? 279.4 : 297;
  const lebarKertasCss = ukuranKertas === 'letter' ? '8.5in' : '210mm';
  const tinggiKertasCss = ukuranKertas === 'letter' ? '11in' : '297mm';

  // Khusus template modern_ats: Two-Column Split Layout (Sidebar Gelap Kiri + Konten Kanan Bersih)
  if (templateId === 'modern_ats') {
    return (
      <div className="w-full">
        {bilahKontrolZoom}
        {/* Kontainer Scrollable/Geser Otomatis saat Dizoom tanpa scrollbar visual */}
        <div className="w-full overflow-auto no-scrollbar max-h-[calc(100vh-140px)] p-2 bg-stone-50/50 rounded-2xl border border-stone-200/80 print:border-none print:bg-transparent print:p-0 print:overflow-visible print:max-h-none">
          <div 
            style={{
              width: `${Math.round(lebarKertasMm * zoomScale)}mm`,
              height: `${Math.round(tinggiKertasMm * zoomScale)}mm`,
              minWidth: `${Math.round(lebarKertasMm * zoomScale)}mm`,
            }}
            className="mx-auto block relative print:!w-full print:!min-w-0 print:!h-auto print:!m-0"
          >
            <div 
              id="lembar-cv-target"
              data-cv-sheet="true"
              className={`bg-white rounded-2xl border border-stone-200/90 shadow-md print:border-none print:shadow-none print:rounded-none print:p-0 transition-transform origin-top-left ${fontClass} overflow-hidden flex flex-row items-stretch shrink-0 print:!transform-none print:!w-full print:!min-w-0 print:!min-h-0 print:!h-auto`}
              style={{
                fontFamily: fontFamilyStyle,
                color: warnaTeks,
                transform: `scale(${zoomScale})`,
                width: lebarKertasCss,
                minWidth: lebarKertasCss,
                height: tinggiKertasCss,
                minHeight: tinggiKertasCss,
              }}
            >
            {/* KOLOM KIRI: Dark Sidebar (~35% lebar kertas fisik) */}
        <aside 
          className="w-[35%] bg-slate-800 text-stone-100 p-6 sm:p-7 space-y-6 shrink-0 print:bg-slate-800"
          style={{ backgroundColor: warnaAksen !== '#111827' ? warnaAksen : '#1e293b' }}
        >
          {/* Circular Headshot / Avatar */}
          {konfigurasiVisual?.tampilkanFoto && (
            <div className="flex justify-center pb-2">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 shadow-md overflow-hidden bg-slate-700/60 flex items-center justify-center">
                {konfigurasiVisual.urlFoto ? (
                  <img
                    src={konfigurasiVisual.urlFoto}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300 p-2 text-center select-none">
                    <User className="w-10 h-10 stroke-[1.5] text-slate-400" />
                    <span className="text-[10px] mt-1 text-slate-300">
                      {t.cvBuilder.pasfotoPlaceholder}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-extrabold text-white pb-1 border-b border-white/20">
              {t.cvBuilder.bagianKontak}
            </h4>
            <div className="space-y-2 text-slate-200" style={{ fontSize: `${sizeBody}px` }}>
              {teleponKontak && (
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t.cvBuilder.telepon}</span>
                  <span className="font-medium">{teleponKontak}</span>
                </div>
              )}
              {emailKontak && (
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t.cvBuilder.email}</span>
                  <span className="break-all font-medium">{emailKontak}</span>
                </div>
              )}
              {domisiliKontak && (
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t.cvBuilder.domisili}</span>
                  <span className="font-medium">{domisiliKontak}</span>
                </div>
              )}
              {linkedinKontak && (
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t.cvBuilder.linkedin}</span>
                  <span className="break-all text-[10px] text-slate-300">{linkedinKontak.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Education Section in Sidebar */}
          {daftarEdukasi.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-extrabold text-white pb-1 border-b border-white/20">
                {t.cvBuilder.atsHeadingPendidikanFormal}
              </h4>
              <div className="space-y-3">
                {daftarEdukasi.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="block text-[10px] font-mono text-slate-300">{edu.tahun}</span>
                    <h5 className="font-bold text-white text-xs leading-snug">{edu.gelar || edu.jurusan}</h5>
                    <span className="block text-slate-300 text-[11px]">{edu.institusi}</span>
                    {edu.ipk && (
                      <span className="block text-[10px] text-slate-400">IPK: {edu.ipk}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expertise / Skills Section in Sidebar */}
          {daftarKeahlian.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-extrabold text-white pb-1 border-b border-white/20">
                {t.cvBuilder.atsHeadingKeahlianKompetensi}
              </h4>
              <div className="space-y-2 text-slate-200" style={{ fontSize: `${sizeBody}px` }}>
                {(() => {
                  const grupKategori: Record<string, string[]> = {};
                  const tanpaKategori: string[] = [];
                  daftarKeahlian.forEach((item) => {
                    const idx = item.indexOf(':');
                    if (idx !== -1) {
                      const kat = item.slice(0, idx).trim();
                      const val = item.slice(idx + 1).trim();
                      if (!grupKategori[kat]) grupKategori[kat] = [];
                      if (!grupKategori[kat].includes(val)) grupKategori[kat].push(val);
                    } else {
                      tanpaKategori.push(item);
                    }
                  });

                  const adaKategori = Object.keys(grupKategori).length > 0;
                  if (adaKategori) {
                    return Object.entries(grupKategori).map(([kat, items], kIdx) => (
                      <div key={kIdx} className="space-y-1">
                        <span className="block text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                          {kat}
                        </span>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          {items.join(' • ')}
                        </p>
                      </div>
                    ));
                  }

                  return (
                    <ul className="space-y-1">
                      {tanpaKategori.map((k, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-orange-400 font-bold">•</span>
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>
          )}
        </aside>

        {/* KOLOM KANAN: Main Canvas (~65% lebar) */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 text-stone-900 bg-white">
          {/* Header Title & Subtitle */}
          <div className="space-y-1.5 pb-4 border-b border-stone-200">
            <h1 
              className="font-extrabold tracking-tight uppercase leading-none text-stone-950"
              style={{ fontSize: `${Math.max(sizeTitle, 26)}px` }}
            >
              {namaLengkap || t.cvBuilder.atsNamaLengkapPlaceholder}
            </h1>
            <h2 
              className="font-medium text-stone-600 tracking-wider uppercase text-sm sm:text-base"
              style={{ fontSize: `${sizeSubtitle}px` }}
            >
              {targetRole || 'Professional Role'}
            </h2>
            {ringkasan && (
              <p 
                className="text-stone-600 leading-relaxed text-justify pt-2 text-xs"
                style={{ fontSize: `${sizeBody}px` }}
              >
                {ringkasan}
              </p>
            )}
          </div>

          {/* Timeline Experience */}
          {daftarPengalaman.length > 0 && (
            <div className="space-y-3">
              <h3 
                className="font-bold uppercase tracking-wider text-stone-950 pb-1 border-b border-stone-200"
                style={{ fontSize: `${sizeH1}px` }}
              >
                {t.cvBuilder.atsHeadingPengalamanKerja}
              </h3>
              <div className="relative pl-5 border-l-2 border-stone-300 space-y-5 my-2">
                {daftarPengalaman.map((exp, idx) => (
                  <div key={idx} className="relative space-y-1">
                    {/* Timeline Dot Marker */}
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-stone-800 bg-white shadow-xs" />
                    
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <span className="text-xs font-mono font-bold text-stone-500">
                        {exp.periode}
                      </span>
                    </div>
                    <div className="text-stone-700 text-xs font-medium">
                      {exp.perusahaan}
                    </div>
                    <h4 
                      className="font-bold text-stone-950"
                      style={{ fontSize: `${sizeH2H3}px` }}
                    >
                      {exp.posisi || t.cvBuilder.atsPosisiPlaceholder}
                    </h4>
                    {exp.deskripsi && (
                      <p 
                        className="text-stone-600 leading-relaxed pt-0.5"
                        style={{ fontSize: `${sizeBody}px` }}
                      >
                        {exp.deskripsi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Projects */}
          {daftarProyek.length > 0 && (
            <div className="space-y-3">
              <h3 
                className="font-bold uppercase tracking-wider text-stone-950 pb-1 border-b border-stone-200"
                style={{ fontSize: `${sizeH1}px` }}
              >
                {t.cvBuilder.atsHeadingProyekUnggulan}
              </h3>
              <div className="space-y-3">
                {daftarProyek.map((proj, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-baseline font-bold" style={{ fontSize: `${sizeH2H3}px` }}>
                      <span className="text-stone-900">{proj.nama || t.cvBuilder.atsNamaProyekPlaceholder}</span>
                      {proj.teknologi && (
                        <span className="text-stone-500 font-mono text-[11px] font-normal">
                          [{proj.teknologi}]
                        </span>
                      )}
                    </div>
                    {proj.deskripsi && (
                      <p className="text-stone-600 leading-relaxed text-xs" style={{ fontSize: `${sizeBody}px` }}>
                        {proj.deskripsi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {bilahKontrolZoom}
      {/* Kontainer Scrollable/Geser Bebas Otomatis saat Dizoom tanpa scrollbar visual */}
      <div className="w-full overflow-auto no-scrollbar max-h-[calc(100vh-140px)] p-2 bg-stone-50/50 rounded-2xl border border-stone-200/80 print:border-none print:bg-transparent print:p-0 print:overflow-visible print:max-h-none">
        <div 
          className="mx-auto block relative print:!w-full print:!min-w-0 print:!h-auto print:!m-0"
          style={{
            width: `${Math.round(lebarKertasMm * zoomScale)}mm`,
            height: `${Math.round(tinggiKertasMm * zoomScale)}mm`,
            minWidth: `${Math.round(lebarKertasMm * zoomScale)}mm`,
          }}
        >
        <div 
          id="lembar-cv-target"
          data-cv-sheet="true"
          className={`bg-white rounded-2xl border border-stone-200/90 shadow-md space-y-5 ${fontClass} ${paddingClass} print:border-none print:shadow-none print:rounded-none print:p-0 transition-transform origin-top-left shrink-0 print:!transform-none print:!w-full print:!min-w-0 print:!min-h-0 print:!h-auto`}
          style={{
            fontFamily: fontFamilyStyle,
            color: warnaTeks,
            transform: `scale(${zoomScale})`,
            width: lebarKertasCss,
            minWidth: lebarKertasCss,
            height: tinggiKertasCss,
            minHeight: tinggiKertasCss,
          }}
        >
          {/* ATS Header */}
      <div 
        className={`pb-3 space-y-1 ${
          isCenteredHeader && !konfigurasiVisual?.tampilkanFoto ? 'text-center border-b' : 'text-left border-b-2'
        }`}
        style={{ borderColor: warnaGaris }}
      >
        {(() => {
          // Posisi baku resmi: BUMN di Kiri Atas (Z-pattern administrasi), lainnya di Kanan Atas (DIN 5008 & Europass)
          const posisi = (konfigurasiVisual?.templateId === 'bumn_nasional') ? 'kiri' : 'kanan';
          const blokFoto = konfigurasiVisual?.tampilkanFoto && (
            <div className="shrink-0">
              {konfigurasiVisual.urlFoto ? (
                <img
                  src={konfigurasiVisual.urlFoto}
                  alt="Pasfoto CV"
                  className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded border border-stone-300 shadow-sm print:border-stone-400"
                />
              ) : (
                <div className="w-16 h-20 sm:w-20 sm:h-24 rounded border border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center text-stone-400 p-1 text-center select-none print:border-stone-400">
                  <User className="w-6 h-6 stroke-[1.5] text-stone-300" />
                  <span className="text-[9px] font-medium leading-tight mt-1 text-stone-400">
                    {t.cvBuilder.pasfotoPlaceholder}
                  </span>
                </div>
              )}
            </div>
          );

          const blokIdentitas = (
            <div className={`space-y-1 flex-1 ${isCenteredHeader && !konfigurasiVisual?.tampilkanFoto ? 'text-center' : 'text-left'}`}>
              <h2 
                className="font-bold tracking-tight uppercase"
                style={{ fontSize: `${sizeTitle}px`, color: warnaHeading }}
              >
                {namaLengkap || t.cvBuilder.atsNamaLengkapPlaceholder}
              </h2>
              {targetRole && (
                <div 
                  className="font-semibold text-stone-700 tracking-wide"
                  style={{ fontSize: `${sizeSubtitle}px` }}
                >
                  {targetRole}
                </div>
              )}
              <div 
                className={`flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-stone-600 ${
                  isCenteredHeader && !konfigurasiVisual?.tampilkanFoto ? 'justify-center' : 'justify-start'
                }`}
                style={{ fontSize: `${sizeBody}px` }}
              >
                {emailKontak && <span>{emailKontak}</span>}
                {teleponKontak && <span>• {teleponKontak}</span>}
                {domisiliKontak && <span>• {domisiliKontak}</span>}
                {linkedinKontak && <span>• {linkedinKontak}</span>}
                {templateId === 'bumn_nasional' && tempatTanggalLahir && (
                  <span>• TTL: {tempatTanggalLahir}</span>
                )}
                {templateId === 'tech_silicon' && githubKontak && (
                  <span>• GitHub: {githubKontak.replace(/^https?:\/\//, '')}</span>
                )}
                {templateId === 'tech_silicon' && portofolioKontak && (
                  <span>• Portfolio: {portofolioKontak.replace(/^https?:\/\//, '')}</span>
                )}
              </div>
            </div>
          );

          return (
            <div className="flex items-start justify-between gap-4">
              {posisi === 'kiri' && blokFoto}
              {blokIdentitas}
              {posisi === 'kanan' && blokFoto}
            </div>
          );
        })()}
      </div>

      {/* ATS Keahlian Teknis (Muncul di atas khusus template tech_silicon) */}
      {templateId === 'tech_silicon' && daftarKeahlian.length > 0 && (
        <div className="space-y-1.5">
          <h3 
            className="font-bold uppercase tracking-wider border-b pb-0.5"
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaHeading,
              borderColor: warnaGaris
            }}
          >
            {t.cvBuilder.atsHeadingKeahlianTeknis}
          </h3>
          <div className="space-y-1 text-stone-800 leading-relaxed font-mono" style={{ fontSize: `${sizeBody}px` }}>
            {(() => {
              const grupKategori: Record<string, string[]> = {};
              const tanpaKategori: string[] = [];
              daftarKeahlian.forEach((item) => {
                const idx = item.indexOf(':');
                if (idx !== -1) {
                  const kat = item.slice(0, idx).trim();
                  const val = item.slice(idx + 1).trim();
                  if (!grupKategori[kat]) grupKategori[kat] = [];
                  if (!grupKategori[kat].includes(val)) grupKategori[kat].push(val);
                } else {
                  tanpaKategori.push(item);
                }
              });

              const adaKategori = Object.keys(grupKategori).length > 0;
              if (adaKategori) {
                return Object.entries(grupKategori).map(([kat, items], kIdx) => (
                  <div key={kIdx} className="leading-snug">
                    <span className="font-bold text-stone-900">{kat}: </span>
                    <span className="text-stone-700">{items.join(', ')}</span>
                  </div>
                ));
              }

              return <p>{daftarKeahlian.join(' • ')}</p>;
            })()}
          </div>
        </div>
      )}

      {/* ATS Ringkasan Profesional / Profil */}
      {ringkasan && (
        <div className="space-y-1">
          <h3 
            className={`font-bold uppercase tracking-wider pb-0.5 ${
              templateId === 'europass_slate' 
                ? 'border-l-4 pl-2' 
                : 'border-b'
            }`}
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaHeading,
              borderColor: warnaGaris
            }}
          >
            {templateId === 'executive_din' 
              ? t.cvBuilder.atsHeadingRingkasanEksekutif 
              : t.cvBuilder.atsHeadingRingkasanProfesional}
          </h3>
          <p 
            className="text-stone-700 leading-relaxed text-justify"
            style={{ fontSize: `${sizeBody}px` }}
          >
            {ringkasan}
          </p>
        </div>
      )}

      {/* ATS Pengalaman Kerja */}
      {daftarPengalaman.length > 0 && (
        <div className="space-y-2.5">
          <h3 
            className={`font-bold uppercase tracking-wider pb-0.5 ${
              templateId === 'europass_slate' 
                ? 'border-l-4 pl-2' 
                : 'border-b'
            }`}
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaAksen,
              borderColor: warnaAksen
            }}
          >
            {t.cvBuilder.atsHeadingPengalamanKerja}
          </h3>
          {daftarPengalaman.map((exp, idx) => (
            <div key={idx} className="space-y-0.5">
              <div 
                className="flex justify-between items-baseline font-bold"
                style={{ fontSize: `${sizeH2H3}px` }}
              >
                <span className="text-stone-900">{exp.posisi || t.cvBuilder.atsPosisiPlaceholder}</span>
                <span 
                  className="text-stone-500 font-normal"
                  style={{ fontSize: `${sizeBody}px` }}
                >
                  {exp.periode}
                </span>
              </div>
              <div 
                className="text-stone-600 font-medium italic"
                style={{ fontSize: `${sizeBody}px` }}
              >
                {exp.perusahaan}
              </div>
              {exp.deskripsi && (
                <p 
                  className="text-stone-700 leading-relaxed pt-0.5"
                  style={{ fontSize: `${sizeBody}px` }}
                >
                  {exp.deskripsi}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ATS Proyek Unggulan */}
      {daftarProyek.length > 0 && (
        <div className="space-y-2.5">
          <h3 
            className={`font-bold uppercase tracking-wider pb-0.5 ${
              templateId === 'europass_slate' 
                ? 'border-l-4 pl-2' 
                : 'border-b'
            }`}
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaAksen,
              borderColor: warnaAksen
            }}
          >
            {t.cvBuilder.atsHeadingProyekUnggulan}
          </h3>
          {daftarProyek.map((proj, idx) => (
            <div key={idx} className="space-y-0.5">
              <div 
                className="flex justify-between items-baseline font-bold"
                style={{ fontSize: `${sizeH2H3}px` }}
              >
                <span className="text-stone-900">{proj.nama || t.cvBuilder.atsNamaProyekPlaceholder}</span>
                {proj.teknologi && (
                  <span 
                    className="text-stone-500 font-normal font-mono"
                    style={{ fontSize: `${sizeBody}px` }}
                  >
                    [{proj.teknologi}]
                  </span>
                )}
              </div>
              {proj.deskripsi && (
                <p 
                  className="text-stone-700 leading-relaxed"
                  style={{ fontSize: `${sizeBody}px` }}
                >
                  {proj.deskripsi}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ATS Pendidikan Formal */}
      {daftarEdukasi.length > 0 && (
        <div className="space-y-2.5">
          <h3 
            className={`font-bold uppercase tracking-wider pb-0.5 ${
              templateId === 'europass_slate' 
                ? 'border-l-4 pl-2' 
                : 'border-b'
            }`}
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaAksen,
              borderColor: warnaAksen
            }}
          >
            {templateId === 'bumn_nasional' 
              ? t.cvBuilder.atsHeadingPendidikanBumn 
              : t.cvBuilder.atsHeadingPendidikanFormal}
          </h3>
          {daftarEdukasi.map((edu, idx) => (
            <div key={idx} className="space-y-0.5">
              <div 
                className="flex justify-between items-baseline font-bold"
                style={{ fontSize: `${sizeH2H3}px` }}
              >
                <span className="text-stone-900">{edu.institusi || t.cvBuilder.atsInstitusiPlaceholder}</span>
                <span 
                  className="text-stone-500 font-normal"
                  style={{ fontSize: `${sizeBody}px` }}
                >
                  {edu.tahun}
                </span>
              </div>
              <div 
                className="text-stone-700"
                style={{ fontSize: `${sizeBody}px` }}
              >
                {edu.gelar ? `${edu.gelar} - ` : ''}{edu.jurusan}
                {edu.ipk ? ` (IPK: ${edu.ipk})` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ATS Keahlian Teknis (Posisi bawah untuk template non-tech_silicon) */}
      {templateId !== 'tech_silicon' && daftarKeahlian.length > 0 && (
        <div className="space-y-1.5">
          <h3 
            className={`font-bold uppercase tracking-wider pb-0.5 ${
              templateId === 'europass_slate' 
                ? 'border-l-4 pl-2' 
                : 'border-b'
            }`}
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaAksen,
              borderColor: warnaAksen
            }}
          >
            {t.cvBuilder.atsHeadingKeahlianKompetensi}
          </h3>
          <div className="space-y-1 text-stone-800 leading-relaxed" style={{ fontSize: `${sizeBody}px` }}>
            {(() => {
              const grupKategori: Record<string, string[]> = {};
              const tanpaKategori: string[] = [];
              daftarKeahlian.forEach((item) => {
                const idx = item.indexOf(':');
                if (idx !== -1) {
                  const kat = item.slice(0, idx).trim();
                  const val = item.slice(idx + 1).trim();
                  if (!grupKategori[kat]) grupKategori[kat] = [];
                  if (!grupKategori[kat].includes(val)) grupKategori[kat].push(val);
                } else {
                  tanpaKategori.push(item);
                }
              });

              const adaKategori = Object.keys(grupKategori).length > 0;
              if (adaKategori) {
                return Object.entries(grupKategori).map(([kat, items], kIdx) => (
                  <div key={kIdx} className="leading-snug">
                    <span className="font-bold text-stone-900">{kat}: </span>
                    <span className="text-stone-700">{items.join(', ')}</span>
                  </div>
                ));
              }

              return <p>{daftarKeahlian.join(' • ')}</p>;
            })()}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  </div>
);
};
