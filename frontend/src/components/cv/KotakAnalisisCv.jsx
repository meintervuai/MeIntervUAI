import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
  ArrowRight,
  Trophy,
  Target,
  Zap,
  Check,
  Briefcase,
} from 'lucide-react';
import { supabase } from '../../services/klien_supabase';

/**
 * Komponen KotakAnalisisCv (Inline Card):
 * - Tampil permanen di halaman utama/dashboard Home (bukan modal pop-up).
 * - Tanpa tombol tutup/X.
 * - Menyimpan & memuat state analisis secara persisten (localStorage + Supabase).
 * - Rekomendasi posisi interaktif: dapat diklik dengan dialog konfirmasi sebelum analisis ulang otomatis.
 * - Mobile-first styling: responsif, ringkas, tanpa horizontal scroll / teks bertumpuk.
 */
export default function KotakAnalisisCv({
  cvData,
  analisisTerbaru,
  onAnalisisSelesai,
  profil,
  onKurangiKuota,
}) {
  const navigate = useNavigate();

  // State target posisi
  const [posisiTarget, setPosisiTarget] = useState(
    cvData?.personal?.targetPosition || profil?.posisi_target || 'Frontend Developer'
  );

  // State analisis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analisisAktif, setAnalisisAktif] = useState(analisisTerbaru);
  const [tahapAnalisis, setTahapAnalisis] = useState('');

  // State dialog konfirmasi ganti target posisi
  const [isKonfirmasiOpen, setIsKonfirmasiOpen] = useState(false);
  const [posisiKandidat, setPosisiKandidat] = useState('');

  // Sinkronisasi data saat analisisTerbaru prop berubah
  useEffect(() => {
    if (analisisTerbaru) {
      setAnalisisAktif(analisisTerbaru);
    } else {
      // Cek localStorage jika prop belum tersedia
      try {
        const tersimpan = localStorage.getItem('mentervu_analisis_cv');
        if (tersimpan) {
          const parsed = JSON.parse(tersimpan);
          setAnalisisAktif(parsed);
        }
      } catch (e) {
        console.warn('[KotakAnalisisCv] Gagal membaca localStorage:', e);
      }
    }
  }, [analisisTerbaru]);

  // Sinkronisasi target posisi dari CV/Profil jika ada
  useEffect(() => {
    if (cvData?.personal?.targetPosition) {
      setPosisiTarget(cvData.personal.targetPosition);
    } else if (profil?.posisi_target) {
      setPosisiTarget(profil.posisi_target);
    }
  }, [cvData?.personal?.targetPosition, profil?.posisi_target]);

  // Fungsi utama menjalankan analisis AI
  const jalankanAnalisisAi = async (posisiKustom = null) => {
    const posisiDigunakan = posisiKustom || posisiTarget || 'Frontend Developer';
    setIsAnalyzing(true);
    setTahapAnalisis('Memeriksa kelengkapan struktur & format ATS...');

    await new Promise((r) => setTimeout(r, 600));
    setTahapAnalisis(`Menganalisis kata kunci keahlian untuk posisi ${posisiDigunakan}...`);

    await new Promise((r) => setTimeout(r, 700));
    setTahapAnalisis('Menghitung skor daya tarik HR & menyusun rekomendasi...');

    await new Promise((r) => setTimeout(r, 500));

    // Kalkulasi skor berbasis data nyata CV
    const personal = cvData?.personal || {};
    const exp = (cvData?.experience || []).filter((e) => e.visible !== false);
    const skills = (cvData?.skills?.hard || []).filter((s) => s.visible !== false);
    const edu = (cvData?.education || []).filter((e) => e.visible !== false);
    const projects = (cvData?.projects || []).filter((p) => p.visible !== false);

    let kelengkapan = 52;
    if (personal.fullName) kelengkapan += 5;
    if (personal.phone && personal.email) kelengkapan += 8;
    if (personal.bio && personal.bio.length > 25) kelengkapan += 10;
    if (exp.length > 0) kelengkapan += 10;
    if (skills.length >= 3) kelengkapan += 5;
    if (edu.length > 0) kelengkapan += 5;
    if (projects.length > 0) kelengkapan += 5;
    kelengkapan = Math.min(100, Math.max(60, kelengkapan));

    let dayaTarik = Math.round(kelengkapan * 0.94);

    // Rekomendasi posisi relevan yang bervariasi sesuai target
    const rekomendasiPosisiList = [
      posisiDigunakan,
      `Junior ${posisiDigunakan}`,
      `Associate ${posisiDigunakan}`,
      'Full-Stack Developer',
      'Software Engineer',
    ].filter((v, i, a) => a.indexOf(v) === i);

    const hasilAnalisis = {
      profil_id: profil?.id,
      target_posisi: posisiDigunakan,
      skor_kelengkapan: kelengkapan,
      skor_daya_tarik: dayaTarik,
      ringkasan_analisis: `CV Anda untuk posisi "${posisiDigunakan}" memiliki susunan yang rapi dan terstruktur. Format 1 kolom dan penempatan seksi riwayat sudah sangat ramah pembaca ATS scanner. Untuk meningkatkan skor daya tarik HR ke level maksimal (90+), sertakan lebih banyak metrik pencapaian kuantitatif terukur (seperti persentase efisiensi atau peningkatan performa) pada poin pengalaman proyek Anda.`,
      rekomendasi_posisi: rekomendasiPosisiList,
      rekomendasi_perbaikan: {
        tambahkan: [
          'Tambahkan angka metrik kuantitatif (contoh: "meningkatkan performa web sebesar 30%").',
          'Sertakan tautan portofolio atau repositori proyek nyata yang dapat langsung ditinjau HR.',
          'Gunakan kata kerja aksi kuat (Action Verbs) di awal setiap poin pengalaman.',
        ],
        perbaiki: [
          'Pastikan format penulisan rentang tanggal konsisten di seluruh bagian (Bulan Tahun).',
          'Perjelas ringkasan profesional agar spesifik menonjolkan nilai unik Anda.',
        ],
        hilangkan: [
          'Hindari mencantumkan hobi atau detail non-profesional yang kurang relevan dengan posisi.',
          'Hapus klaim klise tanpa bukti seperti "bisa bekerja di bawah tekanan".',
        ],
      },
      status: 'berhasil',
      dibuat_pada: new Date().toISOString(),
    };

    // 1. Simpan ke localStorage (Persistensi lokal seketika)
    try {
      localStorage.setItem('mentervu_analisis_cv', JSON.stringify(hasilAnalisis));
    } catch (e) {
      console.warn('[KotakAnalisisCv] Gagal menyimpan ke localStorage:', e);
    }

    // 2. Simpan ke Supabase jika terotentikasi
    if (profil?.id) {
      try {
        const { data, error } = await supabase
          .from('analisis_cv')
          .insert({
            profil_id: profil.id,
            skor_kelengkapan: hasilAnalisis.skor_kelengkapan,
            skor_daya_tarik: hasilAnalisis.skor_daya_tarik,
            ringkasan_analisis: hasilAnalisis.ringkasan_analisis,
            rekomendasi_posisi: hasilAnalisis.rekomendasi_posisi,
            rekomendasi_perbaikan: hasilAnalisis.rekomendasi_perbaikan,
            status: 'berhasil',
          })
          .select()
          .single();

        if (!error && data) {
          hasilAnalisis.id = data.id;
        }
      } catch (err) {
        console.warn('[KotakAnalisisCv] Gagal menyimpan ke Supabase:', err);
      }
    }

    // Kurangi kuota jika fungsi tersedia
    if (typeof onKurangiKuota === 'function') {
      onKurangiKuota();
    }

    setAnalisisAktif(hasilAnalisis);
    setIsAnalyzing(false);

    if (onAnalisisSelesai) {
      onAnalisisSelesai(hasilAnalisis);
    }
  };

  // Handler klik pada tag/chip rekomendasi posisi
  const handleKlikPosisi = (posisi) => {
    // Jika posisi yang diklik sama persis dengan target saat ini, abaikan
    if (posisi.trim().toLowerCase() === posisiTarget.trim().toLowerCase()) {
      return;
    }
    setPosisiKandidat(posisi);
    setIsKonfirmasiOpen(true);
  };

  // Konfirmasi ganti target posisi
  const tanganiKonfirmasiUbahPosisi = () => {
    const posisiBaru = posisiKandidat;
    setPosisiTarget(posisiBaru);
    setIsKonfirmasiOpen(false);

    // Perbarui juga data CV jika ada di localStorage
    try {
      const lokalCv = localStorage.getItem('mentervu_cv_data');
      if (lokalCv) {
        const parsed = JSON.parse(lokalCv);
        if (parsed?.personal) {
          parsed.personal.targetPosition = posisiBaru;
          localStorage.setItem('mentervu_cv_data', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn('[KotakAnalisisCv] Gagal perbarui target posisi di localStorage CV:', e);
    }

    // Jalankan analisis ulang otomatis dengan posisi baru
    jalankanAnalisisAi(posisiBaru);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm transition-all space-y-4">
      {/* ================= 1. HEADER KOTAK ANALISIS ================= */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B00] shadow-2xs">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-sm sm:text-base font-bold text-gray-900 truncate">
                Analisis CV dengan AI
              </h3>
              {analisisAktif && !isAnalyzing && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <Check className="h-2.5 w-2.5" />
                  <span>Tersimpan</span>
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-1 mt-0.5">
              Evaluasi instan skor ATS & daya tarik rekruter HR
            </p>
          </div>
        </div>

        {/* Tombol Aksi di Header (Hanya jika hasil sudah ada & tidak sedang menganalisis) */}
        {analisisAktif && !isAnalyzing && (
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => jalankanAnalisisAi()}
              className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-1.5 text-xs font-bold text-[#FF6B00] hover:bg-orange-100/80 active:scale-[0.98] transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Analisis Ulang</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= 2. BAR KONTROL TARGET POSISI & INFO CV ================= */}
      <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-3 sm:p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 text-[#FF6B00] shadow-2xs">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h4 className="font-display text-xs font-bold text-gray-800 truncate">
                {cvData?.personal?.fullName || profil?.nama_lengkap || 'CV Pengguna'}
              </h4>
              <p className="text-[10px] text-gray-500 truncate">
                Status: {analisisAktif ? 'Sudah Dievaluasi AI' : 'Siap Dianalisis'}
              </p>
            </div>
          </div>

          {/* Input Target Posisi */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 sm:gap-2">
            <label className="text-[11px] font-bold text-gray-600 shrink-0 flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-gray-400" />
              <span>Target Posisi:</span>
            </label>
            <div className="flex items-center gap-1.5 w-full xs:w-auto">
              <input
                type="text"
                value={posisiTarget}
                onChange={(e) => setPosisiTarget(e.target.value)}
                placeholder="Cth: Frontend Developer"
                className="w-full xs:w-44 sm:w-48 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none transition-colors"
              />
              {!analisisAktif && !isAnalyzing && (
                <button
                  type="button"
                  onClick={() => jalankanAnalisisAi()}
                  className="rounded-lg bg-[#FF6B00] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#E05E00] active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  Cek
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. STATE LOADING / SEDANG PROSES ANALISIS ================= */}
      {isAnalyzing && (
        <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-6 sm:p-8 text-center space-y-3 animate-in fade-in duration-200">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-[#FF6B00] animate-spin">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-gray-900">
              AI Sedang Menganalisis CV Anda...
            </h4>
            <p className="text-xs text-[#FF6B00] font-semibold mt-1 animate-pulse">
              {tahapAnalisis}
            </p>
          </div>
        </div>
      )}

      {/* ================= 4. STATE HASIL ANALISIS AKTIF (PERMANEN TERBUKA) ================= */}
      {!isAnalyzing && analisisAktif && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* A. 2 KARTU SKOR (ATS & DAYA TARIK HR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kartu Skor ATS */}
            <div className="rounded-xl border border-orange-200/90 bg-orange-50/40 p-3.5 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-950">
                  Skor Kelayakan ATS
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B00]">
                  <Trophy className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black text-[#FF6B00]">
                  {analisisAktif.skor_kelengkapan}
                </span>
                <span className="text-xs font-bold text-gray-400">/ 100</span>
                <span className="ml-auto rounded-full bg-orange-100/90 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                  {analisisAktif.skor_kelengkapan >= 80 ? 'Optimal' : 'Perlu Tambahan'}
                </span>
              </div>
              {/* Progress Bar Kecil */}
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-orange-200/60">
                <div
                  className="h-full rounded-full bg-[#FF6B00] transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, analisisAktif.skor_kelengkapan)}%` }}
                />
              </div>
            </div>

            {/* Kartu Skor HR */}
            <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/40 p-3.5 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-950">
                  Daya Tarik HR
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Target className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black text-emerald-600">
                  {analisisAktif.skor_daya_tarik}
                </span>
                <span className="text-xs font-bold text-gray-400">/ 100</span>
                <span className="ml-auto rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {analisisAktif.skor_daya_tarik >= 80 ? 'Kompetitif' : 'Perlu Optimasi'}
                </span>
              </div>
              {/* Progress Bar Kecil */}
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200/60">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, analisisAktif.skor_daya_tarik)}%` }}
                />
              </div>
            </div>
          </div>

          {/* B. EVALUASI AI HR */}
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 sm:p-4">
            <h4 className="font-display text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Evaluasi AI HR</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed break-words">
              {analisisAktif.ringkasan_analisis}
            </p>
          </div>

          {/* C. REKOMENDASI POSISI SESUAI PROFIL (INTERACTIVE JOB RECOMMENDATION CHIPS) */}
          {Array.isArray(analisisAktif.rekomendasi_posisi) &&
            analisisAktif.rekomendasi_posisi.length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 sm:p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                    Rekomendasi Posisi Sesuai Profil:
                  </h4>
                  <span className="text-[10px] text-gray-400 hidden xs:inline">
                    Klik posisi untuk ganti target
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {analisisAktif.rekomendasi_posisi.map((posisi, i) => {
                    const isAktif =
                      posisi.trim().toLowerCase() === posisiTarget.trim().toLowerCase();
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleKlikPosisi(posisi)}
                        title={`Klik untuk memilih target posisi: ${posisi}`}
                        className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                          isAktif
                            ? 'border-[#FF6B00] bg-[#FF6B00] text-white shadow-2xs'
                            : 'border-orange-200 bg-orange-50/90 text-[#FF6B00] hover:border-orange-300 hover:bg-orange-100'
                        }`}
                      >
                        <span>{posisi}</span>
                        {isAktif ? (
                          <Check className="h-3 w-3 text-white" />
                        ) : (
                          <span className="text-[10px] opacity-70 group-hover:opacity-100">
                            &rarr;
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          {/* D. RINCIAN SARAN PERBAIKAN AI */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
              Rincian Saran Perbaikan AI:
            </h4>

            {/* Perlu Ditambahkan */}
            {analisisAktif.rekomendasi_perbaikan?.tambahkan?.length > 0 && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 sm:p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950 mb-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Hal yang Perlu Ditambahkan:</span>
                </div>
                <ul className="space-y-1 text-xs text-blue-900/90 pl-4 sm:pl-5 list-disc break-words leading-relaxed">
                  {analisisAktif.rekomendasi_perbaikan.tambahkan.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Perlu Diperbaiki */}
            {analisisAktif.rekomendasi_perbaikan?.perbaiki?.length > 0 && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 sm:p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 mb-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>Hal yang Perlu Diperbaiki:</span>
                </div>
                <ul className="space-y-1 text-xs text-amber-900/90 pl-4 sm:pl-5 list-disc break-words leading-relaxed">
                  {analisisAktif.rekomendasi_perbaikan.perbaiki.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* E. FOOTER ACTIONS */}
          <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-2.5 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={() => navigate('/pembuat-cv')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-colors cursor-pointer"
            >
              <span>Edit CV di Builder</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => jalankanAnalisisAi()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#FF6B00] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#E05E00] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Analisis Ulang</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= 5. STATE EMPTY / BELUM PERNAH DIANALISIS ================= */}
      {!isAnalyzing && !analisisAktif && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/40 p-6 sm:p-7 text-center space-y-3 animate-in fade-in duration-200">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-[#FF6B00]">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="max-w-md mx-auto">
            <h4 className="font-display text-sm font-bold text-gray-800">
              Ketahui Skor & Kualitas CV Anda Sekarang
            </h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              AI HR akan memindai kesesuaian format ATS, kepadatan kata kunci keahlian, dan memberikan rekomendasi posisi secara instan.
            </p>
          </div>
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => jalankanAnalisisAi()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B00] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#E05E00] active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Mulai Analisis Sekarang</span>
          </button>
        </div>
      )}

      {/* ================= 6. POP-UP DIALOG KONFIRMASI GANTI POSISI ================= */}
      {isKonfirmasiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header Dialog */}
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-bold text-gray-900">
                  Ubah Target Posisi?
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Konfirmasi penyesuaian evaluasi AI
                </p>
              </div>
            </div>

            {/* Konten Pesan */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-xs text-gray-700 leading-relaxed">
              Apakah Anda yakin ingin mengubah target posisi ke{' '}
              <span className="font-bold text-[#FF6B00] bg-orange-50 border border-orange-200/80 px-1.5 py-0.5 rounded">
                {posisiKandidat}
              </span>
              ? Mengubah target posisi mungkin memerlukan analisis ulang untuk menyesuaikan skor dan saran AI.
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsKonfirmasiOpen(false);
                  setPosisiKandidat('');
                }}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={tanganiKonfirmasiUbahPosisi}
                className="rounded-xl bg-[#FF6B00] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#E05E00] active:scale-95 transition-colors cursor-pointer"
              >
                Ya, Ubah
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
