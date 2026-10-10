// Halaman Beranda & Onboarding: dialog umur/status/gender/role, petunjuk panduan 4 langkah, status token, dan kartu simulasi terkunci.
import React, { useState, useEffect } from 'react';
import { Kartu } from '../components/ui/Kartu';
import { Tombol } from '../components/ui/Tombol';
import { KotakInput } from '../components/ui/KotakInput';
import { DialogModal } from '../components/ui/DialogModal';
import { api } from '../services/api';
import { 
  FileText, 
  Video, 
  Briefcase, 
  Lock, 
  Coins, 
  ArrowRight, 
  Sparkles, 
  AlertCircle
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

  // Status CV & Kelayakan Simulasi
  const [cvTersedia, setCvTersedia] = useState(false);
  const [saldoToken, setSaldoToken] = useState(100);

  useEffect(() => {
    if (pengguna && pengguna.pengguna_id) {
      api.getProfil(pengguna.pengguna_id).then((res) => {
        if (res.status === 'sukses') {
          setCvTersedia(res.cv_tersedia || false);
          if (res.saldo_token) {
            setSaldoToken(res.saldo_token.jumlah_saldo);
          }
          // Jika profil belum memiliki data umur atau status pekerjaan, buka modal onboarding
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
        // Mode offline/fallback: jika profil belum lengkap
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
      // Tetap tutup modal
      setModalOnboarding(false);
    } finally {
      setSedangSimpanOnboarding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Onboarding Dialog Modal */}
      <DialogModal
        terbuka={modalOnboarding}
        padaTutup={() => setModalOnboarding(false)}
        judul="Lengkapi Profil Awal Anda"
      >
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Informasi ini membantu AI menyesuaikan tingkat kesulitan dan gaya wawancara dengan profil Anda.
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Jenis Kelamin
              </label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="pria">Pria</option>
                <option value="wanita">Wanita</option>
                <option value="memilih_tidak_disebutkan">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Saat Ini
            </label>
            <select
              value={statusPekerjaan}
              onChange={(e) => setStatusPekerjaan(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="mahasiswa">Mahasiswa Aktif</option>
              <option value="pelajar">Pelajar SMA/SMK</option>
              <option value="fresh_graduate">Fresh Graduate (Lulusan Baru)</option>
              <option value="pekerja">Karyawan / Profesional</option>
              <option value="mencari_kerja">Sedang Mencari Kerja</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <KotakInput
            label="Role / Pekerjaan Impian (Opsional)"
            placeholder="Contoh: Frontend Developer, Product Manager, HR Officer"
            value={roleImpian}
            onChange={(e) => setRoleImpian(e.target.value)}
          />

          <KotakInput
            label="Industri Target (Opsional)"
            placeholder="Contoh: Teknologi, Perbankan, FMCG, Kesehatan"
            value={industriImpian}
            onChange={(e) => setIndustriImpian(e.target.value)}
          />

          <Tombol
            type="submit"
            varian="primer"
            ukuran="md"
            sedangMemuat={sedangSimpanOnboarding}
            className="w-full mt-2"
          >
            Simpan & Mulai Persiapan Karir
          </Tombol>
        </form>
      </DialogModal>

      {/* Hero Banner Sambutan */}
      <div className="bg-gradient-to-r from-brand-900 to-indigo-900 rounded-2xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Platform Latihan Wawancara AI Terpadu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Halo, {pengguna?.nama_pengguna || 'Kandidat Hebat'}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200 leading-relaxed">
            Siapkan diri Anda menghadapi wawancara kerja impian. Susun CV ramah ATS, ikuti simulasi adaptif berbasis AI, dan temukan lowongan pekerjaan yang cocok.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold">
              <Coins className="w-4 h-4 text-amber-300" />
              <span>Saldo Anda: {saldoToken} Token</span>
            </div>
            {roleImpian && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-slate-200 text-xs">
                <Briefcase className="w-4 h-4" />
                <span>Target: {roleImpian}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Petunjuk Panduan 4 Tahap Sukses */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Tahapan Persiapan Wawancara Anda
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Ikuti urutan langkah berikut agar simulasi AI dapat mengenali kompetensi Anda secara optimal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Langkah 1: CV Builder */}
          <Kartu className="p-5 relative border-l-4 border-l-brand-600">
            <div className="flex items-center justify-between mb-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <FileText className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Susun CV ATS</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Lengkapi 5 bagian (profil, pendidikan, pengalaman, projek, keahlian) dengan 5 template standar ATS.
            </p>
            <button
              onClick={() => alert('Modul Pembuat CV siap dibuka pada tahap berikutnya!')}
              className="w-full text-xs font-semibold py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors flex items-center justify-center gap-1"
            >
              <span>Isi CV Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Kartu>

          {/* Langkah 2: Analisis CV */}
          <Kartu className="p-5 relative border-l-4 border-l-indigo-400">
            <div className="flex items-center justify-between mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Analisis CV AI</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Dapatkan skor kelayakan (0-100), analisis kelebihan dan kekurangan, serta rekomendasi role yang sesuai.
            </p>
            <button
              disabled={!cvTersedia}
              onClick={() => alert('Analisis CV AI akan menguji skor format ATS dan SWOT pengalaman Anda.')}
              className="w-full text-xs font-semibold py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cvTersedia ? 'Cek Skor CV (5 Token)' : 'Menunggu Pengisian CV'}
            </button>
          </Kartu>

          {/* Langkah 3: Simulasi Wawancara (Terkunci jika CV belum ada) */}
          <Kartu className={`p-5 relative border-l-4 ${cvTersedia ? 'border-l-emerald-600' : 'border-l-slate-300'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                3
              </span>
              {cvTersedia ? <Video className="w-5 h-5 text-emerald-600" /> : <Lock className="w-5 h-5 text-slate-400" />}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Simulasi Wawancara</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              3 mode (Teks, Suara Alami, dan Video Avatar + MediaPipe Vision). Pertanyaan dinamis seputar CV Anda.
            </p>
            <button
              disabled={!cvTersedia}
              onClick={() => alert('Simulasi siap dijalankan!')}
              className={`w-full text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                cvTersedia
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title={cvTersedia ? 'Mulai sesi simulasi' : 'Tombol terkunci: Lengkapi CV Anda terlebih dahulu'}
            >
              {!cvTersedia && <Lock className="w-3.5 h-3.5" />}
              <span>{cvTersedia ? 'Mulai Simulasi' : 'Terkunci (Isi CV Dahulu)'}</span>
            </button>
          </Kartu>

          {/* Langkah 4: Rekomendasi Loker */}
          <Kartu className="p-5 relative border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                4
              </span>
              <Briefcase className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Rekomendasi Loker</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Cari lowongan real-time dari LinkedIn, Indeed, Jobstreet, dan Glints yang selaras dengan hasil latihan.
            </p>
            <button
              onClick={() => alert('Portal lowongan kerja real-time via RapidAPI JSearch siap diakses!')}
              className="w-full text-xs font-semibold py-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Lihat Informasi Loker
            </button>
          </Kartu>
        </div>
      </div>

      {/* Status Kelayakan & Pengingat Ramah */}
      {!cvTersedia && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Kenapa Tombol Mulai Simulasi Terkunci?</span>
            <p className="leading-relaxed text-blue-800">
              Pewawancara AI bekerja layaknya HRD sungguhan yang membaca resume kandidat terlebih dahulu. AI akan mengekstrak proyek dan riwayat organisasi dari CV Anda untuk mengajukan pertanyaan kontekstual (metode STAR). Silakan klik <strong>Langkah 1 (Susun CV ATS)</strong> di atas untuk membuka akses simulasi!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
