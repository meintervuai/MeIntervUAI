// Halaman Penyusun CV ATS (pages/cv/CVBuilder.tsx)
// Mematuhi FE-04 (Dwibahasa i18n), FE-06 (Modular Per-Komponen & Multi-Device),
// UX-11 (320px - 1920px), UX-13, dan UX-16 (Anti Desktop-Shrink & Ergonomi Tab Horizontal).
// Bebas data dummy hardcoded: data murni tersinkronisasi ke Supabase via backend FastAPI.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tombol } from '../../components/ui/Tombol';
import { NotifikasiToast, TipeToast } from '../../components/ui/NotifikasiToast';
import { api } from '../../services/api';
import { useBahasa } from '../../i18n';
import { FormKontakCV } from './komponen/FormKontakCV';
import { FormEdukasiCV, ItemEdukasi } from './komponen/FormEdukasiCV';
import { FormPengalamanCV, ItemPengalaman } from './komponen/FormPengalamanCV';
import { FormProyekCV, ItemProyek } from './komponen/FormProyekCV';
import { FormKeahlianCV } from './komponen/FormKeahlianCV';
import { FormPengaturanCV } from './komponen/FormPengaturanCV';
import { PratinjauKertasATS } from './komponen/PratinjauKertasATS';
import { KonfigurasiVisualCV, DEFAULT_KONFIGURASI_VISUAL } from './tipePengaturanCV';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  CheckCircle2, 
  Eye, 
  Edit3,
  Sliders,
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Wrench
} from 'lucide-react';

interface PropertiCVBuilder {
  pengguna: any;
}

type TabEditor = 'pengaturan' | 'kontak' | 'edukasi' | 'pengalaman' | 'proyek' | 'keahlian';

