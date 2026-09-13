import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Sparkles,
  Search,
  Building2,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Play,
  ArrowRight,
  TrendingUp,
  X,
  PlusCircle,
  Info,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import { pakaiBahasa } from '../contexts/KonteksBahasa';
import { ambilCvTerbaru } from '../services/api_cv';
import {
  ambilRekomendasiLowongan,
  formatGajiRingkas,
} from '../services/api_lowongan';

export default function Lowongan() {
  const { profil } = pakaiOtentikasi();
  const { t } = pakaiBahasa();
  const navigate = useNavigate();

  const [cvData, setCvData] = useState(null);
  const [isLoadingCv, setIsLoadingCv] = useState(true);
  const [daftarLowongan, setDaftarLowongan] = useState([]);
  const [isLoadingLowongan, setIsLoadingLowongan] = useState(true);

  // State Filter & Pencarian
  const [kataKunciInput, setKataKunciInput] = useState('');
  const [kataKunciDebounce, setKataKunciDebounce] = useState('');
  const [sistemKerja, setSistemKerja] = useState('Semua');
  const [urutan, setUrutan] = useState('skor');

  // Debounce input pencarian kata kunci agar tidak membebani live aggregator
  useEffect(() => {
    const timer = setTimeout(() => {
      setKataKunciDebounce(kataKunciInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [kataKunciInput]);

  // Modal / Drawer Detail Lowongan
  const [detailDipilih, setDetailDipilih] = useState(null);

  // Modal Custom Input Posisi / Perusahaan Impian
  const [bukaModalCustom, setBukaModalCustom] = useState(false);
  const [customPerusahaan, setCustomPerusahaan] = useState('');
  const [customPosisi, setCustomPosisi] = useState('');
  const [customError, setCustomError] = useState('');

  // 1. Muat Data CV Pengguna
  useEffect(() => {
    let aktif = true;
    async function muatCv() {
      setIsLoadingCv(true);
      const lokal = localStorage.getItem('mentervu_cv_data');
      if (lokal) {
        try {
          const parsed = JSON.parse(lokal);
          if (aktif && parsed) setCvData(parsed);
        } catch (e) {
          console.warn('Gagal parse cv data lokal:', e);
        }
      }

      if (profil?.id) {
        try {
          const cvDb = await ambilCvTerbaru(profil.id);
          if (aktif && cvDb?.data_cv) {
            setCvData(cvDb.data_cv);
          }
        } catch (e) {
          console.warn('Gagal load cv dari supabase:', e);
        }
      }
      if (aktif) setIsLoadingCv(false);
    }
    muatCv();
    return () => {
      aktif = false;
    };
  }, [profil?.id]);

  // 2. Kalkulasi Rekomendasi Lowongan AI dari Live Aggregator Nyata
  useEffect(() => {
    let aktif = true;
    async function muatRekomendasi() {
      setIsLoadingLowongan(true);
      try {
        const hasil = await ambilRekomendasiLowongan(cvData, {
          kataKunci: kataKunciDebounce,
          sistemKerja,
          urutan,
        });
        if (aktif) {
          setDaftarLowongan(hasil || []);
        }
      } catch (e) {
        console.warn('Gagal muat rekomendasi lowongan:', e);
        if (aktif) setDaftarLowongan([]);
      } finally {
        if (aktif) {
          setIsLoadingLowongan(false);
        }
      }
    }
    muatRekomendasi();
    return () => {
      aktif = false;
    };
  }, [cvData, kataKunciDebounce, sistemKerja, urutan]);

  // Handle Mulai Simulasi untuk Lowongan Tertentu (Sinkronisasi Mulus ke Simulasi Wawancara)
  const navigasiKeSimulasi = (posisi, perusahaan, idLowongan = null) => {
    try {
      localStorage.setItem(
        'mentervu_target_simulasi',
        JSON.stringify({
          posisiTarget: posisi,
          perusahaanTarget: perusahaan,
          lowonganId: idLowongan,
          diperbarui: Date.now(),
        })
      );
    } catch (e) {
      console.warn('Gagal menyimpan target simulasi ke localStorage:', e);
    }

    navigate('/simulasi', {
      state: {
        posisiTarget: posisi,
        perusahaanTarget: perusahaan,
        lowonganId: idLowongan,
      },
    });
  };

  // Submit Custom Posisi & Perusahaan
  const tanganiSubmitCustom = (e) => {
    e.preventDefault();
    if (!customPosisi.trim()) {
      setCustomError('Posisi impian wajib diisi.');
      return;
    }
    if (!customPerusahaan.trim()) {
      setCustomError('Nama perusahaan target wajib diisi.');
      return;
    }
    setCustomError('');
    setBukaModalCustom(false);
    navigasiKeSimulasi(customPosisi.trim(), customPerusahaan.trim());
  };

  // Statistik Ringkas
  const skorTertinggi = daftarLowongan.length > 0 ? Math.max(...daftarLowongan.map((l) => l.skorKecocokan)) : 0;
  const targetUser = cvData?.personal?.targetPosition || profil?.posisi_target || 'Software Engineer';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 1. Header Banner: Rekomendasi AI Smart Matching */}
      <div className="relative overflow-hidden rounded-2xl border border-oranye-200 bg-gradient-to-br from-oranye-50 via-white to-amber-50/60 p-6 shadow-sm sm:p-8">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-oranye-200 bg-oranye-100/80 px-3 py-1 text-xs font-bold text-oranye-800">
              <Sparkles className="h-3.5 w-3.5 text-oranye-600 animate-pulse" />
              <span>Pencarian Lowongan Nyata · JSearch API & Platform Resmi</span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-black tracking-tight text-batu-900 sm:text-3xl">
              Pencocokan Lowongan Kerja Aktif
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-batu-600 sm:text-base">
              Menghubungkan Anda dengan lowongan pekerjaan nyata dari platform terkemuka (LinkedIn, Jobstreet, Glints, Indeed) dan menganalisis skor keselarasan keahlian secara instan dari profil CV Anda.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-batu-700">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-medium shadow-xs border border-batu-200">
                <Briefcase className="h-4 w-4 text-oranye-600" />
                Target Posisi CV: <strong className="text-batu-900">{targetUser}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-medium shadow-xs border border-batu-200">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Kecocokan Tertinggi: <strong className="text-emerald-700">{skorTertinggi}% Match</strong>
              </span>
            </div>
          </div>

          {/* Aksi Tambah Perusahaan Impian Custom */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={() => {
                setCustomPosisi(targetUser);
                setBukaModalCustom(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-oranye-300 bg-white px-4 py-3 text-sm font-bold text-oranye-700 shadow-xs transition-all hover:bg-oranye-50 hover:border-oranye-400 active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-oranye-600" />
              <span>Input Perusahaan Impian Mandiri</span>
            </button>
            <p className="text-[11px] text-batu-500 text-center lg:text-right">
              Bisa langsung latihan simulasi untuk perusahaan manapun di luar daftar.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Toolbar Pencarian & Filter */}
      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-batu-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Kolom Pencarian */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-batu-400" />
          <input
            type="text"
            value={kataKunciInput}
            onChange={(e) => setKataKunciInput(e.target.value)}
            placeholder="Cari judul posisi, perusahaan, atau teknologi (misal: React, Python, Frontend)..."
            className="w-full rounded-lg border border-batu-200 bg-batu-50/50 py-2.5 pl-10 pr-4 text-sm text-batu-900 placeholder:text-batu-400 focus:border-oranye-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-oranye-500/20"
          />
          {kataKunciInput && (
            <button
              onClick={() => setKataKunciInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-batu-400 hover:text-batu-700"
            >
              Reset
            </button>
          )}
        </div>

        {/* Filter Sistem Kerja */}
        <div className="flex flex-wrap items-center gap-2">
          {['Semua', 'Remote', 'Hybrid', 'On-site'].map((sistem) => (
            <button
              key={sistem}
              onClick={() => setSistemKerja(sistem)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                sistemKerja === sistem
                  ? 'bg-oranye-600 text-white shadow-xs'
                  : 'bg-batu-100 text-batu-600 hover:bg-batu-200'
              }`}
            >
              {sistem}
            </button>
          ))}
        </div>

        {/* Urutan */}
        <div className="flex items-center gap-2 text-xs text-batu-600">
          <span className="font-semibold text-batu-500">Urut:</span>
          <select
            value={urutan}
            onChange={(e) => setUrutan(e.target.value)}
            className="rounded-lg border border-batu-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-batu-800 focus:border-oranye-500 focus:outline-none"
          >
            <option value="skor">Kecocokan AI (Tertinggi)</option>
            <option value="gaji">Estimasi Gaji (Tertinggi)</option>
          </select>
        </div>
      </div>

      {/* 3. Daftar Kartu Lowongan */}
      <div className="mt-6">
        {isLoadingLowongan ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-oranye-500 border-t-transparent"></div>
            <p className="mt-4 text-sm font-bold text-batu-800">
              Menarik lowongan kerja langsung dari live aggregator & menganalisis kecocokan AI...
            </p>
            <p className="mt-1 text-xs text-batu-500 max-w-md">
              Menghubungkan data bursa kerja resmi dan menghitung keselarasan keahlian serta riwayat CV Anda.
            </p>
          </div>
        ) : daftarLowongan.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-batu-300 bg-white py-14 px-4 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-batu-300" />
            <h3 className="mt-3 text-base font-bold text-batu-800">
              Tidak ada lowongan yang sesuai dengan kriteria
            </h3>
            <p className="mt-1 text-sm text-batu-500 max-w-md mx-auto">
              Data ditarik secara langsung dari bursa kerja resmi. Coba gunakan kata kunci pencarian yang lebih umum atau masukkan perusahaan impian Anda secara mandiri.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              {kataKunciInput && (
                <button
                  onClick={() => setKataKunciInput('')}
                  className="rounded-xl border border-batu-300 bg-white px-4 py-2.5 text-xs font-bold text-batu-700 hover:bg-batu-50"
                >
                  Hapus Kata Kunci
                </button>
              )}
              <button
                onClick={() => setBukaModalCustom(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-oranye-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-oranye-700"
              >
                <PlusCircle className="h-4 w-4" />
                Input Perusahaan Impian Sendiri
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {daftarLowongan.map((item, index) => {
              const persentase = item.skorKecocokan;
              const isHighMatch = persentase >= 85;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.3) }}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  className="group flex flex-col justify-between rounded-2xl border border-batu-200 bg-white p-5 shadow-xs transition-colors hover:border-oranye-300 hover:shadow-md"
                >
                  <div>
                    {/* Header Kartu: Logo Perusahaan + Skor AI Match */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-base font-black text-white shadow-xs ${
                            item.warna_aksen || 'bg-oranye-600'
                          }`}
                        >
                          {item.logo_singkatan || 'ID'}
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-batu-900 group-hover:text-oranye-600 transition-colors line-clamp-1">
                            {item.judul}
                          </h2>
                          <div className="flex items-center gap-1.5 text-xs text-batu-500 font-medium">
                            <Building2 className="h-3.5 w-3.5 text-batu-400" />
                            <span>{item.perusahaan}</span>
                          </div>
                        </div>
                      </div>

                      {/* Badge Skor AI */}
                      <div
                        className={`shrink-0 rounded-xl px-2.5 py-1 text-right font-display text-xs font-black shadow-xs ${
                          isHighMatch
                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200'
                            : 'bg-oranye-50 text-oranye-700 border border-oranye-200'
                        }`}
                        title="Tingkat kecocokan berdasarkan analisis riwayat dan keahlian di CV Anda"
                      >
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-oranye-500" />
                          <span>{persentase}% Match</span>
                        </div>
                        <span className="text-[9px] font-medium opacity-80 block">AI Match</span>
                      </div>
                    </div>

                    {/* Metadata Lokasi, Sistem Kerja, Gaji, & Platform Sumber */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-batu-600">
                      {item.platform_sumber && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 font-bold text-blue-700 px-2 py-0.5 border border-blue-200/80">
                          <ExternalLink className="h-3 w-3" />
                          {item.platform_sumber}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-md bg-batu-100 px-2 py-0.5 font-medium">
                        <MapPin className="h-3 w-3 text-batu-400" />
                        {item.lokasi}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-batu-100 px-2 py-0.5 font-medium">
                        <Briefcase className="h-3 w-3 text-batu-400" />
                        {item.tingkat_pengalaman}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 font-semibold text-emerald-800 px-2 py-0.5 border border-emerald-100">
                        <DollarSign className="h-3 w-3 text-emerald-600" />
                        {formatGajiRingkas(item.gaji_min, item.gaji_maks)}
                      </span>
                    </div>

                    {/* Alasan Kecocokan AI */}
                    {item.alasanAi && (
                      <div className="mt-3.5 rounded-xl border border-oranye-100 bg-oranye-50/60 p-3 text-xs leading-relaxed text-batu-700">
                        <div className="flex items-start gap-2">
                          <Zap className="h-4 w-4 shrink-0 text-oranye-600 mt-0.5" />
                          <div>
                            <span className="font-bold text-oranye-900">Analisis Kecocokan: </span>
                            {item.alasanAi}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Skills Cocok vs Gap */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {item.skillsCocok?.slice(0, 3).map((sk) => (
                        <span
                          key={sk}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {sk}
                        </span>
                      ))}
                      {item.skillsGap?.slice(0, 2).map((sk) => (
                        <span
                          key={sk}
                          className="inline-flex items-center gap-1 rounded-md bg-batu-100 px-2 py-0.5 text-[11px] font-medium text-batu-600"
                          title="Keahlian yang disarankan untuk diperdalam"
                        >
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tombol Aksi Bawah */}
                  <div className="mt-5 pt-4 border-t border-batu-100 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailDipilih(item)}
                        className="text-xs font-bold text-batu-600 hover:text-batu-900 transition-colors"
                      >
                        Detail
                      </button>
                      {item.url_lamaran && (
                        <a
                          href={item.url_lamaran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                          title={`Buka lowongan langsung di ${item.platform_sumber || 'platform resmi'}`}
                        >
                          <span>Lamar di Platform</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => navigasiKeSimulasi(item.judul, item.perusahaan, item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-oranye-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-oranye-700 active:scale-95"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Simulasi Wawancara</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* 4. Modal Detail Lowongan (Framer Motion AnimatePresence) */}
      <AnimatePresence>
        {detailDipilih && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-batu-900/60 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
            >
              {/* Tombol Tutup */}
              <button
                onClick={() => setDetailDipilih(null)}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-batu-400 hover:bg-batu-100 hover:text-batu-700"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header Detail */}
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black text-white shadow-xs ${
                    detailDipilih.warna_aksen || 'bg-oranye-600'
                  }`}
                >
                  {detailDipilih.logo_singkatan || 'ID'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-batu-900">{detailDipilih.judul}</h3>
                  <p className="text-sm font-semibold text-batu-600">{detailDipilih.perusahaan}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-batu-100 px-2 py-0.5 text-batu-700 font-medium">
                      {detailDipilih.lokasi} ({detailDipilih.sistem_kerja})
                    </span>
                    <span className="rounded bg-emerald-50 text-emerald-800 px-2 py-0.5 font-bold border border-emerald-200">
                      {formatGajiRingkas(detailDipilih.gaji_min, detailDipilih.gaji_maks)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skor Kecocokan AI Komprehensif */}
              <div className="mt-6 rounded-xl border border-oranye-200 bg-oranye-50/70 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-oranye-600" />
                    <span className="font-bold text-sm text-oranye-900">Skor Kecocokan Profil CV Anda</span>
                  </div>
                  <span className="font-display text-lg font-black text-oranye-700">
                    {detailDipilih.skorKecocokan}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-batu-700 leading-relaxed">
                  {detailDipilih.alasanAi}
                </p>

                {/* Rincian Bobot */}
                {detailDipilih.rincianBobot && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4 pt-3 border-t border-oranye-200">
                    <div>
                      <span className="text-batu-500">Skill Match:</span>
                      <p className="font-bold text-batu-800">{detailDipilih.rincianBobot.skill}/40 poin</p>
                    </div>
                    <div>
                      <span className="text-batu-500">Pengalaman:</span>
                      <p className="font-bold text-batu-800">{detailDipilih.rincianBobot.pengalaman}/30 poin</p>
                    </div>
                    <div>
                      <span className="text-batu-500">Kesesuaian Posisi:</span>
                      <p className="font-bold text-batu-800">{detailDipilih.rincianBobot.posisi}/20 poin</p>
                    </div>
                    <div>
                      <span className="text-batu-500">Sistem Kerja:</span>
                      <p className="font-bold text-batu-800">{detailDipilih.rincianBobot.lokasi}/10 poin</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Deskripsi Pekerjaan */}
              <div className="mt-6">
                <h4 className="text-sm font-bold text-batu-900">Deskripsi & Ruang Lingkup Peran</h4>
                <p className="mt-1.5 text-xs text-batu-600 leading-relaxed">
                  {detailDipilih.deskripsi}
                </p>
              </div>

              {/* Persyaratan Keahlian */}
              <div className="mt-5">
                <h4 className="text-sm font-bold text-batu-900">Keahlian & Teknologi Utama</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detailDipilih.persyaratan_skills?.map((s) => {
                    const cocok = detailDipilih.skillsCocok?.includes(s);
                    return (
                      <span
                        key={s}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          cocok
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-batu-100 text-batu-700'
                        }`}
                      >
                        {cocok && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        {s}
                        {cocok && <span className="text-[10px] text-emerald-600">(Ada di CV)</span>}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Kultur & Tips Wawancara Khusus Perusahaan */}
              <div className="mt-5 rounded-xl border border-batu-200 bg-batu-50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-batu-500">
                  Wawasan Khusus Wawancara di {detailDipilih.perusahaan}
                </h4>
                <p className="mt-1 text-xs text-batu-700">
                  <strong className="text-batu-900">Kultur & Standar:</strong> {detailDipilih.kultur_perusahaan}
                </p>
                <p className="mt-2 text-xs text-batu-700">
                  <strong className="text-batu-900">Fokus Pertanyaan:</strong> {detailDipilih.fokus_wawancara}
                </p>
              </div>

              {/* Tombol Aksi Modal */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-batu-200">
                {detailDipilih.url_lamaran && (
                  <a
                    href={detailDipilih.url_lamaran}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-batu-300 px-4 py-2.5 text-xs font-bold text-batu-700 hover:bg-batu-50"
                  >
                    <span>Website Karier</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={() => {
                    setDetailDipilih(null);
                    navigasiKeSimulasi(detailDipilih.judul, detailDipilih.perusahaan, detailDipilih.id);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-oranye-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-oranye-700"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Mulai Simulasi Wawancara untuk Posisi Ini</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Modal Custom Input Posisi & Perusahaan Impian Mandiri (Framer Motion) */}
      <AnimatePresence>
        {bukaModalCustom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-batu-900/60 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-7"
            >
              <button
                onClick={() => setBukaModalCustom(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-batu-400 hover:bg-batu-100 hover:text-batu-700"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oranye-100 text-oranye-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-batu-900">Perusahaan Impian Mandiri</h3>
                  <p className="text-xs text-batu-500">Sesuaikan simulasi dengan tempat yang ingin Anda lamar.</p>
                </div>
              </div>

              <form onSubmit={tanganiSubmitCustom} className="mt-5 space-y-4">
                {customError && (
                  <div className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700 border border-red-200">
                    {customError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-batu-700 mb-1">
                    Nama Perusahaan Target
                  </label>
                  <input
                    type="text"
                    value={customPerusahaan}
                    onChange={(e) => setCustomPerusahaan(e.target.value)}
                    placeholder="Misal: Google, Bank Central Asia, Tokopedia, Grab..."
                    className="w-full rounded-xl border border-batu-200 px-3.5 py-2.5 text-sm text-batu-900 focus:border-oranye-500 focus:outline-none focus:ring-2 focus:ring-oranye-500/20"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-batu-700 mb-1">
                    Posisi Pekerjaan Impian
                  </label>
                  <input
                    type="text"
                    value={customPosisi}
                    onChange={(e) => setCustomPosisi(e.target.value)}
                    placeholder="Misal: Senior Backend Engineer, UI/UX Designer..."
                    className="w-full rounded-xl border border-batu-200 px-3.5 py-2.5 text-sm text-batu-900 focus:border-oranye-500 focus:outline-none focus:ring-2 focus:ring-oranye-500/20"
                  />
                </div>

                <div className="rounded-xl bg-oranye-50/70 p-3 text-xs text-oranye-900 border border-oranye-200">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-oranye-600 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      AI MENTERVU akan menyesuaikan skenario studi kasus teknis dan gaya pertanyaan sesuai profil industri perusahaan tersebut.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setBukaModalCustom(false)}
                    className="rounded-xl border border-batu-300 px-4 py-2 text-xs font-bold text-batu-700 hover:bg-batu-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-oranye-600 px-4 py-2 text-xs font-bold text-white hover:bg-oranye-700"
                  >
                    <span>Mulai Simulasi Wawancara</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
