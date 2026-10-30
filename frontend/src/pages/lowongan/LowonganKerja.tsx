// LowonganKerja.tsx - Halaman Agregator Rekomendasi Lowongan Kerja (JobStreet, Glints, LinkedIn)
// Modular SaaS Design: Palette #FAF8F5, Border #E5E7EB, Aksen Oranye #EA580C
// Multi-Device Responsive (320px - 1920px+), Skeleton Loading (FE-07 / UX-17), NotifikasiToast (FE-02 / UX-16), Anti-Slop (No pulsing dots, no em-dash).

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  FileText, 
  Building2,
  CheckCircle2,
  TrendingUp,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Kartu } from '../../components/ui/Kartu';
import { NotifikasiToast } from '../../components/ui/NotifikasiToast';
import { api } from '../../services/api';
import { useBahasa } from '../../i18n';

export interface LowonganItem {
  id: string;
  judul: string;
  perusahaan: string;
  lokasi: string;
  tipe_kerja: 'Remote' | 'Hybrid' | 'Onsite';
  sumber: 'JobStreet' | 'Glints' | 'LinkedIn';
  logo_perusahaan?: string;
  gaji_tampil?: string;
  url_asli: string;
  kategori: string;
  kata_kunci: string[];
  deskripsi_singkat: string;
  pengalaman_min_tahun: number;
  pendidikan_min: string;
  tanggal_tayang: string;
  skor_kecocokan?: number;
  alasan_rekomendasi?: string;
}

