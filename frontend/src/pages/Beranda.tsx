// Halaman Beranda & Studio Simulasi: Asymmetric Executive Career Studio layout, mode switcher interaktif, timeline kesiapan karir, dan penanganan status CV bermartabat.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Kartu } from '../components/ui/Kartu';
import { Tombol } from '../components/ui/Tombol';
import { KotakInput } from '../components/ui/KotakInput';
import { DialogModal } from '../components/ui/DialogModal';
import { api } from '../services/api';
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
  // State Onboarding Modal
  const [modalOnboarding, setModalOnboarding] = useState(false);
  const [umur, setUmur] = useState<number | ''>('');
  const [statusPekerjaan, setStatusPekerjaan] = useState('mahasiswa');
  const [jenisKelamin, setJenisKelamin] = useState('pria');
  const [roleImpian, setRoleImpian] = useState('');
  const [industriImpian, setIndustriImpian] = useState('');
  const [sedangSimpanOnboarding, setSedangSimpanOnboarding] = useState(false);

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
            setIndustriImpian(p.industri_impian || '');
          }
        }
      }).catch(() => {
        // Fallback jika belum terkoneksi
        setModalOnboarding(true);
      });
    }
  }, [pengguna]);

  const simpanOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengguna) return;

    setSedangSimpanOnboarding(true);
    try {
      await api.updateProfil({
        pengguna_id: pengguna.pengguna_id,
        umur: umur ? Number(umur) : undefined,
        status_pekerjaan: statusPekerjaan,
        jenis_kelamin: jenisKelamin,
        industri_impian: industriImpian,
        role_impian: roleImpian,
      });
      setModalOnboarding(false);
    } catch (err) {
      setModalOnboarding(false);
    } finally {
      setSedangSimpanOnboarding(false);
    }
  };

  const biayaMode = {
    teks: 10,
    suara: 15,
    video: 25,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 safe-padding-x space-y-10">
      {/* Onboarding Dialog Modal Wajib (Tanpa Tombol Silang) */}
      <DialogModal
        terbuka={modalOnboarding}
        padaTutup={() => {}}
        wajibDiisi={true}
        tanpaTombolTutup={true}
        judul="Lengkapi Profil Awal Anda"
      >
        <p className="text-xs text-stone-600 mb-5 leading-relaxed max-w-[65ch]">
          Informasi ini wajib diisi agar AI dapat mengkalibrasi tingkat kesulitan, gaya pertanyaan, dan skenario wawancara dengan latar belakang Anda.
        </p>
        <form onSubmit={simpanOnboarding} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <KotakInput
              label="Umur (Tahun)"
              type="number"
              required
              min={15}
              max={80}
              placeholder="Contoh: 22"
              value={umur}
              onChange={(e) => setUmur(e.target.value ? Number(e.target.value) : '')}
            />
            <div>
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
                Jenis Kelamin
              </label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              >
                <option value="pria">Pria</option>
                <option value="wanita">Wanita</option>
                <option value="memilih_tidak_disebutkan">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
              Status Karir Saat Ini
            </label>
            <select
              value={statusPekerjaan}
              onChange={(e) => setStatusPekerjaan(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
            >
              <option value="mahasiswa">Mahasiswa Aktif</option>
              <option value="pelajar">Pelajar SMA/SMK</option>
              <option value="fresh_graduate">Fresh Graduate (Lulusan Baru)</option>
              <option value="pekerja">Karyawan / Profesional Aktif</option>
              <option value="mencari_kerja">Sedang Mencari Kerja</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <KotakInput
            label="Role / Posisi Impian"
            required
            placeholder="Contoh: Frontend Developer, Product Designer, Data Analyst"
            value={roleImpian}
            onChange={(e) => setRoleImpian(e.target.value)}
          />

          <KotakInput
            label="Industri Target (Opsional)"
            placeholder="Contoh: Teknologi Informasi, Keuangan, FMCG"
            value={industriImpian}
            onChange={(e) => setIndustriImpian(e.target.value)}
          />

          <Tombol
            type="submit"
            varian="primer"
            ukuran="md"
            sedangMemuat={sedangSimpanOnboarding}
            className="w-full mt-2 font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[44px]"
          >
            Simpan & Masuk ke Studio
          </Tombol>
        </form>
      </DialogModal>

      {/* Editorial Header (Zero AI Slop: No capsule badges, confident direct hierarchy) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/90">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Studio Persiapan Karir & Simulasi
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Selamat datang, <span className="font-semibold text-slate-900">{pengguna?.nama_pengguna || 'Kandidat'}</span>. Latih ketenangan, kejelasan artikulasi, dan struktur jawaban STAR Anda bersama pewawancara AI adaptif.
          </p>
        </div>

        {/* Real-time Status Indicator Strip */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Kredit Tersedia: <strong className="text-amber-300 font-bold">{saldoToken}</strong> Token</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
            cvTersedia 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${cvTersedia ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span>{cvTersedia ? 'CV Terverifikasi' : 'CV Belum Lengkap'}</span>
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
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Peluncur Sesi Simulasi Wawancara
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih format latihan yang sesuai dengan kebutuhan persiapan Anda hari ini.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                Tahap 3
              </span>
            </div>

            {/* Mode Selector Tabs (Interactive & Tactile) */}
            <div className="grid grid-cols-3 gap-2.5 p-1.5 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setModeSimulasi('teks')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  modeSimulasi === 'teks'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video 3D & Visi</span>
              </button>
            </div>

            {/* Mode Details Specification Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 space-y-3">
              {modeSimulasi === 'teks' && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span>Format: Pertanyaan & Jawaban Tertulis</span>
                    <span className="font-mono text-brand-700">{biayaMode.teks} Token / Sesi</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sangat cocok untuk pemula yang ingin mematangkan struktur formulasi STAR (Situation, Task, Action, Result) tanpa tekanan waktu bicara langsung.
                  </p>
                </div>
              )}

              {modeSimulasi === 'suara' && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span>Format: Percakapan Audio Real-time</span>
                    <span className="font-mono text-brand-700">{biayaMode.suara} Token / Sesi</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Menguji tempo berbicara, kejelasan intonasi, dan kelancaran menyampaikan argumen menggunakan input suara mikrofon Anda.
                  </p>
                </div>
              )}

              {modeSimulasi === 'video' && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span>Format: Avatar 3D Interaktif & Deteksi Visi</span>
                    <span className="font-mono text-brand-700">{biayaMode.video} Token / Sesi</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Simulasi paling realistis. Pewawancara 3D interaktif bereaksi secara visual. MediaPipe menganalisis kontak mata dan postur tubuh secara privat di browser Anda.
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Perkiraan durasi: 12 sampai 15 menit</span>
                <span>Umpan balik instan di akhir sesi</span>
              </div>
            </div>

            {/* Simulation Action: Dignified Locked vs Active State */}
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
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
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
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Penyusunan CV Berstandar ATS
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fondasi utama kesuksesan wawancara dan seleksi administrasi rekruter.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                Tahap 1
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                <span className="block text-slate-500 mb-1">Bagian 1</span>
                <strong className="text-slate-800">Profil & Kontak</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                <span className="block text-slate-500 mb-1">Bagian 2</span>
                <strong className="text-slate-800">Riwayat Edukasi</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                <span className="block text-slate-500 mb-1">Bagian 3</span>
                <strong className="text-slate-800">Pengalaman Kerja</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                <span className="block text-slate-500 mb-1">Bagian 4</span>
                <strong className="text-slate-800">Projek Portofolio</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                <span className="block text-slate-500 mb-1">Bagian 5</span>
                <strong className="text-slate-800">Daftar Keahlian</strong>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200/70 text-xs flex flex-col justify-center">
                <span className="text-indigo-600 font-semibold">5 Template ATS</span>
                <span className="text-indigo-900 font-bold">Ekspor PDF & DOCX</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Uji Skor ATS (5 Token)
              </button>
            </div>
          </Kartu>
        </div>

        {/* Kolom Kanan: Timeline Kesiapan & Ekosistem Karir (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Roadmap Kesiapan Karir Kandidat */}
          <Kartu className="p-6">
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Alur Progres Kesiapan Karir
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Jalur terstruktur untuk mencapai performa wawancara optimal.
            </p>

            {/* Vertical Chronological Roadmap */}
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-200">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold ${
                  cvTersedia 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white border-2 border-brand-600 text-brand-600'
                }`}>
                  {cvTersedia ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <div className="pt-0.5">
                  <h3 className="text-xs font-bold text-slate-900">Penyusunan CV Standar ATS</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cvTersedia ? 'Format resume lengkap dan siap dievaluasi.' : 'Lengkapi 5 bagian esensial profil Anda.'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 relative">
                <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-300 text-slate-500 flex items-center justify-center shrink-0 z-10 text-xs font-bold">
                  2
                </div>
                <div className="pt-0.5">
                  <h3 className="text-xs font-bold text-slate-900">Evaluasi STAR & SWOT AI</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Analisis kekuatan, kelemahan, dan relevansi pengalaman terhadap posisi impian.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold ${
                  cvTersedia 
                    ? 'bg-white border-2 border-brand-600 text-brand-600' 
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}>
                  3
                </div>
                <div className="pt-0.5">
                  <h3 className="text-xs font-bold text-slate-900">Simulasi Wawancara Adaptif</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Latihan berulang pada 3 mode untuk mengasah artikulasi dan ketenangan mental.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3.5 relative">
                <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center shrink-0 z-10 text-xs font-bold">
                  4
                </div>
                <div className="pt-0.5">
                  <h3 className="text-xs font-bold text-slate-900">Pencocokan Lowongan Real-time</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Telusuri lowongan yang selaras di LinkedIn, Indeed, Jobstreet, dan Glints.
                  </p>
                </div>
              </div>
            </div>
          </Kartu>

          {/* Card: Target Karir & Rekomendasi Loker */}
          <Kartu className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Target className="w-4 h-4 text-brand-600" />
                <span>Target Karir Anda</span>
              </div>
              <button
                onClick={() => setModalOnboarding(true)}
                className="text-[11px] text-brand-700 hover:underline font-semibold"
              >
                Ubah Target
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
              <div className="text-xs text-slate-500">Posisi Impian:</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {roleImpian || 'Belum Ditentukan'}
              </div>
              {industriImpian && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Industri: {industriImpian}
                </div>
              )}
            </div>

            <button
              onClick={() => alert('Pencarian lowongan kerja real-time via RapidAPI JSearch siap diakses!')}
              className="w-full py-2.5 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Cari Lowongan Sesuai Profil</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
            </button>
          </Kartu>

          {/* Card: Customer Success Quick Link */}
          <div className="p-5 rounded-2xl bg-slate-100/70 border border-slate-200/70 text-xs text-slate-600 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <span className="font-semibold text-slate-800">Butuh Konsultasi atau Tambahan Token?</span>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Tim Customer Success MeIntervUAI siap mendampingi persiapan karir Anda. Ajukan pertanyaan atau permintaan token langsung melalui halaman CSM.
              </p>
              <Link
                to="/csm"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 pt-1"
              >
                <span>Buka Pengenalan & Pusat CSM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
