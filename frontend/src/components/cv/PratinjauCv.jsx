import React from 'react';
import { Mail, Phone, MapPin, Globe, ExternalLink, Code2 } from 'lucide-react';
import IkonMediaSosial from './IkonMediaSosial';

/**
 * Pratinjau Dokumen CV (A4 Sheet):
 * - Render real-time data binding dari state formData
 * - Mendukung 5 gaya template sesuai standar Jobstreet Indonesia:
 *   1. 'ats' / 'modern': CV ATS Friendly (1 kolom minimalis, ramah mesin ATS)
 *   2. 'kronologis': CV Kronologis (Fokus riwayat kerja linier, formal korporat)
 *   3. 'fungsional': CV Fungsional (Keahlian & kompetensi utama di atas, sebelum pengalaman)
 *   4. 'kombinasi': CV Kombinasi (Dua kolom: sidebar keahlian 35% + riwayat kerja 65%)
 *   5. 'kreatif': CV Kreatif (Header banner berwarna aksen, layout 2 kolom visual)
 * - Skalabilitas dinamis (zoom level)
 * - Ekspor cetak PDF A4 standar
 */
export default function PratinjauCv({ formData, id = 'cv-preview-sheet' }) {
  const {
    personal = {},
    socialLinks = [],
    experience = [],
    education = [],
    skills = { hard: [], soft: [], language: [] },
    projects = [],
    settings = {
      template: 'ats',
      accentColor: '#EA580C',
      fontFamily: 'Inter',
      language: 'id',
      paperSize: 'a4',
      headingColor: '#1F2937',
      subheadingColor: '#4B5563',
      textColor: '#1F2937',
    },
  } = formData;

  const isEn = settings.language === 'en';
  const labelSummary = isEn ? 'PROFESSIONAL SUMMARY' : 'RINGKASAN PROFESIONAL';
  const labelExp = isEn ? 'WORK EXPERIENCE' : 'PENGALAMAN KERJA';
  const labelEdu = isEn ? 'EDUCATION' : 'PENDIDIKAN';
  const labelSkills = isEn ? 'SKILLS & COMPETENCIES' : 'KEAHLIAN & KOMPETENSI';
  const labelProjects = isEn ? 'PROJECTS & PORTFOLIO' : 'PROYEK & PORTOFOLIO';

  const fontStyle = {
    fontFamily:
      settings.fontFamily === 'Roboto'
        ? '"Roboto", sans-serif'
        : settings.fontFamily === 'Poppins'
        ? '"Poppins", sans-serif'
        : settings.fontFamily === 'Open Sans'
        ? '"Open Sans", sans-serif'
        : settings.fontFamily === 'Georgia'
        ? 'Georgia, serif'
        : settings.fontFamily === 'Times New Roman'
        ? '"Times New Roman", serif'
        : settings.fontFamily === 'Geist'
        ? 'system-ui, sans-serif'
        : settings.fontFamily === 'Hanken Grotesk'
        ? '"Hanken Grotesk", sans-serif'
        : '"Inter", "Plus Jakarta Sans", sans-serif',
  };

  const accentColor = settings.accentColor || '#EA580C';
  const headingColor = settings.headingColor || '#1F2937';
  const subheadingColor = settings.subheadingColor || '#4B5563';
  const textColor = settings.textColor || '#1F2937';

  // Filter hanya item yang aktif (toggle switch ON)
  const activeExp = (experience || []).filter((item) => item.visible !== false);
  const activeEdu = (education || []).filter((item) => item.visible !== false);
  const activeProjects = (projects || []).filter((item) => item.visible !== false);
  const activeHardSkills = (skills.hard || []).filter((item) => item.visible !== false);
  const activeSoftSkills = (skills.soft || []).filter((item) => item.visible !== false);
  const activeLangSkills = (skills.language || []).filter((item) => item.visible !== false);

  const tpl = settings.template || 'ats';

  // =========================================================================
  // SUB-KOMPONEN SEKSI DATA
  // =========================================================================

  /**
   * Parser Deskripsi Pengalaman Kerja & Proyek:
   * Mengubah teks deskripsi menjadi list semantik (<ul> <li>) jika terdapat pola bullet/dash (•, -, *, ⁃),
   * atau paragraf multi-baris rapi dengan whitespace-pre-line dan indentasi sempurna.
   */
  const renderDeskripsiTeks = (teks, customStyle = {}) => {
    if (!teks) return null;

    // Normalisasi baris teks
    const lines = teks.split('\n').map((l) => l.trim()).filter(Boolean);

    // Cek apakah terdapat pola bullet (•, -, *, ⁃, dsb.)
    const adaBullet = lines.some((l) => /^[•\-\*\⁃\–]\s*/.test(l));

    if (adaBullet) {
      return (
        <ul className="mt-1 space-y-1 list-none pl-0">
          {lines.map((line, i) => {
            const cleanText = line.replace(/^[•\-\*\⁃\–]\s*/, '');
            return (
              <li key={i} className="flex items-start gap-1.5 text-[9.5px] leading-relaxed text-justify" style={customStyle}>
                <span
                  className="mt-1 h-1 w-1 rounded-full shrink-0 select-none"
                  style={{ backgroundColor: accentColor }}
                />
                <span className="flex-1">{cleanText}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    // Jika teks multi-baris biasa tanpa simbol bullet
    return (
      <div className="mt-1 space-y-1">
        {lines.map((line, i) => (
          <p key={i} className="text-[9.5px] leading-relaxed text-justify whitespace-pre-line" style={customStyle}>
            {line}
          </p>
        ))}
      </div>
    );
  };

  const renderSummarySection = (customTitle = labelSummary) => {
    if (!personal.bio) return null;
    return (
      <section className="mb-3.5">
        <h2
          className="text-xs font-bold tracking-wider uppercase mb-1.5 flex items-center gap-2"
          style={{ color: accentColor }}
        >
          <span>{customTitle}</span>
          <span className="flex-1 h-px bg-gray-200" />
        </h2>
        <p className="text-[10px] leading-relaxed whitespace-pre-line text-justify" style={{ color: textColor }}>
          {personal.bio}
        </p>
      </section>
    );
  };

  const renderExperienceSection = (isTimeline = false) => {
    if (activeExp.length === 0) return null;
    return (
      <section className="mb-3.5">
        <h2
          className="text-xs font-bold tracking-wider uppercase mb-2 flex items-center gap-2"
          style={{ color: accentColor }}
        >
          <span>{labelExp}</span>
          <span className="flex-1 h-px bg-gray-200" />
        </h2>
        <div className={`space-y-2.5 ${isTimeline ? 'border-l-2 pl-3 ml-1' : ''}`} style={isTimeline ? { borderColor: `${accentColor}44` } : {}}>
          {activeExp.map((item, idx) => (
            <div key={idx} className="relative">
              {isTimeline && (
                <span
                  className="absolute -left-[17px] top-1 h-2 w-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <h3 className="font-bold text-[10.5px]" style={{ color: headingColor }}>
                    {item.position || 'Posisi / Jabatan'}
                  </h3>
                  <p className="text-[10px] font-semibold" style={{ color: subheadingColor }}>
                    {item.company || 'Perusahaan / Organisasi'}
                  </p>
                </div>
                <span className="text-[9px] font-medium text-gray-500 shrink-0">
                  {item.startDate || 'Mulai'} &ndash; {item.endDate || 'Sekarang'}
                </span>
              </div>
              {item.description && renderDeskripsiTeks(item.description, { color: textColor })}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderEducationSection = () => {
    if (activeEdu.length === 0) return null;
    return (
      <section className="mb-3.5">
        <h2
          className="text-xs font-bold tracking-wider uppercase mb-2 flex items-center gap-2"
          style={{ color: accentColor }}
        >
          <span>{labelEdu}</span>
          <span className="flex-1 h-px bg-gray-200" />
        </h2>
        <div className="space-y-2">
          {activeEdu.map((item, idx) => (
            <div key={idx} className="flex items-baseline justify-between gap-2">
              <div>
                <h3 className="font-bold text-[10.5px]" style={{ color: headingColor }}>
                  {item.institution || 'Nama Institusi / Universitas'}
                </h3>
                <p className="text-[10px] font-medium" style={{ color: subheadingColor }}>
                  {item.degree || 'Gelar / Jurusan'}
                </p>
              </div>
              <span className="text-[9px] font-medium text-gray-500 shrink-0">
                {item.startDate || 'Mulai'} &ndash; {item.endDate || 'Selesai'}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderProjectsSection = () => {
    if (activeProjects.length === 0) return null;
    return (
      <section className="mb-3.5">
        <h2
          className="text-xs font-bold tracking-wider uppercase mb-2 flex items-center gap-2"
          style={{ color: accentColor }}
        >
          <span>{labelProjects}</span>
          <span className="flex-1 h-px bg-gray-200" />
        </h2>
        <div className="space-y-2">
          {activeProjects.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[10.5px]" style={{ color: headingColor }}>
                    {item.name || 'Nama Proyek'}
                  </h3>
                  {item.role && (
                    <span className="text-[9.5px]" style={{ color: subheadingColor }}>
                      | {item.role}
                    </span>
                  )}
                </div>
                {item.projectUrl && (
                  <a
                    href={item.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] flex items-center gap-0.5 text-blue-600 hover:underline"
                  >
                    <span>Demo</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              {item.description && renderDeskripsiTeks(item.description, { color: textColor })}
              {item.techStack && (
                <p className="mt-0.5 text-[9px] font-mono text-gray-500">
                  <strong>Tech:</strong> {item.techStack}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkillsSection = (isHighlighted = false) => {
    if (activeHardSkills.length === 0 && activeSoftSkills.length === 0 && activeLangSkills.length === 0)
      return null;

    if (isHighlighted) {
      // Tampilan fungsional: Keahlian disorot dengan box/grid rapi di atas
      return (
        <section className="mb-4">
          <h2
            className="text-xs font-bold tracking-wider uppercase mb-2 flex items-center gap-2"
            style={{ color: accentColor }}
          >
            <span>{labelSkills}</span>
            <span className="flex-1 h-px bg-gray-200" />
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {activeHardSkills.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-2.5">
                <span className="block font-bold text-[10px] uppercase text-gray-800 mb-1" style={{ color: accentColor }}>
                  {isEn ? 'Hard Skills' : 'Keahlian Teknis'}
                </span>
                <ul className="space-y-0.5 text-[9.5px] text-gray-700">
                  {activeHardSkills.map((s, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
                      <span>{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeSoftSkills.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-2.5">
                <span className="block font-bold text-[10px] uppercase text-gray-800 mb-1" style={{ color: accentColor }}>
                  {isEn ? 'Soft Skills' : 'Soft Skills'}
                </span>
                <ul className="space-y-0.5 text-[9.5px] text-gray-700">
                  {activeSoftSkills.map((s, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
                      <span>{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeLangSkills.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-2.5">
                <span className="block font-bold text-[10px] uppercase text-gray-800 mb-1" style={{ color: accentColor }}>
                  {isEn ? 'Languages' : 'Bahasa'}
                </span>
                <ul className="space-y-0.5 text-[9.5px] text-gray-700">
                  {activeLangSkills.map((s, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
                      <span>{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      );
    }

    // Tampilan standar ATS
    return (
      <section className="mb-3.5">
        <h2
          className="text-xs font-bold tracking-wider uppercase mb-1.5 flex items-center gap-2"
          style={{ color: accentColor }}
        >
          <span>{labelSkills}</span>
          <span className="flex-1 h-px bg-gray-200" />
        </h2>
        <div className="space-y-1 text-[9.5px]">
          {activeHardSkills.length > 0 && (
            <div>
              <strong style={{ color: subheadingColor }}>{isEn ? 'Technical Skills: ' : 'Keahlian Teknis: '}</strong>
              <span style={{ color: textColor }}>{activeHardSkills.map((s) => s.name).join(', ')}</span>
            </div>
          )}
          {activeSoftSkills.length > 0 && (
            <div>
              <strong style={{ color: subheadingColor }}>{isEn ? 'Soft Skills: ' : 'Soft Skills: '}</strong>
              <span style={{ color: textColor }}>{activeSoftSkills.map((s) => s.name).join(', ')}</span>
            </div>
          )}
          {activeLangSkills.length > 0 && (
            <div>
              <strong style={{ color: subheadingColor }}>{isEn ? 'Languages: ' : 'Bahasa: '}</strong>
              <span style={{ color: textColor }}>{activeLangSkills.map((s) => s.name).join(', ')}</span>
            </div>
          )}
        </div>
      </section>
    );
  };

  // =========================================================================
  // 1. TEMPLATE: CV ATS FRIENDLY (Minimalis 1-Kolom)
  // =========================================================================
  if (tpl === 'ats' || tpl === 'modern') {
    return (
      <div
        id={id}
        style={{ ...fontStyle, color: textColor, width: '595px', minHeight: '842px', backgroundColor: '#FFFFFF' }}
        className="relative shadow-2xl p-8 sm:p-10 flex flex-col justify-between box-border text-[11px] leading-relaxed transition-all duration-200"
      >
        <div>
          {/* Header ATS Bersih Tengah / Kiri */}
          <header className="border-b pb-3 mb-4 text-center" style={{ borderColor: `${accentColor}33` }}>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: headingColor }}>
              {personal.fullName || 'Nama Lengkap'}
            </h1>
            {personal.targetPosition && (
              <p className="text-xs font-bold tracking-wide uppercase mt-0.5" style={{ color: accentColor }}>
                {personal.targetPosition}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-[9.5px] text-gray-600">
              {personal.phone && <span>{personal.phone}</span>}
              {personal.phone && personal.email && <span>•</span>}
              {personal.email && <span>{personal.email}</span>}
              {personal.email && personal.location && <span>•</span>}
              {personal.location && <span>{personal.location}</span>}
              {socialLinks.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <IkonMediaSosial platform={item.platform} className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                    <span>{item.url || item.username}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </header>

          {renderSummarySection()}
          {renderExperienceSection()}
          {renderEducationSection()}
          {renderSkillsSection()}
          {renderProjectsSection()}
        </div>

        <footer className="pt-3 border-t border-gray-100 flex items-center justify-end text-[8.5px] text-gray-400">
          <span>Halaman 1 dari 1</span>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // 2. TEMPLATE: CV KRONOLOGIS (Fokus Pengalaman Linier)
  // =========================================================================
  if (tpl === 'kronologis' || tpl === 'bisnis') {
    return (
      <div
        id={id}
        style={{ ...fontStyle, color: textColor, width: '595px', minHeight: '842px', backgroundColor: '#FFFFFF' }}
        className="relative shadow-2xl p-8 sm:p-10 flex flex-col justify-between box-border text-[11px] leading-relaxed transition-all duration-200"
      >
        <div>
          {/* Header Formal Bergaris Aksen Tebal */}
          <header className="border-b-2 pb-3 mb-4" style={{ borderColor: accentColor }}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: headingColor }}>
                  {personal.fullName || 'Nama Lengkap'}
                </h1>
                {personal.targetPosition && (
                  <p className="text-xs font-semibold tracking-wider uppercase mt-0.5" style={{ color: accentColor }}>
                    {personal.targetPosition}
                  </p>
                )}
              </div>
              {personal.avatarUrl && (
                <img
                  src={personal.avatarUrl}
                  alt="Avatar"
                  className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-xs"
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[9.5px] text-gray-600">
              {personal.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-2.5 h-2.5 text-gray-400" />
                  {personal.email}
                </span>
              )}
              {personal.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5 text-gray-400" />
                  {personal.phone}
                </span>
              )}
              {personal.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-gray-400" />
                  {personal.location}
                </span>
              )}
              {socialLinks.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <IkonMediaSosial platform={item.platform} className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                  <span>{item.url || item.username}</span>
                </span>
              ))}
            </div>
          </header>

          {renderSummarySection()}
          {/* Prioritas Pengalaman Kerja di urutan pertama */}
          {renderExperienceSection(true)}
          {renderEducationSection()}
          {renderProjectsSection()}
          {renderSkillsSection()}
        </div>

        <footer className="pt-3 border-t border-gray-100 flex items-center justify-end text-[8.5px] text-gray-400">
          <span>Halaman 1 dari 1</span>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // 3. TEMPLATE: CV FUNGSIONAL (Fokus Keahlian & Kompetensi Utama)
  // =========================================================================
  if (tpl === 'fungsional') {
    return (
      <div
        id={id}
        style={{ ...fontStyle, color: textColor, width: '595px', minHeight: '842px', backgroundColor: '#FFFFFF' }}
        className="relative shadow-2xl p-8 sm:p-10 flex flex-col justify-between box-border text-[11px] leading-relaxed transition-all duration-200"
      >
        <div>
          {/* Header Ringkas Berorientasi Kompetensi */}
          <header className="border-b pb-3 mb-4" style={{ borderColor: `${accentColor}33` }}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: headingColor }}>
                  {personal.fullName || 'Nama Lengkap'}
                </h1>
                {personal.targetPosition && (
                  <p className="text-xs font-bold tracking-wide uppercase mt-0.5" style={{ color: accentColor }}>
                    {personal.targetPosition}
                  </p>
                )}
              </div>
              {personal.avatarUrl && (
                <img
                  src={personal.avatarUrl}
                  alt="Avatar"
                  className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-xs"
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[9.5px] text-gray-600">
              {personal.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-2.5 h-2.5 text-gray-400" />
                  {personal.email}
                </span>
              )}
              {personal.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5 text-gray-400" />
                  {personal.phone}
                </span>
              )}
              {personal.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-gray-400" />
                  {personal.location}
                </span>
              )}
              {socialLinks.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <IkonMediaSosial platform={item.platform} className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                  <span>{item.url || item.username}</span>
                </span>
              ))}
            </div>
          </header>

          {renderSummarySection()}
          {/* Keahlian & Kompetensi Ditaruh Paling Atas Sebelum Pengalaman */}
          {renderSkillsSection(true)}
          {renderProjectsSection()}
          {renderExperienceSection()}
          {renderEducationSection()}
        </div>

        <footer className="pt-3 border-t border-gray-100 flex items-center justify-end text-[8.5px] text-gray-400">
          <span>Halaman 1 dari 1</span>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // 4. TEMPLATE: CV KOMBINASI (Dua Kolom: Sidebar 35% + Utama 65%)
  // =========================================================================
  if (tpl === 'kombinasi' || tpl === 'tech') {
    return (
      <div
        id={id}
        style={{ ...fontStyle, color: textColor, width: '595px', minHeight: '842px', backgroundColor: '#FFFFFF' }}
        className="relative shadow-2xl p-6 sm:p-8 flex flex-col justify-between box-border text-[11px] leading-relaxed transition-all duration-200"
      >
        <div className="grid grid-cols-12 gap-5 h-full">
          {/* SIDEBAR KIRI (35% / 4 Kolom) */}
          <aside className="col-span-4 border-r pr-4 space-y-4" style={{ borderColor: `${accentColor}22` }}>
            {/* Foto Profil */}
            {personal.avatarUrl ? (
              <div className="flex justify-center">
                <img
                  src={personal.avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-xl object-cover border-2 shadow-xs"
                  style={{ borderColor: accentColor }}
                />
              </div>
            ) : (
              <div className="h-14 w-14 rounded-xl flex items-center justify-center font-bold text-lg text-white mx-auto" style={{ backgroundColor: accentColor }}>
                {(personal.fullName || 'M').charAt(0)}
              </div>
            )}

            {/* Kontak Sidebar */}
            <div className="space-y-1.5 text-[9px] border-b pb-3" style={{ borderColor: `${accentColor}22` }}>
              <h3 className="font-bold text-[10px] uppercase tracking-wider" style={{ color: accentColor }}>
                {isEn ? 'CONTACT' : 'KONTAK'}
              </h3>
              {personal.email && (
                <div className="flex items-center gap-1 text-gray-700 break-all">
                  <Mail className="w-2.5 h-2.5 shrink-0 text-gray-400" />
                  <span>{personal.email}</span>
                </div>
              )}
              {personal.phone && (
                <div className="flex items-center gap-1 text-gray-700">
                  <Phone className="w-2.5 h-2.5 shrink-0 text-gray-400" />
                  <span>{personal.phone}</span>
                </div>
              )}
              {personal.location && (
                <div className="flex items-center gap-1 text-gray-700">
                  <MapPin className="w-2.5 h-2.5 shrink-0 text-gray-400" />
                  <span>{personal.location}</span>
                </div>
              )}
              {socialLinks.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1 text-gray-700">
                  <IkonMediaSosial platform={item.platform} className="w-2.5 h-2.5 shrink-0 text-gray-400" />
                  <span className="truncate">{item.url || item.username}</span>
                </div>
              ))}
            </div>

            {/* Keahlian Teknis Sidebar */}
            {activeHardSkills.length > 0 && (
              <div className="space-y-1 text-[9.5px]">
                <h3 className="font-bold text-[10px] uppercase tracking-wider" style={{ color: accentColor }}>
                  {isEn ? 'HARD SKILLS' : 'KEAHLIAN TEKNIS'}
                </h3>
                <div className="flex flex-wrap gap-1 pt-1">
                  {activeHardSkills.map((s, i) => (
                    <span key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-700">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills Sidebar */}
            {activeSoftSkills.length > 0 && (
              <div className="space-y-1 text-[9.5px]">
                <h3 className="font-bold text-[10px] uppercase tracking-wider" style={{ color: accentColor }}>
                  SOFT SKILLS
                </h3>
                <ul className="space-y-0.5 text-[9px] text-gray-600">
                  {activeSoftSkills.map((s, i) => (
                    <li key={i}>• {s.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bahasa Sidebar */}
            {activeLangSkills.length > 0 && (
              <div className="space-y-1 text-[9.5px]">
                <h3 className="font-bold text-[10px] uppercase tracking-wider" style={{ color: accentColor }}>
                  {isEn ? 'LANGUAGES' : 'BAHASA'}
                </h3>
                <ul className="space-y-0.5 text-[9px] text-gray-600">
                  {activeLangSkills.map((s, i) => (
                    <li key={i}>• {s.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* KOLOM KANAN (65% / 8 Kolom) */}
          <main className="col-span-8 space-y-3.5">
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: headingColor }}>
                {personal.fullName || 'Nama Lengkap'}
              </h1>
              {personal.targetPosition && (
                <p className="text-xs font-bold tracking-wider uppercase mt-0.5" style={{ color: accentColor }}>
                  {personal.targetPosition}
                </p>
              )}
            </div>

            {renderSummarySection()}
            {renderExperienceSection()}
            {renderEducationSection()}
            {renderProjectsSection()}
          </main>
        </div>

        <footer className="pt-3 border-t border-gray-100 flex items-center justify-end text-[8.5px] text-gray-400">
          <span>Halaman 1 dari 1</span>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // 5. TEMPLATE: CV KREATIF (Banner Berwarna & Layout Ekspresif)
  // =========================================================================
  return (
    <div
      id={id}
      style={{ ...fontStyle, color: textColor, width: '595px', minHeight: '842px', backgroundColor: '#FFFFFF' }}
      className="relative shadow-2xl flex flex-col justify-between box-border text-[11px] leading-relaxed transition-all duration-200"
    >
      <div>
        {/* Banner Atas Berwarna Aksen Tebal */}
        <header className="p-6 text-white" style={{ backgroundColor: accentColor }}>
          <div className="flex items-center gap-4">
            {personal.avatarUrl ? (
              <img
                src={personal.avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center font-black text-xl text-white shrink-0">
                {(personal.fullName || 'M').charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black tracking-tight text-white truncate">
                {personal.fullName || 'Nama Lengkap'}
              </h1>
              {personal.targetPosition && (
                <p className="text-xs font-semibold tracking-wide uppercase text-white/90 mt-0.5">
                  {personal.targetPosition}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[9px] text-white/85">
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && <span>• {personal.phone}</span>}
                {personal.location && <span>• {personal.location}</span>}
                {socialLinks.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1 text-white/90">
                    <IkonMediaSosial platform={item.platform} className="w-2.5 h-2.5 shrink-0 opacity-80" />
                    <span className="truncate">{item.url || item.username}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Konten 2 Kolom di Bawah Banner */}
        <div className="p-6 grid grid-cols-12 gap-5">
          {/* Kolom Kiri (4 Kolom) */}
          <div className="col-span-4 space-y-3 border-r pr-3 border-gray-200">
            {activeHardSkills.length > 0 && (
              <div>
                <h3 className="font-bold text-[10px] uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>
                  {isEn ? 'HARD SKILLS' : 'KEAHLIAN TEKNIS'}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {activeHardSkills.map((s, i) => (
                    <span key={i} className="rounded-full px-2 py-0.5 text-[8.5px] font-bold text-white shadow-2xs" style={{ backgroundColor: accentColor }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeSoftSkills.length > 0 && (
              <div>
                <h3 className="font-bold text-[10px] uppercase tracking-wider mb-1" style={{ color: accentColor }}>
                  SOFT SKILLS
                </h3>
                <ul className="space-y-0.5 text-[9px] text-gray-600">
                  {activeSoftSkills.map((s, i) => (
                    <li key={i}>• {s.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeEdu.length > 0 && (
              <div>
                <h3 className="font-bold text-[10px] uppercase tracking-wider mb-1" style={{ color: accentColor }}>
                  {labelEdu}
                </h3>
                <div className="space-y-2">
                  {activeEdu.map((item, idx) => (
                    <div key={idx} className="text-[9px]">
                      <p className="font-bold text-gray-800">{item.institution}</p>
                      <p className="text-gray-600">{item.degree}</p>
                      <p className="text-gray-400">{item.startDate} - {item.endDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kolom Kanan (8 Kolom) */}
          <div className="col-span-8 space-y-3">
            {renderSummarySection()}
            {renderExperienceSection(true)}
            {renderProjectsSection()}
          </div>
        </div>
      </div>

      <footer className="p-4 border-t border-gray-100 flex items-center justify-end text-[8.5px] text-gray-400">
        <span>Halaman 1 dari 1</span>
      </footer>
    </div>
  );
}
