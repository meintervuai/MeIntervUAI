import React from 'react';

/**
 * Komponen Ilustrasi Miniatur Wireframe Template CV:
 * - Menampilkan visual miniatur tata letak dan posisi elemen CV secara presisi
 * - Proporsi 210 x 297 (aspek rasio A4 standar 1:1.414)
 * - Responsif terhadap warna aksen dinamis yang dipilih pengguna
 * - Mewakili 5 jenis CV standar Jobstreet Indonesia:
 *   1. 'ats': 1-kolom minimalis, teks bersih, tanpa foto/grafis rumit
 *   2. 'kronologis': Formal korporat dengan timeline linier riwayat kerja & foto kanan atas
 *   3. 'fungsional': Berbasis kompetensi dengan kartu sorotan keahlian di posisi paling atas
 *   4. 'kombinasi': Hybrid 2-kolom (Sidebar 35% untuk profil/keahlian + Utama 65% untuk pengalaman)
 *   5. 'kreatif': Header banner berwarna aksen dinamis penuh & tata letak visual 2 kolom
 */
export default function IlustrasiTemplateCv({
  templateId = 'ats',
  accentColor = '#EA580C',
  isSelected = false,
}) {
  const tpl = templateId || 'ats';

  // 1. CV ATS FRIENDLY
  if (tpl === 'ats' || tpl === 'modern') {
    return (
      <svg
        viewBox="0 0 210 297"
        className="h-full w-full rounded shadow-xs"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Border kertas A4 */}
        <rect x="0" y="0" width="210" height="297" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

        {/* Header ATS Tengah Bersih (Tanpa Foto) */}
        <rect x="60" y="16" width="90" height="7" rx="2" fill="#1E293B" />
        <rect x="75" y="27" width="60" height="4" rx="1.5" fill={accentColor} />
        <rect x="50" y="35" width="110" height="2.5" rx="1" fill="#94A3B8" />

        {/* Garis Pembatas Tipis */}
        <line x1="20" y1="42" x2="190" y2="42" stroke="#E2E8F0" strokeWidth="1" />

        {/* Seksi: Ringkasan Profesional */}
        <rect x="20" y="48" width="55" height="3.5" rx="1" fill={accentColor} />
        <rect x="20" y="55" width="170" height="2" rx="1" fill="#CBD5E1" />
        <rect x="20" y="60" width="145" height="2" rx="1" fill="#E2E8F0" />

        {/* Seksi: Pengalaman Kerja */}
        <rect x="20" y="70" width="60" height="3.5" rx="1" fill={accentColor} />
        {/* Item 1 */}
        <rect x="20" y="77" width="70" height="3" rx="1" fill="#334155" />
        <rect x="150" y="77" width="40" height="2.5" rx="1" fill="#94A3B8" />
        <rect x="20" y="83" width="165" height="2" rx="1" fill="#CBD5E1" />
        <rect x="20" y="88" width="140" height="2" rx="1" fill="#E2E8F0" />
        {/* Item 2 */}
        <rect x="20" y="96" width="65" height="3" rx="1" fill="#334155" />
        <rect x="155" y="96" width="35" height="2.5" rx="1" fill="#94A3B8" />
        <rect x="20" y="102" width="150" height="2" rx="1" fill="#CBD5E1" />

        {/* Seksi: Pendidikan */}
        <rect x="20" y="113" width="45" height="3.5" rx="1" fill={accentColor} />
        <rect x="20" y="120" width="80" height="3" rx="1" fill="#334155" />
        <rect x="150" y="120" width="40" height="2.5" rx="1" fill="#94A3B8" />
        <rect x="20" y="126" width="130" height="2" rx="1" fill="#E2E8F0" />

        {/* Seksi: Keahlian (Baris Teks Linier) */}
        <rect x="20" y="137" width="55" height="3.5" rx="1" fill={accentColor} />
        <rect x="20" y="144" width="35" height="2.5" rx="1" fill="#475569" />
        <rect x="58" y="144" width="125" height="2" rx="1" fill="#94A3B8" />
        <rect x="20" y="150" width="30" height="2.5" rx="1" fill="#475569" />
        <rect x="53" y="150" width="100" height="2" rx="1" fill="#94A3B8" />

        {/* Seksi: Proyek */}
        <rect x="20" y="161" width="50" height="3.5" rx="1" fill={accentColor} />
        <rect x="20" y="168" width="75" height="3" rx="1" fill="#334155" />
        <rect x="20" y="174" width="160" height="2" rx="1" fill="#E2E8F0" />

        {/* Label Format di Bawah */}
        <rect x="20" y="278" width="60" height="3" rx="1" fill="#94A3B8" opacity="0.6" />
        <rect x="165" y="278" width="25" height="3" rx="1" fill="#94A3B8" opacity="0.6" />
      </svg>
    );
  }

  // 2. CV KRONOLOGIS
  if (tpl === 'kronologis' || tpl === 'bisnis') {
    return (
      <svg
        viewBox="0 0 210 297"
        className="h-full w-full rounded shadow-xs"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <rect x="0" y="0" width="210" height="297" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

        {/* Header Formal: Teks Kiri + Foto Kanan */}
        <rect x="20" y="18" width="85" height="7" rx="2" fill="#1E293B" />
        <rect x="20" y="28" width="55" height="4" rx="1.5" fill={accentColor} />
        <rect x="20" y="36" width="95" height="2.5" rx="1" fill="#64748B" />

        {/* Foto Formal Kanan */}
        <rect x="160" y="16" width="30" height="30" rx="3" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
        <circle cx="175" cy="27" r="6" fill="#94A3B8" opacity="0.5" />
        <path d="M165 42 Q175 35 185 42" fill="#94A3B8" opacity="0.5" />

        {/* Garis Pembatas Aksen Tebal */}
        <line x1="20" y1="52" x2="190" y2="52" stroke={accentColor} strokeWidth="2" />

        {/* Ringkasan */}
        <rect x="20" y="58" width="170" height="2" rx="1" fill="#CBD5E1" />
        <rect x="20" y="63" width="140" height="2" rx="1" fill="#E2E8F0" />

        {/* Timeline Pengalaman Kerja Linier (Fokus Utama) */}
        <rect x="20" y="73" width="65" height="4" rx="1" fill={accentColor} />
        {/* Garis vertikal timeline */}
        <line x1="26" y1="83" x2="26" y2="155" stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.35" />

        {/* Milestone 1 */}
        <circle cx="26" cy="86" r="3" fill={accentColor} />
        <rect x="34" y="84" width="70" height="3.5" rx="1" fill="#1E293B" />
        <rect x="150" y="84" width="40" height="3" rx="1" fill="#64748B" />
        <rect x="34" y="90" width="155" height="2" rx="1" fill="#CBD5E1" />
        <rect x="34" y="95" width="135" height="2" rx="1" fill="#E2E8F0" />

        {/* Milestone 2 */}
        <circle cx="26" cy="110" r="3" fill={accentColor} />
        <rect x="34" y="108" width="65" height="3.5" rx="1" fill="#1E293B" />
        <rect x="155" y="108" width="35" height="3" rx="1" fill="#64748B" />
        <rect x="34" y="114" width="150" height="2" rx="1" fill="#CBD5E1" />
        <rect x="34" y="119" width="125" height="2" rx="1" fill="#E2E8F0" />

        {/* Milestone 3 */}
        <circle cx="26" cy="134" r="3" fill={accentColor} />
        <rect x="34" y="132" width="55" height="3.5" rx="1" fill="#1E293B" />
        <rect x="150" y="132" width="40" height="3" rx="1" fill="#64748B" />
        <rect x="34" y="138" width="140" height="2" rx="1" fill="#E2E8F0" />

        {/* Pendidikan & Proyek */}
        <rect x="20" y="162" width="45" height="3.5" rx="1" fill={accentColor} />
        <rect x="20" y="169" width="80" height="3" rx="1" fill="#334155" />
        <rect x="150" y="169" width="40" height="2.5" rx="1" fill="#94A3B8" />

        <rect x="20" y="184" width="50" height="3.5" rx="1" fill={accentColor} />
        <rect x="20" y="191" width="75" height="3" rx="1" fill="#334155" />
        <rect x="20" y="197" width="150" height="2" rx="1" fill="#E2E8F0" />
      </svg>
    );
  }

  // 3. CV FUNGSIONAL
  if (tpl === 'fungsional') {
    return (
      <svg
        viewBox="0 0 210 297"
        className="h-full w-full rounded shadow-xs"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <rect x="0" y="0" width="210" height="297" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

        {/* Header Ringkas */}
        <rect x="20" y="16" width="80" height="6.5" rx="2" fill="#1E293B" />
        <rect x="20" y="25" width="55" height="3.5" rx="1" fill={accentColor} />
        <rect x="20" y="32" width="115" height="2.5" rx="1" fill="#64748B" />

        <line x1="20" y1="39" x2="190" y2="39" stroke="#E2E8F0" strokeWidth="1" />

        {/* Ringkasan */}
        <rect x="20" y="44" width="170" height="2" rx="1" fill="#CBD5E1" />
        <rect x="20" y="49" width="140" height="2" rx="1" fill="#E2E8F0" />

        {/* SOROTAN UTAMA: 3 KOTAK KOMPETENSI / KEAHLIAN DI ATAS */}
        <rect x="20" y="58" width="75" height="4" rx="1" fill={accentColor} />

        {/* Kotak 1: Hard Skills */}
        <rect x="20" y="66" width="53" height="48" rx="3" fill="#F8FAFC" stroke="#E2E8F0" />
        <rect x="24" y="70" width="35" height="3" rx="1" fill={accentColor} />
        <circle cx="26" cy="78" r="1.5" fill={accentColor} />
        <rect x="30" y="77" width="38" height="2" rx="1" fill="#475569" />
        <circle cx="26" cy="85" r="1.5" fill={accentColor} />
        <rect x="30" y="84" width="35" height="2" rx="1" fill="#475569" />
        <circle cx="26" cy="92" r="1.5" fill={accentColor} />
        <rect x="30" y="91" width="40" height="2" rx="1" fill="#475569" />
        <circle cx="26" cy="99" r="1.5" fill={accentColor} />
        <rect x="30" y="98" width="32" height="2" rx="1" fill="#475569" />

        {/* Kotak 2: Soft Skills */}
        <rect x="78" y="66" width="53" height="48" rx="3" fill="#F8FAFC" stroke="#E2E8F0" />
        <rect x="82" y="70" width="30" height="3" rx="1" fill={accentColor} />
        <circle cx="84" cy="78" r="1.5" fill={accentColor} />
        <rect x="88" y="77" width="36" height="2" rx="1" fill="#475569" />
        <circle cx="84" cy="85" r="1.5" fill={accentColor} />
        <rect x="88" y="84" width="38" height="2" rx="1" fill="#475569" />
        <circle cx="84" cy="92" r="1.5" fill={accentColor} />
        <rect x="88" y="91" width="34" height="2" rx="1" fill="#475569" />

        {/* Kotak 3: Bahasa */}
        <rect x="136" y="66" width="54" height="48" rx="3" fill="#F8FAFC" stroke="#E2E8F0" />
        <rect x="140" y="70" width="28" height="3" rx="1" fill={accentColor} />
        <circle cx="142" cy="78" r="1.5" fill={accentColor} />
        <rect x="146" y="77" width="38" height="2" rx="1" fill="#475569" />
        <circle cx="142" cy="85" r="1.5" fill={accentColor} />
        <rect x="146" y="84" width="35" height="2" rx="1" fill="#475569" />

        {/* Proyek & Portofolio Relevan (Bukti Kompetensi) */}
        <rect x="20" y="122" width="60" height="4" rx="1" fill={accentColor} />
        <rect x="20" y="130" width="75" height="3" rx="1" fill="#1E293B" />
        <rect x="20" y="136" width="165" height="2" rx="1" fill="#CBD5E1" />
        <rect x="20" y="141" width="135" height="2" rx="1" fill="#E2E8F0" />

        <rect x="20" y="150" width="70" height="3" rx="1" fill="#1E293B" />
        <rect x="20" y="156" width="160" height="2" rx="1" fill="#E2E8F0" />

        {/* Pengalaman Kerja Ringkas */}
        <rect x="20" y="168" width="55" height="3.5" rx="1" fill={accentColor} />
        <rect x="20" y="175" width="65" height="3" rx="1" fill="#334155" />
        <rect x="150" y="175" width="40" height="2.5" rx="1" fill="#94A3B8" />

        {/* Pendidikan */}
        <rect x="20" y="188" width="45" height="3.5" rx="1" fill={accentColor} />
        <rect x="20" y="195" width="70" height="3" rx="1" fill="#334155" />
        <rect x="150" y="195" width="40" height="2.5" rx="1" fill="#94A3B8" />
      </svg>
    );
  }

  // 4. CV KOMBINASI (HYBRID 2-KOLOM: SIDEBAR 35% + UTAMA 65%)
  if (tpl === 'kombinasi' || tpl === 'tech') {
    return (
      <svg
        viewBox="0 0 210 297"
        className="h-full w-full rounded shadow-xs"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <rect x="0" y="0" width="210" height="297" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

        {/* SIDEBAR KIRI (x=0 to 72, Lebar ~34%) */}
        <rect x="0" y="0" width="72" height="297" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />

        {/* Avatar Bulat di Sidebar */}
        <circle cx="36" cy="28" r="14" fill={accentColor} />
        <circle cx="36" cy="25" r="5" fill="#FFFFFF" fillOpacity="0.8" />
        <path d="M26 38 Q36 31 46 38" fill="#FFFFFF" fillOpacity="0.8" />

        {/* Kontak Sidebar */}
        <rect x="10" y="52" width="32" height="3" rx="1" fill={accentColor} />
        <circle cx="13" cy="61" r="1.5" fill="#94A3B8" />
        <rect x="18" y="60" width="45" height="2" rx="1" fill="#64748B" />
        <circle cx="13" cy="68" r="1.5" fill="#94A3B8" />
        <rect x="18" y="67" width="42" height="2" rx="1" fill="#64748B" />
        <circle cx="13" cy="75" r="1.5" fill="#94A3B8" />
        <rect x="18" y="74" width="48" height="2" rx="1" fill="#64748B" />

        {/* Keahlian Teknis (Badges) di Sidebar */}
        <rect x="10" y="86" width="45" height="3" rx="1" fill={accentColor} />
        <rect x="10" y="93" width="22" height="5" rx="1.5" fill="#E2E8F0" />
        <rect x="35" y="93" width="26" height="5" rx="1.5" fill="#E2E8F0" />
        <rect x="10" y="101" width="30" height="5" rx="1.5" fill="#E2E8F0" />
        <rect x="43" y="101" width="20" height="5" rx="1.5" fill="#E2E8F0" />
        <rect x="10" y="109" width="26" height="5" rx="1.5" fill="#E2E8F0" />

        {/* Soft Skills di Sidebar */}
        <rect x="10" y="122" width="35" height="3" rx="1" fill={accentColor} />
        <rect x="10" y="129" width="48" height="2" rx="1" fill="#64748B" />
        <rect x="10" y="134" width="42" height="2" rx="1" fill="#64748B" />
        <rect x="10" y="139" width="46" height="2" rx="1" fill="#64748B" />

        {/* Bahasa di Sidebar */}
        <rect x="10" y="152" width="30" height="3" rx="1" fill={accentColor} />
        <rect x="10" y="159" width="45" height="2" rx="1" fill="#64748B" />
        <rect x="10" y="164" width="40" height="2" rx="1" fill="#64748B" />

        {/* KOLOM UTAMA KANAN (x=80 to 200, Lebar ~66%) */}
        {/* Nama & Target Posisi */}
        <rect x="82" y="20" width="85" height="7" rx="2" fill="#1E293B" />
        <rect x="82" y="30" width="60" height="4" rx="1.5" fill={accentColor} />

        {/* Ringkasan Profesional */}
        <rect x="82" y="44" width="45" height="3" rx="1" fill={accentColor} />
        <rect x="82" y="50" width="118" height="2" rx="1" fill="#CBD5E1" />
        <rect x="82" y="55" width="105" height="2" rx="1" fill="#E2E8F0" />

        {/* Pengalaman Kerja Terperinci */}
        <rect x="82" y="66" width="60" height="3.5" rx="1" fill={accentColor} />
        <rect x="82" y="73" width="65" height="3" rx="1" fill="#1E293B" />
        <rect x="160" y="73" width="38" height="2.5" rx="1" fill="#94A3B8" />
        <rect x="82" y="79" width="118" height="2" rx="1" fill="#CBD5E1" />
        <rect x="82" y="84" width="105" height="2" rx="1" fill="#E2E8F0" />

        <rect x="82" y="93" width="60" height="3" rx="1" fill="#1E293B" />
        <rect x="165" y="93" width="33" height="2.5" rx="1" fill="#94A3B8" />
        <rect x="82" y="99" width="115" height="2" rx="1" fill="#E2E8F0" />

        {/* Pendidikan */}
        <rect x="82" y="112" width="45" height="3.5" rx="1" fill={accentColor} />
        <rect x="82" y="119" width="75" height="3" rx="1" fill="#334155" />
        <rect x="160" y="119" width="38" height="2.5" rx="1" fill="#94A3B8" />

        {/* Proyek */}
        <rect x="82" y="133" width="50" height="3.5" rx="1" fill={accentColor} />
        <rect x="82" y="140" width="70" height="3" rx="1" fill="#334155" />
        <rect x="82" y="146" width="115" height="2" rx="1" fill="#E2E8F0" />
      </svg>
    );
  }

  // 5. CV KREATIF (HEADER BANNER BERWARNA AKSEN & LAYOUT MODERN)
  return (
    <svg
      viewBox="0 0 210 297"
      className="h-full w-full rounded shadow-xs"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <rect x="0" y="0" width="210" height="297" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

      {/* HEADER BANNER PENUH DENGAN WARNA AKSEN */}
      <rect x="0" y="0" width="210" height="66" fill={accentColor} />

      {/* Avatar Bulat dengan Bingkai Putih */}
      <circle cx="35" cy="33" r="16" fill="#FFFFFF" fillOpacity="0.25" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="35" cy="30" r="6" fill="#FFFFFF" fillOpacity="0.9" />
      <path d="M24 45 Q35 38 46 45" fill="#FFFFFF" fillOpacity="0.9" />

      {/* Teks Putih Elegan di Banner */}
      <rect x="62" y="21" width="85" height="7" rx="2" fill="#FFFFFF" />
      <rect x="62" y="32" width="55" height="4" rx="1" fill="#FFFFFF" fillOpacity="0.85" />
      <rect x="62" y="41" width="120" height="3" rx="1" fill="#FFFFFF" fillOpacity="0.65" />

      {/* KONTEN 2-KOLOM MODERN DI BAWAH BANNER */}
      {/* Kolom Kiri (x=16 to 75) */}
      {/* Hard Skills dengan Pill Aksen */}
      <rect x="16" y="80" width="40" height="3.5" rx="1" fill={accentColor} />
      <rect x="16" y="87" width="26" height="6" rx="3" fill={accentColor} />
      <rect x="45" y="87" width="24" height="6" rx="3" fill={accentColor} />
      <rect x="16" y="96" width="30" height="6" rx="3" fill={accentColor} />
      <rect x="49" y="96" width="20" height="6" rx="3" fill={accentColor} />

      {/* Soft Skills */}
      <rect x="16" y="112" width="35" height="3" rx="1" fill={accentColor} />
      <rect x="16" y="118" width="50" height="2" rx="1" fill="#64748B" />
      <rect x="16" y="123" width="45" height="2" rx="1" fill="#64748B" />

      {/* Pendidikan */}
      <rect x="16" y="136" width="40" height="3.5" rx="1" fill={accentColor} />
      <rect x="16" y="143" width="52" height="3" rx="1" fill="#1E293B" />
      <rect x="16" y="148" width="45" height="2" rx="1" fill="#64748B" />
      <rect x="16" y="152" width="35" height="2" rx="1" fill="#94A3B8" />

      {/* Garis Pembatas Antar Kolom */}
      <line x1="77" y1="76" x2="77" y2="280" stroke="#F1F5F9" strokeWidth="1" />

      {/* Kolom Kanan (x=85 to 195) */}
      {/* Ringkasan */}
      <rect x="85" y="80" width="50" height="3.5" rx="1" fill={accentColor} />
      <rect x="85" y="87" width="110" height="2" rx="1" fill="#CBD5E1" />
      <rect x="85" y="92" width="95" height="2" rx="1" fill="#E2E8F0" />

      {/* Pengalaman Timeline Modern */}
      <rect x="85" y="103" width="60" height="3.5" rx="1" fill={accentColor} />
      <rect x="85" y="110" width="65" height="3" rx="1" fill="#1E293B" />
      <rect x="160" y="110" width="35" height="2.5" rx="1" fill="#94A3B8" />
      <rect x="85" y="116" width="110" height="2" rx="1" fill="#CBD5E1" />
      <rect x="85" y="121" width="90" height="2" rx="1" fill="#E2E8F0" />

      <rect x="85" y="130" width="60" height="3" rx="1" fill="#1E293B" />
      <rect x="165" y="130" width="30" height="2.5" rx="1" fill="#94A3B8" />
      <rect x="85" y="136" width="105" height="2" rx="1" fill="#E2E8F0" />

      {/* Proyek */}
      <rect x="85" y="150" width="50" height="3.5" rx="1" fill={accentColor} />
      <rect x="85" y="157" width="70" height="3" rx="1" fill="#1E293B" />
      <rect x="85" y="163" width="110" height="2" rx="1" fill="#E2E8F0" />
    </svg>
  );
}
