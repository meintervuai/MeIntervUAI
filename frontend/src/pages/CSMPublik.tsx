import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  Globe,
  BookOpen,
  HelpCircle,
  Mail,
  Send,
  ShieldCheck,
  Award,
  ArrowRight,
  Star,
  Plus,
} from 'lucide-react';
import { useBahasa } from '../i18n';
import { UlasanPenggunaItem } from '../i18n/types';
import { api } from '../services/api';

export const CSMPublik: React.FC = () => {
  const { bahasa, setBahasa, t } = useBahasa();

  // State Interaktif Bank Soal
  const [kategoriSoalAktif, setKategoriSoalAktif] = useState('behavioral');
  const [soalTerbuka, setSoalTerbuka] = useState<string | null>('soal-1');

  // State FAQ Terbuka
  const [faqTerbuka, setFaqTerbuka] = useState<number | null>(0);

  // State Formulir Kontak
  const [formNama, setFormNama] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPesan, setFormPesan] = useState('');
  const [pesanTerkirim, setPesanTerkirim] = useState(false);

  // State Seksi Ulasan & Rating Pengguna Interaktif (Database + Local Fallback)
  const [daftarUlasan, setDaftarUlasan] = useState<UlasanPenggunaItem[]>(t.ulasan.daftarAwal);

  // Ambil ulasan nyata dari database Supabase
  useEffect(() => {
    api.getUlasanPublik().then((res) => {
      if (res.status === 'sukses' && res.ulasan && res.ulasan.length > 0) {
        const ulasanDb: UlasanPenggunaItem[] = res.ulasan.map((u: any) => ({
          id: u.ulasan_id,
          nama: u.pengguna?.nama_pengguna || 'Kandidat MeIntervUAI',
          peran: u.pengguna?.profil_pengguna?.[0]?.role_impian || (bahasa === 'id' ? 'Pengguna Terverifikasi' : 'Verified Candidate'),
          rating: u.bintang_rating,
          tanggal: new Date(u.dibuat_pada).toLocaleDateString(bahasa === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' }),
          komentar: u.isi_ulasan || '',
        }));
        setDaftarUlasan([...ulasanDb, ...t.ulasan.daftarAwal]);
      } else {
        setDaftarUlasan(t.ulasan.daftarAwal);
      }
    }).catch(() => {
      setDaftarUlasan(t.ulasan.daftarAwal);
    });
  }, [bahasa, t.ulasan.daftarAwal]);

  const [formUlasanBuka, setFormUlasanBuka] = useState(false);
  const [namaPengulas, setNamaPengulas] = useState('');
  const [peranPengulas, setPeranPengulas] = useState('');
  const [ratingPengulas, setRatingPengulas] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [komentarPengulas, setKomentarPengulas] = useState('');
  const [ulasanSuksesKirim, setUlasanSuksesKirim] = useState(false);

  const tanganiKirimUlasan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPengulas.trim() || !komentarPengulas.trim()) return;

    const ulasanBaru: UlasanPenggunaItem = {
      id: `rev-${Date.now()}`,
      nama: namaPengulas.trim(),
      peran: peranPengulas.trim() || (bahasa === 'id' ? 'Pengguna Latihan' : 'Practice Candidate'),
      rating: ratingPengulas,
      tanggal: bahasa === 'id' ? 'Baru saja' : 'Just now',
      komentar: komentarPengulas.trim(),
    };

    const updateList = [ulasanBaru, ...daftarUlasan];
    setDaftarUlasan(updateList);
    try {
      localStorage.setItem('meintervu_ulasan_pengguna', JSON.stringify(updateList));
    } catch {
      // Ignore
    }

    setUlasanSuksesKirim(true);
    setNamaPengulas('');
    setPeranPengulas('');
    setKomentarPengulas('');
    setRatingPengulas(5);
    setTimeout(() => {
      setUlasanSuksesKirim(false);
      setFormUlasanBuka(false);
    }, 2500);
  };

  const tanganiKirimForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formPesan.trim()) return;
    setPesanTerkirim(true);
    setTimeout(() => {
      setFormNama('');
      setFormEmail('');
      setFormPesan('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-900 font-sans selection:bg-orange-200 selection:text-orange-950 flex flex-col">
      {/* 1. HEADER MANDIRI (STANDALONE TOPBAR TANPA MENU JUALAN / NAVIGASI) */}
      <header className="sticky top-0 z-50 bg-[#fdfbf7] border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo Brand Mandiri */}
            <Link to="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-800 rounded-lg">
              <div className="w-10 h-10 rounded-xl bg-orange-700 text-white flex items-center justify-center font-black text-base shadow-sm shadow-orange-700/30 group-hover:bg-orange-800 transition-colors">
                MI
              </div>
              <div className="flex flex-col">
                <span className="tracking-tight text-stone-900 font-black text-lg leading-tight">
                  MeIntervU<span className="text-orange-800">AI</span>
                </span>
                <span className="text-xs tracking-wide text-stone-600 font-bold uppercase">
                  {t.hero.kicker.slice(0, 24)}
                </span>
              </div>
            </Link>

            {/* Kontrol Kanan: Pengalih Bahasa & CTA Langsung */}
            <div className="flex items-center gap-3">
              {/* Pengalih Bahasa Dwibahasa ID / EN */}
              <div
                className="inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/80"
                role="group"
                aria-label="Pilih Bahasa Antarmuka"
              >
                <button
                  type="button"
                  onClick={() => setBahasa('id')}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all min-h-[36px] flex items-center gap-1.5 ${
                    bahasa === 'id'
                      ? 'bg-orange-700 text-white shadow-sm shadow-orange-700/25'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                  aria-pressed={bahasa === 'id'}
                >
                  <Globe className="w-3.5 h-3.5" />
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setBahasa('en')}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all min-h-[36px] flex items-center gap-1.5 ${
                    bahasa === 'en'
                      ? 'bg-orange-700 text-white shadow-sm shadow-orange-700/25'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                  aria-pressed={bahasa === 'en'}
                >
                  EN
                </button>
              </div>

              {/* Tombol Masuk Akun */}
              <Link
                to="/masuk"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-bold rounded-xl text-stone-800 hover:text-orange-900 hover:bg-orange-100/60 transition-colors min-h-[44px] items-center"
              >
                {t.nav.ctaMasuk}
              </Link>

              {/* Tombol Mulai Simulasi */}
              <Link
                to="/masuk"
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-orange-700 text-white hover:bg-orange-800 transition-all shadow-sm shadow-orange-700/25 min-h-[44px] flex items-center gap-2"
              >
                <span>{t.nav.ctaMulai}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 2. AREA KONTEN UTAMA */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 sm:space-y-28 w-full">
        {/* HERO SECTION DENGAN GAMBAR VEKTOR INTERAKTIF */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.12]">
              {t.hero.judul}
            </h1>

            <p className="text-lg sm:text-xl text-stone-700 leading-relaxed max-w-[65ch]">
              {t.hero.subjudul}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#simulator"
                className="px-6 py-3.5 text-sm sm:text-base font-bold rounded-xl bg-orange-700 text-white hover:bg-orange-800 transition-all shadow-sm shadow-orange-700/25 min-h-[48px] inline-flex items-center gap-2 group"
              >
                <span>{t.hero.ctaPrimer}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#bank-soal"
                className="px-6 py-3.5 text-sm sm:text-base font-bold rounded-xl bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 hover:border-orange-300 transition-all min-h-[48px] inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-orange-800" />
                <span>{t.hero.ctaSekunder}</span>
              </a>
            </div>

            {/* PILAR KAPABILITAS PLATFORM (JUJUR & NYATA TANPA KLAIM HIPERBOLA) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-200">
              {t.hero.pilarPlatform.map((pilar, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-white/70 border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-orange-300 transition-colors">
                  <div className="text-sm font-black text-stone-900 tracking-tight">
                    {pilar.judul}
                  </div>
                  <div className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                    {pilar.label}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {pilar.keterangan}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ILUSTRASI VEKTOR WAWANCARA KERJA DENGAN MICRO-ANIMATION */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md p-6 bg-white rounded-3xl border border-stone-200 shadow-sm transition-transform duration-500 hover:scale-[1.02]">
              <img
                src="/illustrations/interview.svg"
                alt="Ilustrasi Simulasi Wawancara Kerja Interaktif"
                className="w-full h-auto object-contain max-h-[320px]"
                loading="eager"
              />
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span className="font-bold text-stone-800">Sesi Wawancara Adaptif</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Siap Latihan
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TIGA PILIHAN MODE SIMULASI WAWANCARA DENGAN GAMBAR & PENJELASAN SINGKAT */}
        <section id="simulator" className="space-y-8 scroll-mt-24">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 text-orange-950 text-xs font-bold uppercase tracking-wider">
              <span>{t.simulator.kicker}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              {t.simulator.judul}
            </h2>
            <p className="text-base text-stone-700 leading-relaxed max-w-[65ch]">
              {t.simulator.subjudul}
            </p>
          </div>

          {/* GRID 3 KARTU SIMULASI BESERTA GAMBAR DAN PENJELASAN SINGKAT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {t.simulator.daftarMode.map((mode) => (
              <div
                key={mode.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-orange-300 hover:shadow-md transition-all duration-300 group"
              >
                <div className="space-y-5">
                  {/* Gambar Ilustrasi Mode */}
                  <div className="w-full bg-[#fcfaf7] rounded-2xl p-6 border border-stone-100 flex items-center justify-center min-h-[200px] overflow-hidden">
                    <img
                      src={mode.gambar}
                      alt={mode.nama}
                      className="w-full max-h-[160px] object-contain transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Tag & Durasi */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                      {mode.tag}
                    </span>
                    <span className="font-semibold text-stone-500">
                      {mode.durasi}
                    </span>
                  </div>

                  {/* Judul & Penjelasan Singkat */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">
                      {mode.nama}
                    </h3>
                    <p className="text-sm font-semibold text-stone-800 leading-snug">
                      {mode.ringkasan}
                    </p>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {mode.penjelasan}
                    </p>
                  </div>

                  {/* Poin Fokus Fitur Utama */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      {t.simulator.fokusLatihanLabel}
                    </div>
                    {mode.fiturUtama.map((fitur, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{fitur}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tombol Aksi Langsung */}
                <div className="pt-4 border-t border-stone-100">
                  <Link
                    to="/masuk"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-stone-900 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 min-h-[44px] group-hover:bg-orange-700 shadow-sm"
                  >
                    <span>{mode.ctaTeks}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. BANK SOAL STAR & PANDUAN REKRUTER DENGAN ILUSTRASI VEKTOR */}
        <section id="bank-soal" className="space-y-8 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                {t.bankSoal.judul}
              </h2>
              <p className="text-base text-stone-700 leading-relaxed max-w-[65ch]">
                {t.bankSoal.subjudul}
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <img
                src="/illustrations/career-development.svg"
                alt="Ilustrasi Pengembangan Karier & STAR"
                className="w-full max-w-[200px] h-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-200">
            {/* FILTER KATEGORI */}
            <div className="p-4 sm:p-6 bg-stone-50/70 flex flex-wrap gap-2">
              {t.bankSoal.kategori.map((kat) => (
                <button
                  key={kat.id}
                  type="button"
                  onClick={() => setKategoriSoalAktif(kat.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all min-h-[40px] flex items-center gap-2 ${
                    kategoriSoalAktif === kat.id
                      ? 'bg-orange-700 text-white shadow-sm'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{kat.nama}</span>
                  <span className="text-xs font-semibold">({kat.jumlahSoal})</span>
                </button>
              ))}
            </div>

            {/* DAFTAR SOAL TERSTRUKTUR */}
            <div className="divide-y divide-stone-200">
              {t.bankSoal.daftarSoal.map((soal) => {
                const terbuka = soalTerbuka === soal.id;
                return (
                  <div key={soal.id} className="p-6 transition-colors hover:bg-stone-50/50">
                    <button
                      type="button"
                      onClick={() => setSoalTerbuka(terbuka ? null : soal.id)}
                      className="w-full flex items-start justify-between gap-4 text-left focus:outline-none min-h-[44px]"
                      aria-expanded={terbuka}
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                          {soal.kategori}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-stone-900">
                          {soal.pertanyaan}
                        </h3>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 mt-1">
                        <ChevronDown
                          className={`w-4 h-4 text-stone-700 transition-transform duration-200 ${
                            terbuka ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {terbuka && (
                      <div className="mt-4 pt-4 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1.5">
                          <div className="text-xs font-black text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-orange-800" />
                            <span>Tujuan Asesmen Penguji</span>
                          </div>
                          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                            {soal.tujuanPenguji}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-emerald-700" />
                            <span>Kunci Struktur Jawaban STAR</span>
                          </div>
                          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                            {soal.kunciJawabanSTAR}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. TANYA JAWAB (FAQ ACCORDION) */}
        <section id="faq" className="space-y-8 scroll-mt-24">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              {t.faq.judul}
            </h2>
            <p className="text-base text-stone-700 leading-relaxed max-w-[65ch]">
              {t.faq.subjudul}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm divide-y divide-stone-200 overflow-hidden">
            {t.faq.daftarFaq.map((item, idx) => {
              const buka = faqTerbuka === idx;
              return (
                <div key={idx} className="p-6 transition-colors hover:bg-stone-50/50">
                  <button
                    type="button"
                    onClick={() => setFaqTerbuka(buka ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left focus:outline-none min-h-[44px]"
                    aria-expanded={buka}
                  >
                    <span className="font-bold text-base text-stone-900">
                      {item.tanya}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 text-stone-700 transition-transform duration-200 ${
                          buka ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {buka && (
                    <div className="mt-3 pr-8 text-sm text-stone-700 leading-relaxed border-t border-stone-100 pt-3">
                      {item.jawab}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. ULASAN & PENGALAMAN PENGGUNA INTERAKTIF (USER REVIEWS & RATINGS) */}
        <section id="ulasan" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 text-orange-950 text-xs font-bold uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-orange-700 text-orange-700" />
                <span>{t.ulasan.kicker}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                {t.ulasan.judul}
              </h2>
              <p className="text-base text-stone-700 leading-relaxed max-w-[65ch]">
                {t.ulasan.subjudul}
              </p>
            </div>

            {/* Tombol Buka Form Tulis Ulasan & Ringkasan Rating */}
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  <span className="text-2xl font-black text-stone-900 leading-none">
                    {daftarUlasan.length > 0
                      ? (daftarUlasan.reduce((acc, curr) => acc + curr.rating, 0) / daftarUlasan.length).toFixed(1)
                      : '5.0'}
                  </span>
                </div>
                <div className="text-xs text-stone-600 border-l border-stone-200 pl-3">
                  <div className="font-bold text-stone-900">{t.ulasan.rataRataLabel}</div>
                  <div>{daftarUlasan.length} {t.ulasan.totalUlasanLabel}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormUlasanBuka(!formUlasanBuka)}
                className="px-5 py-3 bg-orange-700 text-white hover:bg-orange-800 rounded-xl font-bold text-sm transition-all shadow-sm shadow-orange-700/25 min-h-[44px] flex items-center gap-2"
              >
                <Plus className={`w-4 h-4 transition-transform duration-200 ${formUlasanBuka ? 'rotate-45' : ''}`} />
                <span>{formUlasanBuka ? t.ulasan.tutupFormUlasan : t.ulasan.tombolTulisUlasan}</span>
              </button>
            </div>
          </div>

          {/* FORMULIR TULIS ULASAN (COLLAPSIBLE DENGAN ANIMASI) */}
          {formUlasanBuka && (
            <div className="bg-white rounded-3xl border-2 border-orange-200 p-6 sm:p-8 shadow-sm space-y-6 transition-all duration-300">
              <div className="border-b border-stone-100 pb-4">
                <h3 className="text-xl font-black text-stone-900">
                  {t.ulasan.form.judul}
                </h3>
              </div>

              <form onSubmit={tanganiKirimUlasan} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ulasan-nama" className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">
                      {t.ulasan.form.labelNama}
                    </label>
                    <input
                      id="ulasan-nama"
                      type="text"
                      required
                      value={namaPengulas}
                      onChange={(e) => setNamaPengulas(e.target.value)}
                      placeholder={t.ulasan.form.placeholderNama}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label htmlFor="ulasan-peran" className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">
                      {t.ulasan.form.labelPeran}
                    </label>
                    <input
                      id="ulasan-peran"
                      type="text"
                      value={peranPengulas}
                      onChange={(e) => setPeranPengulas(e.target.value)}
                      placeholder={t.ulasan.form.placeholderPeran}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Rating Bintang Interaktif */}
                <div>
                  <span className="block text-xs font-bold text-stone-700 mb-2 uppercase">
                    {t.ulasan.form.labelRating}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5" role="group" aria-label="Rating Bintang">
                      {[1, 2, 3, 4, 5].map((bintang) => {
                        const aktif = bintang <= (hoverRating || ratingPengulas);
                        return (
                          <button
                            key={bintang}
                            type="button"
                            onMouseEnter={() => setHoverRating(bintang)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRatingPengulas(bintang)}
                            className="p-1 rounded-lg hover:scale-125 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                            aria-label={`${bintang} Bintang`}
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                aktif
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-stone-300 fill-transparent'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-stone-700 ml-2 bg-stone-100 px-3 py-1 rounded-lg">
                      {t.ulasan.form.ratingDesc[hoverRating || ratingPengulas]}
                    </span>
                  </div>
                </div>

                {/* Komentar Ulasan */}
                <div>
                  <label htmlFor="ulasan-komentar" className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">
                    {t.ulasan.form.labelKomentar}
                  </label>
                  <textarea
                    id="ulasan-komentar"
                    rows={3}
                    required
                    value={komentarPengulas}
                    onChange={(e) => setKomentarPengulas(e.target.value)}
                    placeholder={t.ulasan.form.placeholderKomentar}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  />
                </div>

                {ulasanSuksesKirim && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{t.ulasan.form.suksesNotif}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormUlasanBuka(false)}
                    className="px-4 py-2.5 text-stone-700 hover:text-stone-900 font-bold text-sm min-h-[44px]"
                  >
                    {t.ulasan.tutupFormUlasan}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-orange-700 text-white font-bold text-sm rounded-xl hover:bg-orange-800 transition-all shadow-sm shadow-orange-700/25 min-h-[44px] flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.ulasan.form.tombolKirim}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* GRID KARTU ULASAN PENGGUNA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {daftarUlasan.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-orange-300 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3">
                  {/* Rating Bintang Emas */}
                  <div className="flex items-center gap-1" aria-label={`Rating ${rev.rating} dari 5`}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-stone-300 fill-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Kutipan Pengalaman */}
                  <p className="text-sm text-stone-700 leading-relaxed italic">
                    "{rev.komentar}"
                  </p>
                </div>

                {/* Profil Pengulas */}
                <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-black text-sm shrink-0">
                    {rev.nama.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-stone-900 truncate">
                      {rev.nama}
                    </h3>
                    <p className="text-xs text-stone-500 truncate">
                      {rev.peran}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. FORMULIR BANTUAN & KONTAK DUKUNGAN */}
        <section id="bantuan" className="space-y-8 scroll-mt-24">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              {t.kontak.judul}
            </h2>
            <p className="text-base text-stone-700 leading-relaxed max-w-[65ch]">
              {t.kontak.subjudul}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Pengiriman */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
              <form onSubmit={tanganiKirimForm} className="space-y-4">
                <div>
                  <label htmlFor="kontak-nama" className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">
                    Nama Lengkap
                  </label>
                  <input
                    id="kontak-nama"
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder={t.kontak.placeholderNama}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent min-h-[44px]"
                  />
                </div>

                <div>
                  <label htmlFor="kontak-email" className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">
                    Email Aktif
                  </label>
                  <input
                    id="kontak-email"
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder={t.kontak.placeholderEmail}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent min-h-[44px]"
                  />
                </div>

                <div>
                  <label htmlFor="kontak-pesan" className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">
                    Pertanyaan atau Kendala
                  </label>
                  <textarea
                    id="kontak-pesan"
                    rows={4}
                    required
                    value={formPesan}
                    onChange={(e) => setFormPesan(e.target.value)}
                    placeholder={t.kontak.placeholderPesan}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  />
                </div>

                {pesanTerkirim && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{t.kontak.pesanTerkirim}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-700 text-white font-bold text-sm rounded-xl hover:bg-orange-800 transition-all shadow-sm shadow-orange-700/25 min-h-[48px] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.kontak.tombolKirim}</span>
                </button>
              </form>
            </div>

            {/* Kartu SLA Informasi Layanan */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-orange-50 border border-orange-200/80 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-orange-950">
                  <Mail className="w-4 h-4 text-orange-800" />
                  <span>Dukungan Teknis MeIntervUAI</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {t.kontak.slaResponse}
                </p>
                <div className="pt-2 text-xs font-bold text-orange-900">
                  Email Langsung: <span className="underline">support@meintervu.ai</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900">
                  <HelpCircle className="w-4 h-4 text-orange-800" />
                  <span>Prioritas Penanganan Permintaan</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Pertanyaan seputar kalibrasi pertanyaan wawancara dan persiapan simulasi diproses secara terjadwal oleh tim kami.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. FOOTER MANDIRI (STANDALONE BESPOKE FOOTER) */}
      <footer className="mt-20 bg-[#fffbf7] border-t border-orange-200/90 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Kolom Brand & Status Sistem */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-700 text-white flex items-center justify-center font-black text-sm">
                  MI
                </div>
                <span className="tracking-tight text-stone-900 font-extrabold text-base">
                  MeIntervU<span className="text-orange-800">AI</span>
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed max-w-[45ch]">
                {t.footer.deskripsi}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true" />
                  <span>{t.footer.statusSistem}</span>
                </div>
                <span className="text-xs font-bold text-stone-500">
                  {t.footer.latency}
                </span>
              </div>
            </div>

            {/* Kolom Tautan Terkategori */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
              {t.footer.kolomTautan.map((kolom, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    {kolom.judul}
                  </h3>
                  <ul className="space-y-2 text-xs">
                    {kolom.tautan.map((taut, tIdx) => (
                      <li key={tIdx}>
                        <a
                          href={taut.href}
                          className="text-stone-600 hover:text-orange-800 transition-colors"
                        >
                          {taut.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>{t.footer.hakCipta}</p>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-stone-600">Kode Bahasa: {bahasa.toUpperCase()}</span>
              <span>•</span>
              <a href="#simulator" className="hover:text-orange-800 transition-colors">
                Kembali ke Atas ↑
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CSMPublik;
