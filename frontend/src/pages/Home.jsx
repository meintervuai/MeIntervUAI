import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Play,
  Trophy,
  MessageSquare,
  Zap,
  Sparkles,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  LayoutDashboard,
  FileText,
} from 'lucide-react';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import { pakaiKuota } from '../hooks/pakai_kuota';
import { ambilCvTerbaru, ambilAnalisisTerbaru } from '../services/api_cv';
import KotakAnalisisCv from '../components/cv/KotakAnalisisCv';

/**
 * Halaman Beranda (Home Dashboard):
 * - Mobile (< lg): Menggunakan Tabbed View dengan segmented pill buttons
 *   - Tab 1: "Ringkasan" (Hero Banner Simulasi, 3 Stat Cards, Aktivitas Terakhir, Card Shortcut Profil CV)
 *   - Tab 2: "Analisis CV" (Kotak Inline Analisis CV dengan AI, skor ATS, saran perbaikan, rekomendasi posisi)
 *   - Tab 3: "Profil CV" (Circular Progress bar kelengkapan & Accordion 6 bagian CV)
 * - Desktop (>= lg): Split-Screen 2 Kolom lengkap
 *   - Kolom Kiri: Banner + Stats + Kotak Analisis CV + Aktivitas Terakhir
 *   - Kolom Kanan: Profil CV Sidebar
 * - State tab aktif tersimpan persisten di localStorage & URL search params
 */