export const CVBuilder: React.FC<PropertiCVBuilder> = ({ pengguna }) => {
  const { t } = useBahasa();
  const navigate = useNavigate();

  // Mode View (Khusus mobile toggle antara Form Editor & ATS Paper Preview)
  const [tabTampilanMobile, setTabTampilanMobile] = useState<'editor' | 'pratinjau'>('editor');

  // Tab Navigasi Horizontal Form Editor (Mencegah form memanjang ke bawah)
  const [tabFormAktif, setTabFormAktif] = useState<TabEditor>('kontak');

  // State Data CV (Tersimpan ke Supabase)
  const [judulCv, setJudulCv] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [emailKontak, setEmailKontak] = useState('');
  const [teleponKontak, setTeleponKontak] = useState('');
  const [linkedinKontak, setLinkedinKontak] = useState('');
  const [domisiliKontak, setDomisiliKontak] = useState('');
  const [tempatTanggalLahir, setTempatTanggalLahir] = useState('');
  const [githubKontak, setGithubKontak] = useState('');
  const [portofolioKontak, setPortofolioKontak] = useState('');
  const [ringkasan, setRingkasan] = useState('');

  const [daftarEdukasi, setDaftarEdukasi] = useState<ItemEdukasi[]>([]);
  const [daftarPengalaman, setDaftarPengalaman] = useState<ItemPengalaman[]>([]);
  const [daftarProyek, setDaftarProyek] = useState<ItemProyek[]>([]);
  const [daftarKeahlian, setDaftarKeahlian] = useState<string[]>([]);

  // State Styling Visual (Template, Kertas, Warna, Tipografi)
  const [konfigurasiVisual, setKonfigurasiVisual] = useState<KonfigurasiVisualCV>(DEFAULT_KONFIGURASI_VISUAL);

  const [skorAts, setSkorAts] = useState<number>(0);
  const [statusTerverifikasi, setStatusTerverifikasi] = useState<boolean>(false);

  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
  const [adaPerubahanBelumDisimpan, setAdaPerubahanBelumDisimpan] = useState(false);
  const [toastNotifikasi, setToastNotifikasi] = useState<{ tipe: TipeToast; pesan: string } | null>(null);

  // Kunci unik cache localStorage per akun pengguna
  const kunciCacheLokal = pengguna?.pengguna_id ? `cv_draft_cache_${pengguna.pengguna_id}` : null;

  // Optimasi Instan (Stale-While-Revalidate): Muat draf lokal seketika saat pertama kali mount (0 ms)
  useEffect(() => {
    if (!kunciCacheLokal) return;

    try {
      const raw = localStorage.getItem(kunciCacheLokal);
      if (raw) {
        const drafLokal = JSON.parse(raw);
        if (drafLokal && drafLokal.konten) {
          setJudulCv(drafLokal.judul_cv || `CV ${pengguna?.nama_pengguna || 'Profesional'}`);
          setTargetRole(drafLokal.target_role || '');

          const kontak = drafLokal.konten.data_kontak || {};
          setNamaLengkap(kontak.nama_lengkap || pengguna?.nama_pengguna || '');
          setEmailKontak(kontak.email || pengguna?.email || '');
          setTeleponKontak(kontak.telepon || '');
          setLinkedinKontak(kontak.linkedin || '');
          setDomisiliKontak(kontak.domisili || '');
          setTempatTanggalLahir(kontak.tempat_tanggal_lahir || '');
          setGithubKontak(kontak.github || '');
          setPortofolioKontak(kontak.portofolio || '');
          setRingkasan(drafLokal.konten.ringkasan_eksekutif || '');

          setDaftarEdukasi(Array.isArray(drafLokal.konten.riwayat_edukasi) ? drafLokal.konten.riwayat_edukasi : []);
          setDaftarPengalaman(Array.isArray(drafLokal.konten.pengalaman_kerja) ? drafLokal.konten.pengalaman_kerja : []);
          setDaftarProyek(Array.isArray(drafLokal.konten.proyek_portofolio) ? drafLokal.konten.proyek_portofolio : []);
          setDaftarKeahlian(Array.isArray(drafLokal.konten.keahlian) ? drafLokal.konten.keahlian : []);

          if (drafLokal.konten.konfigurasi_visual) {
            setKonfigurasiVisual((prev) => ({
              ...prev,
              ...drafLokal.konten.konfigurasi_visual,
            }));
          }
          // Langsung buka layar form tanpa skeleton loop
          setSedangMemuat(false);
        }
      }
    } catch {
      // Abaikan jika parsing gagal
    }
  }, [kunciCacheLokal]);

  // Background Sync: Ambil Data Terbaru dari Database Supabase secara senyap
  useEffect(() => {
    if (!pengguna?.pengguna_id) return;

    let mounted = true;
    api.ambilStatusCV(pengguna.pengguna_id)
      .then((res) => {
        if (!mounted) return;

        // Ambil timestamp draf lokal
        let drafLokal: any = null;
        if (kunciCacheLokal) {
          try {
            const raw = localStorage.getItem(kunciCacheLokal);
            if (raw) drafLokal = JSON.parse(raw);
          } catch {
            drafLokal = null;
          }
        }

        const serverDataAda = res.status === 'sukses' && res.cv_tersedia && res.cv;
        const serverCv = serverDataAda ? res.cv : null;

        const waktuServer = serverCv?.diperbarui_pada ? new Date(serverCv.diperbarui_pada).getTime() : 0;
        const waktuLokal = drafLokal?.timestamp || 0;

        // Jika lokal lebih baru, pertahankan draf lokal
        if (drafLokal && waktuLokal > waktuServer) {
          setAdaPerubahanBelumDisimpan(true);
          return;
        }

        // Jika server ada dan lebih baru (atau belum ada data lokal), gunakan data server
        if (serverCv) {
          setJudulCv(serverCv.judul_cv || '');
          setTargetRole(serverCv.target_role || '');
          setSkorAts(serverCv.skor_ats || 0);
          setStatusTerverifikasi(serverCv.status_terverifikasi || false);

          const konten = serverCv.konten_json || {};
          const kontak = konten.data_kontak || {};
          setNamaLengkap(kontak.nama_lengkap || pengguna.nama_pengguna || '');
          setEmailKontak(kontak.email || pengguna.email || '');
          setTeleponKontak(kontak.telepon || '');
          setLinkedinKontak(kontak.linkedin || '');
          setDomisiliKontak(kontak.domisili || '');
          setTempatTanggalLahir(kontak.tempat_tanggal_lahir || '');
          setGithubKontak(kontak.github || '');
          setPortofolioKontak(kontak.portofolio || '');
          setRingkasan(konten.ringkasan_eksekutif || '');

          setDaftarEdukasi(Array.isArray(konten.riwayat_edukasi) ? konten.riwayat_edukasi : []);
          setDaftarPengalaman(Array.isArray(konten.pengalaman_kerja) ? konten.pengalaman_kerja : []);
          setDaftarProyek(Array.isArray(konten.proyek_portofolio) ? konten.proyek_portofolio : []);
          setDaftarKeahlian(Array.isArray(konten.keahlian) ? konten.keahlian : []);

          if (konten.konfigurasi_visual) {
            setKonfigurasiVisual((prev) => ({
              ...prev,
              ...konten.konfigurasi_visual,
            }));
          }
          setAdaPerubahanBelumDisimpan(false);
        } else if (!drafLokal) {
          setNamaLengkap(pengguna.nama_pengguna || '');
          setEmailKontak(pengguna.email || '');
          setJudulCv(`CV ${pengguna.nama_pengguna || 'Profesional'}`);
          setAdaPerubahanBelumDisimpan(false);
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data CV:', err);
      })
      .finally(() => {
        if (mounted) setSedangMemuat(false);
      });

    return () => {
      mounted = false;
    };
  }, [pengguna]);

  // Caching Senyap: Simpan setiap perubahan ke localStorage secara instan tanpa mengganggu user
  useEffect(() => {
    if (sedangMemuat || !kunciCacheLokal) return;

    const dataDrafLokal = {
      timestamp: Date.now(),
      judul_cv: judulCv,
      target_role: targetRole,
      konten: {
        data_kontak: {
          nama_lengkap: namaLengkap,
          email: emailKontak,
          telepon: teleponKontak,
          linkedin: linkedinKontak,
          domisili: domisiliKontak,
          tempat_tanggal_lahir: tempatTanggalLahir,
          github: githubKontak,
          portofolio: portofolioKontak,
        },
        ringkasan_eksekutif: ringkasan,
        riwayat_edukasi: daftarEdukasi,
        pengalaman_kerja: daftarPengalaman,
        proyek_portofolio: daftarProyek,
        keahlian: daftarKeahlian,
        konfigurasi_visual: konfigurasiVisual,
      },
    };

    try {
      localStorage.setItem(kunciCacheLokal, JSON.stringify(dataDrafLokal));
      setAdaPerubahanBelumDisimpan(true);
    } catch (e) {
      console.warn('Gagal menyimpan cache draf lokal:', e);
    }
  }, [
    sedangMemuat,
    kunciCacheLokal,
    judulCv,
    targetRole,
    namaLengkap,
    emailKontak,
    teleponKontak,
    linkedinKontak,
    domisiliKontak,
    tempatTanggalLahir,
    githubKontak,
    portofolioKontak,
    ringkasan,
    daftarEdukasi,
    daftarPengalaman,
    daftarProyek,
    daftarKeahlian,
    konfigurasiVisual,
  ]);

  // Handler Simpan Draf Resmi ke Supabase
  const tanganiSimpan = async () => {
    if (!pengguna?.pengguna_id) return;

    setSedangMenyimpan(true);
    setToastNotifikasi(null);

    const payload = {
      pengguna_id: pengguna.pengguna_id,
      judul_cv: judulCv.trim() || `CV ${namaLengkap || 'Profesional'}`,
      target_role: targetRole.trim() || 'Software Engineer',
      konten_json: {
        data_kontak: {
          nama_lengkap: namaLengkap,
          email: emailKontak,
          telepon: teleponKontak,
          linkedin: linkedinKontak,
          domisili: domisiliKontak,
          tempat_tanggal_lahir: tempatTanggalLahir,
          github: githubKontak,
          portofolio: portofolioKontak,
        },
        ringkasan_eksekutif: ringkasan,
        riwayat_edukasi: daftarEdukasi,
        pengalaman_kerja: daftarPengalaman,
        proyek_portofolio: daftarProyek,
        keahlian: daftarKeahlian,
        konfigurasi_visual: konfigurasiVisual,
      },
    };

    try {
      const res = await api.simpanDrafCV(payload);
      if (res.status === 'sukses') {
        setAdaPerubahanBelumDisimpan(false);
        setToastNotifikasi({ tipe: 'sukses', pesan: t.cvBuilder.drafTersimpan });
      } else {
        setToastNotifikasi({ tipe: 'gagal', pesan: res.pesan || 'Gagal menyimpan draf CV.' });
      }
    } catch (err: any) {
      setToastNotifikasi({ tipe: 'gagal', pesan: `Terjadi kesalahan sistem: ${err.message || 'Koneksi terputus'}` });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  const tabsConfig = [
    { id: 'pengaturan', label: t.cvBuilder.tabPengaturan, icon: Sliders },
    { id: 'kontak', label: t.cvBuilder.tabKontak, icon: User },
    { id: 'edukasi', label: t.cvBuilder.tabEdukasi, icon: GraduationCap },
    { id: 'pengalaman', label: t.cvBuilder.tabPengalaman, icon: Briefcase },
    { id: 'proyek', label: t.cvBuilder.tabProyek, icon: FolderGit2 },
    { id: 'keahlian', label: t.cvBuilder.tabKeahlian, icon: Wrench },
  ];

  if (sedangMemuat) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 pb-28 md:pb-12 safe-padding-x font-sans animate-pulse">
        {/* Skeleton Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-200" />
            <div className="space-y-2">
              <div className="w-48 sm:w-64 h-6 rounded-md bg-stone-200" />
              <div className="w-32 sm:w-40 h-4 rounded-md bg-stone-100 hidden sm:block" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-10 rounded-xl bg-stone-200 hidden sm:block" />
            <div className="w-32 h-10 rounded-xl bg-stone-300" />
          </div>
        </div>

        {/* Skeleton Workspace Grid (8 cols Editor & 4 cols Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Skeleton Form Editor */}
          <div className="lg:col-span-8 space-y-4">
            {/* Skeleton Tab Navigation Bar */}
            <div className="bg-stone-100/90 p-2 rounded-2xl border border-stone-200/80 flex items-center gap-2 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-9 w-24 rounded-xl bg-stone-200/90 shrink-0" />
              ))}
            </div>

            {/* Skeleton Form Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-7 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="w-40 h-5 bg-stone-200 rounded-md" />
                <div className="w-20 h-8 bg-stone-200 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-stone-200 rounded" />
                  <div className="w-full h-10 bg-stone-100 rounded-xl border border-stone-200/60" />
                </div>
                <div className="space-y-2">
                  <div className="w-28 h-4 bg-stone-200 rounded" />
                  <div className="w-full h-10 bg-stone-100 rounded-xl border border-stone-200/60" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="w-36 h-4 bg-stone-200 rounded" />
                <div className="w-full h-24 bg-stone-100 rounded-xl border border-stone-200/60" />
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Skeleton Preview Kertas CV */}
          <div className="hidden lg:block lg:col-span-4 space-y-3 sticky top-4">
            <div className="bg-stone-100/90 p-3 rounded-2xl border border-stone-200/80 flex items-center justify-between">
              <div className="w-24 h-4 bg-stone-200 rounded" />
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-stone-200" />
                <div className="w-8 h-8 rounded-lg bg-stone-200" />
              </div>
            </div>
            <div className="w-full aspect-[210/297] bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-6 space-y-4">
              <div className="w-3/4 h-5 bg-stone-200 rounded mx-auto" />
              <div className="w-1/2 h-3 bg-stone-100 rounded mx-auto" />
              <div className="w-full h-px bg-stone-200 my-3" />
              <div className="space-y-2 pt-2">
                <div className="w-1/3 h-4 bg-stone-200 rounded" />
                <div className="w-full h-2 bg-stone-100 rounded" />
                <div className="w-5/6 h-2 bg-stone-100 rounded" />
              </div>
              <div className="space-y-2 pt-3">
                <div className="w-1/3 h-4 bg-stone-200 rounded" />
                <div className="w-full h-2 bg-stone-100 rounded" />
                <div className="w-4/5 h-2 bg-stone-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 pb-28 md:pb-12 safe-padding-x print:p-0 print:m-0 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={t.cvBuilder.kembaliKeBeranda}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                {t.cvBuilder.judulHalaman}
              </h1>
              {skorAts > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  ATS: {skorAts}/100
                </span>
              )}
              {statusTerverifikasi && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Terverifikasi</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-500 hidden sm:block">
              {t.cvBuilder.subjudulHalaman}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile View Toggle: Form Editor vs Pratinjau Kertas */}
          <div className="flex lg:hidden bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTabTampilanMobile('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all min-h-[38px] ${
                tabTampilanMobile === 'editor' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t.cvBuilder.tabEditor}</span>
            </button>
            <button
              type="button"
              onClick={() => setTabTampilanMobile('pratinjau')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all min-h-[38px] ${
                tabTampilanMobile === 'pratinjau' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.cvBuilder.tabPratinjau}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors min-h-[42px]"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>{t.cvBuilder.cetakPdf}</span>
          </button>

          <Tombol
            varian="primer"
            ukuran="md"
            onClick={tanganiSimpan}
            disabled={sedangMenyimpan}
            className={`font-bold text-xs min-h-[42px] px-4 shadow-sm transition-all duration-300 ${
              adaPerubahanBelumDisimpan
                ? 'bg-orange-700 hover:bg-orange-800 text-white ring-2 ring-orange-500/20'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {sedangMenyimpan ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.cvBuilder.sedangMenyimpan}</span>
              </span>
            ) : adaPerubahanBelumDisimpan ? (
              <span className="flex items-center gap-1.5">
                <Save className="w-4 h-4 mr-0.5" />
                <span>{t.cvBuilder.tombolSimpanDraf}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 mr-0.5" />
                <span>{t.cvBuilder.statusTersimpan}</span>
              </span>
            )}
          </Tombol>
        </div>
      </div>

      {/* Floating Notification Toast Reusable (FE-02, UX-03, UX-16) */}
      {toastNotifikasi && (
        <NotifikasiToast
          tipe={toastNotifikasi.tipe}
          pesan={toastNotifikasi.pesan}
          onTutup={() => setToastNotifikasi(null)}
          durasiMs={4000}
        />
      )}

      {/* Workspace Grid Layout: Form Dominan Lega (lg:col-span-8) & Preview Ramping Kompak (lg:col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* KOLOM KIRI: FORM BUILDER TABBED (Lega untuk Seluruh Inputan Formulir)     */}
        {/* ========================================================================= */}
        <div className={`lg:col-span-8 space-y-4 print:hidden ${tabTampilanMobile === 'pratinjau' ? 'hidden lg:block' : 'block'}`}>
          
          {/* Horizontal Tab Navigation (Scrollable di Mobile, Clean di Desktop) */}
          <div className="bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const aktif = tabFormAktif === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTabFormAktif(tab.id as TabEditor)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[40px] shrink-0 ${
                    aktif
                      ? 'bg-white text-orange-950 shadow-sm border border-stone-200/60 font-extrabold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${aktif ? 'text-orange-700' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Berdasarkan Tab Aktif */}
          <div className="min-h-[420px]">
            {tabFormAktif === 'pengaturan' && (
              <FormPengaturanCV
                konfigurasiVisual={konfigurasiVisual}
                setKonfigurasiVisual={setKonfigurasiVisual}
                urlFotoProfilAkun={pengguna?.foto_url}
              />
            )}

            {tabFormAktif === 'kontak' && (
              <FormKontakCV
                targetRole={targetRole}
                setTargetRole={setTargetRole}
                namaLengkap={namaLengkap}
                setNamaLengkap={setNamaLengkap}
                emailKontak={emailKontak}
                setEmailKontak={setEmailKontak}
                teleponKontak={teleponKontak}
                setTeleponKontak={setTeleponKontak}
                linkedinKontak={linkedinKontak}
                setLinkedinKontak={setLinkedinKontak}
                domisiliKontak={domisiliKontak}
                setDomisiliKontak={setDomisiliKontak}
                tempatTanggalLahir={tempatTanggalLahir}
                setTempatTanggalLahir={setTempatTanggalLahir}
                githubKontak={githubKontak}
                setGithubKontak={setGithubKontak}
                portofolioKontak={portofolioKontak}
                setPortofolioKontak={setPortofolioKontak}
                ringkasan={ringkasan}
                setRingkasan={setRingkasan}
                konfigurasiVisual={konfigurasiVisual}
                setKonfigurasiVisual={setKonfigurasiVisual}
                urlFotoProfilAkun={pengguna?.foto_url}
              />
            )}

            {tabFormAktif === 'edukasi' && (
              <FormEdukasiCV
                daftarEdukasi={daftarEdukasi}
                setDaftarEdukasi={setDaftarEdukasi}
              />
            )}

            {tabFormAktif === 'pengalaman' && (
              <FormPengalamanCV
                daftarPengalaman={daftarPengalaman}
                setDaftarPengalaman={setDaftarPengalaman}
              />
            )}

            {tabFormAktif === 'proyek' && (
              <FormProyekCV
                daftarProyek={daftarProyek}
                setDaftarProyek={setDaftarProyek}
              />
            )}

            {tabFormAktif === 'keahlian' && (
              <FormKeahlianCV
                daftarKeahlian={daftarKeahlian}
                setDaftarKeahlian={setDaftarKeahlian}
                templateId={konfigurasiVisual.templateId}
              />
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN: PRATINJAU KERTAS ATS 1-KOLOM (Paper Preview Sticky di Desktop)*/}
        {/* ========================================================================= */}
        <div className={`lg:col-span-4 lg:sticky lg:top-24 ${tabTampilanMobile === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <PratinjauKertasATS
            namaLengkap={namaLengkap}
            targetRole={targetRole}
            emailKontak={emailKontak}
            teleponKontak={teleponKontak}
            domisiliKontak={domisiliKontak}
            linkedinKontak={linkedinKontak}
            tempatTanggalLahir={tempatTanggalLahir}
            githubKontak={githubKontak}
            portofolioKontak={portofolioKontak}
            ringkasan={ringkasan}
            daftarEdukasi={daftarEdukasi}
            daftarPengalaman={daftarPengalaman}
            daftarProyek={daftarProyek}
            daftarKeahlian={daftarKeahlian}
            konfigurasiVisual={konfigurasiVisual}
          />
        </div>

      </div>
    </div>
  );
};
