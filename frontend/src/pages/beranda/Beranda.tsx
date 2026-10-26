// Halaman Beranda & Studio Simulasi: Asymmetric Executive Career Studio layout (pages/beranda/Beranda.tsx)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Target
} from 'lucide-react';

interface PropertiBeranda {
  pengguna: any;
  onPerbaruiPengguna?: (pengguna: any) => void;
}

export const Beranda: React.FC<PropertiBeranda> = ({ pengguna }) => {
  const { t } = useBahasa();
  // State Onboarding Modal
  const [modalOnboarding, setModalOnboarding] = useState(false);
  const [umur, setUmur] = useState<number | ''>('');
  const [statusPekerjaan, setStatusPekerjaan] = useState('mahasiswa');
  const [jenisKelamin, setJenisKelamin] = useState('pria');
  const [roleImpian, setRoleImpian] = useState('');

  // Status CV & Saldo Token
  const [cvTersedia, setCvTersedia] = useState(false);
  const [saldoToken, setSaldoToken] = useState(100);

  // Mode Simulasi Pilihan Kandidat
  const [modeSimulasi, setModeSimulasi] = useState<'teks' | 'suara' | 'video'>('video');

  useEffect(() => {
    if (pengguna && pengguna.pengguna_id) {
      api.getProfil(pengguna.pengguna_id).then((res) => {
        if (res.status === 'sukses') {
          setCvTersedia(res.cv_tersedia || false);
          if (res.saldo_token) {
            setSaldoToken(res.saldo_token.jumlah_saldo);
          }
          const p = res.profil || {};
          if (!p.umur || !p.status_pekerjaan) {
            setModalOnboarding(true);
          } else {
            setUmur(p.umur);
            setStatusPekerjaan(p.status_pekerjaan);
            setJenisKelamin(p.jenis_kelamin || 'pria');
            setRoleImpian(p.role_impian || '');
          }
        }
      }).catch(() => {
        setModalOnboarding(true);
      });
    }
  }, [pengguna]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 safe-padding-x space-y-10">
      {/* Dialog Profil Awal (pages/beranda/DataAwal.tsx) */}
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

      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200/90">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
            {t.beranda.judulStudio}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {t.beranda.sambutan} <span className="font-semibold text-stone-900">{pengguna?.nama_pengguna || 'Kandidat'}</span>.
          </p>
        </div>

        {/* Real-time Status Indicator Strip */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium shadow-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{t.beranda.kreditTersedia} <strong className="text-amber-300 font-bold">{saldoToken}</strong> Token</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
            cvTersedia 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${cvTersedia ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span>{cvTersedia ? t.beranda.cvTerverifikasi : t.beranda.cvBelumLengkap}</span>
          </div>
        </div>
      </div>

      {/* Asymmetric Studio Workspace Layout (62% Left Actions / 38% Right Timeline & Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Simulation Launcher & CV Studio (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Interactive Simulation Hub */}
          <Kartu className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                  {t.beranda.peluncurJudul}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {t.beranda.peluncurDesc}
                </p>
              </div>
              <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
                Tahap 3
              </span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-2.5 p-1.5 bg-stone-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setModeSimulasi('teks')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  modeSimulasi === 'teks'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MessageSquareText className="w-4 h-4" />
                <span>Teks & Refleksi</span>
              </button>

              <button
                type="button"
                onClick={() => setModeSimulasi('suara')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  modeSimulasi === 'suara'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Suara Alami</span>
              </button>

              <button
                type="button"
                onClick={() => setModeSimulasi('video')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  modeSimulasi === 'video'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video 3D & Visi</span>
              </button>
            </div>

            {/* Mode Details Specification Box dengan Ilustrasi Dinamis */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-8 space-y-2">
                  {modeSimulasi === 'teks' && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1">
                        <span>Format: Jawaban Tertulis Terpandu</span>
                        <span className="font-mono text-orange-700 font-bold">{biayaMode.teks} Token / Sesi</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Sangat cocok untuk pemula yang ingin mematangkan struktur formulasi STAR (Situation, Task, Action, Result) tanpa tekanan waktu bicara langsung.
                      </p>
                    </div>
                  )}

                  {modeSimulasi === 'suara' && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1">
                        <span>Format: Percakapan Audio Real-time</span>
                        <span className="font-mono text-orange-700 font-bold">{biayaMode.suara} Token / Sesi</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Menguji tempo berbicara, kejelasan intonasi, dan kelancaran menyampaikan argumen menggunakan input suara mikrofon Anda.
                      </p>
                    </div>
                  )}

                  {modeSimulasi === 'video' && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1">
                        <span>Format: Avatar 3D & Analisis Tatap Muka</span>
                        <span className="font-mono text-orange-700 font-bold">{biayaMode.video} Token / Sesi</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Simulasi paling realistis. Pewawancara 3D bereaksi secara visual. MediaPipe menganalisis kontak mata dan postur tubuh secara privat di browser Anda.
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                    <span>Durasi: 12 - 15 menit</span>
                    <span>Evaluasi STAR instan</span>
                  </div>
                </div>

                {/* Ilustrasi Preview Mode */}
                <div className="sm:col-span-4 flex items-center justify-center p-2 bg-white rounded-xl border border-stone-200/70 shadow-sm">
                  <img
                    src={
                      modeSimulasi === 'teks'
                        ? '/illustrations/text-mode.svg'
                        : modeSimulasi === 'suara'
                        ? '/illustrations/audio-conversation.svg'
                        : '/illustrations/interview.svg'
                    }
                    alt="Preview Mode Simulasi"
                    className="max-h-28 w-auto object-contain transition-all duration-300 transform hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Simulation Action */}
            {cvTersedia ? (
              <Tombol
                varian="primer"
                ukuran="lg"
                onClick={() => alert(`Memulai simulasi mode ${modeSimulasi}. Mengalokasikan ${biayaMode[modeSimulasi]} token.`)}
                className="w-full font-semibold"
              >
                <span>Mulai Simulasi Mode {modeSimulasi.toUpperCase()} ({biayaMode[modeSimulasi]} Token)</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Tombol>
            ) : (
              <div className="space-y-3">
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl bg-stone-100 text-stone-400 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-stone-200"
                >
                  <Lock className="w-4 h-4 text-stone-400" />
                  <span>Simulasi Terkunci (Memerlukan Data CV)</span>
                </button>
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Pewawancara AI membutuhkan poin pengalaman kerja atau projek dari CV Anda agar dapat merumuskan pertanyaan kontekstual. Silakan isi CV Anda pada panel di bawah ini untuk membuka akses.
                  </p>
                </div>
              </div>
            )}
          </Kartu>

          {/* Card 2: ATS CV Workspace */}
          <Kartu className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                      Penyusunan CV Berstandar ATS
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Fondasi utama kesuksesan wawancara dan seleksi administrasi rekruter.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md shrink-0">
                    Tahap 1
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-xs">
                    <span className="block text-stone-500 text-[11px] mb-0.5">Bagian 1</span>
                    <strong className="text-stone-800">Profil & Kontak</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-xs">
                    <span className="block text-stone-500 text-[11px] mb-0.5">Bagian 2</span>
                    <strong className="text-stone-800">Riwayat Edukasi</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-xs">
                    <span className="block text-stone-500 text-[11px] mb-0.5">Bagian 3</span>
                    <strong className="text-stone-800">Pengalaman Kerja</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-xs">
                    <span className="block text-stone-500 text-[11px] mb-0.5">Bagian 4</span>
                    <strong className="text-stone-800">Projek Portofolio</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-xs">
                    <span className="block text-stone-500 text-[11px] mb-0.5">Bagian 5</span>
                    <strong className="text-stone-800">Daftar Keahlian</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200/70 text-xs flex flex-col justify-center">
                    <span className="text-orange-700 font-semibold text-[11px]">5 Template ATS</span>
                    <span className="text-orange-950 font-bold">Ekspor PDF/DOCX</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Tombol
                    varian="primer"
                    ukuran="md"
                    onClick={() => alert('Modul Pembuat CV siap dibuka pada tahap berikutnya!')}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{cvTersedia ? 'Perbarui Konten CV' : 'Isi Data CV Sekarang'}</span>
                  </Tombol>

                  <button
                    disabled={!cvTersedia}
                    onClick={() => alert('Analisis CV AI sedang mengevaluasi kata kunci industri Anda.')}
                    className="px-4 py-2.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[38px]"
                  >
                    Uji Skor ATS (5 Token)
                  </button>
                </div>
              </div>

              {/* Ilustrasi ATS Document Preview */}
              <div className="md:col-span-4 hidden md:flex items-center justify-center p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <img
                  src="/illustrations/resume-folder.svg"
                  alt="Ilustrasi Penyusunan CV ATS"
                  className="w-full max-h-48 object-contain filter drop-shadow-sm hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </Kartu>
        </div>

        {/* Kolom Kanan: Timeline Kesiapan & Ekosistem Karir (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Roadmap Kesiapan Karir Kandidat */}
          <Kartu className="p-6">
            <h2 className="text-base font-bold text-stone-900 tracking-tight mb-1">
              Alur Progres Kesiapan Karir
            </h2>
            <p className="text-xs text-stone-500 mb-5">
              Jalur terstruktur untuk mencapai performa wawancara optimal.
            </p>

            {/* Vertical Chronological Roadmap */}
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-stone-200">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold ${
                  cvTersedia 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white border-2 border-orange-700 text-orange-700'
                }`}>
                  {cvTersedia ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <div className="pt-0.5">
                  <h3 className="text-xs font-bold text-stone-900">Penyusunan CV Standar ATS</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {cvTersedia ? 'Format resume lengkap dan siap dievaluasi.' : 'Lengkapi 5 bagian esensial profil Anda.'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 relative">
                <div className="w-7 h-7 rounded-full bg-white border-2 border-stone-300 text-stone-500 flex items-center justify-center shrink-0 z-10 text-xs font-bold">
                  2
                </div>
                <div className="pt-0.5">
                  <h3 className="text-xs font-bold text-stone-900">Evaluasi STAR & SWOT AI</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Analisis kekuatan, kelemahan, dan relevansi pengalaman terhadap posisi impian.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold ${
                  cvTersedia 
                    ? 'bg-white border-2 border-orange-700 text-orange-700' 
                    : 'bg-white border-2 border-stone-300 text-stone-400'
                }`}>
                  3
                </div>
                <div className="pt-0.5">
                  <h3 className="text-xs font-bold text-stone-900">Simulasi Wawancara Adaptif</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Latihan berulang pada 3 mode untuk mengasah artikulasi dan ketenangan mental.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3.5 relative">
                <div className="w-7 h-7 rounded-full bg-white border-2 border-stone-300 text-stone-400 flex items-center justify-center shrink-0 z-10 text-xs font-bold">
                  4
                </div>
                <div className="pt-0.5">
                  <h3 className="text-xs font-bold text-stone-900">Pencocokan Lowongan Real-time</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Telusuri lowongan yang selaras di LinkedIn, Indeed, Jobstreet, dan Glints.
                  </p>
                </div>
              </div>
            </div>
          </Kartu>

          {/* Card: Target Karir & Rekomendasi Loker */}
          <Kartu className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <Target className="w-4 h-4 text-orange-700" />
                <span>Target Karir Anda</span>
              </div>
              <button
                onClick={() => setModalOnboarding(true)}
                className="text-xs text-orange-700 hover:text-orange-900 underline font-semibold min-h-[28px]"
              >
                Ubah Profil
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center mb-4">
              <div className="sm:col-span-8 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="text-xs text-stone-600 font-medium">Posisi Impian:</div>
                <div className="text-sm font-bold text-stone-900 mt-0.5">
                  {roleImpian || 'Fleksibel / Belum Ditentukan'}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Pencocokan lowongan otomatis diperbarui sesuai preferensi Anda.
                </p>
              </div>
              <div className="sm:col-span-4 flex items-center justify-center p-2 bg-stone-50 rounded-xl border border-stone-200/70">
                <img
                  src="/illustrations/job-hunt.svg"
                  alt="Pencarian Karir"
                  className="max-h-20 w-auto object-contain hover:scale-105 transition-transform"
                />
              </div>
            </div>

            <button
              onClick={() => alert('Pencarian lowongan kerja real-time via RapidAPI JSearch siap diakses!')}
              className="w-full py-2.5 px-3 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors min-h-[38px]"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Cari Lowongan Sesuai Profil</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto text-stone-400" />
            </button>
          </Kartu>

          {/* Card: Customer Success Quick Link */}
          <div className="p-5 rounded-2xl bg-stone-100/80 border border-stone-200 text-xs text-stone-700">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-8 space-y-1.5">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-orange-700 shrink-0" />
                  <span className="font-semibold text-stone-900 text-sm">Konsultasi Karir & CSM</span>
                </div>
                <p className="text-xs leading-relaxed text-stone-600">
                  Tim pendamping karir MeIntervUAI siap membantu persiapan Anda. Ajukan pertanyaan atau diskusikan kebutuhan latihan melalui halaman panduan.
                </p>
                <Link
                  to="/csm"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-900 pt-1 min-h-[28px]"
                >
                  <span>Buka Pusat Panduan & Dukungan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="sm:col-span-4 flex items-center justify-center p-2 bg-white rounded-xl border border-stone-200 shadow-sm">
                <img
                  src="/illustrations/contact-us.svg"
                  alt="Dukungan CSM"
                  className="max-h-20 w-auto object-contain hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
