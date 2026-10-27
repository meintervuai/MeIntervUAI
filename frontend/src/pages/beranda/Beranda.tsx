// Halaman Beranda & Studio Simulasi: Single Unified Component (pages/beranda/Beranda.tsx)
// Menyatukan logika state & penataan layout responsif modern (CSS/Tailwind breakpoints) dalam 1 file bersih,
// tanpa duplikasi file terpisah, bebas emoji slop, bebas glassmorphism berlebihan, dan ergonomis di mobile (320px) s.d desktop (1920px).

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Kartu } from '../../components/ui/Kartu';
import { Tombol } from '../../components/ui/Tombol';
import { DataAwal } from './DataAwal';
import { api } from '../../services/api';
import { useBahasa } from '../../i18n';
import { 
  FileText, 
  Video, 
  Mic, 
  MessageSquareText, 
  Briefcase, 
  Lock, 
  Coins, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Target,
  ChevronDown
} from 'lucide-react';

interface PropertiBeranda {
  pengguna: any;
  onPerbaruiPengguna?: (pengguna: any) => void;
}

export const Beranda: React.FC<PropertiBeranda> = ({ pengguna }) => {
  const { t } = useBahasa();
  const navigate = useNavigate();

  // State Onboarding Modal
  const [modalOnboarding, setModalOnboarding] = useState(false);
  const [umur, setUmur] = useState<number | ''>('');
  const [statusPekerjaan, setStatusPekerjaan] = useState('mahasiswa');
  const [jenisKelamin, setJenisKelamin] = useState('pria');
  const [roleImpian, setRoleImpian] = useState('');

  // Status CV & Saldo Token
  const [cvTersedia, setCvTersedia] = useState(false);
  const [saldoToken, setSaldoToken] = useState(100);
  const [dataCvPengguna, setDataCvPengguna] = useState<any>(null);
  const [skorAts, setSkorAts] = useState<number | null>(null);
  const [rekomendasiAi, setRekomendasiAi] = useState<any>(null);
  const [sedangAnalisis, setSedangAnalisis] = useState(false);

  // Mode Simulasi Pilihan Kandidat
  const [modeSimulasi, setModeSimulasi] = useState<'teks' | 'suara' | 'video'>('video');

  // Toggle Accordion Roadmap Mobile
  const [bukaRoadmapMobile, setBukaRoadmapMobile] = useState(false);
  const [sedangMemuatBeranda, setSedangMemuatBeranda] = useState(true);

  const kunciCacheBeranda = pengguna?.pengguna_id ? `beranda_status_cache_${pengguna.pengguna_id}` : null;

  // 1. Caching Instan: Baca status token dan profil beranda dari localStorage seketika (0 ms)
  useEffect(() => {
    if (!kunciCacheBeranda) return;
    try {
      const cached = localStorage.getItem(kunciCacheBeranda);
      if (cached) {
        const d = JSON.parse(cached);
        if (d) {
          if (d.saldo_token !== undefined) setSaldoToken(d.saldo_token);
          if (d.cv_tersedia !== undefined) setCvTersedia(d.cv_tersedia);
          if (d.skor_ats !== undefined) setSkorAts(d.skor_ats);
          if (d.rekomendasi_ai) setRekomendasiAi(d.rekomendasi_ai);
          if (d.umur) setUmur(d.umur);
          if (d.status_pekerjaan) setStatusPekerjaan(d.status_pekerjaan);
          if (d.jenis_kelamin) setJenisKelamin(d.jenis_kelamin);
          if (d.role_impian) setRoleImpian(d.role_impian);
          setSedangMemuatBeranda(false);
        }
      }
    } catch {}
  }, [kunciCacheBeranda]);

  const muatDataStatus = () => {
    if (pengguna && pengguna.pengguna_id) {
      Promise.all([
        api.getProfil(pengguna.pengguna_id).catch(() => null),
        api.ambilStatusCV(pengguna.pengguna_id).catch(() => null),
      ]).then(([resProfil, resCv]) => {
        let updateCache: any = {};

        if (resProfil && resProfil.status === 'sukses') {
          const cvAda = resProfil.cv_tersedia || false;
          setCvTersedia(cvAda);
          updateCache.cv_tersedia = cvAda;

          if (resProfil.saldo_token) {
            setSaldoToken(resProfil.saldo_token.jumlah_saldo);
            updateCache.saldo_token = resProfil.saldo_token.jumlah_saldo;
          }
          const p = resProfil.profil || {};
          if (!p.umur || !p.status_pekerjaan) {
            setModalOnboarding(true);
          } else {
            setUmur(p.umur);
            setStatusPekerjaan(p.status_pekerjaan);
            setJenisKelamin(p.jenis_kelamin || 'pria');
            setRoleImpian(p.role_impian || '');
            updateCache.umur = p.umur;
            updateCache.status_pekerjaan = p.status_pekerjaan;
            updateCache.jenis_kelamin = p.jenis_kelamin || 'pria';
            updateCache.role_impian = p.role_impian || '';
          }
        }

        if (resCv && resCv.status === 'sukses' && resCv.cv_tersedia && resCv.cv) {
          setDataCvPengguna(resCv.cv);
          const ats = resCv.cv.skor_ats !== undefined ? resCv.cv.skor_ats : null;
          setSkorAts(ats);
          setRekomendasiAi(resCv.cv.rekomendasi_ai || null);
          updateCache.skor_ats = ats;
          updateCache.rekomendasi_ai = resCv.cv.rekomendasi_ai;
          if (resCv.cv.status_terverifikasi) {
            setCvTersedia(true);
            updateCache.cv_tersedia = true;
          }
        }

        if (kunciCacheBeranda && Object.keys(updateCache).length > 0) {
          try {
            localStorage.setItem(kunciCacheBeranda, JSON.stringify(updateCache));
          } catch {}
        }
      }).finally(() => {
        setSedangMemuatBeranda(false);
      });
    }
  };

  useEffect(() => {
    muatDataStatus();
  }, [pengguna, kunciCacheBeranda]);

  const tanganiSelesaiDataAwal = (dataProfil: {
    umur?: number;
    jenis_kelamin: string;
    status_pekerjaan: string;
    role_impian?: string;
  }) => {
    if (dataProfil.umur) setUmur(dataProfil.umur);
    setJenisKelamin(dataProfil.jenis_kelamin);
    setStatusPekerjaan(dataProfil.status_pekerjaan);
    if (dataProfil.role_impian) setRoleImpian(dataProfil.role_impian);
    setModalOnboarding(false);
  };

  const biayaMode = {
    teks: 10,
    suara: 15,
    video: 25,
  };

  const tanganiMulaiSimulasi = () => {
    alert(`Memulai simulasi mode ${modeSimulasi.toUpperCase()}. Mengalokasikan ${biayaMode[modeSimulasi]} token.`);
  };

  const tanganiJalankanAnalisisAts = async () => {
    if (!pengguna?.pengguna_id) return;
    setSedangAnalisis(true);
    try {
      const res = await api.analisisSkorCV({ pengguna_id: pengguna.pengguna_id });
      if (res.status === 'sukses') {
        setSkorAts(res.skor_ats);
        setRekomendasiAi(res.rekomendasi_ai);
        setCvTersedia(true);
        if (res.sisa_saldo_token !== undefined) {
          setSaldoToken(res.sisa_saldo_token);
        }
      } else {
        alert(res.pesan || 'Gagal memproses analisis CV.');
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan sistem: ${err.message || 'Koneksi terputus'}`);
    } finally {
      setSedangAnalisis(false);
    }
  };

  if (sedangMemuatBeranda) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10 pb-28 md:pb-12 safe-padding-x font-sans animate-pulse">
        {/* Skeleton Header Beranda */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-stone-200">
          <div className="space-y-2">
            <div className="w-28 h-4 bg-stone-200 rounded" />
            <div className="w-48 sm:w-64 h-8 bg-stone-300 rounded-lg" />
            <div className="w-72 h-4 bg-stone-100 rounded hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-11 bg-stone-200 rounded-xl" />
            <div className="w-36 h-11 bg-stone-200 rounded-xl" />
          </div>
        </div>

        {/* Skeleton Grid 2 Kolom Beranda */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-4 shadow-2xs">
              <div className="w-44 h-6 bg-stone-200 rounded" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-24 bg-stone-100 rounded-xl" />
                <div className="h-24 bg-stone-100 rounded-xl" />
                <div className="h-24 bg-stone-100 rounded-xl" />
              </div>
              <div className="w-full h-12 bg-stone-200 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-4 shadow-2xs">
              <div className="w-36 h-6 bg-stone-200 rounded" />
              <div className="w-full h-28 bg-stone-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10 pb-28 md:pb-12 safe-padding-x">
      {/* Dialog Profil Awal */}
      <DataAwal
        terbuka={modalOnboarding}
        pengguna={pengguna}
        profilAwal={{
          umur,
          jenis_kelamin: jenisKelamin,
          status_pekerjaan: statusPekerjaan,
          role_impian: roleImpian,
        }}
        onSelesai={tanganiSelesaiDataAwal}
      />

      {/* Header Studio Editorial Responsif */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs font-semibold text-orange-800 uppercase tracking-wider block">
            {t.beranda.sambutan}
          </span>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight mt-0.5">
            {pengguna?.nama_pengguna || 'Kandidat'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed hidden sm:block">
            {t.beranda.peluncurDesc}
          </p>
        </div>

        {/* Status Strip: Token & CV */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium shadow-sm min-h-[44px]">
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <span className="text-stone-400 hidden sm:inline">{t.beranda.kreditTersedia} </span>
              <strong className="text-amber-300 font-bold">{saldoToken}</strong> Token
            </span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border min-h-[44px] ${
            cvTersedia 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}>
            {cvTersedia ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{cvTersedia ? t.beranda.cvTerverifikasi : t.beranda.cvBelumLengkap}</span>
          </div>
        </div>
      </div>

      {/* Workspace Grid Layout (1 Kolom di Mobile, 12 Kolom di Layar Lebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Kolom Kiri: Simulation Launcher & CV Studio */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Interactive Simulation Hub */}
          <Kartu className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-stone-900 tracking-tight">
                  {t.beranda.peluncurJudul}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tahap 3: Simulasi Terpandu STAR AI
                </p>
              </div>
              <span className="text-[11px] font-mono text-orange-800 bg-orange-100 px-2.5 py-1 rounded-md font-bold shrink-0">
                {biayaMode[modeSimulasi]} {t.beranda.tokenPerSesi}
              </span>
            </div>

            {/* Mode Selector Tabs (Sentuh Ergonomis di Mobile, Clean di Desktop) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 bg-stone-100 rounded-xl mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => setModeSimulasi('teks')}
                className={`py-2 sm:py-2.5 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 min-h-[46px] transition-all ${
                  modeSimulasi === 'teks'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MessageSquareText className="w-4 h-4 text-orange-700" />
                <span className="truncate">Teks STAR</span>
              </button>

              <button
                type="button"
                onClick={() => setModeSimulasi('suara')}
                className={`py-2 sm:py-2.5 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 min-h-[46px] transition-all ${
                  modeSimulasi === 'suara'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Mic className="w-4 h-4 text-orange-700" />
                <span className="truncate">Suara Alami</span>
              </button>

              <button
                type="button"
                onClick={() => setModeSimulasi('video')}
                className={`py-2 sm:py-2.5 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 min-h-[46px] transition-all ${
                  modeSimulasi === 'video'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Video className="w-4 h-4 text-orange-700" />
                <span className="truncate">Avatar 3D</span>
              </button>
            </div>

            {/* Mode Details Specification Box */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-stone-50 border border-stone-200/90 mb-5 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                <div className="sm:col-span-8 space-y-2">
                  {modeSimulasi === 'teks' && (
                    <div>
                      <div className="text-xs font-bold text-stone-900 mb-1">
                        {t.beranda.modeTeksJudul}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {t.beranda.modeTeksDesc}
                      </p>
                    </div>
                  )}

                  {modeSimulasi === 'suara' && (
                    <div>
                      <div className="text-xs font-bold text-stone-900 mb-1">
                        {t.beranda.modeSuaraJudul}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {t.beranda.modeSuaraDesc}
                      </p>
                    </div>
                  )}

                  {modeSimulasi === 'video' && (
                    <div>
                      <div className="text-xs font-bold text-stone-900 mb-1">
                        {t.beranda.modeVideoJudul}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {t.beranda.modeVideoDesc}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                    <span>{t.beranda.durasiSesi}</span>
                    <span>{t.beranda.evaluasiStarInstan}</span>
                  </div>
                </div>

                <div className="sm:col-span-4 hidden sm:flex items-center justify-center p-2 bg-white rounded-xl border border-stone-200 shadow-sm">
                  <img
                    src={
                      modeSimulasi === 'teks'
                        ? '/illustrations/text-mode.svg'
                        : modeSimulasi === 'suara'
                        ? '/illustrations/audio-conversation.svg'
                        : '/illustrations/interview.svg'
                    }
                    alt="Preview Mode Simulasi"
                    className="max-h-24 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Action Button (Desktop & Mobile) */}
            <div className="pt-2">
              {cvTersedia ? (
                <Tombol
                  varian="primer"
                  ukuran="lg"
                  onClick={tanganiMulaiSimulasi}
                  className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[48px] shadow-sm shadow-orange-700/20"
                >
                  <span>Mulai Simulasi Mode {modeSimulasi.toUpperCase()} ({biayaMode[modeSimulasi]} Token)</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Tombol>
              ) : (
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full py-3.5 px-4 rounded-xl bg-stone-100 text-stone-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-stone-200 min-h-[48px]"
                  >
                    <Lock className="w-4 h-4 text-stone-400" />
                    <span>{t.beranda.simulasiTerkunci}</span>
                  </button>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      {t.beranda.simulasiTerkunciDesc}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Kartu>

          {/* Card 2: ATS CV Workspace & Live AI Audit */}
          <Kartu className="p-5 sm:p-7 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                      {t.beranda.atsTahap1}
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {t.beranda.atsTahap1Desc}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded shrink-0">
                    Tahap 1
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                    <span className="block text-stone-500 text-[10px]">Bagian 1</span>
                    <strong className="text-stone-800 text-[11px]">Profil & Kontak</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                    <span className="block text-stone-500 text-[10px]">Bagian 2</span>
                    <strong className="text-stone-800 text-[11px]">Riwayat Edukasi</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                    <span className="block text-stone-500 text-[10px]">Bagian 3</span>
                    <strong className="text-stone-800 text-[11px]">Pengalaman Kerja</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                    <span className="block text-stone-500 text-[10px]">Bagian 4</span>
                    <strong className="text-stone-800 text-[11px]">Projek Portofolio</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                    <span className="block text-stone-500 text-[10px]">Bagian 5</span>
                    <strong className="text-stone-800 text-[11px]">Daftar Keahlian</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-50 border border-orange-200 text-xs flex flex-col justify-center">
                    <span className="text-orange-800 font-bold text-[10px]">Standar 1 Kolom</span>
                    <span className="text-orange-950 font-bold text-[11px]">Ekspor PDF / Cetak</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <Tombol
                    varian="primer"
                    ukuran="md"
                    onClick={() => navigate('/cv')}
                    className="flex-1 bg-orange-700 hover:bg-orange-800 font-bold text-xs min-h-[44px]"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    <span>{dataCvPengguna ? t.beranda.tombolPerbaruiCV : t.beranda.tombolBuatCV}</span>
                  </Tombol>

                  <button
                    disabled={!dataCvPengguna || sedangAnalisis}
                    onClick={tanganiJalankanAnalisisAts}
                    className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{sedangAnalisis ? t.beranda.analisisSedangMemproses : t.beranda.analisisTombolProses}</span>
                  </button>
                </div>
              </div>

              {/* Ilustrasi Preview ATS Dokumen */}
              <div className="md:col-span-4 hidden md:flex items-center justify-center p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <img
                  src="/illustrations/resume-folder.svg"
                  alt="Ilustrasi Penyusunan CV ATS"
                  className="w-full max-h-40 object-contain"
                />
              </div>
            </div>

            {/* Live ATS AI Analysis Feedback Card */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-700" />
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                    {t.beranda.analisisCardJudul}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                    {t.beranda.analisisBiayaBadge}
                  </span>
                  {skorAts !== null && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      skorAts >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.beranda.analisisSkorLabel}: {skorAts}/100
                    </span>
                  )}
                </div>
              </div>

              {rekomendasiAi ? (
                <div className="space-y-2.5 text-xs">
                  {rekomendasiAi.poin_positif && rekomendasiAi.poin_positif.length > 0 && (
                    <div>
                      <strong className="text-emerald-800 block text-[11px] mb-1 font-bold">
                        {t.beranda.poinKelebihan}
                      </strong>
                      <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                        {rekomendasiAi.poin_positif.map((p: string, idx: number) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rekomendasiAi.poin_perbaikan && rekomendasiAi.poin_perbaikan.length > 0 && (
                    <div>
                      <strong className="text-amber-800 block text-[11px] mb-1 font-bold">
                        {t.beranda.poinPerbaikan}
                      </strong>
                      <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                        {rekomendasiAi.poin_perbaikan.map((p: string, idx: number) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rekomendasiAi.saran_kata_kunci && rekomendasiAi.saran_kata_kunci.length > 0 && (
                    <div>
                      <strong className="text-stone-800 block text-[11px] mb-1 font-bold">
                        {t.beranda.kataKunciDisarankan}
                      </strong>
                      <div className="flex flex-wrap gap-1">
                        {rekomendasiAi.saran_kata_kunci.map((kw: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white border border-stone-200 text-[11px] font-mono text-stone-700">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-stone-500 leading-relaxed italic">
                  {dataCvPengguna ? t.beranda.statusBelumDianalisis : 'Silakan buat draf CV terlebih dahulu sebelum menjalankan audit AI.'}
                </p>
              )}
            </div>
          </Kartu>
        </div>


        {/* Kolom Kanan: Timeline Kesiapan & Rekomendasi Karir */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Target Karir Kandidat */}
          <Kartu className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs sm:text-sm">
                <Target className="w-4 h-4 text-orange-700" />
                <span>{t.beranda.targetKarirJudul}</span>
              </div>
              <button
                type="button"
                onClick={() => setModalOnboarding(true)}
                className="text-xs text-orange-800 hover:text-orange-950 underline font-semibold min-h-[36px] flex items-center px-1"
              >
                {t.beranda.ubahProfil}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 mb-3">
              <span className="text-[11px] text-stone-500 block">{t.beranda.posisiImpian}</span>
              <div className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">
                {roleImpian || t.beranda.posisiBelum}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {t.beranda.posisiDesc}
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert('Pencarian lowongan kerja real-time via RapidAPI JSearch siap diakses!')}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Briefcase className="w-3.5 h-3.5 text-stone-600" />
              <span>{t.beranda.cariLowongan}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto text-stone-400" />
            </button>
          </Kartu>

          {/* Card: Roadmap Kesiapan Karir (Accordion di Mobile, Timeline di Desktop) */}
          <Kartu className="p-5 sm:p-6">
            {/* Header / Toggle untuk Mobile */}
            <div 
              className="flex items-center justify-between cursor-pointer md:cursor-default"
              onClick={() => setBukaRoadmapMobile(!bukaRoadmapMobile)}
            >
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                  {t.beranda.roadmapJudul}
                </h2>
                <p className="text-xs text-stone-500">
                  {t.beranda.roadmapDesc}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-500 md:hidden transition-transform ${bukaRoadmapMobile ? 'rotate-180' : ''}`} />
            </div>

            {/* List Roadmap: Selalu Tampil di Desktop, Toggle di Mobile */}
            <div className={`mt-4 space-y-3.5 relative before:hidden md:before:block before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-stone-200 ${bukaRoadmapMobile ? 'block' : 'hidden md:block'}`}>
              <div className="flex items-start gap-3 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-[11px] font-bold ${
                  cvTersedia ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-orange-700 text-orange-700'
                }`}>
                  {cvTersedia ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900">1. Penyusunan CV Standar ATS</h3>
                  <p className="text-[11px] text-stone-500">
                    {cvTersedia ? 'Resume lengkap & siap dievaluasi.' : 'Lengkapi 5 bagian profil resume.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-stone-300 text-stone-500 flex items-center justify-center shrink-0 z-10 text-[11px] font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900">2. Evaluasi STAR AI</h3>
                  <p className="text-[11px] text-stone-500">
                    Analisis relevansi keahlian terhadap peran impian.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-[11px] font-bold ${
                  cvTersedia ? 'bg-white border-2 border-orange-700 text-orange-700' : 'bg-white border-2 border-stone-300 text-stone-400'
                }`}>
                  3
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900">3. Simulasi Wawancara Adaptif</h3>
                  <p className="text-[11px] text-stone-500">
                    Latihan terpandu pada 3 mode interaktif.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-stone-300 text-stone-400 flex items-center justify-center shrink-0 z-10 text-[11px] font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900">4. Pencocokan Lowongan</h3>
                  <p className="text-[11px] text-stone-500">
                    Telusuri lowongan di portal karir terpercaya.
                  </p>
                </div>
              </div>
            </div>
          </Kartu>

          {/* Quick Support Link */}
          <Link
            to="/csm"
            className="p-3.5 sm:p-4 rounded-xl bg-stone-100 border border-stone-200/90 flex items-center justify-between text-xs text-stone-800 min-h-[44px] hover:bg-stone-200/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-700 shrink-0" />
              <span className="font-semibold">{t.beranda.csmJudul}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
          </Link>
        </div>
      </div>
    </div>
  );
};
