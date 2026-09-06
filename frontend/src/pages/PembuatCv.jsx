import { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Sparkles,
  Plus,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Briefcase,
  GraduationCap,
  Zap,
  Users,
  Globe,
  FolderCode,
  Tag,
  ExternalLink,
  Code2,
  Sliders,
  Type,
  FileText,
  Link2Off,
  Check,
  RotateCcw,
  Palette,
  Eye,
  Edit3,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PratinjauCv from '../components/cv/PratinjauCv';
import IlustrasiTemplateCv from '../components/cv/IlustrasiTemplateCv';
import IkonMediaSosial, { DAFTAR_OPSI_SOSMED } from '../components/cv/IkonMediaSosial';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import { ambilCvTerbaru, simpanCv } from '../services/api_cv';

/**
 * Halaman CV Builder (Pembuat CV):
 * - Mobile-first: toggler antara Mode Form Editor & Mode Pratinjau di ponsel
 * - Desktop: split-screen 50/50 live preview
 * - 6 Tab Navigasi: PERSONAL, PENGALAMAN, PENDIDIKAN, KEAHLIAN, PROYEK, PENGATURAN
 * - Auto-save debounced ke localStorage & Supabase riwayat_cv
 * - Ekspor PDF A4 via html2pdf.js
 * - Fitur Auto-Generate AI untuk ringkasan profesional & deskripsi
 */
export default function PembuatCv() {
  const { profil } = pakaiOtentikasi();

  // State Utama Data CV
  const [formData, setFormData] = useState({
    personal: {
      fullName: '',
      targetPosition: '',
      phone: '',
      email: '',
      location: '',
      bio: '',
      avatarUrl: '',
    },
    socialLinks: [],
    experience: [
      {
        id: 1,
        position: 'Frontend Developer',
        company: 'PT Teknologi Masa Depan',
        startDate: '2023',
        endDate: 'Sekarang',
        description:
          'Mengembangkan antarmuka web modern dengan React, TypeScript, dan Tailwind CSS. Mengoptimalkan performa halaman dan integrasi API RESTful.',
        visible: true,
      },
    ],
    education: [
      {
        id: 1,
        institution: 'Universitas Indonesia',
        degree: 'S1 Teknik Informatika',
        startDate: '2020',
        endDate: '2024',
        visible: true,
      },
    ],
    skills: {
      hard: [
        { id: 1, name: 'React.js', visible: true },
        { id: 2, name: 'TypeScript', visible: true },
        { id: 3, name: 'Tailwind CSS', visible: true },
      ],
      soft: [
        { id: 1, name: 'Komunikasi Efektif', visible: true },
        { id: 2, name: 'Kerja Sama Tim', visible: true },
      ],
      language: [
        { id: 1, name: 'Bahasa Indonesia (Native)', visible: true },
        { id: 2, name: 'Bahasa Inggris (Professional)', visible: true },
      ],
    },
    projects: [
      {
        id: 1,
        name: 'Aplikasi E-Commerce',
        role: 'Frontend Developer',
        description:
          'Membangun katalog produk interaktif, keranjang belanja, dan integrasi payment gateway dengan performa tinggi.',
        techStack: 'React, TypeScript, Tailwind CSS, Supabase',
        projectUrl: 'https://github.com/username/project',
        githubUrl: 'https://github.com/username/project',
        visible: true,
      },
    ],
    settings: {
      template: 'ats',
      accentColor: '#EA580C',
      fontFamily: 'Inter',
      language: 'id',
      paperSize: 'a4',
      headingColor: '#1F2937',
      subheadingColor: '#4B5563',
      textColor: '#1F2937',
    },
  });

  const [searchParams] = useSearchParams();
  const validTabs = ['PERSONAL', 'PENGALAMAN', 'PENDIDIKAN', 'KEAHLIAN', 'PROYEK', 'PENGATURAN'];
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && validTabs.includes(tabFromUrl.toUpperCase()) ? tabFromUrl.toUpperCase() : 'PERSONAL'
  );

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && validTabs.includes(t.toUpperCase())) {
      setActiveTab(t.toUpperCase());
    }
  }, [searchParams]);
  const [mobileMode, setMobileMode] = useState('form'); // 'form' atau 'preview'
  const [isSaving, setIsSaving] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(65);
  const [documentId, setDocumentId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('CV Utama');
  const [isExporting, setIsExporting] = useState(false);

  // Inisialisasi data dari Profil atau Supabase saat pertama dimuat
  useEffect(() => {
    let aktif = true;
    async function muatCv() {
      // 1. Coba ambil dari localStorage dulu
      const tersimpanLokal = localStorage.getItem('mentervu_cv_data');
      if (tersimpanLokal) {
        try {
          const parsed = JSON.parse(tersimpanLokal);
          if (aktif && parsed) {
            setFormData(parsed);
            return;
          }
        } catch (e) {
          console.warn('Gagal membaca cache lokal:', e);
        }
      }

      // 2. Jika ada profil, ambil dari Supabase
      if (profil?.id) {
        const cvDb = await ambilCvTerbaru(profil.id);
        if (aktif && cvDb?.data_cv) {
          setFormData((prev) => ({
            ...prev,
            ...cvDb.data_cv,
            personal: {
              ...prev.personal,
              fullName: cvDb.data_cv?.personal?.fullName || profil.nama_lengkap || '',
              targetPosition: cvDb.data_cv?.personal?.targetPosition || profil.posisi_target || '',
              email: cvDb.data_cv?.personal?.email || profil.email || '',
              ...cvDb.data_cv?.personal,
            },
          }));
          setDocumentId(cvDb.id);
          setDocumentTitle(cvDb.nama_dokumen || 'CV Utama');
        } else if (aktif && profil) {
          // Prefill dari data profil yang ada
          setFormData((prev) => ({
            ...prev,
            personal: {
              ...prev.personal,
              fullName: profil.nama_lengkap || '',
              targetPosition: profil.posisi_target || '',
              email: profil.email || '',
              avatarUrl: profil.url_avatar || '',
            },
          }));
        }
      }
    }

    muatCv();
    return () => {
      aktif = false;
    };
  }, [profil]);

  // Debounce Auto-Save Effect (ke localStorage & Supabase)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSaving(true);
      // Simpan ke localStorage
      localStorage.setItem('mentervu_cv_data', JSON.stringify(formData));

      // Simpan ke Supabase jika login
      if (profil?.id) {
        const hasil = await simpanCv(
          profil.id,
          documentId,
          formData,
          documentTitle || 'CV Utama'
        );
        if (hasil?.id && !documentId) {
          setDocumentId(hasil.id);
        }
      }

      setTimeout(() => {
        setIsSaving(false);
      }, 600);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, profil?.id, documentId, documentTitle]);

  // Handler input Personal
  const handlePersonalChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  // Upload Avatar handler
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handlePersonalChange('avatarUrl', reader.result);
    };
    reader.readAsDataURL(file);
  };

  // AI Auto-Generate Ringkasan Profesional
  const generateAiBio = () => {
    const pos = formData.personal.targetPosition || 'profesional';
    const contohBio = `Profesional yang berdedikasi dan berorientasi pada hasil dengan fokus kuat di bidang ${pos}. Memiliki pengalaman terbukti dalam memecahkan masalah kompleks, merancang solusi inovatif, serta berkolaborasi secara efektif dalam tim lintas fungsi untuk mencapai target perusahaan.`;
    handlePersonalChange('bio', contohBio);
  };

  // AI Auto-Generate Deskripsi Pengalaman
  const generateAiExperience = (idx) => {
    const item = formData.experience[idx];
    const role = item?.position || 'profesional';
    const text = `• Bertanggung jawab penuh dalam pengembangan dan peningkatan efisiensi tugas sebagai ${role}.\n• Meningkatkan produktivitas kerja dan kepuasan pengguna hingga 25% melalui otomatisasi dan optimasi alur kerja.\n• Berkolaborasi aktif bersama tim internal dalam menyelesaikan target proyek tepat waktu.`;
    setFormData((prev) => {
      const copy = [...prev.experience];
      copy[idx] = { ...copy[idx], description: text };
      return { ...prev, experience: copy };
    });
  };

  // AI Auto-Generate Deskripsi Proyek
  const generateAiProject = (idx) => {
    const item = formData.projects[idx];
    const name = item?.name || 'Aplikasi';
    const text = `• Merancang arsitektur sistem dan antarmuka responsif untuk ${name} dengan standar ramah pengguna.\n• Mengintegrasikan database dan API secara aman, menghasilkan waktu pemuatan 40% lebih cepat.\n• Melakukan pengujian fungsional menyeluruh untuk memastikan reliabilitas sistem.`;
    setFormData((prev) => {
      const copy = [...prev.projects];
      copy[idx] = { ...copy[idx], description: text };
      return { ...prev, projects: copy };
    });
  };

  // Export PDF Handler menggunakan html2pdf.js
  const handleDownloadPdf = async () => {
    const element = document.getElementById('cv-preview-sheet');
    if (!element) return;

    setIsExporting(true);
    try {
      // Dynamic import html2pdf.js
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `${(formData.personal.fullName || 'CV').replace(/\s+/g, '_')}_CV.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.warn('Gagal mengekspor PDF:', e);
      // Fallback ke window.print
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // Swatches Warna Aksen
  const accentColors = [
    { name: 'Orange', hex: '#EA580C' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Teal', hex: '#0D9488' },
    { name: 'Purple', hex: '#7C3AED' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Dark Navy', hex: '#1E293B' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Rose', hex: '#E11D48' },
  ];

  // 5 Opsi Template CV Sesuai Standar Jobstreet Indonesia
  const templates = [
    {
      id: 'ats',
      alias: ['modern'],
      name: 'CV ATS Friendly',
      tag: 'Standar ATS',
      desc: 'Format 1 kolom minimalis tanpa elemen grafis rumit, teks bersih dan optimal lolos scanner ATS sistem rekrutmen online.',
      cocok: 'Semua industri & lamaran via portal karir online',
    },
    {
      id: 'kronologis',
      alias: ['bisnis'],
      name: 'CV Kronologis',
      tag: 'Korporat & BUMN',
      desc: 'Menonjolkan riwayat kerja terbalik (terbaru ke lama) dengan garis waktu linier yang terstruktur dan rapi.',
      cocok: 'BUMN, perbankan, instansi formal & karir linier',
    },
    {
      id: 'fungsional',
      alias: [],
      name: 'CV Fungsional',
      tag: 'Career Switcher',
      desc: 'Menyoroti kompetensi & keahlian utama di posisi teratas sebelum riwayat pekerjaan.',
      cocok: 'Fresh graduate, career switcher, atau career gap',
    },
    {
      id: 'kombinasi',
      alias: ['tech'],
      name: 'CV Kombinasi',
      tag: 'Hybrid 2-Kolom',
      desc: 'Sidebar profil & keahlian (35%) berdampingan dengan riwayat pengalaman detail (65%).',
      cocok: 'Tech, software engineer, desainer, & manajerial',
    },
    {
      id: 'kreatif',
      alias: ['elegan'],
      name: 'CV Kreatif',
      tag: 'Desain & Media',
      desc: 'Header banner berwarna aksen dinamis dengan foto bulat dan tata letak visual modern ekspresif.',
      cocok: 'Industri kreatif, agensi, media, UI/UX, & branding',
    },
  ];

  const tabs = [
    { id: 'PERSONAL', label: 'PERSONAL', Icon: Users },
    { id: 'PENGALAMAN', label: 'PENGALAMAN', Icon: Briefcase },
    { id: 'PENDIDIKAN', label: 'PENDIDIKAN', Icon: GraduationCap },
    { id: 'KEAHLIAN', label: 'KEAHLIAN', Icon: Zap },
    { id: 'PROYEK', label: 'PROYEK', Icon: FolderCode },
    { id: 'PENGATURAN', label: 'PENGATURAN', Icon: Sliders },
  ];

  return (
    <div className="flex min-h-[calc(100dvh-70px)] flex-col bg-[#F9F8F3] -mx-4 -mt-5 -mb-24 sm:-mx-6 sm:-mt-5 md:-mb-12 lg:-mx-8">
      {/* ================= TOP HEADER BAR ================= */}
      <section className="sticky top-[57px] z-20 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B00]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold text-gray-800 sm:text-xl">
                Pembuat CV
              </h1>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Nama Dokumen"
                className="hidden text-xs font-semibold text-gray-500 bg-transparent hover:bg-gray-100 px-2 py-0.5 rounded border-b border-dashed border-gray-300 md:inline-block focus:outline-none focus:border-orange-500"
              />
            </div>
            <p className="text-[11px] text-gray-500">CV Builder · Auto-save aktif</p>
          </div>
        </div>

        {/* Action Button Download PDF & Mobile Toggler */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Mode Switcher (Form vs Pratinjau) */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-0.5 text-xs font-semibold lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMode('form')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                mobileMode === 'form'
                  ? 'bg-white text-[#FF6B00] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMode('preview')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                mobileMode === 'preview'
                  ? 'bg-white text-[#FF6B00] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Pratinjau</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex min-h-[40px] items-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#E05E00] active:scale-[0.98] disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Mengekspor…' : 'Download PDF'}</span>
          </button>
        </div>
      </section>

      {/* ================= TAB NAVIGATION BAR ================= */}
      <nav
        className="sticky top-[115px] z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8"
        aria-label="Tabs Pembuat CV"
      >
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveTab(id);
                  if (mobileMode === 'preview') setMobileMode('form');
                }}
                className={`relative flex shrink-0 items-center gap-2 px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-[#FF6B00]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#FF6B00]' : 'text-gray-400'}`} />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF6B00]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Indikator Status Simpan */}
        <div className="hidden shrink-0 items-center gap-1.5 pl-3 text-xs sm:flex">
          {isSaving ? (
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-[11px] font-medium animate-pulse">
              <RotateCcw className="h-3 w-3 animate-spin" />
              Menyimpan…
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full text-[11px] font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tersimpan
            </span>
          )}
        </div>
      </nav>

      {/* ================= MAIN SPLIT CONTAINER ================= */}
      <div className="flex flex-1 flex-col lg:flex-row items-start relative w-full">
        {/* ================= KOLOM KIRI: EDITOR FORM ================= */}
        <div
          className={`w-full p-4 sm:p-6 lg:w-1/2 ${
            mobileMode === 'form' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="mx-auto max-w-2xl space-y-6 pb-24">
            {/* ================= TAB: PERSONAL ================= */}
            {activeTab === 'PERSONAL' && (
              <div className="space-y-5">
                {/* Kartu Informasi Kontak */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                  <div className="mb-4">
                    <h2 className="font-display text-base font-bold text-gray-800">
                      Informasi Kontak
                    </h2>
                    <p className="text-xs text-gray-500">Data diri yang ditampilkan di CV</p>
                  </div>

                  {/* Foto Profil Area */}
                  <div className="mb-5 flex items-center gap-4 rounded-lg bg-gray-50 p-3.5 border border-gray-100">
                    {formData.personal.avatarUrl ? (
                      <img
                        src={formData.personal.avatarUrl}
                        alt="Avatar"
                        className="h-16 w-16 rounded-full object-cover border-2 border-orange-500 shadow-xs"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                        <Users className="h-7 w-7" />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-gray-700">Foto Profil</p>
                      <p className="text-[11px] text-gray-400">JPG/PNG · Maks 2MB</p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <label className="cursor-pointer rounded-lg bg-[#FF6B00] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#E05E00]">
                          Unggah
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                        {formData.personal.avatarUrl && (
                          <button
                            type="button"
                            onClick={() => handlePersonalChange('avatarUrl', '')}
                            className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={formData.personal.fullName}
                        onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                        placeholder="Cth: Budi Santoso"
                        className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                        Posisi Target / Jabatan
                      </label>
                      <input
                        type="text"
                        value={formData.personal.targetPosition}
                        onChange={(e) => handlePersonalChange('targetPosition', e.target.value)}
                        placeholder="Cth: Frontend Developer"
                        className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Nomor Telepon
                        </label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.personal.phone}
                            onChange={(e) => handlePersonalChange('phone', e.target.value)}
                            placeholder="Cth: 081234567890"
                            className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={formData.personal.email}
                            onChange={(e) => handlePersonalChange('email', e.target.value)}
                            placeholder="Cth: nama@email.com"
                            className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                        Lokasi / Kota
                      </label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.personal.location}
                          onChange={(e) => handlePersonalChange('location', e.target.value)}
                          placeholder="Cth: Jakarta, Indonesia"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Textarea Bio / Ringkasan Profesional */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                          Bio / Ringkasan Profesional
                        </label>
                        <button
                          type="button"
                          onClick={generateAiBio}
                          className="flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-[#FF6B00] transition-colors hover:bg-orange-100"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Auto-Generate AI</span>
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={formData.personal.bio}
                        onChange={(e) => handlePersonalChange('bio', e.target.value)}
                        placeholder="Tuliskan ringkasan profesional Anda di sini..."
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Kartu Media Sosial */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base font-bold text-gray-800">Media Sosial</h2>
                      <p className="text-xs text-gray-500">
                        Tautan profil online Anda (LinkedIn, GitHub, Portfolio)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          socialLinks: [
                            ...prev.socialLinks,
                            { platform: 'LinkedIn', label: 'LinkedIn', url: '' },
                          ],
                        }))
                      }
                      className="flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>

                  {formData.socialLinks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
                      <Link2Off className="mb-2 h-7 w-7 stroke-1" />
                      <p className="text-xs">Belum ada tautan sosial media.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.socialLinks.map((item, idx) => {
                        const selectedOpt = DAFTAR_OPSI_SOSMED.find(
                          (o) => o.value.toLowerCase() === (item.platform || '').toLowerCase()
                        );
                        const placeholderText = selectedOpt?.placeholder || 'Cth: tautan profil';

                        return (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl border border-gray-200/70 bg-gray-50/60"
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 text-[#FF6B00] shadow-2xs">
                                <IkonMediaSosial platform={item.platform} className="h-4 w-4" />
                              </span>
                              <select
                                value={item.platform}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const copy = [...prev.socialLinks];
                                    copy[idx] = { ...copy[idx], platform: val, label: val };
                                    return { ...prev, socialLinks: copy };
                                  });
                                }}
                                className="h-9 rounded-lg border border-gray-300 bg-white px-2.5 text-xs font-semibold text-gray-700 focus:border-[#FF6B00] focus:outline-none"
                              >
                                {DAFTAR_OPSI_SOSMED.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="text"
                                value={item.url}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const copy = [...prev.socialLinks];
                                    copy[idx] = { ...copy[idx], url: val };
                                    return { ...prev, socialLinks: copy };
                                  });
                                }}
                                placeholder={`Cth: ${placeholderText}`}
                                className="h-9 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    socialLinks: prev.socialLinks.filter((_, i) => i !== idx),
                                  }));
                                }}
                                title="Hapus tautan"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB: PENGALAMAN ================= */}
            {activeTab === 'PENGALAMAN' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-gray-800">Pengalaman</h2>
                    <p className="text-xs text-gray-500">
                      Kerja, magang, kepanitiaan, organisasi, dll.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        experience: [
                          ...prev.experience,
                          {
                            id: Date.now(),
                            position: '',
                            company: '',
                            startDate: '',
                            endDate: '',
                            description: '',
                            visible: true,
                          },
                        ],
                      }))
                    }
                    className="flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-[#FF6B00] hover:bg-orange-100"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah</span>
                  </button>
                </div>

                {formData.experience.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-xs"
                  >
                    {/* Header Item */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B00]">
                          <Briefcase className="h-4 w-4" />
                        </span>
                        <h3 className="font-bold text-gray-800 text-sm">
                          Pengalaman #{idx + 1}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Toggle Visible */}
                        <label
                          className="relative inline-flex cursor-pointer items-center"
                          title="Tampilkan di CV"
                        >
                          <input
                            type="checkbox"
                            checked={item.visible !== false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData((prev) => {
                                const copy = [...prev.experience];
                                copy[idx] = { ...copy[idx], visible: checked };
                                return { ...prev, experience: copy };
                              });
                            }}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#FF6B00] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                        </label>

                        {/* Hapus */}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              experience: prev.experience.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Grid Form Pengalaman */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Posisi / Peran
                        </label>
                        <input
                          type="text"
                          value={item.position}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.experience];
                              copy[idx] = { ...copy[idx], position: val };
                              return { ...prev, experience: copy };
                            });
                          }}
                          placeholder="Cth: Frontend Developer"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Perusahaan / Organisasi
                        </label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.experience];
                              copy[idx] = { ...copy[idx], company: val };
                              return { ...prev, experience: copy };
                            });
                          }}
                          placeholder="Cth: PT Teknologi Masa Depan"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Mulai
                        </label>
                        <input
                          type="text"
                          value={item.startDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.experience];
                              copy[idx] = { ...copy[idx], startDate: val };
                              return { ...prev, experience: copy };
                            });
                          }}
                          placeholder="Cth: 2020"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Selesai
                        </label>
                        <input
                          type="text"
                          value={item.endDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.experience];
                              copy[idx] = { ...copy[idx], endDate: val };
                              return { ...prev, experience: copy };
                            });
                          }}
                          placeholder="mis: 2024, Sekarang, 2023 - 2025"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                          Deskripsi
                        </label>
                        <button
                          type="button"
                          onClick={() => generateAiExperience(idx)}
                          className="flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Auto-Generate AI</span>
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={item.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const copy = [...prev.experience];
                            copy[idx] = { ...copy[idx], description: val };
                            return { ...prev, experience: copy };
                          });
                        }}
                        placeholder="Ceritakan apa yang Anda kerjakan atau pelajari..."
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= TAB: PENDIDIKAN ================= */}
            {activeTab === 'PENDIDIKAN' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-gray-800">Pendidikan</h2>
                    <p className="text-xs text-gray-500">Riwayat pendidikan formal Anda.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        education: [
                          ...prev.education,
                          {
                            id: Date.now(),
                            institution: '',
                            degree: '',
                            startDate: '',
                            endDate: '',
                            visible: true,
                          },
                        ],
                      }))
                    }
                    className="flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-[#FF6B00] hover:bg-orange-100"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah</span>
                  </button>
                </div>

                {formData.education.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B00]">
                          <GraduationCap className="h-4 w-4" />
                        </span>
                        <h3 className="font-bold text-gray-800 text-sm">
                          Pendidikan #{idx + 1}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <label
                          className="relative inline-flex cursor-pointer items-center"
                          title="Tampilkan di CV"
                        >
                          <input
                            type="checkbox"
                            checked={item.visible !== false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData((prev) => {
                                const copy = [...prev.education];
                                copy[idx] = { ...copy[idx], visible: checked };
                                return { ...prev, education: copy };
                              });
                            }}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#FF6B00] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              education: prev.education.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Institusi / Universitas
                        </label>
                        <input
                          type="text"
                          value={item.institution}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.education];
                              copy[idx] = { ...copy[idx], institution: val };
                              return { ...prev, education: copy };
                            });
                          }}
                          placeholder="Cth: Universitas Indonesia"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Gelar / Jurusan
                        </label>
                        <input
                          type="text"
                          value={item.degree}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.education];
                              copy[idx] = { ...copy[idx], degree: val };
                              return { ...prev, education: copy };
                            });
                          }}
                          placeholder="Cth: S1 Teknik Informatika"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Mulai
                        </label>
                        <input
                          type="text"
                          value={item.startDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.education];
                              copy[idx] = { ...copy[idx], startDate: val };
                              return { ...prev, education: copy };
                            });
                          }}
                          placeholder="Cth: 2020"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Selesai
                        </label>
                        <input
                          type="text"
                          value={item.endDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.education];
                              copy[idx] = { ...copy[idx], endDate: val };
                              return { ...prev, education: copy };
                            });
                          }}
                          placeholder="Cth: 2024 atau Sekarang"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= TAB: KEAHLIAN ================= */}
            {activeTab === 'KEAHLIAN' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-800">Keahlian</h2>
                  <p className="text-xs text-gray-500">
                    Kelompokkan keahlian ke dalam kategori.
                  </p>
                </div>

                {[
                  {
                    key: 'hard',
                    title: 'Keahlian Teknis (Hard Skills)',
                    Icon: Zap,
                    placeholder: 'Cth: React, Python, UI/UX Design',
                  },
                  {
                    key: 'soft',
                    title: 'Soft Skills',
                    Icon: Users,
                    placeholder: 'Cth: Kepemimpinan, Problem Solving',
                  },
                  {
                    key: 'language',
                    title: 'Bahasa',
                    Icon: Globe,
                    placeholder: 'Cth: Indonesia (Native), English (Fluent)',
                  },
                ].map(({ key, title, Icon, placeholder }) => {
                  const list = formData.skills[key] || [];
                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-orange-100 bg-[#FFF8F3]/60 p-4 space-y-3"
                    >
                      {/* Header Kategori */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[#FF6B00]" />
                          <span className="font-bold text-gray-800 text-sm">{title}</span>
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-[#FF6B00]">
                            {list.length}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              skills: {
                                ...prev.skills,
                                [key]: [...list, { id: Date.now(), name: '', visible: true }],
                              },
                            }));
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-orange-200 text-[#FF6B00] hover:bg-orange-100 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* List Tags */}
                      <div className="space-y-2">
                        {list.map((skill, idx) => (
                          <div
                            key={skill.id || idx}
                            className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-2.5 shadow-xs"
                          >
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => {
                                  const copy = [...list];
                                  copy[idx] = { ...copy[idx], name: val };
                                  return {
                                    ...prev,
                                    skills: { ...prev.skills, [key]: copy },
                                  };
                                });
                              }}
                              placeholder={placeholder}
                              className="h-8 flex-1 bg-transparent px-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
                            />

                            <div className="flex items-center gap-2">
                              {/* Toggle */}
                              <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                  type="checkbox"
                                  checked={skill.visible !== false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setFormData((prev) => {
                                      const copy = [...list];
                                      copy[idx] = { ...copy[idx], visible: checked };
                                      return {
                                        ...prev,
                                        skills: { ...prev.skills, [key]: copy },
                                      };
                                    });
                                  }}
                                  className="peer sr-only"
                                />
                                <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#FF6B00] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                              </label>

                              {/* Hapus */}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    skills: {
                                      ...prev.skills,
                                      [key]: list.filter((_, i) => i !== idx),
                                    },
                                  }));
                                }}
                                className="rounded p-1 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= TAB: PROYEK ================= */}
            {activeTab === 'PROYEK' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-gray-800">Proyek</h2>
                    <p className="text-xs text-gray-500">
                      Tampilkan proyek terbaik dan portofolio Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        projects: [
                          ...prev.projects,
                          {
                            id: Date.now(),
                            name: '',
                            role: '',
                            description: '',
                            techStack: '',
                            projectUrl: '',
                            githubUrl: '',
                            visible: true,
                          },
                        ],
                      }))
                    }
                    className="flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-[#FF6B00] hover:bg-orange-100"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah</span>
                  </button>
                </div>

                {formData.projects.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B00]">
                          <FolderCode className="h-4 w-4" />
                        </span>
                        <h3 className="font-bold text-gray-800 text-sm">Proyek #{idx + 1}</h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <label
                          className="relative inline-flex cursor-pointer items-center"
                          title="Tampilkan di CV"
                        >
                          <input
                            type="checkbox"
                            checked={item.visible !== false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData((prev) => {
                                const copy = [...prev.projects];
                                copy[idx] = { ...copy[idx], visible: checked };
                                return { ...prev, projects: copy };
                              });
                            }}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#FF6B00] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              projects: prev.projects.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Nama Proyek
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.projects];
                              copy[idx] = { ...copy[idx], name: val };
                              return { ...prev, projects: copy };
                            });
                          }}
                          placeholder="Cth: Aplikasi E-Commerce"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          Posisi / Peran
                        </label>
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.projects];
                              copy[idx] = { ...copy[idx], role: val };
                              return { ...prev, projects: copy };
                            });
                          }}
                          placeholder="Cth: Frontend Developer"
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                          Deskripsi
                        </label>
                        <button
                          type="button"
                          onClick={() => generateAiProject(idx)}
                          className="flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Auto-Generate AI</span>
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={item.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const copy = [...prev.projects];
                            copy[idx] = { ...copy[idx], description: val };
                            return { ...prev, projects: copy };
                          });
                        }}
                        placeholder="Ceritakan apa yang Anda kerjakan atau pelajari..."
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                        Tech Stack / Tags
                      </label>
                      <div className="relative">
                        <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={item.techStack}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.projects];
                              copy[idx] = { ...copy[idx], techStack: val };
                              return { ...prev, projects: copy };
                            });
                          }}
                          placeholder="React, TypeScript, Supabase, Tailwind..."
                          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-gray-400">Pisahkan dengan koma</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          URL Proyek / Demo
                        </label>
                        <div className="relative">
                          <ExternalLink className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            value={item.projectUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const copy = [...prev.projects];
                                copy[idx] = { ...copy[idx], projectUrl: val };
                                return { ...prev, projects: copy };
                              });
                            }}
                            placeholder="Cth: https://myproject.com"
                            className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          GitHub Repository
                        </label>
                        <div className="relative">
                          <Code2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            value={item.githubUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const copy = [...prev.projects];
                                copy[idx] = { ...copy[idx], githubUrl: val };
                                return { ...prev, projects: copy };
                              });
                            }}
                            placeholder="https://github.com/user/repo"
                            className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= TAB: PENGATURAN ================= */}
            {activeTab === 'PENGATURAN' && (
              <div className="space-y-6">
                {/* 1. Template CV */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B00]">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="font-display text-base font-bold text-gray-800">
                        Template CV
                      </h2>
                      <p className="text-xs text-gray-500">
                        Pilih tata letak dan gaya tampilan template CV Anda.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                    {templates.map((tpl) => {
                      const isSelected =
                        formData.settings.template === tpl.id ||
                        (tpl.alias && tpl.alias.includes(formData.settings.template));
                      return (
                        <div
                          key={tpl.id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              settings: { ...prev.settings, template: tpl.id },
                            }))
                          }
                          className={`group relative flex flex-col justify-between rounded-xl border p-3 cursor-pointer transition-all duration-200 text-left ${
                            isSelected
                              ? 'border-[#FF6B00] bg-orange-50/30 shadow-sm ring-2 ring-orange-500/30'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                          }`}
                        >
                          {/* Miniatur Ilustrasi Wireframe A4 */}
                          <div className="relative mb-2.5 flex h-48 w-full items-center justify-center rounded-lg border border-gray-100 bg-slate-50 p-2 overflow-hidden transition-transform group-hover:scale-[1.01]">
                            <IlustrasiTemplateCv
                              templateId={tpl.id}
                              accentColor={formData.settings.accentColor || '#EA580C'}
                              isSelected={isSelected}
                            />
                            {isSelected && (
                              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#FF6B00] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                <Check className="h-3 w-3" />
                                <span>Dipilih</span>
                              </div>
                            )}
                          </div>

                          {/* Detail Info Template */}
                          <div className="flex flex-col flex-1 justify-between space-y-2">
                            <div>
                              <div className="flex items-center justify-between gap-1.5 mb-1">
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase ${
                                    isSelected ? 'bg-orange-100 text-[#FF6B00]' : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {tpl.tag}
                                </span>
                              </div>
                              <h3 className="font-display text-sm font-bold text-gray-900">
                                {tpl.name}
                              </h3>
                              <p className="mt-1 text-[11px] text-gray-500 leading-snug line-clamp-2">
                                {tpl.desc}
                              </p>
                            </div>

                            <div className="border-t border-gray-100 pt-2 text-[10.5px]">
                              <p className="text-gray-400 font-medium">Cocok untuk:</p>
                              <p className="font-semibold text-gray-700 truncate">{tpl.cocok}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Keterangan Otomatisasi Live Preview */}
                  <div className="mt-3.5 flex items-start gap-2.5 rounded-lg bg-orange-50/60 p-3 border border-orange-100 text-[11.5px] text-orange-950">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#FF6B00] mt-0.5" />
                    <div>
                      <p className="font-semibold">Perubahan Tata Letak Real-Time</p>
                      <p className="text-[11px] text-orange-900/80 mt-0.5">
                        Klik salah satu template di atas untuk melihat lembar A4 Live Preview di sebelah kanan otomatis berubah tata letak dan posisinya. Pada smartphone, beralih ke tombol <strong>Pratinjau</strong> di atas untuk melihat tampilan dokumen penuh.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Pengaturan Tampilan */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B00]">
                      <Sliders className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="font-display text-base font-bold text-gray-800">
                        Pengaturan Tampilan
                      </h2>
                      <p className="text-xs text-gray-500">
                        Sesuaikan konfigurasi bahasa dan ukuran cetak.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                        Bahasa Template
                      </label>
                      <select
                        value={formData.settings.language}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, language: e.target.value },
                          }))
                        }
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 focus:border-orange-500 focus:outline-none"
                      >
                        <option value="id">🇮🇩 Bahasa Indonesia</option>
                        <option value="en">🇬🇧 English</option>
                      </select>
                      <p className="mt-1 text-[10px] text-gray-400">
                        * Hanya mempengaruhi konten & label bagian CV, bukan tampilan aplikasi.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                        Ukuran Kertas
                      </label>
                      <select
                        value={formData.settings.paperSize}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, paperSize: e.target.value },
                          }))
                        }
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 focus:border-orange-500 focus:outline-none"
                      >
                        <option value="a4">A4 (210 × 297 mm)</option>
                        <option value="letter">Letter (216 × 279 mm)</option>
                      </select>
                    </div>
                  </div>

                  {/* Warna Aksen */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">
                      Warna Aksen
                    </label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {accentColors.map(({ name, hex }) => {
                        const isChosen = formData.settings.accentColor === hex;
                        return (
                          <button
                            key={hex}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                settings: { ...prev.settings, accentColor: hex },
                              }))
                            }
                            title={name}
                            style={{ backgroundColor: hex }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-95 ${
                              isChosen ? 'ring-2 ring-offset-2 ring-gray-600' : ''
                            }`}
                          >
                            {isChosen && <Check className="h-4 w-4 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Tipografi & Warna */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B00]">
                      <Type className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="font-display text-base font-bold text-gray-800">
                        Tipografi & Warna
                      </h2>
                      <p className="text-xs text-gray-500">
                        Kustomisasi jenis font dan warna pada CV Anda.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                        Jenis Font
                      </label>
                      <select
                        value={formData.settings.fontFamily}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, fontFamily: e.target.value },
                          }))
                        }
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 focus:border-orange-500 focus:outline-none"
                      >
                        <option value="Inter">Inter (Modern Sans)</option>
                        <option value="Roboto">Roboto (Clean Sans)</option>
                        <option value="Open Sans">Open Sans (Friendly Sans)</option>
                        <option value="Poppins">Poppins (Geometric Sans)</option>
                        <option value="Georgia">Georgia (Classic Serif)</option>
                        <option value="Times New Roman">Times New Roman (Formal Serif)</option>
                        <option value="Geist">Geist (Tech Sans)</option>
                        <option value="Hanken Grotesk">Hanken Grotesk (Elegant Sans)</option>
                      </select>
                    </div>

                    {/* Grid Warna Teks (3 Kolom) */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-gray-600">
                          Warna Heading
                        </label>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-1.5">
                          <input
                            type="color"
                            value={formData.settings.headingColor}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                settings: { ...prev.settings, headingColor: e.target.value },
                              }))
                            }
                            className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                          />
                          <span className="font-mono text-xs text-gray-600">
                            {formData.settings.headingColor}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-gray-600">
                          Warna Subheading
                        </label>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-1.5">
                          <input
                            type="color"
                            value={formData.settings.subheadingColor}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                settings: { ...prev.settings, subheadingColor: e.target.value },
                              }))
                            }
                            className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                          />
                          <span className="font-mono text-xs text-gray-600">
                            {formData.settings.subheadingColor}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-gray-600">
                          Warna Teks Biasa
                        </label>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-1.5">
                          <input
                            type="color"
                            value={formData.settings.textColor}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                settings: { ...prev.settings, textColor: e.target.value },
                              }))
                            }
                            className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                          />
                          <span className="font-mono text-xs text-gray-600">
                            {formData.settings.textColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= KOLOM KANAN: LIVE PREVIEW (STICKY A4 CANVAS) ================= */}
        <div
          className={`w-full flex-col items-center bg-gray-200/60 p-4 sm:p-6 lg:w-1/2 lg:flex lg:sticky lg:top-[168px] lg:h-[calc(100vh-180px)] lg:overflow-y-auto rounded-2xl shadow-inner ${
            mobileMode === 'preview' ? 'flex' : 'hidden'
          }`}
        >
          {/* Header Control Preview (Sticky dalam Container Preview) */}
          <div className="sticky top-0 z-10 mb-4 flex w-full max-w-[595px] items-center justify-between rounded-xl bg-gray-200/90 py-1.5 px-2 backdrop-blur-xs shadow-2xs">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-gray-700">
              Pratinjau (A4)
            </span>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white p-1 text-xs shadow-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(30, z - 10))}
                title="Perkecil"
                className="rounded p-1 text-gray-600 hover:bg-gray-100"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>

              <span className="px-2 font-mono text-[11px] font-bold text-gray-700">
                {zoomLevel}%
              </span>

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(120, z + 10))}
                title="Perbesar"
                className="rounded p-1 text-gray-600 hover:bg-gray-100"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setZoomLevel(65)}
                title="Reset Skala"
                className="rounded p-1 text-gray-500 hover:bg-gray-100 text-[10px] font-bold ml-1 border-l border-gray-200 pl-2"
              >
                Fit
              </button>
            </div>
          </div>

          {/* Canvas Sheet Container with Transform Scale */}
          <div className="flex w-full justify-center overflow-x-auto pb-24">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                marginBottom: `${(842 * (zoomLevel / 100) - 842)}px`,
              }}
              className="transition-transform duration-150"
            >
              <PratinjauCv formData={formData} id="cv-preview-sheet" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

