// Halaman Penyusun CV ATS (pages/cv/CVBuilder.tsx)
// Mematuhi FE-04 (Dwibahasa i18n), FE-06 (Modular Per-Komponen & Multi-Device),
// UX-11 (320px - 1920px), UX-13, dan UX-16 (Anti Desktop-Shrink & Ergonomi Tab Horizontal).
// Bebas data dummy hardcoded: data murni tersinkronisasi ke Supabase via backend FastAPI.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tombol } from '../../components/ui/Tombol';
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
  const [pesanNotifikasi, setPesanNotifikasi] = useState<string | null>(null);

  // Ambil Data CV Asli dari Database
  useEffect(() => {
    if (!pengguna?.pengguna_id) return;

    let mounted = true;
    api.ambilStatusCV(pengguna.pengguna_id)
      .then((res) => {
        if (!mounted) return;
        if (res.status === 'sukses' && res.cv_tersedia && res.cv) {
          const cv = res.cv;
          setJudulCv(cv.judul_cv || '');
          setTargetRole(cv.target_role || '');
          setSkorAts(cv.skor_ats || 0);
          setStatusTerverifikasi(cv.status_terverifikasi || false);

          const konten = cv.konten_json || {};
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
        } else {
          // Inisialisasi awal bersih dari profil akun pengguna
          setNamaLengkap(pengguna.nama_pengguna || '');
          setEmailKontak(pengguna.email || '');
          setJudulCv(`CV ${pengguna.nama_pengguna || 'Profesional'}`);
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

  // Handler Simpan Draf ke Supabase
  const tanganiSimpan = async () => {
    if (!pengguna?.pengguna_id) return;

    setSedangMenyimpan(true);
    setPesanNotifikasi(null);

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
        setPesanNotifikasi(t.cvBuilder.drafTersimpan);
        setTimeout(() => setPesanNotifikasi(null), 4000);
      } else {
        alert(res.pesan || 'Gagal menyimpan draf CV.');
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan sistem: ${err.message || 'Koneksi terputus'}`);
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
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-stone-500">
        <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm">Memuat data CV Anda dari server...</p>
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Terverifikasi
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
            className="bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs min-h-[42px] px-4 shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>{sedangMenyimpan ? t.cvBuilder.sedangMenyimpan : t.cvBuilder.tombolSimpanDraf}</span>
          </Tombol>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {pesanNotifikasi && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 print:hidden shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{pesanNotifikasi}</span>
        </div>
      )}

      {/* Workspace Grid Layout: 2 Kolom di Desktop (lg:grid-cols-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ========================================================================= */}
        {/* KOLOM KIRI: FORM BUILDER TABBED (Horizontal Stepper / Tab Navigasi)       */}
        {/* ========================================================================= */}
        <div className={`lg:col-span-6 space-y-4 print:hidden ${tabTampilanMobile === 'pratinjau' ? 'hidden lg:block' : 'block'}`}>
          
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
        <div className={`lg:col-span-6 lg:sticky lg:top-24 ${tabTampilanMobile === 'editor' ? 'hidden lg:block' : 'block'}`}>
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