export default function Home() {
  const { profil } = pakaiOtentikasi();
  const { kuota, kurangi } = pakaiKuota();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [cvData, setCvData] = useState(null);

  // State persisten analisis terakhir: baca dari localStorage jika ada
  const [analisisTerbaru, setAnalisisTerbaru] = useState(() => {
    try {
      const lokal = localStorage.getItem('mentervu_analisis_cv');
      return lokal ? JSON.parse(lokal) : null;
    } catch (e) {
      return null;
    }
  });

  // State persisten tab aktif khusus mobile: baca dari localStorage atau default 'ringkasan'
  const [tabAktifMobile, setTabAktifMobile] = useState(() => {
    try {
      const tersimpan = localStorage.getItem('mentervu_home_tab_mobile');
      return tersimpan && ['ringkasan', 'analisis', 'profil'].includes(tersimpan)
        ? tersimpan
        : 'ringkasan';
    } catch (e) {
      return 'ringkasan';
    }
  });

  // Sinkronisasi tab dengan query URL (jika ada ?tab=...)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['ringkasan', 'analisis', 'profil'].includes(tabParam)) {
      setTabAktifMobile(tabParam);
      try {
        localStorage.setItem('mentervu_home_tab_mobile', tabParam);
      } catch (e) {}
    }
  }, [searchParams]);

  // Handler pergantian tab mobile dengan penyimpanan persisten
  const gantiTabMobile = (tabId) => {
    setTabAktifMobile(tabId);
    try {
      localStorage.setItem('mentervu_home_tab_mobile', tabId);
    } catch (e) {}
  };

  const [accordionOpen, setAccordionOpen] = useState({
    personal: false,
    bio: false,
    pendidikan: false,
    pengalaman: false,
    keahlian: false,
    proyek: false,
  });

  // Format Tanggal Hari Ini (Indonesia)
  const formatHariTanggal = () => {
    const d = new Date();
    const namaHari = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ][d.getDay()];
    const namaBulan = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ][d.getMonth()];
    return `${namaHari}, ${d.getDate()} ${namaBulan}`;
  };

  // Muat data CV & Analisis
  useEffect(() => {
    let aktif = true;
    async function muatData() {
      // 1. Ambil dari localStorage terlebih dahulu
      const lokalCv = localStorage.getItem('mentervu_cv_data');
      if (lokalCv) {
        try {
          const parsed = JSON.parse(lokalCv);
          if (aktif && parsed) setCvData(parsed);
        } catch (e) {
          console.warn('[Home] Gagal parse localStorage CV:', e);
        }
      }

      const lokalAnalisis = localStorage.getItem('mentervu_analisis_cv');
      if (lokalAnalisis) {
        try {
          const parsed = JSON.parse(lokalAnalisis);
          if (aktif && parsed) setAnalisisTerbaru(parsed);
        } catch (e) {
          console.warn('[Home] Gagal parse localStorage analisis:', e);
        }
      }

      // 2. Ambil dari Supabase jika ada profil
      if (profil?.id) {
        try {
          const [cvDb, analisisDb] = await Promise.all([
            ambilCvTerbaru(profil.id),
            ambilAnalisisTerbaru(profil.id),
          ]);
          if (aktif) {
            if (cvDb?.data_cv) {
              setCvData(cvDb.data_cv);
            }
            if (analisisDb) {
              setAnalisisTerbaru(analisisDb);
              try {
                localStorage.setItem('mentervu_analisis_cv', JSON.stringify(analisisDb));
              } catch (e) {}
            }
          }
        } catch (e) {
          console.warn('[Home] Gagal memuat data dari Supabase:', e);
        }
      }
    }

    muatData();
    return () => {
      aktif = false;
    };
  }, [profil?.id]);

  // Kalkulasi Kelengkapan 6 Bagian CV
  const hitungKelengkapan = () => {
    const personal = cvData?.personal || {};
    const exp = (cvData?.experience || []).filter((e) => e.visible !== false);
    const edu = (cvData?.education || []).filter((e) => e.visible !== false);
    const hardSkills = (cvData?.skills?.hard || []).filter((s) => s.visible !== false);
    const softSkills = (cvData?.skills?.soft || []).filter((s) => s.visible !== false);
    const langSkills = (cvData?.skills?.language || []).filter((s) => s.visible !== false);
    const projects = (cvData?.projects || []).filter((p) => p.visible !== false);

    // 1. Informasi Pribadi
    const personalKosong = [];
    if (!personal.fullName && !profil?.nama_lengkap) personalKosong.push('Nama Lengkap');
    if (!personal.targetPosition && !profil?.posisi_target) personalKosong.push('Posisi Target');
    if (!personal.phone) personalKosong.push('Nomor Telepon');
    if (!personal.email && !profil?.email) personalKosong.push('Email');
    if (!personal.location) personalKosong.push('Lokasi / Kota');
    if (!personal.avatarUrl && !profil?.url_avatar) personalKosong.push('Foto Profil');
    const personalLengkap = personalKosong.length === 0;

    // 2. Ringkasan Profesional
    const bioKosong = [];
    if (!personal.bio || personal.bio.trim().length < 20) {
      bioKosong.push('Ringkasan profil belum diisi atau terlalu singkat');
    }
    const bioLengkap = bioKosong.length === 0;

    // 3. Pendidikan
    const eduKosong = [];
    if (edu.length === 0) {
      eduKosong.push('Belum menambahkan riwayat pendidikan');
    } else if (!edu[0].institution || !edu[0].degree) {
      eduKosong.push('Nama institusi atau gelar pendidikan belum lengkap');
    }
    const eduLengkap = eduKosong.length === 0;

    // 4. Pengalaman Kerja
    const expKosong = [];
    if (exp.length === 0) {
      expKosong.push('Belum menambahkan riwayat pengalaman kerja');
    } else if (!exp[0].position || !exp[0].company) {
      expKosong.push('Posisi atau nama perusahaan belum lengkap');
    }
    const expLengkap = expKosong.length === 0;

    // 5. Keahlian
    const skillKosong = [];
    if (hardSkills.length === 0) skillKosong.push('Keahlian teknis (Hard Skills)');
    if (softSkills.length === 0) skillKosong.push('Soft skills');
    if (langSkills.length === 0) skillKosong.push('Kemampuan bahasa');
    const skillLengkap = skillKosong.length === 0;

    // 6. Proyek / Portofolio
    const projectKosong = [];
    if (projects.length === 0) {
      projectKosong.push('Belum menambahkan proyek atau portofolio');
    } else if (!projects[0].name) {
      projectKosong.push('Nama proyek belum lengkap');
    }
    const projectLengkap = projectKosong.length === 0;

    const sections = [
      {
        id: 'personal',
        nama: 'Informasi Pribadi',
        tab: 'PERSONAL',
        isLengkap: personalLengkap,
        daftarKosong: personalKosong,
        selesaiText: personalLengkap ? '6/6 selesai, 100%' : `${6 - personalKosong.length}/6 selesai`,
      },
      {
        id: 'bio',
        nama: 'Ringkasan Profesional',
        tab: 'PERSONAL',
        isLengkap: bioLengkap,
        daftarKosong: bioKosong,
        selesaiText: bioLengkap ? '1/1 selesai, 100%' : '0/1 selesai, 0%',
      },
      {
        id: 'pendidikan',
        nama: 'Pendidikan',
        tab: 'PENDIDIKAN',
        isLengkap: eduLengkap,
        daftarKosong: eduKosong,
        selesaiText: eduLengkap ? `${edu.length} riwayat selesai` : '0/1 selesai, 0%',
      },
      {
        id: 'pengalaman',
        nama: 'Pengalaman Kerja',
        tab: 'PENGALAMAN',
        isLengkap: expLengkap,
        daftarKosong: expKosong,
        selesaiText: expLengkap ? `${exp.length} riwayat selesai` : '0/1 selesai, 0%',
      },
      {
        id: 'keahlian',
        nama: 'Keahlian',
        tab: 'KEAHLIAN',
        isLengkap: skillLengkap,
        daftarKosong: skillKosong,
        selesaiText: skillLengkap
          ? `${hardSkills.length + softSkills.length + langSkills.length} keahlian`
          : `${3 - skillKosong.length}/3 kategori`,
      },
      {
        id: 'proyek',
        nama: 'Proyek / Portofolio',
        tab: 'PROYEK',
        isLengkap: projectLengkap,
        daftarKosong: projectKosong,
        selesaiText: projectLengkap ? `${projects.length} proyek selesai` : '0/1 selesai, 0%',
      },
    ];

    const seksiLengkapCount = sections.filter((s) => s.isLengkap).length;
    const persentase = Math.round((seksiLengkapCount / 6) * 100);

    return { sections, seksiLengkapCount, persentase };
  };

  const { sections, seksiLengkapCount, persentase } = hitungKelengkapan();

  const toggleAccordion = (id) => {
    setAccordionOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const namaTampil =
    profil?.nama_lengkap?.split(' ')[0] ||
    cvData?.personal?.fullName?.split(' ')[0] ||
    'Budi';

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* ================= 1. HEADER DASHBOARD ================= */}
      <header className="flex flex-col justify-between gap-3 sm:gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
            Halo, {namaTampil}! Siap berlatih hari ini?
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
            Lanjutkan progresmu untuk meraih karir impian.
          </p>
        </div>

        {/* Widget Tanggal Saat Ini */}
        <div className="self-start sm:self-auto flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm shrink-0">
          <Calendar className="h-4 w-4 text-[#FF6B00]" />
          <span className="font-semibold">{formatHariTanggal()}</span>
        </div>
      </header>

      {/* ================= 2. MOBILE TAB NAVIGATION (KHUSUS MOBILE / < lg) ================= */}
      <div className="lg:hidden">
        <div className="flex items-center rounded-2xl bg-gray-100/90 p-1 border border-gray-200/80 shadow-2xs">
          {/* Tab 1: Ringkasan */}
          <button
            type="button"
            onClick={() => gantiTabMobile('ringkasan')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition-all duration-200 min-h-[44px] cursor-pointer ${
              tabAktifMobile === 'ringkasan'
                ? 'bg-white text-[#FF6B00] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span>Ringkasan</span>
          </button>

          {/* Tab 2: Analisis CV */}
          <button
            type="button"
            onClick={() => gantiTabMobile('analisis')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition-all duration-200 min-h-[44px] cursor-pointer ${
              tabAktifMobile === 'analisis'
                ? 'bg-white text-[#FF6B00] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Analisis CV</span>
            {analisisTerbaru?.skor_kelengkapan && (
              <span className="hidden xs:inline-block rounded-full bg-orange-100 px-1.5 py-0.2 text-[9px] font-bold text-[#FF6B00]">
                {analisisTerbaru.skor_kelengkapan}
              </span>
            )}
          </button>

          {/* Tab 3: Profil CV */}
          <button
            type="button"
            onClick={() => gantiTabMobile('profil')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition-all duration-200 min-h-[44px] cursor-pointer ${
              tabAktifMobile === 'profil'
                ? 'bg-white text-[#FF6B00] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span>Profil CV</span>
            <span className="hidden xs:inline-block rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700">
              {persentase}%
            </span>
          </button>
        </div>
      </div>

      {/* ================= 3. LAYOUT UTAMA (SPLIT SCREEN 2 KOLOM DI DESKTOP, TABBED DI MOBILE) ================= */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
        {/* ================= KOLOM KIRI (lg:col-span-2) ================= */}
        <div className="space-y-5 sm:space-y-6 lg:col-span-2">
          {/* A. BANNER HERO: SIMULASI WAWANCARA AI (Bagian dari Tab 'ringkasan' di mobile, selalu tampil di desktop) */}
          <div className={tabAktifMobile === 'ringkasan' ? 'block' : 'hidden lg:block'}>
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-5 sm:p-7 text-white shadow-md">
              {/* Ornamen Lingkaran Halus Latar Belakang */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-amber-400/20 blur-xl" />

              <div className="relative z-10">
                {/* Badge Atas */}
                <div className="mb-3 inline-block rounded-full bg-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-semibold tracking-wider text-white uppercase backdrop-blur-sm shadow-2xs">
                  POWERED BY AGIL MAHASISWA S1 SISTEM INFORMASI UKSW
                </div>

                {/* Judul & Subtitle */}
                <h2 className="text-lg sm:text-2xl font-bold mb-1 tracking-tight text-white">
                  Simulasi Wawancara AI
                </h2>
                <p className="text-xs text-orange-100 max-w-md leading-relaxed mb-4 sm:mb-5">
                  Latih kemampuan wawancaramu dengan AI roleplay yang disesuaikan
                  dengan profil dan lowongan yang kamu tuju.
                </p>

                {/* Tombol Utama */}
                <button
                  type="button"
                  onClick={() => navigate('/simulasi')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-orange-600 shadow-sm transition-all hover:bg-orange-50 active:scale-[0.98] min-h-[44px] cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-orange-600 text-orange-600" />
                  <span>MULAI SIMULASI</span>
                </button>
              </div>
            </section>
          </div>

          {/* B. GRID 3 KARTU STATISTIK (Bagian dari Tab 'ringkasan' di mobile, selalu tampil di desktop) */}
          <div className={tabAktifMobile === 'ringkasan' ? 'block' : 'hidden lg:block'}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
              {/* Kartu 1: SKOR TERAKHIR */}
              <div
                onClick={() => gantiTabMobile('analisis')}
                className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-4 shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer lg:cursor-default"
              >
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Trophy className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                    SKOR TERAKHIR
                  </span>
                  <p className="font-display text-base sm:text-lg font-bold text-gray-800 mt-0.5 truncate">
                    {analisisTerbaru?.skor_kelengkapan
                      ? `${analisisTerbaru.skor_kelengkapan} / 100`
                      : '- / 100'}
                  </p>
                </div>
              </div>

              {/* Kartu 2: SESI LATIHAN */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-4 shadow-sm transition-transform hover:-translate-y-0.5">
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                    SESI LATIHAN
                  </span>
                  <p className="font-display text-base sm:text-lg font-bold text-gray-800 mt-0.5 truncate">
                    0 sesi
                  </p>
                </div>
              </div>

              {/* Kartu 3: SISA KUOTA AI */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-4 shadow-sm transition-transform hover:-translate-y-0.5">
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Zap className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                    SISA KUOTA AI
                  </span>
                  <p className="font-display text-base sm:text-lg font-bold text-gray-800 mt-0.5 truncate">
                    {kuota?.sisa !== undefined
                      ? `${kuota.sisa} / ${kuota.batas}`
                      : '20 / 20'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* C. KARTU RINGKASAN PROFIL CV DI TAB RINGKASAN (Khusus Mobile < lg) */}
          <div className={tabAktifMobile === 'ringkasan' ? 'block lg:hidden' : 'hidden'}>
            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B00] font-black text-sm border border-orange-200/60">
                  {persentase}%
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-xs font-bold text-gray-800 truncate">
                    Kelengkapan Profil CV
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">
                    {seksiLengkapCount} dari 6 seksi telah dilengkapi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => gantiTabMobile('profil')}
                className="flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline shrink-0 ml-2 cursor-pointer"
              >
                <span>Lihat</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* D. KOTAK ANALISIS CV AI (Tampil di Tab 'analisis' pada mobile, selalu tampil di desktop) */}
          <div className={tabAktifMobile === 'analisis' ? 'block' : 'hidden lg:block'}>
            <KotakAnalisisCv
              cvData={cvData}
              analisisTerbaru={analisisTerbaru}
              onAnalisisSelesai={(hasil) => setAnalisisTerbaru(hasil)}
              profil={profil}
              onKurangiKuota={kurangi}
            />
          </div>

          {/* E. SEKSI: AKTIVITAS TERAKHIR (Bagian dari Tab 'ringkasan' di mobile, selalu tampil di desktop) */}
          <div className={tabAktifMobile === 'ringkasan' ? 'block' : 'hidden lg:block'}>
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-gray-800">
                  Aktivitas Terakhir
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/simulasi')}
                  className="text-xs font-semibold text-[#FF6B00] hover:underline cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>

              {/* Empty State */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                  <Clock className="h-5 w-5" />
                </span>
                <p>Belum ada aktivitas wawancara.</p>
              </div>
            </section>
          </div>
        </div>

        {/* ================= KOLOM KANAN: SIDEBAR PROFIL CV ================= */}
        {/* Di mobile: tampil ketika Tab 'profil' aktif. Di desktop: selalu tampil di kolom kanan */}
        <aside
          className={`space-y-4 sm:space-y-5 lg:col-span-1 ${
            tabAktifMobile === 'profil' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Kartu Profil CV & Circular Progress */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm space-y-4">
            {/* Header Profil CV */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm sm:text-base font-bold text-gray-800">
                Profil CV
              </h2>
              <Link
                to="/pembuat-cv"
                className="flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Link>
            </div>

            {/* Circular Progress Bar Kelengkapan */}
            <div className="flex flex-col items-center justify-center py-1 sm:py-2">
              <div className="relative flex items-center justify-center">
                <svg className="h-24 w-24 sm:h-28 sm:w-28 -rotate-90" viewBox="0 0 100 100">
                  {/* Lingkaran Background */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#F1F5F9"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Lingkaran Progress */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#FF6B00"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * persentase) / 100}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="font-display text-lg sm:text-xl font-black text-gray-800">
                    {persentase}%
                  </span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Lengkap
                  </span>
                </div>
              </div>

              {/* Teks Kelengkapan Per Bagian */}
              <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                KELENGKAPAN PER BAGIAN ({seksiLengkapCount}/6 seksi)
              </p>
            </div>

            {/* Accordion Checklist Per Bagian (6 Bagian) */}
            <div className="space-y-2 border-t border-gray-100 pt-3">
              {sections.map((seksi) => {
                const isOpen = accordionOpen[seksi.id] ?? !seksi.isLengkap;
                return (
                  <div
                    key={seksi.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/40 p-2.5 sm:p-3 transition-colors"
                  >
                    {/* Header Item Accordion (Touch Target Bersahabat) */}
                    <div
                      onClick={() => toggleAccordion(seksi.id)}
                      className="flex items-center justify-between cursor-pointer select-none min-h-[36px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {seksi.isLengkap ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 ml-1 mr-1" />
                        )}
                        <span className="font-display text-xs font-bold text-gray-800 truncate">
                          {seksi.nama}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold ${
                            seksi.isLengkap
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {seksi.selesaiText}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Konten Accordion */}
                    {isOpen && (
                      <div className="mt-2 pt-2 border-t border-gray-100 animate-in fade-in duration-200">
                        {seksi.isLengkap ? (
                          <div className="flex items-center justify-between text-[11px] sm:text-xs text-emerald-700">
                            <span>Seksi ini telah lengkap dan siap digunakan.</span>
                            <button
                              type="button"
                              onClick={() => navigate(`/pembuat-cv?tab=${seksi.tab}`)}
                              className="font-bold text-[#FF6B00] hover:underline shrink-0 ml-2"
                            >
                              Ubah
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-2.5 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-amber-800 text-[11px]">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                              <span>PERLU DILENGKAPI</span>
                            </div>
                            <ul className="mt-1.5 space-y-0.5 text-[11px] text-amber-900/90 pl-4 list-disc">
                              {seksi.daftarKosong.map((field, idx) => (
                                <li key={idx}>{field}</li>
                              ))}
                            </ul>
                            <button
                              type="button"
                              onClick={() => navigate(`/pembuat-cv?tab=${seksi.tab}`)}
                              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer"
                            >
                              <span>Lengkapi sekarang</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}