export const LowonganKerja: React.FC<{ pengguna: any }> = ({ pengguna }) => {
  const { t } = useBahasa();
  const PENGGUNA_ID = pengguna?.pengguna_id || 'guest';
  const CACHE_KEY = `intervu_lowongan_cache_${PENGGUNA_ID}`;
  const BOOKMARK_KEY = `intervu_lowongan_bookmarks_${PENGGUNA_ID}`;

  // State Utama
  const [tabFilter, setTabFilter] = useState<'semua' | 'cv' | 'simulasi' | 'bookmark'>('semua');
  const [daftarLowongan, setDaftarLowongan] = useState<LowonganItem[]>(() => {
    try {
      const c = localStorage.getItem(CACHE_KEY);
      if (c) return JSON.parse(c);
    } catch {}
    return [];
  });
  const [rekomendasiCv, setRekomendasiCv] = useState<LowonganItem[]>([]);
  const [rekomendasiSimulasi, setRekomendasiSimulasi] = useState<LowonganItem[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>(() => {
    try {
      const b = localStorage.getItem(BOOKMARK_KEY);
      if (b) return JSON.parse(b);
    } catch {}
    return [];
  });

  const [kataKunci, setKataKunci] = useState('');
  const [filterSumber, setFilterSumber] = useState('semua');
  const [filterTipeKerja, setFilterTipeKerja] = useState('semua');
  const [halamanAktif, setHalamanAktif] = useState(1);
  const ITEM_PER_HALAMAN = 8;
  const [sedangMemuat, setSedangMemuat] = useState(() => daftarLowongan.length === 0);
  const [notif, setNotif] = useState<{ teks: string; tipe: 'sukses' | 'gagal' | 'info' } | null>(null);

  // 1. Fetch Lowongan Utama & Rekomendasi (Stale-While-Revalidate: FE-07 / UX-17)
  const muatDataLowongan = async (kataKunciPencarian?: string, portal?: string, tipeKerja?: string) => {
    setSedangMemuat(true);
    try {
      // Ambil katalog live
      const resKatalog = await api.cariLowongan({ 
        kata_kunci: kataKunciPencarian !== undefined ? kataKunciPencarian : kataKunci,
        sumber: portal !== undefined ? portal : filterSumber,
        tipe_kerja: tipeKerja !== undefined ? tipeKerja : filterTipeKerja
      });
      if (resKatalog.status === 'sukses' && Array.isArray(resKatalog.data)) {
        setDaftarLowongan(resKatalog.data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(resKatalog.data));
      }

      // Ambil rekomendasi personal jika user login
      if (PENGGUNA_ID !== 'guest') {
        const resRekom = await api.ambilRekomendasiLowongan(PENGGUNA_ID);
        if (resRekom.status === 'sukses') {
          if (Array.isArray(resRekom.rekomendasi_cv)) setRekomendasiCv(resRekom.rekomendasi_cv);
          if (Array.isArray(resRekom.rekomendasi_simulasi)) setRekomendasiSimulasi(resRekom.rekomendasi_simulasi);
        }

        const resBm = await api.ambilBookmarkLowongan(PENGGUNA_ID);
        if (resBm.status === 'sukses' && Array.isArray(resBm.bookmark_ids)) {
          setBookmarkIds(resBm.bookmark_ids);
          localStorage.setItem(BOOKMARK_KEY, JSON.stringify(resBm.bookmark_ids));
        }
      }
    } catch (err: any) {
      console.warn('Gagal sinkronisasi lowongan dari API:', err);
    } finally {
      setSedangMemuat(false);
    }
  };

  useEffect(() => {
    // Purge cache lama jika kosong atau rusak
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!Array.isArray(parsed) || parsed.length === 0 || cached.includes('loker_001')) {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch {}
    muatDataLowongan();
  }, [PENGGUNA_ID]);

  // Debounced search live ke backend
  useEffect(() => {
    const timer = setTimeout(() => {
      muatDataLowongan(kataKunci.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [kataKunci]);

  // Toggle Bookmark
  const tanganiToggleBookmark = async (loker: LowonganItem) => {
    const id = loker.id;
    const isBookmarked = bookmarkIds.includes(id);
    const updatedIds = isBookmarked
      ? bookmarkIds.filter((b) => b !== id)
      : [id, ...bookmarkIds];

    setBookmarkIds(updatedIds);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(updatedIds));

    setNotif({
      teks: isBookmarked ? 'Lowongan dihapus dari daftar simpanan.' : 'Lowongan berhasil disimpan ke bookmark.',
      tipe: 'sukses',
    });

    if (PENGGUNA_ID !== 'guest') {
      try {
        await api.toggleBookmarkLowongan(PENGGUNA_ID, id, loker);
      } catch (err) {
        console.warn('Sinkronisasi bookmark gagal:', err);
      }
    }
  };

  // Komputasi Daftar Lowongan Terfilter
  const daftarTampil = useMemo(() => {
    let list: LowonganItem[] = [];

    if (tabFilter === 'cv') {
      list = rekomendasiCv.length > 0 ? rekomendasiCv : daftarLowongan;
    } else if (tabFilter === 'simulasi') {
      list = rekomendasiSimulasi.length > 0 ? rekomendasiSimulasi : daftarLowongan;
    } else if (tabFilter === 'bookmark') {
      list = daftarLowongan.filter((item) => bookmarkIds.includes(item.id));
    } else {
      list = daftarLowongan;
    }

    // Filter Kata Kunci
    if (kataKunci.trim()) {
      const kw = kataKunci.toLowerCase();
      list = list.filter(
        (item) =>
          item.judul.toLowerCase().includes(kw) ||
          item.perusahaan.toLowerCase().includes(kw) ||
          item.kategori.toLowerCase().includes(kw) ||
          item.kata_kunci.some((k) => k.toLowerCase().includes(kw))
      );
    }

    // Filter Sumber
    if (filterSumber !== 'semua') {
      list = list.filter((item) => item.sumber.toLowerCase() === filterSumber.toLowerCase());
    }

    // Filter Tipe Kerja
    if (filterTipeKerja !== 'semua') {
      list = list.filter((item) => item.tipe_kerja.toLowerCase() === filterTipeKerja.toLowerCase());
    }

    return list;
  }, [tabFilter, daftarLowongan, rekomendasiCv, rekomendasiSimulasi, bookmarkIds, kataKunci, filterSumber, filterTipeKerja]);

  // Reset ke halaman 1 setiap kali filter atau kata kunci berubah
  useEffect(() => {
    setHalamanAktif(1);
  }, [tabFilter, kataKunci, filterSumber, filterTipeKerja]);

  // Perhitungan Pagination
  const totalHalaman = Math.max(1, Math.ceil(daftarTampil.length / ITEM_PER_HALAMAN));
  const indeksAwal = (halamanAktif - 1) * ITEM_PER_HALAMAN;
  const daftarTampilHalaman = useMemo(() => {
    return daftarTampil.slice(indeksAwal, indeksAwal + ITEM_PER_HALAMAN);
  }, [daftarTampil, indeksAwal]);

  // Badge Warna Portal Sumber (LinkedIn, Indeed, Kalibrr)
  const dapatkanBadgeSumber = (sumber: string) => {
    switch (sumber) {
      case 'LinkedIn':
        return 'bg-sky-50 text-sky-800 border-sky-200/90';
      case 'Indeed':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200/90';
      case 'Kalibrr':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/90';
      default:
        return 'bg-stone-50 text-stone-800 border-stone-200/90';
    }
  };

  return (
    <div className="mx-auto font-sans safe-padding-x max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24">
      {/* Notifikasi Toast Mengambang Standar (FE-02 / UX-16) */}
      {notif && (
        <NotifikasiToast
          pesan={notif.teks}
          tipe={notif.tipe}
          onTutup={() => setNotif(null)}
        />
      )}

      {/* Header Halaman */}
      <div className="space-y-1.5 pb-2 border-b border-stone-200/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-200/70 shadow-2xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {t.lowongan.judulHalaman}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 max-w-3xl leading-relaxed">
          {t.lowongan.subjudulHalaman}
        </p>
      </div>

      {/* Notice Agregator Transparan */}
      <div className="p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200/70 text-stone-600 text-xs flex items-start gap-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t.lowongan.infoAgregator}
        </p>
      </div>

      {/* Baris Kontrol: Tab Filter Pill & Search Bar */}
      <div className="space-y-4">
        {/* Tab Filter Utama (Horizontal Scroll pada Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          <button
            type="button"
            onClick={() => setTabFilter('semua')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[42px] cursor-pointer shrink-0 snap-start flex items-center gap-1.5 border ${
              tabFilter === 'semua'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border-stone-200/80'
            }`}
          >
            <span>{t.lowongan.filterSemua}</span>
            <span className="px-1.5 py-0.2 rounded-md bg-stone-200/40 text-[10px]">
              {daftarLowongan.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabFilter('cv')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[42px] cursor-pointer shrink-0 snap-start flex items-center gap-1.5 border ${
              tabFilter === 'cv'
                ? 'bg-orange-700 text-white border-orange-700 shadow-xs'
                : 'bg-white text-stone-600 hover:text-orange-700 border-stone-200/80'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.lowongan.filterCv}</span>
            {rekomendasiCv.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-900 text-[10px] font-bold">
                {rekomendasiCv.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTabFilter('simulasi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[42px] cursor-pointer shrink-0 snap-start flex items-center gap-1.5 border ${
              tabFilter === 'simulasi'
                ? 'bg-orange-700 text-white border-orange-700 shadow-xs'
                : 'bg-white text-stone-600 hover:text-orange-700 border-stone-200/80'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.lowongan.filterSimulasi}</span>
            {rekomendasiSimulasi.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-900 text-[10px] font-bold">
                {rekomendasiSimulasi.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTabFilter('bookmark')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[42px] cursor-pointer shrink-0 snap-start flex items-center gap-1.5 border ${
              tabFilter === 'bookmark'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border-stone-200/80'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{t.lowongan.filterBookmark}</span>
            <span className="px-1.5 py-0.2 rounded-md bg-stone-200/40 text-[10px]">
              {bookmarkIds.length}
            </span>
          </button>
        </div>

        {/* Input Pencarian & Dropdown Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder={t.lowongan.pencarianPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 min-h-[44px] transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterSumber}
              onChange={(e) => setFilterSumber(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-600 min-h-[44px] cursor-pointer"
            >
              <option value="semua">{t.lowongan.filterSumber}</option>
              <option value="linkedin">LinkedIn (Live)</option>
              <option value="indeed">Indeed (Live)</option>
              <option value="kalibrr">Kalibrr (Live)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterTipeKerja}
              onChange={(e) => setFilterTipeKerja(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-600 min-h-[44px] cursor-pointer"
            >
              <option value="semua">{t.lowongan.filterTipeKerja}</option>
              <option value="remote">{t.lowongan.tipeRemote}</option>
              <option value="hybrid">{t.lowongan.tipeHybrid}</option>
              <option value="onsite">{t.lowongan.tipeOnsite}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banner Konteks Khusus (Jika tab rekomendasi CV atau Simulasi aktif) */}
      {tabFilter === 'cv' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/90 text-stone-800 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-orange-900 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-orange-600" />
            <span>{t.lowongan.bannerCvJudul}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {t.lowongan.bannerCvDesc}
          </p>
        </div>
      )}

      {tabFilter === 'simulasi' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 text-stone-800 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span>{t.lowongan.bannerSimulasiJudul}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {t.lowongan.bannerSimulasiDesc}
          </p>
        </div>
      )}

      {/* DAFTAR KARTU LOWONGAN ATAU SKELETON */}
      {sedangMemuat ? (
        /* Skeleton Shimmer Loading Bento Grid (FE-07 / UX-17) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 flex flex-col justify-between h-[230px]">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-stone-200 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-3.5 bg-stone-200 rounded w-3/4" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-stone-50 rounded-lg w-full" />
              </div>
              <div className="h-9 bg-stone-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : daftarTampil.length === 0 ? (
        /* Empty State */
        <Kartu className="p-10 sm:p-14 text-center bg-white border border-stone-200/90 rounded-3xl space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center mx-auto shadow-xs">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              {t.lowongan.lokerKosongJudul}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              {t.lowongan.lokerKosongDesc}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setKataKunci('');
                setFilterSumber('semua');
                setFilterTipeKerja('semua');
                setTabFilter('semua');
              }}
              className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all min-h-[44px] cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        </Kartu>
      ) : (
        /* Bento Grid Card Lowongan Kerja (Kompak, Dense & Memuat Banyak seperti E-Commerce / Shopee) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 animate-fadeIn">
            {daftarTampilHalaman.map((loker) => {
              const isBookmarked = bookmarkIds.includes(loker.id);
              return (
                <div
                  key={loker.id}
                  className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-400/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full group"
                >
                  {/* Bagian Atas: Badges, Logo, Judul & Perusahaan */}
                  <div className="space-y-2.5">
                    {/* Top Bar Card: Badge Sumber, Tipe Kerja & Tombol Bookmark */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${dapatkanBadgeSumber(loker.sumber)}`}>
                          {loker.sumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                          {loker.tipe_kerja}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => tanganiToggleBookmark(loker)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 ${
                          isBookmarked
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200/80 text-stone-400 hover:text-stone-700'
                        }`}
                        title={isBookmarked ? 'Hapus bookmark' : 'Simpan lowongan'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5 fill-amber-600 text-amber-700" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Header Job: Logo + Judul */}
                    <div className="flex items-start gap-2.5 pt-0.5">
                      {loker.logo_perusahaan ? (
                        <img
                          src={loker.logo_perusahaan}
                          alt={loker.perusahaan}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-50"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback jika CDN gambar memblokir hotlink
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-building-icon')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center shrink-0 fallback-building-icon';
                              fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;
                              parent.insertBefore(fallback, target);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight leading-snug line-clamp-2 group-hover:text-orange-700 transition-colors" title={loker.judul}>
                          {loker.judul}
                        </h3>
                        <p className="text-[11px] font-semibold text-stone-600 truncate mt-0.5" title={loker.perusahaan}>
                          {loker.perusahaan}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Lokasi & Gaji Bento */}
                    <div className="space-y-1 pt-1 border-t border-stone-100 text-[11px]">
                      <div className="flex items-center gap-1 text-stone-500 truncate" title={loker.lokasi}>
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{loker.lokasi}</span>
                      </div>

                      {loker.gaji_tampil && (
                        <p className="font-extrabold text-emerald-700 truncate text-[11px]">
                          {loker.gaji_tampil}
                        </p>
                      )}
                    </div>

                    {/* Deskripsi Singkat 2 Baris */}
                    <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-2 pt-0.5" title={loker.deskripsi_singkat}>
                      {loker.deskripsi_singkat}
                    </p>

                    {/* Badge Rekomendasi Kecocokan AI jika ada */}
                    {loker.skor_kecocokan && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-orange-50/90 border border-orange-200/70 text-[10px] text-orange-950 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-orange-600 shrink-0" />
                        <span className="truncate">
                          Match {loker.skor_kecocokan}%: {loker.alasan_rekomendasi}
                        </span>
                      </div>
                    )}

                    {/* Tag Keahlian Ringkas */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {loker.kata_kunci.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200/60 truncate max-w-[120px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bagian Bawah Card: Waktu Tayang & Tombol Akses Sumber Portal */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-3">
                    <span className="text-[10px] text-stone-400">
                      {loker.tanggal_tayang}
                    </span>

                    <a
                      href={loker.url_asli}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-[11px] transition-all min-h-[38px] shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
                    >
                      <span>{t.lowongan.lihatDiSumber}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bar Kontrol Pagination (UX-16: Ergonomis & Responsif) */}
          {totalHalaman > 1 && (
            <div className="pt-4 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <p className="text-stone-500 font-medium order-2 sm:order-1">
                {t.lowongan.menampilkanHalaman
                  .replace('{current}', String(halamanAktif))
                  .replace('{total}', String(totalHalaman))}
                <span className="text-stone-400 ml-1">
                  ({daftarTampil.length} lowongan total)
                </span>
              </p>

              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => {
                    setHalamanAktif((prev) => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={halamanAktif === 1}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border font-bold transition-all min-h-[40px] cursor-pointer ${
                    halamanAktif === 1
                      ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed'
                      : 'bg-white text-stone-700 hover:text-orange-700 hover:border-orange-300 border-stone-200 shadow-2xs'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.lowongan.halamanSebelumnya}</span>
                </button>

                {/* Nomor Halaman */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((nomor) => {
                    // Batasi display nomor halaman jika lebih dari 5
                    if (
                      totalHalaman > 5 &&
                      Math.abs(nomor - halamanAktif) > 1 &&
                      nomor !== 1 &&
                      nomor !== totalHalaman
                    ) {
                      if (nomor === 2 || nomor === totalHalaman - 1) {
                        return (
                          <span key={nomor} className="px-1 text-stone-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    const isAktif = nomor === halamanAktif;
                    return (
                      <button
                        key={nomor}
                        type="button"
                        onClick={() => {
                          setHalamanAktif(nomor);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center border cursor-pointer ${
                          isAktif
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white text-stone-600 hover:text-orange-700 hover:border-orange-300 border-stone-200 shadow-2xs'
                        }`}
                      >
                        {nomor}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setHalamanAktif((prev) => Math.min(totalHalaman, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={halamanAktif === totalHalaman}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border font-bold transition-all min-h-[40px] cursor-pointer ${
                    halamanAktif === totalHalaman
                      ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed'
                      : 'bg-white text-stone-700 hover:text-orange-700 hover:border-orange-300 border-stone-200 shadow-2xs'
                  }`}
                >
                  <span className="hidden sm:inline">{t.lowongan.halamanBerikutnya}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
