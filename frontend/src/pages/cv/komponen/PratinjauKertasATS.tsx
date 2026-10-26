// Komponen Pratinjau Kertas 1-Kolom ATS Standar (pages/cv/komponen/PratinjauKertasATS.tsx)
// Mendukung kustomisasi template, ukuran kertas A4/Letter, margin, warna elemen, dan skala tipografi.
import React from 'react';
import { User } from 'lucide-react';
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
  // Default values jika konfigurasiVisual belum dipassing
  const templateId = konfigurasiVisual?.templateId || 'ivy_classic';
  const ukuranKertas = konfigurasiVisual?.ukuranKertas || 'a4';
  const marginMode = konfigurasiVisual?.margin || 'standar';
  const warnaAksen = konfigurasiVisual?.warnaAksen || '#111827';
  const sizeTitle = konfigurasiVisual?.ukuranTitle || 24;
  const sizeSubtitle = konfigurasiVisual?.ukuranSubtitle || 14;
  const sizeH1 = konfigurasiVisual?.ukuranH1 || 14;
  const sizeH2H3 = konfigurasiVisual?.ukuranH2H3 || 12;
  const sizeBody = konfigurasiVisual?.ukuranBody || 11;

  // Margin padding mapping (kompak: 12mm, standar: 18mm, lega: 24mm)
  const paddingClass = 
    marginMode === 'kompak' 
      ? 'p-4 sm:p-6' 
      : marginMode === 'lega' 
      ? 'p-8 sm:p-12' 
      : 'p-6 sm:p-10';

  // Font family berdasarkan template
  const fontClass = 
    templateId === 'ivy_classic' 
      ? 'font-serif' 
      : 'font-sans';

  // Header alignment
  const isCenteredHeader = templateId === 'ivy_classic';

  return (
    <div 
      className={`bg-white rounded-2xl border border-stone-200/90 shadow-sm space-y-5 text-stone-900 ${fontClass} ${paddingClass} print:border-none print:shadow-none print:p-0 transition-all`}
      style={{
        // Ukuran kertas proporsional
        maxWidth: ukuranKertas === 'letter' ? '8.5in' : '210mm',
        minHeight: ukuranKertas === 'letter' ? '11in' : '297mm',
        margin: '0 auto',
      }}
    >
      {/* ATS Header */}
      <div 
        className={`pb-3 space-y-1 ${
          isCenteredHeader && !konfigurasiVisual?.tampilkanFoto ? 'text-center border-b' : 'text-left border-b-2'
        }`}
        style={{ borderColor: warnaAksen }}
      >
        {(() => {
          const posisi = konfigurasiVisual?.posisiFoto || 'kanan';
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
                    Pasfoto<br />3×4
                  </span>
                </div>
              )}
            </div>
          );

          const blokIdentitas = (
            <div className={`space-y-1 flex-1 ${isCenteredHeader && !konfigurasiVisual?.tampilkanFoto ? 'text-center' : 'text-left'}`}>
              <h2 
                className="font-bold tracking-tight uppercase"
                style={{ fontSize: `${sizeTitle}px`, color: warnaAksen }}
              >
                {namaLengkap || 'NAMA LENGKAP KANDIDAT'}
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
        <div className="space-y-1">
          <h3 
            className="font-bold uppercase tracking-wider border-b pb-0.5"
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaAksen,
              borderColor: `${warnaAksen}40`
            }}
          >
            KEAHLIAN TEKNIS
          </h3>
          <p 
            className="text-stone-800 leading-relaxed font-mono"
            style={{ fontSize: `${sizeBody}px` }}
          >
            {daftarKeahlian.join(' • ')}
          </p>
        </div>
      )}

      {/* ATS Ringkasan Profesional / Profil */}
      {ringkasan && (
        <div className="space-y-1">
          <h3 
            className={`font-bold uppercase tracking-wider pb-0.5 ${
              templateId === 'europass_slate' 
                ? 'border-l-4 pl-2' 
                : templateId === 'modern_ats'
                ? 'border-b-2 inline-block'
                : 'border-b'
            }`}
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaAksen,
              borderColor: warnaAksen
            }}
          >
            {templateId === 'executive_din' ? 'RINGKASAN EKSEKUTIF' : 'RINGKASAN PROFESIONAL'}
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
                : templateId === 'modern_ats'
                ? 'border-b-2 inline-block'
                : 'border-b'
            }`}
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaAksen,
              borderColor: warnaAksen
            }}
          >
            PENGALAMAN KERJA
          </h3>
          {daftarPengalaman.map((exp, idx) => (
            <div key={idx} className="space-y-0.5">
              <div 
                className="flex justify-between items-baseline font-bold"
                style={{ fontSize: `${sizeH2H3}px` }}
              >
                <span className="text-stone-900">{exp.posisi || 'Posisi Jabatan'}</span>
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
                : templateId === 'modern_ats'
                ? 'border-b-2 inline-block'
                : 'border-b'
            }`}
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaAksen,
              borderColor: warnaAksen
            }}
          >
            PROYEK UNGGULAN & PORTOFOLIO
          </h3>
          {daftarProyek.map((proj, idx) => (
            <div key={idx} className="space-y-0.5">
              <div 
                className="flex justify-between items-baseline font-bold"
                style={{ fontSize: `${sizeH2H3}px` }}
              >
                <span className="text-stone-900">{proj.nama || 'Nama Proyek'}</span>
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
                : templateId === 'modern_ats'
                ? 'border-b-2 inline-block'
                : 'border-b'
            }`}
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaAksen,
              borderColor: warnaAksen
            }}
          >
            {templateId === 'bumn_nasional' ? 'RIWAYAT PENDIDIKAN TINGGI' : 'PENDIDIKAN FORMAL'}
          </h3>
          {daftarEdukasi.map((edu, idx) => (
            <div key={idx} className="space-y-0.5">
              <div 
                className="flex justify-between items-baseline font-bold"
                style={{ fontSize: `${sizeH2H3}px` }}
              >
                <span className="text-stone-900">{edu.institusi || 'Nama Institusi'}</span>
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
        <div className="space-y-1">
          <h3 
            className={`font-bold uppercase tracking-wider pb-0.5 ${
              templateId === 'europass_slate' 
                ? 'border-l-4 pl-2' 
                : templateId === 'modern_ats'
                ? 'border-b-2 inline-block'
                : 'border-b'
            }`}
            style={{ 
              fontSize: `${sizeH1}px`, 
              color: warnaAksen,
              borderColor: warnaAksen
            }}
          >
            KEAHLIAN & KOMPETENSI
          </h3>
          <p 
            className="text-stone-800 leading-relaxed"
            style={{ fontSize: `${sizeBody}px` }}
          >
            {daftarKeahlian.join(' • ')}
          </p>
        </div>
      )}
    </div>
  );
};
