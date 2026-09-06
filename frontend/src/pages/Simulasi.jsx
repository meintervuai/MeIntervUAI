import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  Volume2,
  Video,
  VideoOff,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Award,
  TrendingUp,
  Briefcase,
  User,
  Bot,
  Send,
  Info,
  ShieldCheck,
  Zap,
  Target,
  Camera,
  ThumbsUp,
  AlertTriangle,
  ChevronRight,
  Sliders,
  Check,
  Lock,
  Edit3,
  MessageSquare,
  Radio,
  History,
  Calendar,
  ArrowLeft,
  Eye,
  FileText,
} from 'lucide-react';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import { pakaiKuota } from '../hooks/pakai_kuota';
import { pakaiBahasa } from '../contexts/KonteksBahasa';
import { ambilCvTerbaru } from '../services/api_cv';
import {
  buatSesiWawancara,
  simpanPertanyaanSesi,
  simpanJawabanSesi,
  simpanEvaluasiSesi,
  ambilRiwayatSimulasi,
} from '../services/api_simulasi';

// Daftar Posisi Populer
const DAFTAR_POSISI_POPULER = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'UI/UX Designer',
  'Data Analyst',
  'Product Manager',
  'Mobile Developer',
  'DevOps / Cloud Engineer',
];

// Bank Pertanyaan Standar Berbasis HRD & STAR
const BANK_PERTANYAAN_HRD = {
  teknikal: [
    {
      kategori: 'Arsitektur & Teknis',
      pertanyaan: 'Ceritakan arsitektur teknis paling kompleks yang pernah Anda rancang atau kembangkan. Mengapa memilih pendekatan tersebut?',
      petunjuk: 'Jelaskan stack teknologi, trade-off, skalabilitas, dan keputusan desain arsitektur yang Anda ambil.',
      jawabanIdeal: 'Bahas masalah bisnis yang diselesaikan, alasan memilih teknologi tertentu dibanding alternatifnya, serta metrik performa/reliability yang dicapai.',
    },
    {
      kategori: 'Code Quality & Debugging',
      pertanyaan: 'Bagaimana pendekatan Anda dalam memastikan kualitas kode, automated testing, serta penanganan bug kritis di lingkungan produksi?',
      petunjuk: 'Sebutkan praktik testing (unit/integration), code review, logging terstruktur, dan pipeline CI/CD.',
      jawabanIdeal: 'Tekankan keseimbangan antara kecepatan delivery dan keandalan sistem, automated testing, logging, dan post-mortem analisis pasca insiden.',
    },
    {
      kategori: 'Optimasi & Performa',
      pertanyaan: 'Ceritakan pengalaman nyata ketika Anda harus mendiagnosis dan mengoptimalkan performa aplikasi yang mengalami bottleneck.',
      petunjuk: 'Jelaskan profiling tools yang dipakai, hipotesis perbaikan, dan hasil peningkatan kecepatan terukur.',
      jawabanIdeal: 'Gunakan metrik kuantitatif, misalnya: "Latency API berkurang 65% dan query execution time turun dari 1.2 detik ke 140ms".',
    },
    {
      kategori: 'Metode STAR (Konflik Tim)',
      pertanyaan: 'Ceritakan situasi ketika terjadi perbedaan pendapat teknis tajam di dalam tim Anda, dan bagaimana cara Anda mencapai mufakat?',
      petunjuk: 'Uraikan dengan metode STAR: Situation, Task, Action, dan Result yang berdampak positif bagi kekompakan tim.',
      jawabanIdeal: 'Tunjukkan komunikasi objektif berdasarkan data benchmark/bukti teknis daripada ego, dan prioritaskan tujuan produk.',
    },
    {
      kategori: 'Prioritas & Tekanan',
      pertanyaan: 'Bagaimana strategi Anda saat menghadapi sprint dengan deadline yang sangat ketat dan terjadi perubahan requirement mendadak?',
      petunjuk: 'Jelaskan manajemen risiko, komunikasi dengan stakeholder/PM, dan trade-off teknis yang sehat.',
      jawabanIdeal: 'Jelaskan scoping ulang, pemisahan must-have vs nice-to-have, serta mitigasi technical debt dengan transparansi.',
    },
    {
      kategori: 'Penyelidikan Masalah (Root Cause)',
      pertanyaan: 'Ketika sistem tiba-tiba mengalami downtime di luar jam kerja, ceritakan langkah metodologis pertama yang Anda ambil untuk investigasi.',
      petunjuk: 'Jelaskan triage insiden: pengecekan log, metrik, isolasi komponen, rollback vs hotfix, dan komunikasi.',
      jawabanIdeal: 'Uraikan penanganan darurat tanpa panik: amati log error, rollback versi jika diperlukan, baru telusuri root cause dan buat dokumentasi insiden.',
    },
    {
      kategori: 'Pembaruan Teknologi',
      pertanyaan: 'Bagaimana cara Anda menimbang keputusan apakah perlu mengadopsi library/framework baru atau tetap mempertahankan teknologi yang ada?',
      petunjuk: 'Sebutkan faktor evaluasi: kematangan ekosistem, kurva belajar tim, maintainability, dan cost.',
      jawabanIdeal: 'Jelaskan POC (Proof of Concept) terukur, audit lisensi, dan dampak jangka panjang pada kecepatan pengembangan tim.',
    },
    {
      kategori: 'Komunikasi Non-Teknis',
      pertanyaan: 'Bagaimana cara Anda menjelaskan kendala arsitektur atau technical debt kepada tim bisnis/manajemen yang non-teknis?',
      petunjuk: 'Gunakan analogi sederhana, fokus pada dampak finansial, kecepatan rilis fitur, atau keamanan data.',
      jawabanIdeal: 'Hindari jargon rumit, komunikasikan risiko bisnis jika dibiarkan dan return of investment (ROI) dari refactoring.',
    },
    {
      kategori: 'Visi & Pengembangan Diri',
      pertanyaan: 'Bidang teknologi atau spesialisasi apa yang sedang giat Anda eksplorasi secara mandiri dalam 6 bulan terakhir?',
      petunjuk: 'Tunjukkan inisiatif belajar berkelanjutan (continuous learning) dan passion di dunia rekayasa perangkat lunak.',
      jawabanIdeal: 'Ceritakan teknologi baru yang dipelajari, implementasi mini project, dan bagaimana itu membuat Anda lebih produktif.',
    },
    {
      kategori: 'Pertanyaan Penutup (Exit Question)',
      pertanyaan: 'Apakah ada pertanyaan yang ingin Anda ajukan kepada kami mengenai roadmap rekayasa sistem, budaya tim, atau tantangan perusahaan?',
      petunjuk: 'Wawancara profesional adalah dialog dua arah. Ajukan pertanyaan yang berbobot mengenai pertumbuhan dan teknologi.',
      jawabanIdeal: 'Tanyakan mengenai ekspektasi keberhasilan dalam 90 hari pertama atau tantangan skalabilitas terbesar tim saat ini.',
    },
  ],
  umum: [
    {
      kategori: 'Perkenalan Profesional',
      pertanyaan: 'Ceritakan latar belakang profesional Anda dan apa pencapaian terbesar yang paling mendefinisikan etos kerja Anda?',
      petunjuk: 'Struktur: Background ringkas -> Pencapaian utama dengan angka -> Nilai tambah untuk posisi ini.',
      jawabanIdeal: 'Fokuskan pada perjalanan karier atau keahlian utama, highlight 1-2 pencapaian terbesar, dan sambungkan mengapa visi peran ini selaras.',
    },
    {
      kategori: 'Metode STAR (Tantangan Kerja)',
      pertanyaan: 'Ceritakan situasi ketika Anda menghadapi target kerja yang tampak hampir mustahil tercapai. Langkah konkrit apa yang Anda lakukan?',
      petunjuk: 'Gunakan metode STAR (Situation, Task, Action, Result) dengan penekanan pada ketahanan mental dan kreativitas solusi.',
      jawabanIdeal: 'Sebutkan konteks masalah secara ringkas, peran spesifik Anda, tindakan terukur yang diambil, serta hasil positif yang dicapai.',
    },
    {
      kategori: 'Kolaborasi Lintas Divisi',
      pertanyaan: 'Bagaimana cara Anda membangun hubungan kerja yang produktif dengan rekan kerja atau klien yang memiliki gaya komunikasi berbeda?',
      petunjuk: 'Jelaskan empati komunikasi, mendengarkan aktif, dan fleksibilitas dalam menyelesaikan hambatan komunikasi.',
      jawabanIdeal: 'Tunjukkan empati, klarifikasi ekspektasi secara tertulis, dan fokus pada tujuan bersama.',
    },
    {
      kategori: 'Manajemen Waktu & Prioritas',
      pertanyaan: 'Bagaimana Anda mengatur prioritas ketika beberapa proyek mendesak datang dari atasan yang berbeda secara serentak?',
      petunjuk: 'Jelaskan framework prioritas (Eisenhower Matrix, impact vs urgency) dan komunikasi proaktif.',
      jawabanIdeal: 'Jelaskan cara Anda mengidentifikasi urgensi dan dampak, lalu berkomunikasi proaktif dengan manajer untuk penyelarasan ekspektasi.',
    },
    {
      kategori: 'Respon terhadap Umpan Balik',
      pertanyaan: 'Ceritakan momen ketika Anda menerima kritik atau umpan balik negatif yang cukup keras terhadap hasil kerja Anda. Bagaimana Anda meresponnya?',
      petunjuk: 'Tunjukkan kematangan emosi, keterbukaan untuk berkembang, dan aksi perbaikan nyata.',
      jawabanIdeal: 'Sambut kritik sebagai masukan objektif, evaluasi kekurangan, dan buktikan dengan perbaikan terukur pada pekerjaan berikutnya.',
    },
    {
      kategori: 'Kepemimpinan & Inisiatif',
      pertanyaan: 'Bisa ceritakan contoh ketika Anda mengambil inisiatif di luar lingkup tanggung jawab resmi Anda untuk memajukan tim atau proyek?',
      petunjuk: 'Tunjukkan kepemilikan (ownership mindset) dan proaktivitas dalam menyelesaikan masalah operasional.',
      jawabanIdeal: 'Jelaskan peluang perbaikan yang Anda identifikasi, inisiatif yang diambil, dan dampak efisiensi yang dirasakan tim.',
    },
    {
      kategori: 'Integritas & Etika',
      pertanyaan: 'Pernahkah Anda berada dalam situasi di mana integritas kerja diuji, dan keputusan sulit apa yang Anda ambil?',
      petunjuk: 'Fokus pada kejujuran profesional, kepatuhan prosedur, dan keberanian mempertahankan standar etika.',
      jawabanIdeal: 'Jelaskan komitmen pada transparansi dan kepentingan jangka panjang organisasi di atas kenyamanan sesaat.',
    },
    {
      kategori: 'Adaptasi Terhadap Perubahan',
      pertanyaan: 'Bagaimana Anda beradaptasi ketika ada restrukturisasi tim, perubahan target bisnis drastis, atau pergeseran strategi perusahaan?',
      petunjuk: 'Tunjukkan kegesitan (agility), sikap optimis, dan kemampuan membantu rekan kerja beradaptasi.',
      jawabanIdeal: 'Pahami alasan strategis di balik perubahan, susun rencana penyesuaian kerja harian, dan bantu menjaga moral tim.',
    },
    {
      kategori: 'Pengembangan Diri Mandiri',
      pertanyaan: 'Apa kelemahan utama yang saat ini sedang aktif Anda kembangkan, dan sistem apa yang Anda bangun untuk memperbaikinya?',
      petunjuk: 'Pilih kelemahan nyata yang dapat diperbaiki (misal: public speaking, delegasi), bukan klise perfeksionis.',
      jawabanIdeal: 'Akui area pengembangan secara jujur, jelaskan pelatihan/metode yang diterapkan, dan tunjukkan progres nyata.',
    },
    {
      kategori: 'Pertanyaan Penutup (Exit Question)',
      pertanyaan: 'Apakah ada hal yang ingin Anda ketahui lebih dalam tentang ekspektasi keberhasilan peran ini atau budaya organisasi kami?',
      petunjuk: 'Ajukan pertanyaan yang mencerminkan ketertarikan mendalam Anda pada kesuksesan jangka panjang di organisasi.',
      jawabanIdeal: 'Tanyakan mengenai ukuran kesuksesan 90 hari pertama atau kesempatan kolaborasi inovatif di perusahaan.',
    },
  ],
};

export default function Simulasi() {
  const { profil } = pakaiOtentikasi();
  const { kuota, kurangiKuota } = pakaiKuota();
  const { t } = pakaiBahasa();
  const navigate = useNavigate();

  // Tahap: 'persiapan' | 'wawancara' | 'evaluasi'
  const [tahap, setTahap] = useState('persiapan');

  // Sistem Tab Menu Simulasi: 'mode' (Pilih Mode Simulasi) | 'riwayat' (Hasil Review Sesi)
  const [tabMenuSimulasi, setTabMenuSimulasi] = useState('mode');
  const [riwayatSesi, setRiwayatSesi] = useState([]);
  const [isLoadingRiwayat, setIsLoadingRiwayat] = useState(false);
  const [sesiDipilihReview, setSesiDipilihReview] = useState(null);

  // Ambil Riwayat Sesi Simulasi dari Supabase / localStorage
  const muatRiwayat = async () => {
    setIsLoadingRiwayat(true);
    try {
      const data = await ambilRiwayatSimulasi(profil?.id);
      setRiwayatSesi(data || []);
    } catch (e) {
      console.warn('Gagal muat riwayat simulasi:', e);
    } finally {
      setIsLoadingRiwayat(false);
    }
  };

  useEffect(() => {
    muatRiwayat();
  }, [profil?.id]);

  // =========================================================================
  // 1. DATA CV & PRASYARAT AKSES (ACCESS GATE)
  // =========================================================================
  const [cvData, setCvData] = useState(null);
  const [isLoadingCv, setIsLoadingCv] = useState(true);

  useEffect(() => {
    let aktif = true;
    async function loadCv() {
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
    loadCv();
    return () => {
      aktif = false;
    };
  }, [profil?.id]);

  // Validasi Prasyarat Minimal CV
  const cekPrasyaratCv = () => {
    if (!cvData) {
      return {
        lengkap: false,
        bagianKurang: ['Pengalaman Kerja', 'Keahlian (Skills)'],
        alasan: 'Data CV belum ditemukan. Harap buat dan lengkapi CV Anda terlebih dahulu.',
      };
    }

    const exp = (cvData.experience || []).filter((e) => e.visible !== false && (e.position || e.company));
    const hardSkills = (cvData.skills?.hard || []).filter((s) => s.visible !== false && s.name);
    const softSkills = (cvData.skills?.soft || []).filter((s) => s.visible !== false && s.name);
    const totalSkills = hardSkills.length + softSkills.length;

    const bagianKurang = [];
    if (exp.length === 0) {
      bagianKurang.push('Pengalaman Kerja (Minimal 1 riwayat pekerjaan/proyek)');
    }
    if (totalSkills === 0) {
      bagianKurang.push('Keahlian (Minimal 1 keahlian teknis atau soft skills)');
    }

    return {
      lengkap: bagianKurang.length === 0,
      bagianKurang,
      expCount: exp.length,
      skillCount: totalSkills,
    };
  };

  const statusPrasyarat = cekPrasyaratCv();

  // Deteksi Otomatis Tingkat Pengalaman dari CV
  const deteksiTingkatPengalaman = () => {
    if (!cvData?.experience || cvData.experience.length === 0) {
      return { level: 'Fresh Graduate / Entry Level', keterangan: 'Belum ada riwayat kerja tercatat di CV.' };
    }
    const exp = cvData.experience.filter((e) => e.visible !== false);
    const textAll = exp.map((e) => `${e.position || ''} ${e.description || ''}`).join(' ').toLowerCase();

    if (exp.length >= 3 || /senior|lead|manager|head|principal|director/i.test(textAll)) {
      return {
        level: 'Senior / Lead (5+ Tahun)',
        keterangan: `Terdeteksi otomatis dari ${exp.length} riwayat kerja dan tanggung jawab strategis di CV.`,
      };
    }
    if (exp.length >= 2 || /mid|intermediate|specialist/i.test(textAll)) {
      return {
        level: 'Mid-Level (3 - 5 Tahun)',
        keterangan: `Terdeteksi otomatis dari ${exp.length} riwayat pekerjaan profesional di CV.`,
      };
    }
    return {
      level: 'Junior (1 - 2 Tahun)',
      keterangan: `Terdeteksi otomatis dari ${exp.length} riwayat pengalaman kerja awal di CV.`,
    };
  };

  const tingkatPengalamanAuto = deteksiTingkatPengalaman();

  // Konfigurasi Sesi Simulasi: Mode default 'video', dapat berupa 'teks' | 'audio' | 'video'
  const [konfigurasi, setKonfigurasi] = useState({
    posisiTarget: profil?.posisi_target || 'Frontend Developer',
    mode: 'video', // 'teks' | 'audio' | 'video'
    bahasa: 'id', // 'id' | 'en'
    jumlahPertanyaan: 10, // Minimal 10 pertanyaan per spesifikasi
  });

  useEffect(() => {
    if (cvData?.personal?.targetPosition && !konfigurasi.posisiTarget) {
      setKonfigurasi((prev) => ({ ...prev, posisiTarget: cvData.personal.targetPosition }));
    }
  }, [cvData]);

  // =========================================================================
  // 2. PERSIAPAN PERANGKAT DINAMIS (DYNAMIC DEVICE CHECK BERDASARKAN MODE)
  // =========================================================================
  const [isMicAllowed, setIsMicAllowed] = useState(false);
  const [isCameraAllowed, setIsCameraAllowed] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0 - 100
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);
  const [deviceCheckError, setDeviceCheckError] = useState(null);

  const previewDeviceVideoRef = useRef(null);
  const previewStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Helper Hentikan Stream
  const hentikanStream = (streamRef) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
  };

  // Helper Enforce Mute Mutlak pada Elemen Video
  const pastikanVideoMuted = (videoEl) => {
    if (videoEl) {
      videoEl.muted = true;
      videoEl.volume = 0;
    }
  };

  // Jalankan Tes Perangkat Sesuai Mode Terpilih
  const jalankanTesPerangkat = async () => {
    setDeviceCheckError(null);
    hentikanTesPerangkat();

    // Mode Teks tidak memerlukan hardware check
    if (konfigurasi.mode === 'teks') return;

    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video:
          konfigurasi.mode === 'video'
            ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
            : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      previewStreamRef.current = stream;

      if (konfigurasi.mode === 'video' && previewDeviceVideoRef.current) {
        pastikanVideoMuted(previewDeviceVideoRef.current);
        previewDeviceVideoRef.current.srcObject = stream;
        setIsCameraAllowed(true);
      }
      setIsMicAllowed(true);

      // Web Audio API untuk visual meter audio
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const loopAudioMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 64) * 100)));
          animFrameRef.current = requestAnimationFrame(loopAudioMeter);
        };
        loopAudioMeter();
      }
    } catch (err) {
      console.warn('Izin akses perangkat ditolak / tidak tersedia:', err);
      setDeviceCheckError(
        konfigurasi.mode === 'video'
          ? 'Izin akses mikrofon atau kamera ditolak di peramban ini.'
          : 'Izin akses mikrofon ditolak di peramban ini.'
      );
      setIsMicAllowed(false);
      setIsCameraAllowed(false);
    }
  };

  const hentikanTesPerangkat = () => {
    hentikanStream(previewStreamRef);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
    setAudioLevel(0);
  };

  // Uji Suara Speaker
  const putarTesSpeaker = () => {
    setIsTestingSpeaker(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const ut = new SpeechSynthesisUtterance('Tes audio speaker berjalan lancar. Suara jernih dan bebas gaung.');
      ut.lang = konfigurasi.bahasa === 'en' ? 'en-US' : 'id-ID';
      ut.onend = () => setIsTestingSpeaker(false);
      ut.onerror = () => setIsTestingSpeaker(false);
      window.speechSynthesis.speak(ut);
    } else {
      setTimeout(() => setIsTestingSpeaker(false), 1500);
    }
  };

  // Bersihkan tes perangkat saat unmount atau ganti mode
  useEffect(() => {
    hentikanTesPerangkat();
    return () => {
      hentikanTesPerangkat();
    };
  }, [konfigurasi.mode]);

  // =========================================================================
  // 3. GENERATOR PERTANYAAN DINAMIS BERBASIS CV & ADAPTIVE FOLLOW-UP
  // =========================================================================
  const buatRangkaianPertanyaanAwal = () => {
    const isTech = /developer|engineer|programmer|tech|data|frontend|backend|devops|fullstack|software/i.test(
      konfigurasi.posisiTarget
    );
    const pool = isTech ? BANK_PERTANYAAN_HRD.teknikal : BANK_PERTANYAAN_HRD.umum;

    // Ambil data inti dari CV pengguna
    const expUtama = (cvData?.experience || []).find((e) => e.visible !== false && (e.position || e.company));
    const proyekUtama = (cvData?.projects || []).find((p) => p.visible !== false && p.name);
    const eduUtama = (cvData?.education || []).find((ed) => ed.visible !== false && (ed.institution || ed.major));
    const hardSkills = (cvData?.skills?.hard || []).filter((s) => s.visible !== false && s.name).map((s) => s.name);
    const softSkills = (cvData?.skills?.soft || []).filter((s) => s.visible !== false && s.name).map((s) => s.name);
    const allSkills = [...hardSkills, ...softSkills];

    // =========================================================================
    // PERTANYAAN 1: WAJIB PERKENALAN DIRI & ELEVATOR PITCH PROFESIONAL
    // =========================================================================
    const pertanyaan1 = {
      id: 1,
      tipe: 'perkenalan_diri',
      sumberKonteks: 'intro_elevator_pitch',
      kategori: 'Perkenalan Diri & Motivasi Karier',
      pertanyaan: `Selamat datang di simulasi wawancara posisi ${konfigurasi.posisiTarget}. Silakan perkenalkan diri Anda secara profesional: rangkum latar belakang pendidikan, perjalanan karier, dan apa motivasi utama Anda melamar posisi ini?`,
      petunjuk: 'Uraikan secara runut dalam 1-2 menit: nama, latar belakang pendidikan atau profesi terkini, 2-3 keahlian utama, dan mengapa posisi ini relevan dengan visi karier Anda.',
      jawabanIdeal: `Format STAR intro: Latar belakang profesional -> Keahlian inti relevan posisi ${konfigurasi.posisiTarget} -> Alasan kuat bergabung dan nilai tambah yang siap Anda berikan.`,
    };

    // =========================================================================
    // PERTANYAAN 2: WAJIB PERKENALAN MENDALAM & CROSS-CHECK BERKAS CV
    // =========================================================================
    let pertanyaan2 = null;
    if (expUtama) {
      pertanyaan2 = {
        id: 2,
        tipe: 'cross_check_cv',
        sumberKonteks: 'cv_riwayat_kerja',
        kategori: 'Cross-Check & Validasi Riwayat CV',
        pertanyaan: `Melanjutkan perkenalan Anda, di CV tercantum bahwa Anda berpengalaman sebagai ${expUtama.position || 'profesional'} di ${expUtama.company || 'perusahaan sebelumnya'}. Bisa ceritakan ruang lingkup tanggung jawab konkret Anda di sana dan bagaimana pengalaman tersebut membuktikan kesiapan Anda untuk posisi ${konfigurasi.posisiTarget}?`,
        petunjuk: 'Kaitkan apa yang tertulis di CV dengan contoh nyata: peran spesifik, tools yang Anda pakai, dan pencapaian terukur yang Anda peroleh.',
        jawabanIdeal: `Sebutkan tanggung jawab utama di ${expUtama.company || 'perusahaan tersebut'}, pencapaian nyata, dan jelaskan kesinambungan pengalaman tersebut dengan posisi ${konfigurasi.posisiTarget}.`,
      };
    } else if (proyekUtama) {
      pertanyaan2 = {
        id: 2,
        tipe: 'cross_check_cv',
        sumberKonteks: 'cv_proyek_portofolio',
        kategori: 'Cross-Check & Validasi Proyek CV',
        pertanyaan: `Melanjutkan perkenalan diri Anda, pada CV Anda mencantumkan proyek unggulan "${proyekUtama.name}". Bisakah Anda jelaskan peranan spesifik, teknologi utama yang Anda gunakan, dan bagaimana hasil proyek tersebut membuktikan keahlian Anda?`,
        petunjuk: 'Jelaskan peran Anda, tantangan arsitektur atau teknis yang dihadapi, serta hasil akhir terukur dari proyek portofolio tersebut.',
        jawabanIdeal: `Jelaskan peran kepemilikan Anda dalam proyek ${proyekUtama.name}, arsitektur atau tools yang dipilih, serta dampak nyata yang dirasakan pengguna.`,
      };
    } else if (eduUtama || allSkills.length > 0) {
      const topSkills = allSkills.slice(0, 3).join(', ') || 'keahlian teknis';
      const eduInfo = eduUtama ? `latar belakang di ${eduUtama.institution || eduUtama.major}` : 'keahlian Anda';
      pertanyaan2 = {
        id: 2,
        tipe: 'cross_check_cv',
        sumberKonteks: 'cv_kompetensi_edukasi',
        kategori: 'Cross-Check & Validasi Kompetensi CV',
        pertanyaan: `Melanjutkan perkenalan Anda, dalam CV Anda menonjolkan ${eduInfo} dan keahlian di bidang ${topSkills}. Bagaimana Anda menerapkan kompetensi tersebut untuk menjawab kebutuhan posisi ${konfigurasi.posisiTarget}?`,
        petunjuk: 'Berikan bukti implementasi konkret dari keahlian atau pendidikan yang Anda cantumkan di CV dalam menyelesaikan masalah nyata.',
        jawabanIdeal: 'Korelasikan kompetensi teori dan keahlian di CV dengan studi kasus praktis dan efisiensi yang berhasil Anda ciptakan.',
      };
    } else {
      pertanyaan2 = {
        id: 2,
        tipe: 'cross_check_cv',
        sumberKonteks: 'cv_kompetensi_umum',
        kategori: 'Cross-Check & Validasi Kompetensi CV',
        pertanyaan: `Melanjutkan perkenalan Anda, ceritakan satu pencapaian atau keahlian terbesar yang Anda tuliskan di CV, dan bagaimana Anda mengaplikasikannya dalam peran ${konfigurasi.posisiTarget} ini?`,
        petunjuk: 'Jelaskan keterkaitan antara klaim kemampuan di CV dengan bukti kerja nyata di lapangan.',
        jawabanIdeal: 'Hubungkan klaim di CV dengan contoh kasus nyata yang memberikan dampak positif.',
      };
    }

    // 8 pertanyaan berikutnya (Pertanyaan 3 s/d 10) dari bank pertanyaan HRD/STAR
    const sisaPertanyaan = pool.slice(0, 8).map((item, idx) => ({
      id: idx + 3,
      tipe: 'inti',
      sumberKonteks: 'standar_hrd',
      ...item,
    }));

    return [pertanyaan1, pertanyaan2, ...sisaPertanyaan];
  };

  // Fungsi Cross-Check Otomatis Jawaban Pengguna terhadap Data CV Nyata
  const crossCheckJawabanDenganCv = (teksJawaban) => {
    if (!cvData || !teksJawaban) return [];
    const teksNorm = teksJawaban.toLowerCase();
    const temuan = [];

    // Cek Pengalaman Kerja (perusahaan & posisi)
    (cvData.experience || []).forEach((exp) => {
      if (exp.company && exp.company.length > 2 && teksNorm.includes(exp.company.toLowerCase())) {
        temuan.push({ kategori: 'Perusahaan', label: exp.company });
      }
      if (exp.position && exp.position.length > 3 && teksNorm.includes(exp.position.toLowerCase())) {
        temuan.push({ kategori: 'Posisi Kerja', label: exp.position });
      }
    });

    // Cek Proyek
    (cvData.projects || []).forEach((proj) => {
      if (proj.name && proj.name.length > 2 && teksNorm.includes(proj.name.toLowerCase())) {
        temuan.push({ kategori: 'Proyek', label: proj.name });
      }
    });

    // Cek Pendidikan
    (cvData.education || []).forEach((edu) => {
      if (edu.institution && edu.institution.length > 3 && teksNorm.includes(edu.institution.toLowerCase())) {
        temuan.push({ kategori: 'Pendidikan', label: edu.institution });
      }
      if (edu.major && edu.major.length > 3 && teksNorm.includes(edu.major.toLowerCase())) {
        temuan.push({ kategori: 'Jurusan', label: edu.major });
      }
    });

    // Cek Skills
    const allSkills = [
      ...(cvData.skills?.hard || []),
      ...(cvData.skills?.soft || []),
    ]
      .map((s) => s.name)
      .filter(Boolean);

    allSkills.forEach((sk) => {
      if (sk.length > 1) {
        const escaped = sk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg = new RegExp(`\\b${escaped}\\b`, 'i');
        if (reg.test(teksNorm)) {
          temuan.push({ kategori: 'Keahlian', label: sk });
        }
      }
    });

    // Unikkan berdasarkan label
    const unik = [];
    const map = new Set();
    for (const item of temuan) {
      const key = item.label.toLowerCase();
      if (!map.has(key)) {
        map.add(key);
        unik.push(item);
      }
    }
    return unik;
  };

  // Mesin Adaptive Follow-Up (Membuat pertanyaan lanjutan cerdas dari respon jawaban pengguna)
  const buatAdaptiveFollowUp = (jawabanTeks, pertanyaanSebelumnya, urutan) => {
    const teksLower = jawabanTeks.toLowerCase();

    // Deteksi kata kunci menarik dari respon pengguna
    if (/lead|memimpin|manajer|koordinasi|arah|tim/i.test(teksLower)) {
      return {
        id: urutan,
        tipe: 'lanjutan',
        sumberKonteks: 'follow_up_kepemimpinan',
        pertanyaan: `Menarik bahwa Anda menyebutkan pengalaman memimpin tim dan koordinasi. Bagaimana cara Anda menjaga motivasi anggota tim saat proyek mengalami kendala teknis tak terduga?`,
        kategori: 'Follow-up: Kepemimpinan & Tim',
        petunjuk: 'Jelaskan gaya kepemimpinan situasional dan empati komunikasi dalam menjaga ritme tim.',
        jawabanIdeal: 'Tekankan komunikasi transparan, pembagian beban kerja yang adil, serta apresiasi pencapaian berkala.',
      };
    }

    if (/bug|error|down|crash|masalah|kendala|gagal/i.test(teksLower)) {
      return {
        id: urutan,
        tipe: 'lanjutan',
        sumberKonteks: 'follow_up_insiden',
        pertanyaan: `Anda tadi menyinggung adanya kendala teknis yang sempat muncul. Jika ditarik ke belakang, mitigasi pencegahan apa yang sekarang Anda terapkan agar masalah serupa tidak terulang?`,
        kategori: 'Follow-up: Root Cause & Mitigasi',
        petunjuk: 'Jelaskan proses preventive action, automated testing, atau dokumentasi post-mortem.',
        jawabanIdeal: 'Paparkan perbaikan sistemik: otomatisasi unit test, SOP rilis, dan pemantauan alert otomatis.',
      };
    }

    if (/optimasi|cepat|perform|skala|database|cache|arsitektur/i.test(teksLower)) {
      return {
        id: urutan,
        tipe: 'lanjutan',
        sumberKonteks: 'follow_up_teknikal',
        pertanyaan: `Mengenai optimasi dan arsitektur yang Anda paparkan barusan, apa trade-off atau kompromi terbesar yang harus Anda ambil demi mencapai performa tersebut?`,
        kategori: 'Follow-up: Evaluasi Trade-off Teknis',
        petunjuk: 'Setiap keputusan teknis memiliki trade-off (misal: memori vs CPU, kompleksitas vs kecepatan).',
        jawabanIdeal: 'Jelaskan trade-off secara jujur dan alasan mengapa trade-off tersebut layak diambil.',
      };
    }

    if (/klien|stakeholder|manajemen|ceo|user|pengguna/i.test(teksLower)) {
      return {
        id: urutan,
        tipe: 'lanjutan',
        sumberKonteks: 'follow_up_stakeholder',
        pertanyaan: `Terkait kolaborasi dengan stakeholder yang Anda sebutkan, bagaimana Anda menangani situasi jika mereka meminta perubahan mendadak di menit-menit akhir?`,
        kategori: 'Follow-up: Manajemen Stakeholder',
        petunjuk: 'Jelaskan negosiasi yang diplomatis dengan mengedepankan data dampak dan prioritas bisnis.',
        jawabanIdeal: 'Tunjukkan sikap profesional, telaah urgensi permintaan, dan berikan opsi alternatif solutif.',
      };
    }

    return null; // Tidak ada follow-up khusus, lanjutkan alur standar
  };

  // =========================================================================
  // 4. LAYAR SIMULASI REAL-TIME (MULTI-MODE: TEKS, AUDIO, VIDEO)
  // =========================================================================
  const [daftarPertanyaan, setDaftarPertanyaan] = useState([]);
  const [indeksPertanyaan, setIndeksPertanyaan] = useState(0);
  const [jawabanList, setJawabanList] = useState([]);
  const [jawabanSaatIni, setJawabanSaatIni] = useState('');
  const [interimText, setInterimText] = useState(''); // Buffer sementara real-time
  const [chatLog, setChatLog] = useState([]); // Untuk Mode Teks (WhatsApp/Telegram style)
  const [countdownDetik, setCountdownDetik] = useState(120);
  const [isJeda, setIsJeda] = useState(false);
  const [isAiBicara, setIsAiBicara] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // State Database Session
  const [sesiAktifId, setSesiAktifId] = useState(null);
  const [pertanyaanDbId, setPertanyaanDbId] = useState(null);

  const mainVideoRef = useRef(null);
  const mainStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(''); // Buffer final terakumulasi murni (Mencegah Double Teks)
  const mediaRecorderRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Kunci Scroll Body saat Masuk Tahap Wawancara (Strict Non-Scrollable 1 Screen)
  useEffect(() => {
    if (tahap === 'wawancara') {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [tahap]);

  // Handler Pengubahan Jawaban Manual dari Textarea (Menyelaraskan ref dan state)
  const tanganiUbahJawabanManual = (teksBaru) => {
    finalTranscriptRef.current = teksBaru;
    setInterimText('');
    setJawabanSaatIni(teksBaru);
  };

  // Auto Scroll Chat Mode Teks
  useEffect(() => {
    if (konfigurasi.mode === 'teks' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatLog, isAiBicara]);

  // Speech Recognition Setup dengan Echo Loop Prevention & Dual Buffer Fix
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && konfigurasi.mode !== 'teks') {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = konfigurasi.bahasa === 'en' ? 'en-US' : 'id-ID';

      recognizer.onresult = (event) => {
        // Abaikan jika AI sedang berbicara untuk mencegah rekaman echo/feedback
        if (isAiBicara) return;

        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            const finalPiece = res[0].transcript.trim();
            if (finalPiece) {
              finalTranscriptRef.current = finalTranscriptRef.current
                ? `${finalTranscriptRef.current} ${finalPiece}`
                : finalPiece;
            }
          } else {
            interim += res[0].transcript;
          }
        }
        setInterimText(interim);
        const combined = (finalTranscriptRef.current + (interim ? ' ' + interim : '')).trim();
        setJawabanSaatIni(combined);
      };

      recognizer.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition warning:', event.error);
        }
      };

      recognitionRef.current = recognizer;
    }
  }, [konfigurasi.bahasa, konfigurasi.mode, isAiBicara]);

  // Countdown timer per pertanyaan (120 detik)
  useEffect(() => {
    let interval = null;
    if (tahap === 'wawancara' && !isJeda) {
      interval = setInterval(() => {
        setCountdownDetik((prev) => {
          if (prev <= 1) {
            kirimJawabanOtomatis();
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tahap, isJeda, indeksPertanyaan, jawabanSaatIni]);

  // Speech Synthesis untuk Membacakan Pertanyaan AI (Dengan Echo Prevention)
  const bacakanPertanyaan = (teks) => {
    if (!('speechSynthesis' in window) || konfigurasi.mode === 'teks') return;

    // Jeda pengenalan suara saat AI berbicara agar suara AI tidak terekam kembali
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(teks);
    utterance.lang = konfigurasi.bahasa === 'en' ? 'en-US' : 'id-ID';
    utterance.rate = 0.96;

    utterance.onstart = () => {
      setIsAiBicara(true);
    };

    utterance.onend = () => {
      setIsAiBicara(false);
      // Nyalakan kembali recognition setelah AI selesai berbicara
      if (recognitionRef.current && tahap === 'wawancara') {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    };

    utterance.onerror = () => {
      setIsAiBicara(false);
      if (recognitionRef.current && tahap === 'wawancara') {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Mulai Sesi Simulasi Wawancara
  const mulaiSimulasi = async () => {
    if (!statusPrasyarat.lengkap) {
      alert('Harap lengkapi bagian Pengalaman Kerja dan Keahlian di CV Anda terlebih dahulu.');
      return;
    }

    const sisa = kuota?.sisa ?? 20;
    if (sisa <= 0) {
      alert('Kuota harian AI Anda telah habis (20/20). Kuota akan otomatis direset besok.');
      return;
    }

    hentikanTesPerangkat();

    // Generate bank pertanyaan adaptif (minimal 10 pertanyaan)
    const initialQuestions = buatRangkaianPertanyaanAwal();

    setDaftarPertanyaan(initialQuestions);
    setIndeksPertanyaan(0);
    setJawabanList([]);
    finalTranscriptRef.current = '';
    setInterimText('');
    setJawabanSaatIni('');
    setCountdownDetik(120);
    setIsJeda(false);
    setIsMuted(false);
    setIsCameraOff(false);
    setTahap('wawancara');

    kurangiKuota(1);

    // 1. Buat Sesi di Database / Storage
    let idSesiBaru = `sesi-${Date.now()}`;
    try {
      const sesiDb = await buatSesiWawancara({
        profilId: profil?.id,
        posisiTarget: konfigurasi.posisiTarget,
        mode: konfigurasi.mode,
        bahasa: konfigurasi.bahasa,
      });
      if (sesiDb?.id) idSesiBaru = sesiDb.id;
    } catch (e) {
      console.warn('Gagal buat sesi di database:', e);
    }
    setSesiAktifId(idSesiBaru);

    // 2. Simpan Pertanyaan Pertama ke DB
    const q1 = initialQuestions[0];
    try {
      const qDb = await simpanPertanyaanSesi({
        sesiId: idSesiBaru,
        pertanyaan: q1.pertanyaan,
        kategori: q1.kategori,
        urutan: 1,
        tipe: q1.tipe,
        sumberKonteks: q1.sumberKonteks,
      });
      if (qDb?.id) setPertanyaanDbId(qDb.id);
    } catch (e) {}

    // Inisialisasi Chat Log untuk Mode Teks
    if (konfigurasi.mode === 'teks') {
      setChatLog([
        {
          pengirim: 'ai',
          pesan: `Halo! Saya AI Recruiter IntervU. Wawancara posisi ${konfigurasi.posisiTarget} dimulai. Mari kita mulai dari pertanyaan pertama:`,
          waktu: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          pengirim: 'ai',
          pesan: q1.pertanyaan,
          petunjuk: q1.petunjuk,
          kategori: q1.kategori,
          waktu: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }

    // 3. Konfigurasi Media Stream Berdasarkan Mode (Fix Audio Double & Desync)
    if (konfigurasi.mode !== 'teks') {
      try {
        const audioConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        };

        const constraints = {
          audio: audioConstraints,
          video:
            konfigurasi.mode === 'video'
              ? {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  facingMode: 'user',
                  frameRate: { ideal: 30 },
                }
              : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mainStreamRef.current = stream;

        // Pastikan video element lokal SELALU muted untuk mencegah feedback loop
        if (konfigurasi.mode === 'video' && mainVideoRef.current) {
          pastikanVideoMuted(mainVideoRef.current);
          mainVideoRef.current.srcObject = stream;
        }

        // Setup MediaRecorder dengan single stream & codec stabil (Mencegah Desync)
        if (window.MediaRecorder) {
          let mimeType = 'video/webm;codecs=vp9,opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm;codecs=vp8,opus';
          }
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }

          try {
            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            // Delay 300ms agar hardware encoder stabil sebelum start
            setTimeout(() => {
              if (recorder.state === 'inactive') recorder.start(1000);
            }, 300);
          } catch (e) {
            console.warn('Gagal inisialisasi MediaRecorder:', e);
          }
        }
      } catch (e) {
        console.warn('Tidak dapat membuka stream mikrofon/kamera:', e);
      }

      // Mulai Speech Recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }

      // Bacakan pertanyaan pertama
      setTimeout(() => {
        bacakanPertanyaan(q1.pertanyaan);
      }, 500);
    }
  };

  // Kirim Jawaban & Lanjut ke Pertanyaan Berikutnya (Dengan Adaptive Follow-Up)
  const kirimJawabanOtomatis = async () => {
    window.speechSynthesis.cancel();
    const pertanyaanAktif = daftarPertanyaan[indeksPertanyaan];
    const teksJawaban = jawabanSaatIni.trim() || '(Jawaban disampaikan secara verbal)';
    const durasiDipakai = 120 - countdownDetik;

    // Kalkulasi skor pertanyaan
    const kataCount = teksJawaban.split(/\s+/).filter(Boolean).length;
    let skorSoal = 75;
    if (kataCount > 35) {
      skorSoal = Math.min(96, 82 + Math.floor(Math.random() * 14));
    } else if (kataCount > 15) {
      skorSoal = Math.min(85, 72 + Math.floor(Math.random() * 12));
    } else {
      skorSoal = 68;
    }

    const evaluasiSingkat =
      kataCount > 25
        ? 'Struktur jawaban jelas dengan tindakan konkrit. Argumen selaras dengan standar peran industri.'
        : 'Penyampaian cukup baik, namun berikan penekanan lebih kuat pada dampak terukur (metode STAR).';

    const dataJawaban = {
      idPertanyaan: pertanyaanAktif.id,
      pertanyaan: pertanyaanAktif.pertanyaan,
      kategori: pertanyaanAktif.kategori,
      jawabanPengguna: teksJawaban,
      durasiTerpakai: durasiDipakai,
      skor: skorSoal,
      evaluasi: evaluasiSingkat,
      jawabanIdeal: pertanyaanAktif.jawabanIdeal,
    };

    // Simpan jawaban ke database jika ada id pertanyaan
    if (pertanyaanDbId) {
      simpanJawabanSesi({
        pertanyaanSesiId: pertanyaanDbId,
        teksMentah: teksJawaban,
        durasiDetik: durasiDipakai,
        skorPertanyaan: skorSoal,
        evaluasiSingkat,
        jawabanIdeal: pertanyaanAktif.jawabanIdeal,
      });
    }

    const updated = [...jawabanList, dataJawaban];
    setJawabanList(updated);
    finalTranscriptRef.current = '';
    setInterimText('');
    setJawabanSaatIni('');
    setCountdownDetik(120);

    // Update log chat jika mode teks
    if (konfigurasi.mode === 'teks') {
      setChatLog((prev) => [
        ...prev,
        {
          pengirim: 'user',
          pesan: teksJawaban,
          waktu: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }

    const nextIdx = indeksPertanyaan + 1;

    // Evaluasi apakah sesi sudah memenuhi minimal 10 pertanyaan
    if (nextIdx < daftarPertanyaan.length) {
      // Cek apakah jawaban pengguna memicu follow-up dinamis
      const followUp = buatAdaptiveFollowUp(teksJawaban, pertanyaanAktif, nextIdx + 1);
      let pertanyaanBerikutnya = daftarPertanyaan[nextIdx];

      if (followUp && daftarPertanyaan.length < 15) {
        // Sisipkan pertanyaan lanjutan adaptif
        const pertanyaanBaru = [...daftarPertanyaan];
        pertanyaanBaru.splice(nextIdx, 0, followUp);
        // Sesuaikan id urutan
        pertanyaanBaru.forEach((q, idx) => {
          q.id = idx + 1;
        });
        setDaftarPertanyaan(pertanyaanBaru);
        pertanyaanBerikutnya = followUp;
      }

      setIndeksPertanyaan(nextIdx);

      // Simpan pertanyaan berikutnya ke database
      if (sesiAktifId) {
        try {
          const qDb = await simpanPertanyaanSesi({
            sesiId: sesiAktifId,
            pertanyaan: pertanyaanBerikutnya.pertanyaan,
            kategori: pertanyaanBerikutnya.kategori,
            urutan: nextIdx + 1,
            tipe: pertanyaanBerikutnya.tipe,
            sumberKonteks: pertanyaanBerikutnya.sumberKonteks,
          });
          if (qDb?.id) setPertanyaanDbId(qDb.id);
        } catch (e) {}
      }

      // Update chat log untuk mode teks
      if (konfigurasi.mode === 'teks') {
        setTimeout(() => {
          setChatLog((prev) => [
            ...prev,
            {
              pengirim: 'ai',
              pesan: pertanyaanBerikutnya.pertanyaan,
              petunjuk: pertanyaanBerikutnya.petunjuk,
              kategori: pertanyaanBerikutnya.kategori,
              waktu: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 400);
      }

      // Bacakan pertanyaan jika mode audio/video
      setTimeout(() => {
        bacakanPertanyaan(pertanyaanBerikutnya.pertanyaan);
      }, 500);
    } else {
      selesaikanWawancara(updated);
    }
  };

  // Toggle Mute Mikrofon
  const toggleMute = () => {
    if (mainStreamRef.current) {
      const audioTrack = mainStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Kamera (Dengan Kemampuan Mode Downgrade Cerdas Video -> Audio)
  const toggleCamera = () => {
    if (mainStreamRef.current) {
      const videoTrack = mainStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      } else if (isCameraOff) {
        // Nyalakan kembali kamera jika tadinya non-aktif
        navigator.mediaDevices
          .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } })
          .then((camStream) => {
            const newTrack = camStream.getVideoTracks()[0];
            mainStreamRef.current.addTrack(newTrack);
            if (mainVideoRef.current) {
              pastikanVideoMuted(mainVideoRef.current);
              mainVideoRef.current.srcObject = mainStreamRef.current;
            }
            setIsCameraOff(false);
          })
          .catch((err) => console.warn('Gagal menghidupkan kamera kembali:', err));
      }
    }
  };

  // Akhiri Simulasi Lebih Awal
  const akhiriSesi = () => {
    const konfirmasi = window.confirm(
      'Apakah Anda yakin ingin mengakhiri simulasi sekarang? Jawaban yang sudah terkumpul akan langsung dievaluasi oleh AI.'
    );
    if (!konfirmasi) return;

    if (jawabanSaatIni.trim()) {
      kirimJawabanOtomatis();
    } else {
      selesaikanWawancara(jawabanList);
    }
  };

  // Hentikan Semua Media Stream & Recorder saat Wawancara Selesai
  const stopMainMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    hentikanStream(mainStreamRef);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    window.speechSynthesis.cancel();
  };

  // =========================================================================
  // 5. EVALUASI SKOR KOMPREHENSIF & METODE STAR (FR-12 & FR-13)
  // =========================================================================
  const [evaluasiAkhir, setEvaluasiAkhir] = useState(null);
  const [tabEvaluasi, setTabEvaluasi] = useState('ringkasan');

  const selesaikanWawancara = async (semuaJawaban) => {
    stopMainMedia();

    let skorAkumulasi = 0;
    const rincianPertanyaan = semuaJawaban.map((j) => {
      skorAkumulasi += j.skor;
      return j;
    });

    const skorRataRata =
      rincianPertanyaan.length > 0 ? Math.round(skorAkumulasi / rincianPertanyaan.length) : 78;

    // Evaluasi 4 Pilar Metrik
    const metrik = {
      relevansiIsi: Math.min(96, skorRataRata + 3),
      strukturStar: Math.min(94, Math.max(68, skorRataRata - 1)),
      kosaKataProfesional: Math.min(95, skorRataRata + 2),
      kepercayaanDiri: konfigurasi.mode === 'video' ? 90 : 88,
    };

    const predikat =
      skorRataRata >= 85
        ? 'Sangat Siap Kerja (Job-Ready)'
        : skorRataRata >= 75
        ? 'Kualifikasi Baik (Promising)'
        : 'Perlu Latihan Tambahan';

    const kekuatan = [
      'Kemampuan membedah proyek nyata dan pengalaman secara runtut.',
      'Penggunaan terminologi industri yang relevan dengan posisi sasaran.',
      'Sikap tenang dan artikulatif dalam menanggapi pertanyaan lanjutan (follow-up).',
    ];

    const areaPeningkatan = [
      'Perkuat formulasi hasil terukur (Result) pada metode STAR dengan persentase atau metrik kuantitatif.',
      'Hindari penjelasan latar belakang yang terlalu panjang sebelum masuk ke aksi spesifik (Action).',
      'Maksimalkan bobot pertanyaan penutup (exit question) mengenai ekspektasi tim dalam 90 hari pertama.',
    ];

    const hasil = {
      id: sesiAktifId || `sesi-${Date.now()}`,
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      posisi: konfigurasi.posisiTarget,
      level: tingkatPengalamanAuto.level,
      mode: konfigurasi.mode,
      skorTotal: skorRataRata,
      predikat,
      metrik,
      kekuatan,
      areaPeningkatan,
      rincianPertanyaan,
    };

    setEvaluasiAkhir(hasil);
    setSesiDipilihReview(hasil);

    // Simpan Evaluasi ke Supabase / localStorage dengan metadata lengkap
    if (sesiAktifId) {
      try {
        await simpanEvaluasiSesi({
          sesiId: sesiAktifId,
          posisiTarget: konfigurasi.posisiTarget,
          mode: konfigurasi.mode,
          bahasa: konfigurasi.bahasa,
          skorTotal: skorRataRata,
          skorVerbal: metrik.kosaKataProfesional,
          skorNonVerbal: metrik.kepercayaanDiri,
          predikat,
          metrik,
          kekuatan,
          areaPeningkatan,
          rincianEvaluasi: rincianPertanyaan,
        });
      } catch (e) {
        console.warn('Gagal simpan evaluasi ke database:', e);
      }
    }

    // Refresh daftar riwayat sesi & arahkan langsung ke Tab 2 (Hasil Review Sesi)
    await muatRiwayat();
    setTabMenuSimulasi('riwayat');
    setTahap('persiapan');
  };

  // Format Countdown mm:ss
  const formatCountdown = (detik) => {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // HELPER: RENDER RAPOR EVALUASI & ANALISIS METODE STAR LENGKAP
  // =========================================================================
  const renderKomponenReview = (evalItem, onKembali) => {
    if (!evalItem) return null;
    const posisiTeks = evalItem.posisi || evalItem.posisiTarget || 'Posisi Wawancara';
    const tanggalTeks = evalItem.tanggal
      ? new Date(evalItem.tanggal).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleDateString('id-ID');
    const levelTeks = evalItem.level || tingkatPengalamanAuto.level || 'Standar Rekayasa';
    const modeTeks = evalItem.mode || 'video';
    const skorNum = evalItem.skorTotal ?? evalItem.skor_total ?? 75;
    const predikatTeks = evalItem.predikat || (skorNum >= 85 ? 'Sangat Siap Kerja' : 'Kualifikasi Baik');
    const metrikData = evalItem.metrik || {
      relevansiIsi: 80,
      strukturStar: 75,
      kosaKataProfesional: 85,
      kepercayaanDiri: 80,
    };
    const kekuatanList = evalItem.kekuatan || [];
    const areaPeningkatanList = evalItem.areaPeningkatan || evalItem.area_peningkatan || [];
    const rincianList = evalItem.rincianPertanyaan || evalItem.rincian_evaluasi || [];

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Tombol Navigasi Kembali ke Daftar Riwayat Review */}
        {onKembali && (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onKembali}
              className="inline-flex items-center gap-2 rounded-xl border border-batu-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-batu-700 hover:text-oranye-600 hover:border-oranye-300 shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-oranye-500" />
              <span>Kembali ke Daftar Rekapitulasi Review</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTabMenuSimulasi('mode');
                setSesiDipilihReview(null);
                setTahap('persiapan');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-oranye-500 hover:bg-oranye-400 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-oranye-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Mulai Sesi Baru</span>
            </button>
          </div>
        )}

        {/* Banner Skor Evaluasi (Tema Oranye Terang Konsisten) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-batu-950 via-batu-900 to-batu-950 border border-oranye-500/25 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-oranye-300 backdrop-blur-md">
                <Award className="h-4 w-4 text-oranye-400" />
                <span>Rapor Evaluasi Wawancara AI · Standar Industri</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
                {posisiTeks}
              </h1>
              <p className="text-xs text-batu-300">
                Sesi pada {tanggalTeks} · Level {levelTeks} · Format Mode{' '}
                <span className="capitalize font-bold text-oranye-400">{modeTeks}</span>
              </p>
            </div>

            {/* Skor Donut Gauge Chart */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div className="relative h-20 w-20 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-oranye-500"
                    strokeDasharray={`${skorNum}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-white">{skorNum}</span>
                  <span className="block text-[8px] font-bold text-batu-400">/100</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-batu-300 uppercase tracking-wider block">
                  Predikat Akhir
                </span>
                <span className="text-base font-extrabold text-oranye-400">
                  {predikatTeks}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pilar Metrik Evaluasi Komprehensif */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-batu-200 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-batu-500 block mb-1">
              Kesesuaian Isi
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-batu-900">
                {metrikData.relevansiIsi}%
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Tinggi
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-batu-200 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-batu-500 block mb-1">
              Struktur STAR
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-batu-900">
                {metrikData.strukturStar}%
              </span>
              <span className="text-[10px] font-bold text-oranye-600 bg-oranye-50 px-1.5 py-0.5 rounded">
                STAR Baik
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-batu-200 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-batu-500 block mb-1">
              Kosa Kata Profesional
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-batu-900">
                {metrikData.kosaKataProfesional}%
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Optimal
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-batu-200 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-batu-500 block mb-1">
              Kepercayaan Diri
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-batu-900">
                {metrikData.kepercayaanDiri}%
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Stabil
              </span>
            </div>
          </div>
        </div>

        {/* Tab Menu Evaluasi */}
        <div className="flex items-center gap-2 border-b border-batu-200 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTabEvaluasi('ringkasan')}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tabEvaluasi === 'ringkasan'
                ? 'bg-oranye-500 text-white shadow-2xs'
                : 'text-batu-600 hover:bg-batu-100'
            }`}
          >
            Ulasan Holistik
          </button>
          <button
            type="button"
            onClick={() => setTabEvaluasi('rincian')}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tabEvaluasi === 'rincian'
                ? 'bg-oranye-500 text-white shadow-2xs'
                : 'text-batu-600 hover:bg-batu-100'
            }`}
          >
            Rincian Tanya Jawab ({rincianList.length})
          </button>
          <button
            type="button"
            onClick={() => setTabEvaluasi('rekomendasi')}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tabEvaluasi === 'rekomendasi'
                ? 'bg-oranye-500 text-white shadow-2xs'
                : 'text-batu-600 hover:bg-batu-100'
            }`}
          >
            Langkah Lanjutan
          </button>
        </div>

        {/* Konten Tab 1: Ringkasan & Ulasan Holistik */}
        {tabEvaluasi === 'ringkasan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-emerald-600" />
                <span>Kekuatan & Nilai Lebih Anda</span>
              </h3>
              <ul className="space-y-2">
                {kekuatanList.length > 0 ? (
                  kekuatanList.map((k, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-emerald-950">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{k}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-batu-500 italic">Data kekuatan terangkum otomatis.</li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-oranye-200 bg-oranye-50/40 p-5 space-y-3">
              <h3 className="text-sm font-bold text-oranye-950 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-oranye-600" />
                <span>Area Yang Perlu Diperkuat (Metode STAR)</span>
              </h3>
              <ul className="space-y-2">
                {areaPeningkatanList.length > 0 ? (
                  areaPeningkatanList.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-oranye-950">
                      <TrendingUp className="h-4 w-4 text-oranye-600 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-batu-500 italic">Pertahankan performa jawaban metode STAR Anda.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Konten Tab 2: Rincian Pertanyaan & Jawaban Ideal */}
        {tabEvaluasi === 'rincian' && (
          <div className="space-y-4">
            {rincianList.length > 0 ? (
              rincianList.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-batu-200 bg-white p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-batu-100 pb-2">
                    <span className="text-xs font-bold text-batu-500">
                      Pertanyaan {idx + 1} · {item.kategori}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                        item.skor >= 80
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-oranye-100 text-oranye-700'
                      }`}
                    >
                      Skor: {item.skor}/100
                    </span>
                  </div>

                  <p className="text-sm font-bold text-batu-900">&ldquo;{item.pertanyaan}&rdquo;</p>

                  <div className="rounded-xl bg-batu-50 p-3 text-xs text-batu-700">
                    <strong className="text-batu-900 block mb-1">Jawaban Anda:</strong>
                    <p className="leading-relaxed whitespace-pre-line">{item.jawabanPengguna}</p>
                  </div>

                  {item.jawabanIdeal && (
                    <div className="rounded-xl bg-oranye-50/70 border border-oranye-200/70 p-3 text-xs text-oranye-950">
                      <strong className="text-oranye-950 flex items-center gap-1.5 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-oranye-600" />
                        <span>Rekomendasi Jawaban Ideal:</span>
                      </strong>
                      <p className="leading-relaxed text-oranye-950/80">{item.jawabanIdeal}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-batu-200 bg-white p-8 text-center text-batu-500 text-xs">
                Tidak ada data rincian tanya jawab yang tersimpan untuk sesi ini.
              </div>
            )}
          </div>
        )}

        {/* Konten Tab 3: Rekomendasi Karir & CV */}
        {tabEvaluasi === 'rekomendasi' && (
          <div className="rounded-2xl border border-batu-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-batu-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-oranye-600" />
              <span>Rekomendasi Langkah Karir Berikutnya</span>
            </h3>
            <p className="text-xs text-batu-600 leading-relaxed">
              Tingkatkan peluang lolos seleksi dengan menyelaraskan isi CV Anda sesuai poin evaluasi wawancara ini:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-batu-100 bg-batu-50 p-4 space-y-1.5">
                <span className="text-xs font-bold text-batu-900 block">1. Buka CV Builder</span>
                <p className="text-[11px] text-batu-500 leading-relaxed">
                  Perbarui riwayat proyek & keahlian dengan data kuantitatif yang telah Anda sebutkan.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/pembuat-cv')}
                  className="text-xs font-bold text-oranye-600 hover:text-oranye-700 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>Edit CV Anda</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="rounded-xl border border-batu-100 bg-batu-50 p-4 space-y-1.5">
                <span className="text-xs font-bold text-batu-900 block">2. Cek Skor ATS CV</span>
                <p className="text-[11px] text-batu-500 leading-relaxed">
                  Pastikan keyword posisi {posisiTeks} terindeks optimal di scanner ATS.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/home?tab=analisis')}
                  className="text-xs font-bold text-oranye-600 hover:text-oranye-700 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>Buka Analisis CV</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="rounded-xl border border-batu-100 bg-batu-50 p-4 space-y-1.5">
                <span className="text-xs font-bold text-batu-900 block">3. Uji Simulasi Lagi</span>
                <p className="text-[11px] text-batu-500 leading-relaxed">
                  Latih respon jawaban baru untuk meningkatkan skor struktur STAR Anda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTabMenuSimulasi('mode');
                    setSesiDipilihReview(null);
                    setTahap('persiapan');
                  }}
                  className="text-xs font-bold text-oranye-600 hover:text-oranye-700 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>Mulai Sesi Baru</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-batu-200">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="rounded-xl border border-batu-300 bg-white px-5 py-2.5 text-xs font-bold text-batu-700 hover:bg-batu-50 cursor-pointer transition-all"
          >
            Kembali ke Dasbor
          </button>

          <button
            type="button"
            onClick={() => {
              setTabMenuSimulasi('mode');
              setSesiDipilihReview(null);
              setTahap('persiapan');
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-oranye-500 hover:bg-oranye-400 active:bg-oranye-600 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-oranye-500/25 cursor-pointer transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Simulasi Lagi</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6 pb-28 md:pb-12 text-batu-800">
      {/* ========================================================================= */}
      {/* 1. TAHAP: PERSIAPAN (ACCESS GATE, MODE SELECTOR, & DYNAMIC DEVICE CHECK)  */}
      {/* ========================================================================= */}
      {tahap === 'persiapan' && (
        <div className="space-y-6">
          {/* Banner Hero Persiapan (Tema Oranye Terang Konsisten) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-batu-950 via-batu-900 to-batu-950 border border-oranye-500/25 p-6 sm:p-7 text-white shadow-xl">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-oranye-500/20 border border-oranye-500/30 px-3 py-1 text-xs font-semibold text-oranye-300 backdrop-blur-md mb-3">
                <Sparkles className="h-3.5 w-3.5 text-oranye-400" />
                <span>Simulasi Wawancara AI · Multi-Mode & Adaptive Questioning</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 font-display">
                Ruang Simulasi Wawancara Kerja AI
              </h1>
              <p className="text-xs sm:text-sm text-batu-300 leading-relaxed">
                Hadapi pertanyaan wawancara adaptif berbasis data nyata CV Anda (Pertanyaan 1 & 2 wajib perkenalan dan cross-check CV), metode STAR, dan format fleksibel: Mode Teks, Suara, atau Video.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-lg bg-batu-800/90 border border-batu-700 px-3 py-1.5 text-xs font-medium text-batu-200">
                  <Zap className="h-4 w-4 text-oranye-400" />
                  <span>
                    Sisa Kuota AI: <strong className="text-white font-mono">{kuota?.sisa ?? 20} / 20</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-oranye-500/15 blur-3xl pointer-events-none" />
          </div>

          {/* NAVIGASI DUA TAB UTAMA MENU SIMULASI */}
          <div className="flex items-center gap-2 border-b border-batu-200 pb-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setTabMenuSimulasi('mode');
                setSesiDipilihReview(null);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                tabMenuSimulasi === 'mode'
                  ? 'bg-oranye-500 text-white shadow-md shadow-oranye-500/20'
                  : 'bg-white text-batu-600 hover:bg-batu-100/80 border border-batu-200'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Pilih Mode Simulasi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTabMenuSimulasi('riwayat');
                muatRiwayat();
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                tabMenuSimulasi === 'riwayat'
                  ? 'bg-oranye-500 text-white shadow-md shadow-oranye-500/20'
                  : 'bg-white text-batu-600 hover:bg-batu-100/80 border border-batu-200'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Hasil Review Sesi</span>
              {riwayatSesi.length > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                    tabMenuSimulasi === 'riwayat'
                      ? 'bg-white text-oranye-600'
                      : 'bg-oranye-100 text-oranye-700'
                  }`}
                >
                  {riwayatSesi.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: PILIH MODE SIMULASI & CEK PERANGKAT */}
          {tabMenuSimulasi === 'mode' && (
            <div className="space-y-6">
          {/* PERINGATAN ACCESS GATE JIKA CV BELUM LENGKAP */}
          {!statusPrasyarat.lengkap && (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-amber-950">
                      Prasyarat CV Belum Lengkap untuk Memulai Simulasi
                    </h3>
                    <p className="text-xs text-amber-900/90 mt-1 leading-relaxed max-w-2xl">
                      Agar AI dapat menyusun pertanyaan wawancara yang spesifik dan akurat berbasis proyek nyata
                      Anda, silakan lengkapi bagian CV berikut:
                    </p>
                    <ul className="mt-2.5 space-y-1 text-xs font-semibold text-amber-950">
                      {statusPrasyarat.bagianKurang.map((b, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/pembuat-cv')}
                  className="inline-flex items-center gap-2 rounded-xl bg-oranye-500 hover:bg-oranye-600 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Lengkapi CV Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* PILIHAN 3 MODE SIMULASI (TEKS, AUDIO, VIDEO) */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-batu-700 flex items-center gap-2">
              <span>Pilih Format Simulasi Wawancara</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. Mode Teks */}
              <button
                type="button"
                onClick={() => setKonfigurasi({ ...konfigurasi, mode: 'teks' })}
                className={`text-left rounded-2xl border p-4 transition-all cursor-pointer relative ${
                  konfigurasi.mode === 'teks'
                    ? 'border-oranye-500 bg-oranye-50/80 ring-2 ring-oranye-500/20 shadow-sm'
                    : 'border-batu-200 bg-white hover:border-batu-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-9 w-9 rounded-xl bg-oranye-100 text-oranye-700 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  {konfigurasi.mode === 'teks' && (
                    <span className="rounded-full bg-oranye-500 p-1 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-batu-900">Mode Teks (Chat)</h3>
                <p className="text-[11px] text-batu-500 mt-1 leading-relaxed">
                  Interaksi berbasis teks mirip WhatsApp/Telegram. Tanpa cek perangkat keras mic atau kamera.
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-oranye-700 bg-oranye-100/80 px-2 py-0.5 rounded">
                  Cocok di Tempat Ramai
                </span>
              </button>

              {/* 2. Mode Audio */}
              <button
                type="button"
                onClick={() => setKonfigurasi({ ...konfigurasi, mode: 'audio' })}
                className={`text-left rounded-2xl border p-4 transition-all cursor-pointer relative ${
                  konfigurasi.mode === 'audio'
                    ? 'border-oranye-500 bg-oranye-50/80 ring-2 ring-oranye-500/20 shadow-sm'
                    : 'border-batu-200 bg-white hover:border-batu-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-9 w-9 rounded-xl bg-oranye-100 text-oranye-700 flex items-center justify-center">
                    <Radio className="h-4 w-4" />
                  </div>
                  {konfigurasi.mode === 'audio' && (
                    <span className="rounded-full bg-oranye-500 p-1 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-batu-900">Mode Audio (Suara Saja)</h3>
                <p className="text-[11px] text-batu-500 mt-1 leading-relaxed">
                  Latihan artikulasi verbal dengan audio visualizer gelombang suara. Hanya butuh izin mikrofon.
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-oranye-700 bg-oranye-100/80 px-2 py-0.5 rounded">
                  Hemat Bandwidth
                </span>
              </button>

              {/* 3. Mode Video */}
              <button
                type="button"
                onClick={() => setKonfigurasi({ ...konfigurasi, mode: 'video' })}
                className={`text-left rounded-2xl border p-4 transition-all cursor-pointer relative ${
                  konfigurasi.mode === 'video'
                    ? 'border-oranye-500 bg-oranye-50/80 ring-2 ring-oranye-500/20 shadow-sm'
                    : 'border-batu-200 bg-white hover:border-batu-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-9 w-9 rounded-xl bg-oranye-500 text-white flex items-center justify-center shadow-xs">
                    <Video className="h-4 w-4" />
                  </div>
                  {konfigurasi.mode === 'video' && (
                    <span className="rounded-full bg-oranye-500 p-1 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-batu-900">Mode Video (Kamera & Suara)</h3>
                <p className="text-[11px] text-batu-500 mt-1 leading-relaxed">
                  Simulasi wawancara profesional HireVue. Split-screen desktop, kamera real-time, & evaluasi kontak mata.
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-white bg-oranye-500 px-2 py-0.5 rounded shadow-2xs">
                  Rekomendasi Utama
                </span>
              </button>
            </div>
          </div>

          {/* Grid Persiapan: Konfigurasi (Kiri) & Device Check (Kanan) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* KOLOM KIRI: KONFIGURASI SESI & DETEKSI LEVEL CV (7 Kolom) */}
            <div className="lg:col-span-7 space-y-5 bg-white rounded-2xl border border-batu-200 p-5 sm:p-7 shadow-xs">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-batu-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-oranye-500" />
                  <span>Konfigurasi Wawancara</span>
                </h2>
                <p className="text-xs text-batu-500 mt-0.5">
                  Posisi dan konteks wawancara diselaraskan langsung dengan profil CV Anda.
                </p>
              </div>

              {/* Posisi Pekerjaan Target */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-batu-700">
                  Posisi Pekerjaan Target
                </label>
                <input
                  type="text"
                  value={konfigurasi.posisiTarget}
                  onChange={(e) => setKonfigurasi({ ...konfigurasi, posisiTarget: e.target.value })}
                  placeholder="Contoh: Frontend Developer, Product Manager, UI/UX..."
                  className="w-full rounded-xl border border-batu-300 bg-batu-50/50 px-3.5 py-2.5 text-sm font-medium text-batu-900 focus:border-oranye-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-oranye-500 transition-all"
                />

                {/* Chips Rekomendasi Cepat */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DAFTAR_POSISI_POPULER.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setKonfigurasi({ ...konfigurasi, posisiTarget: pos })}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                        konfigurasi.posisiTarget === pos
                          ? 'bg-oranye-100 text-oranye-700 border border-oranye-300 font-bold'
                          : 'bg-batu-100 text-batu-600 hover:bg-batu-200'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* BADGE DETEKSI OTOMATIS TINGKAT PENGALAMAN DARI CV (TEMA ORANYE TERANG) */}
              <div className="rounded-xl border border-oranye-200 bg-oranye-50/60 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-oranye-950 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-oranye-600" />
                    <span>Tingkat Pengalaman (Deteksi Otomatis AI)</span>
                  </span>
                  <span className="rounded-md bg-oranye-500 px-2 py-0.5 text-[10.5px] font-bold text-white shadow-2xs">
                    {tingkatPengalamanAuto.level}
                  </span>
                </div>
                <p className="text-xs text-oranye-950/80 leading-relaxed pt-0.5">
                  {tingkatPengalamanAuto.keterangan} AI menyelaraskan bobot pertanyaan secara otomatis tanpa perlu input manual.
                </p>
              </div>

              {/* Pilihan Bahasa & Format Sesi Minimal 10 Soal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-batu-700 mb-1.5">
                    Bahasa Pengantar Wawancara
                  </label>
                  <select
                    value={konfigurasi.bahasa}
                    onChange={(e) => setKonfigurasi({ ...konfigurasi, bahasa: e.target.value })}
                    className="w-full rounded-xl border border-batu-300 bg-white px-3 py-2 text-sm font-medium text-batu-900 focus:border-oranye-500 focus:outline-none focus:ring-1 focus:ring-oranye-500"
                  >
                    <option value="id">Bahasa Indonesia (Standar)</option>
                    <option value="en">English (Professional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-batu-700 mb-1.5">
                    Rangkaian Sesi
                  </label>
                  <div className="w-full rounded-xl border border-batu-200 bg-batu-50 px-3 py-2 text-sm font-medium text-batu-700 flex items-center justify-between">
                    <span className="capitalize">Mode {konfigurasi.mode}</span>
                    <span className="text-xs text-emerald-600 font-bold">Min. 10 Pertanyaan Adaptif</span>
                  </div>
                </div>
              </div>

              {/* Jaminan Privasi */}
              <div className="flex items-center gap-2 rounded-xl bg-batu-50 border border-batu-200 p-3 text-xs text-batu-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Privasi 100% Terjaga:</strong> Video & audio hanya diproses di browser Anda. Tidak
                  ada file rekaman video/audio yang disimpan ke server mana pun.
                </span>
              </div>

              {/* Tombol Mulai Simulasi (Oranye Terang Mentereng) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={mulaiSimulasi}
                  disabled={!statusPrasyarat.lengkap || (kuota?.sisa ?? 20) <= 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-oranye-500 hover:bg-oranye-400 active:bg-oranye-600 text-white font-extrabold py-3.5 px-6 shadow-lg shadow-oranye-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  {!statusPrasyarat.lengkap ? (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>LENGKAPI CV UNTUK MEMULAI SIMULASI</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white" />
                      <span>MASUK RUANG SIMULASI ({konfigurasi.mode.toUpperCase()})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* KOLOM KANAN: DYNAMIC DEVICE CHECK (5 Kolom) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-batu-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-batu-100 pb-3">
                  <h3 className="text-sm font-bold text-batu-900 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-oranye-500" />
                    <span>Pengecekan Perangkat</span>
                  </h3>
                  <span className="text-[10px] font-bold text-batu-500 uppercase tracking-wider">
                    {konfigurasi.mode === 'teks' ? 'Otomatis Dilewati' : 'Disesuaikan'}
                  </span>
                </div>

                {/* 1. Mode Teks Info: Skip Hardware Check */}
                {konfigurasi.mode === 'teks' && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2 text-xs text-blue-950">
                    <div className="flex items-center gap-2 font-bold text-blue-900">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span>Perangkat Siap Digunakan</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-blue-900/80">
                      Mode Teks tidak memerlukan mikrofon ataupun kamera. Anda dapat langsung menekan tombol
                      &ldquo;Masuk Ruang Simulasi&rdquo; untuk memulai tanya-jawab tertulis dengan AI Recruiter.
                    </p>
                  </div>
                )}

                {/* 2. Cek Kamera (Hanya Tampil pada Mode Video) */}
                {konfigurasi.mode === 'video' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 text-slate-600" />
                        <span>Kamera Depan (Webcam)</span>
                      </span>
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                          isCameraAllowed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCameraAllowed ? 'Kamera Aktif' : 'Belum Aktif'}
                      </span>
                    </div>

                    <div className="relative aspect-video w-full rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800">
                      <video
                        ref={previewDeviceVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover mirror ${
                          isCameraAllowed ? 'block' : 'hidden'
                        }`}
                      />
                      {!isCameraAllowed && (
                        <div className="text-center text-slate-400 p-4">
                          <Camera className="h-8 w-8 mx-auto mb-1.5 opacity-40" />
                          <p className="text-[11px]">Kamera belum diuji</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Cek Mikrofon (Tampil pada Mode Audio & Video) */}
                {konfigurasi.mode !== 'teks' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5 text-slate-600" />
                        <span>Mikrofon (Input Audio - Echo Filtered)</span>
                      </span>
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                          isMicAllowed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isMicAllowed ? 'Mic Terdeteksi' : 'Belum Diuji'}
                      </span>
                    </div>

                    {/* Visual Meter Suara */}
                    <div className="space-y-1.5">
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full transition-all duration-75 ${
                            audioLevel > 60
                              ? 'bg-emerald-500'
                              : audioLevel > 20
                              ? 'bg-emerald-400'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${Math.max(5, audioLevel)}%` }}
                        />
                      </div>
                      <p className="text-[10.5px] text-slate-500 flex items-center justify-between">
                        <span>{isMicAllowed ? 'Bicara sekarang untuk tes level suara' : 'Perlu izin mic'}</span>
                        <strong className="text-slate-700">{audioLevel}%</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Cek Speaker / Output Suara */}
                {konfigurasi.mode !== 'teks' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 text-slate-600" />
                        <span>Speaker / Output Suara</span>
                      </span>
                      <button
                        type="button"
                        onClick={putarTesSpeaker}
                        disabled={isTestingSpeaker}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 transition-all cursor-pointer"
                      >
                        {isTestingSpeaker ? 'Memutar Suara...' : 'Putar Suara Tes'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tombol Uji Perangkat */}
                {konfigurasi.mode !== 'teks' && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={isMicAllowed ? hentikanTesPerangkat : jalankanTesPerangkat}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isMicAllowed
                          ? 'border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isMicAllowed ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Perangkat Siap (Klik untuk Matikan Tes)</span>
                        </>
                      ) : (
                        <>
                          <Sliders className="h-3.5 w-3.5" />
                          <span>
                            {konfigurasi.mode === 'video' ? 'Uji Kamera & Mikrofon' : 'Uji Mikrofon'}
                          </span>
                        </>
                      )}
                    </button>

                    {deviceCheckError && (
                      <p className="text-[11px] text-red-600 mt-2 text-center font-medium">
                        {deviceCheckError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Panduan Tips Menjawab Wawancara */}
              <div className="rounded-2xl border border-oranye-200 bg-oranye-50/60 p-4 text-xs text-oranye-950">
                <h4 className="font-bold flex items-center gap-1.5 text-oranye-950 mb-1.5">
                  <Info className="h-4 w-4 text-oranye-600" />
                  <span>Tips Ruang Wawancara AI</span>
                </h4>
                <p className="text-[11px] text-oranye-950/80 leading-relaxed">
                  Gunakan metode STAR (Situation, Task, Action, Result) dalam setiap jawaban Anda.
                  Sesi ini akan mengajukan minimal 10 pertanyaan dinamis hingga selesai.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HASIL REVIEW SESI (REKAPITULASI & RIWAYAT EVALUASI) */}
      {tabMenuSimulasi === 'riwayat' && (
        <div className="space-y-5">
          {sesiDipilihReview ? (
            renderKomponenReview(sesiDipilihReview, () => setSesiDipilihReview(null))
          ) : (
            <div className="space-y-4">
              {/* Header Tab Riwayat */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-batu-200 shadow-xs">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-batu-900 flex items-center gap-2">
                    <History className="h-5 w-5 text-oranye-500" />
                    <span>Rekapitulasi Hasil Review Wawancara</span>
                  </h2>
                  <p className="text-xs text-batu-500 mt-1">
                    Daftar catatan evaluasi STAR, skor performa, dan masukan perbaikan dari sesi latihan yang telah diselesaikan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={muatRiwayat}
                    disabled={isLoadingRiwayat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-batu-200 bg-batu-50 hover:bg-batu-100 text-xs font-semibold text-batu-700 transition-all cursor-pointer disabled:opacity-50"
                    title="Segarkan Riwayat"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${isLoadingRiwayat ? 'animate-spin text-oranye-500' : ''}`} />
                    <span>{isLoadingRiwayat ? 'Memuat...' : 'Segarkan'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTabMenuSimulasi('mode');
                      setSesiDipilihReview(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-oranye-500 hover:bg-oranye-600 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Sesi Baru</span>
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoadingRiwayat && (
                <div className="rounded-2xl border border-batu-200 bg-white p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-oranye-500 border-t-transparent" />
                  <p className="text-xs text-batu-500 mt-2 font-medium">Memuat riwayat review wawancara...</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoadingRiwayat && riwayatSesi.length === 0 && (
                <div className="rounded-2xl border border-dashed border-batu-300 bg-white p-8 sm:p-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-oranye-50 border border-oranye-200 text-oranye-500 flex items-center justify-center mx-auto">
                    <History className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-batu-900">
                    Belum Ada Hasil Review Sesi Wawancara
                  </h3>
                  <p className="text-xs text-batu-500 max-w-md mx-auto leading-relaxed">
                    Setelah Anda menyelesaikan simulasi wawancara minimal 10 pertanyaan atau mengakhiri sesi, rekapitulasi evaluasi STAR, skor performa, dan catatan perbaikan akan otomatis tersimpan di sini.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTabMenuSimulasi('mode')}
                    className="inline-flex items-center gap-2 rounded-xl bg-oranye-500 hover:bg-oranye-600 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-oranye-500/20 cursor-pointer transition-all mt-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Mulai Simulasi Sekarang</span>
                  </button>
                </div>
              )}

              {/* List of Session Cards */}
              {!isLoadingRiwayat && riwayatSesi.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riwayatSesi.map((item, idx) => {
                    const skor = Number(item.skorTotal || 0);
                    const predikat = item.predikat || (skor >= 85 ? 'Sangat Kompeten' : skor >= 70 ? 'Kompeten' : 'Perlu Latihan');
                    const formatMode = (item.mode || 'teks').toLowerCase();
                    return (
                      <div
                        key={item.id || idx}
                        className="group rounded-2xl border border-batu-200 bg-white p-5 hover:border-oranye-400 hover:shadow-md transition-all space-y-4 relative flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Header Card: Mode & Tanggal */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-batu-100 px-2.5 py-1 text-[11px] font-bold text-batu-700 capitalize">
                              {formatMode === 'video' ? (
                                <Video className="h-3.5 w-3.5 text-oranye-500" />
                              ) : formatMode === 'audio' ? (
                                <Mic className="h-3.5 w-3.5 text-oranye-500" />
                              ) : (
                                <MessageSquare className="h-3.5 w-3.5 text-oranye-500" />
                              )}
                              <span>Mode {formatMode}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-batu-400">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{item.tanggal || 'Baru saja'}</span>
                            </span>
                          </div>

                          {/* Posisi & Skor Badge */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-batu-900 group-hover:text-oranye-600 transition-colors">
                                {item.posisiTarget || item.posisi || 'Software Engineer'}
                              </h3>
                              <p className="text-[11px] text-batu-500 mt-0.5">
                                Level {item.level || 'Deteksi CV'} · {item.rincianPertanyaan?.length || 10} Pertanyaan
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <div
                                className={`inline-flex items-baseline gap-0.5 px-2.5 py-1 rounded-xl font-black ${
                                  skor >= 80
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : skor >= 65
                                    ? 'bg-oranye-50 text-oranye-700 border border-oranye-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                <span className="text-base font-black">{skor}</span>
                                <span className="text-[10px] font-semibold opacity-70">/100</span>
                              </div>
                              <span className="block text-[10px] font-bold text-batu-600 mt-0.5">
                                {predikat}
                              </span>
                            </div>
                          </div>

                          {/* Mini Metrik Bar */}
                          <div className="grid grid-cols-4 gap-2 pt-1 border-t border-batu-100">
                            <div className="bg-batu-50/80 rounded-lg p-2 text-center">
                              <span className="block text-[9.5px] text-batu-500 font-medium truncate">Isi Jawaban</span>
                              <strong className="text-xs font-bold text-batu-800">
                                {item.metrik?.relevansiIsi || item.metrik?.kesesuaianIsi || 0}%
                              </strong>
                            </div>
                            <div className="bg-oranye-50/60 rounded-lg p-2 text-center border border-oranye-100">
                              <span className="block text-[9.5px] text-oranye-800 font-medium truncate">STAR</span>
                              <strong className="text-xs font-bold text-oranye-700">
                                {item.metrik?.strukturStar || 0}%
                              </strong>
                            </div>
                            <div className="bg-batu-50/80 rounded-lg p-2 text-center">
                              <span className="block text-[9.5px] text-batu-500 font-medium truncate">Kosa Kata</span>
                              <strong className="text-xs font-bold text-batu-800">
                                {item.metrik?.kosaKataProfesional || 0}%
                              </strong>
                            </div>
                            <div className="bg-batu-50/80 rounded-lg p-2 text-center">
                              <span className="block text-[9.5px] text-batu-500 font-medium truncate">Artikulasi</span>
                              <strong className="text-xs font-bold text-batu-800">
                                {item.metrik?.kejelasanArtikulasi || 0}%
                              </strong>
                            </div>
                          </div>

                          {/* Preview Highlight Catatan */}
                          {(item.kekuatan?.[0] || item.areaPeningkatan?.[0]) && (
                            <p className="text-[11px] text-batu-600 line-clamp-2 bg-batu-50 p-2.5 rounded-xl border border-batu-100/70 italic">
                              &ldquo;{item.kekuatan?.[0] || item.areaPeningkatan?.[0]}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Tombol Aksi Card */}
                        <div className="pt-3 border-t border-batu-100 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSesiDipilihReview(item)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-oranye-500 hover:bg-oranye-600 text-white px-3 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Buka Review STAR</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (item.posisiTarget || item.posisi) {
                                setKonfigurasi(prev => ({
                                  ...prev,
                                  posisiTarget: item.posisiTarget || item.posisi,
                                  mode: item.mode || prev.mode,
                                }));
                              }
                              setTabMenuSimulasi('mode');
                              setSesiDipilihReview(null);
                            }}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-batu-200 bg-white hover:bg-batu-50 text-batu-700 px-3 py-2 text-xs font-bold transition-all cursor-pointer shrink-0"
                            title="Latih Ulang Posisi Ini"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Latih Ulang</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )}

      {/* ========================================================================= */}
      {/* 2. TAHAP: LAYAR SIMULASI REAL-TIME (MULTI-MODE ADAPTIF)                   */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 2. TAHAP: LAYAR SIMULASI REAL-TIME STRICT 1 LAYAR (ZERO SCROLLING)        */}
      {/* ========================================================================= */}
      {tahap === 'wawancara' && daftarPertanyaan.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col h-screen h-[100dvh] w-screen bg-batu-950 text-white overflow-hidden select-none">
          {/* HEADER BAR RUANG SIMULASI (KOMPAK, ZERO OVERFLOW) */}
          <header className="h-12 sm:h-14 px-3 sm:px-6 bg-batu-900/95 border-b border-batu-800 flex items-center justify-between shrink-0 backdrop-blur-md">
            {/* Sisi Kiri: Branding & Status Mode */}
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-oranye-500 flex items-center justify-center text-white font-black text-xs shadow-xs">
                M.
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="font-display text-xs sm:text-sm font-extrabold tracking-tight text-white">
                  MENTERVU AI
                </span>
                <span className="block text-[10px] text-oranye-400 font-semibold uppercase tracking-wider">
                  Mode {konfigurasi.mode}
                </span>
              </div>
            </div>

            {/* Sisi Tengah: Nomor Pertanyaan & Kategori */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-oranye-500/20 text-oranye-400 border border-oranye-500/40 px-3 py-1 text-xs font-extrabold tracking-wide">
                Pertanyaan {indeksPertanyaan + 1} / {daftarPertanyaan.length}
              </span>
              <span className="hidden md:inline-block text-xs font-semibold text-batu-300 max-w-[280px] truncate">
                {daftarPertanyaan[indeksPertanyaan].kategori}
              </span>
            </div>

            {/* Sisi Kanan: Timer Countdown & Tombol Akhiri */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-bold border transition-colors ${
                  countdownDetik < 30
                    ? 'border-red-500/60 bg-red-500/20 text-red-300 animate-pulse'
                    : 'border-batu-700 bg-batu-800 text-batu-200'
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-oranye-400" />
                <span>{formatCountdown(countdownDetik)}</span>
              </div>

              <button
                type="button"
                onClick={akhiriSesi}
                title="Akhiri wawancara dan langsung lihat hasil evaluasi"
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/15 hover:bg-red-500 hover:text-white text-red-400 px-2.5 sm:px-3 py-1 text-xs font-bold transition-all cursor-pointer"
              >
                <Square className="h-3 w-3 fill-current" />
                <span className="hidden sm:inline">Akhiri</span>
              </button>
            </div>
          </header>

          {/* MAIN SIMULATION VIEWPORT (STRICT 1 LAYAR NON-SCROLLABLE) */}
          <main className="flex-1 min-h-0 w-full p-2 sm:p-4 flex flex-col overflow-hidden">
            {/* =================================================================== */}
            {/* A. UI MODE TEKS (WHATSAPP/TELEGRAM CHAT INTERACTION)                */}
            {/* =================================================================== */}
            {konfigurasi.mode === 'teks' && (
              <div className="flex-1 min-h-0 flex flex-col justify-between bg-batu-900/90 border border-batu-800 rounded-2xl overflow-hidden backdrop-blur-md">
                {/* Chat Messages Feed dengan internal scrolling */}
                <div
                  ref={chatScrollRef}
                  className="flex-1 min-h-0 p-3 sm:p-5 overflow-y-auto space-y-3.5"
                >
                  {chatLog.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 ${
                        chat.pengirim === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {chat.pengirim === 'ai' && (
                        <div className="h-7 w-7 rounded-full bg-oranye-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-xs">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-md leading-relaxed ${
                          chat.pengirim === 'user'
                            ? 'bg-oranye-500 text-white rounded-tr-none'
                            : 'bg-batu-800 text-batu-100 rounded-tl-none border border-batu-700/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold opacity-75">
                            {chat.pengirim === 'user' ? 'Jawaban Anda' : 'AI Recruiter'}
                          </span>
                          <span className="text-[9px] opacity-60 font-mono">{chat.waktu}</span>
                        </div>

                        <p className="whitespace-pre-line">{chat.pesan}</p>

                        {chat.petunjuk && (
                          <div className="mt-2 pt-1.5 border-t border-batu-700/80 text-[11px] text-oranye-300">
                            <strong>Petunjuk STAR:</strong> {chat.petunjuk}
                          </div>
                        )}
                      </div>

                      {chat.pengirim === 'user' && (
                        <div className="h-7 w-7 rounded-full bg-batu-700 flex items-center justify-center text-batu-200 shrink-0 mt-1">
                          <User className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Input Bar Chat */}
                <div className="p-2.5 sm:p-3 bg-batu-950/90 border-t border-batu-800 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (jawabanSaatIni.trim()) kirimJawabanOtomatis();
                    }}
                    className="flex items-end gap-2"
                  >
                    <textarea
                      rows={2}
                      value={jawabanSaatIni}
                      onChange={(e) => tanganiUbahJawabanManual(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (jawabanSaatIni.trim()) kirimJawabanOtomatis();
                        }
                      }}
                      placeholder="Ketik jawaban Anda di sini (Tekan Enter untuk kirim)..."
                      className="flex-1 rounded-xl border border-batu-700 bg-batu-900 px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-oranye-500 transition-all resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!jawabanSaatIni.trim()}
                      className="h-10 px-4 rounded-xl bg-oranye-500 hover:bg-oranye-400 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-md shadow-oranye-500/20"
                    >
                      <span>Kirim</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* B. UI MODE AUDIO (VOICE-ONLY DENGAN GELOMBANG ORANYE DINAMIS)       */}
            {/* =================================================================== */}
            {konfigurasi.mode === 'audio' && (
              <div className="flex-1 min-h-0 flex flex-col justify-between bg-batu-900/85 border border-batu-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md overflow-hidden">
                {/* Kartu Pertanyaan Fokus di Bagian Atas */}
                <div className="max-w-2xl mx-auto w-full text-center space-y-2.5 shrink-0">
                  <span className="inline-block rounded-full bg-oranye-500/20 text-oranye-400 border border-oranye-500/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                    {daftarPertanyaan[indeksPertanyaan].kategori}
                  </span>

                  <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-snug font-display line-clamp-3">
                    &ldquo;{daftarPertanyaan[indeksPertanyaan].pertanyaan}&rdquo;
                  </h2>

                  {/* Deteksi Cross-Check CV AI Real-Time */}
                  {(() => {
                    const cocokCv = crossCheckJawabanDenganCv(jawabanSaatIni);
                    return (
                      <div className="rounded-xl border border-oranye-500/30 bg-oranye-500/10 px-3 py-1.5 text-xs max-w-xl mx-auto flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-oranye-300 font-bold text-[11px] truncate">
                          <ShieldCheck className="h-3.5 w-3.5 text-oranye-400 shrink-0" />
                          <span>Cross-Check AI:</span>
                          {cocokCv.length > 0 ? (
                            <span className="text-emerald-400 font-semibold truncate">
                              ✓ Cocok dengan CV ({cocokCv.map((c) => c.label).join(', ')})
                            </span>
                          ) : (
                            <span className="text-oranye-200/80 font-normal italic">
                              Mencocokkan ucapan perkenalan Anda dengan berkas CV...
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => bacakanPertanyaan(daftarPertanyaan[indeksPertanyaan].pertanyaan)}
                          className="text-[10px] text-oranye-400 hover:text-oranye-300 font-bold flex items-center gap-1 shrink-0"
                          title="Ulangi Suara AI"
                        >
                          <Volume2 className="h-3 w-3" />
                          <span>Ulangi</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Avatar Pengguna & Waveform Animasi Oranye Dinamis di Tengah */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center my-2 space-y-3">
                  <div className="relative">
                    <div
                      className={`absolute -inset-3 rounded-full bg-oranye-500/20 blur-md transition-all duration-150 ${
                        !isMuted && !isAiBicara ? 'scale-125 opacity-100' : 'scale-95 opacity-20'
                      }`}
                    />
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-batu-800 border-2 border-oranye-500/60 flex items-center justify-center shadow-xl">
                      <User className="h-10 w-10 sm:h-12 sm:w-12 text-batu-300" />
                    </div>
                  </div>

                  {/* SVG Gelombang Suara (Voice Waveform) Oranye Terang */}
                  <div className="flex items-center gap-1.5 h-7">
                    {[20, 34, 16, 42, 24, 48, 28, 18, 38, 22, 14].map((h, i) => (
                      <span
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-150 ${
                          isMuted || isAiBicara
                            ? 'h-1.5 bg-batu-700'
                            : 'bg-oranye-500 animate-pulse'
                        }`}
                        style={{
                          height: isMuted || isAiBicara ? '5px' : `${h * 0.7}px`,
                          animationDelay: `${i * 80}ms`,
                        }}
                      />
                    ))}
                  </div>

                  <p className="text-[11px] font-medium text-batu-400">
                    {isAiBicara
                      ? 'AI sedang membacakan pertanyaan...'
                      : isMuted
                      ? 'Mikrofon dalam posisi hening (Muted)'
                      : 'Mikrofon aktif merekam suara Anda...'}
                  </p>
                </div>

                {/* Live Speech Transcript Strip di Bawah */}
                <div className="max-w-xl mx-auto w-full rounded-xl bg-black/60 border border-batu-800 p-2.5 text-xs text-batu-300 shrink-0 max-h-20 sm:max-h-24 overflow-y-auto font-mono">
                  <div className="flex items-center justify-between text-[10px] font-bold text-oranye-400 uppercase tracking-wider mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-oranye-500 animate-pulse" />
                      Live Speech Transcript:
                    </span>
                    {interimText && <span className="italic text-oranye-300/80">Mendengarkan...</span>}
                  </div>
                  <p className="leading-relaxed">
                    {jawabanSaatIni ? (
                      <>
                        <span>{finalTranscriptRef.current}</span>
                        {interimText && <span className="text-oranye-300 font-semibold italic"> {interimText}</span>}
                      </>
                    ) : (
                      <span className="italic text-batu-500">Bicaralah sekarang melalui mikrofon Anda...</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* C. UI MODE VIDEO (STRICT ZERO SCROLLING: SPLIT DESKTOP / STACK MOBILE) */}
            {/* =================================================================== */}
            {konfigurasi.mode === 'video' && (
              <div className="h-full flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 lg:gap-4 overflow-hidden">
                {/* KOLOM KIRI (DESKTOP) / KARTU ATAS (MOBILE): PERTANYAAN & CV CROSS CHECK */}
                <div className="lg:col-span-5 h-auto lg:h-full shrink-0 lg:shrink flex flex-col justify-between bg-batu-900/90 border border-batu-800 rounded-2xl p-3 sm:p-5 backdrop-blur-md mb-2 lg:mb-0 overflow-hidden">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-oranye-400 bg-oranye-500/10 border border-oranye-500/20 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                        {daftarPertanyaan[indeksPertanyaan].kategori}
                      </span>
                      <button
                        type="button"
                        onClick={() => bacakanPertanyaan(daftarPertanyaan[indeksPertanyaan].pertanyaan)}
                        className="p-1 rounded-lg bg-batu-800 hover:bg-batu-700 text-oranye-400 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                        title="Ulangi Pertanyaan Suara"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Ulangi Suara</span>
                      </button>
                    </div>

                    <h2 className="text-sm sm:text-base lg:text-xl font-black text-white leading-snug font-display line-clamp-3 lg:line-clamp-4">
                      &ldquo;{daftarPertanyaan[indeksPertanyaan].pertanyaan}&rdquo;
                    </h2>

                    {/* Indikator Cross-Check Data CV Real-Time */}
                    {(() => {
                      const cocokCv = crossCheckJawabanDenganCv(jawabanSaatIni);
                      return (
                        <div className="rounded-xl border border-oranye-500/30 bg-oranye-500/10 p-2.5 text-xs">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-oranye-300 text-[11px] flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-oranye-400 shrink-0" />
                              <span>Cross-Check AI:</span>
                            </span>
                            <span className="text-[10px] font-mono text-oranye-400">
                              {indeksPertanyaan < 2 ? 'Tahap Perkenalan' : 'Verifikasi'}
                            </span>
                          </div>
                          {cocokCv.length > 0 ? (
                            <div className="space-y-1">
                              <p className="text-[10.5px] text-emerald-300 flex items-center gap-1 font-semibold">
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span>Cocok dengan CV:</span>
                              </p>
                              <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                                {cocokCv.map((c, i) => (
                                  <span key={i} className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-300">
                                    {c.kategori}: {c.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[10.5px] text-oranye-200/80 italic leading-tight">
                              {indeksPertanyaan < 2
                                ? 'AI otomatis membandingkan ucapan perkenalan Anda dengan dokumen CV...'
                                : 'Jawaban dievaluasi berdasarkan relevansi kompetensi industri.'}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Petunjuk STAR (Desktop) */}
                    <div className="hidden lg:block rounded-xl border border-batu-800 bg-batu-950/60 p-3 text-xs text-batu-300 leading-relaxed">
                      <strong className="text-oranye-400 block mb-1">Petunjuk STAR:</strong>
                      <p className="line-clamp-2">{daftarPertanyaan[indeksPertanyaan].petunjuk}</p>
                    </div>
                  </div>

                  {/* Toggle Input Teks Cadangan */}
                  <div className="pt-1.5 hidden lg:block border-t border-batu-800">
                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(!isEditorOpen)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-batu-400 hover:text-batu-200 transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>{isEditorOpen ? 'Tutup Koreksi Teks' : 'Koreksi Transkrip Teks Manual'}</span>
                    </button>
                    {isEditorOpen && (
                      <div className="mt-1.5">
                        <textarea
                          rows={2}
                          value={jawabanSaatIni}
                          onChange={(e) => tanganiUbahJawabanManual(e.target.value)}
                          placeholder="Koreksi teks jawaban Anda di sini..."
                          className="w-full rounded-lg border border-batu-700 bg-batu-800 p-2 text-xs text-batu-200 focus:outline-none focus:border-oranye-500 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* KOLOM KANAN: FRAME KAMERA VIDEO LIVE + LIVE TRANSCRIPT STRIP */}
                <div className="lg:col-span-7 flex-1 min-h-0 flex flex-col relative rounded-2xl bg-black border border-batu-800 overflow-hidden shadow-2xl">
                  <video
                    ref={mainVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover mirror ${isCameraOff ? 'hidden' : 'block'}`}
                  />

                  {isCameraOff && (
                    <div className="h-full flex-1 flex flex-col items-center justify-center text-center text-batu-400 p-4">
                      <VideoOff className="h-10 w-10 mx-auto mb-2 opacity-50 text-batu-500" />
                      <p className="text-xs font-semibold text-batu-300">Kamera Non-Aktif (Mode Audio Berjalan)</p>
                      <p className="text-[11px] text-batu-500 mt-0.5">Mikrofon tetap aktif merekam jawaban Anda.</p>
                    </div>
                  )}

                  {/* Recording Badge di Pojok Kiri Atas */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-0.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span className="h-2 w-2 rounded-full bg-red-500 absolute" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider pl-2">
                      ⏺ REC
                    </span>
                  </div>

                  {/* Status Mic di Pojok Kanan Atas */}
                  <div className="absolute top-3 right-3 z-10">
                    <div
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-md border ${
                        isMuted
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {isMuted ? <MicOff className="h-2.5 w-2.5" /> : <Mic className="h-2.5 w-2.5 animate-pulse" />}
                      <span>{isMuted ? 'Mic Senyap' : 'Mic Aktif'}</span>
                    </div>
                  </div>

                  {/* Live Speech Transcript Strip (Kompak, Buffer Terkelola, Zero Overflow) */}
                  <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3 z-10 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 p-2.5 max-h-20 sm:max-h-24 overflow-y-auto">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-oranye-500 animate-pulse" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-oranye-400">
                          Live Speech Transcript:
                        </span>
                      </div>
                      {interimText && (
                        <span className="text-[9px] text-oranye-300/80 font-mono italic">Mendengarkan...</span>
                      )}
                    </div>
                    <p className="text-xs text-white leading-relaxed font-mono">
                      {jawabanSaatIni ? (
                        <>
                          <span>{finalTranscriptRef.current}</span>
                          {interimText && (
                            <span className="text-oranye-300 font-semibold italic"> {interimText}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-batu-400 italic text-[11px]">
                          Bicaralah sekarang melalui mikrofon, teks muncul otomatis tanpa penumpukan ganda...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* ACTION BAR KONTROL DI BAWAH (FLOATING ACTION BAR TETAP, ZERO SCROLLING) */}
          <footer className="h-14 sm:h-16 px-3 sm:px-6 bg-batu-900/95 border-t border-batu-800 shrink-0 backdrop-blur-md flex items-center justify-between gap-2 sm:gap-4">
            {/* Sisi Kiri: Tombol Akhiri (Merah Subtle) */}
            <button
              type="button"
              onClick={akhiriSesi}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span className="hidden sm:inline">Akhiri</span>
            </button>

            {/* Sisi Tengah: Kontrol Media & Tombol Lanjut Oranye Terang */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Tombol Mute Mikrofon */}
              {konfigurasi.mode !== 'teks' && (
                <button
                  type="button"
                  onClick={toggleMute}
                  title={isMuted ? 'Nyalakan Mikrofon' : 'Matikan Mikrofon'}
                  className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isMuted
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/30 hover:bg-red-500'
                      : 'bg-batu-800 text-batu-200 hover:bg-batu-700 border border-batu-700'
                  }`}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}

              {/* Tombol Kamera (Mode Video Only) */}
              {konfigurasi.mode === 'video' && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  title={isCameraOff ? 'Nyalakan Kamera' : 'Matikan Kamera (Beralih ke Audio)'}
                  className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isCameraOff
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/30 hover:bg-red-500'
                      : 'bg-batu-800 text-batu-200 hover:bg-batu-700 border border-batu-700'
                  }`}
                >
                  {isCameraOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </button>
              )}

              {/* Tombol Selesai Menjawab / Lanjut (AKSEN ORANYE TERANG KONSISTEN) */}
              <button
                type="button"
                onClick={kirimJawabanOtomatis}
                className="inline-flex items-center gap-2 rounded-full bg-oranye-500 hover:bg-oranye-400 active:bg-oranye-600 text-white px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold shadow-lg shadow-oranye-500/30 transition-all cursor-pointer"
              >
                <span>
                  {indeksPertanyaan + 1 === daftarPertanyaan.length
                    ? 'Selesai & Lihat Rapor'
                    : 'Selesai Menjawab (Lanjut)'}
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Sisi Kanan: Tombol Jeda (Play/Pause) */}
            <button
              type="button"
              onClick={() => setIsJeda(!isJeda)}
              className="inline-flex items-center gap-1.5 rounded-full border border-batu-700 bg-batu-800/90 px-3 py-2 text-xs font-semibold text-batu-300 hover:bg-batu-700 cursor-pointer transition-colors"
            >
              {isJeda ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isJeda ? 'Lanjut' : 'Jeda'}</span>
            </button>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAHAP: EVALUASI & RAPOR HASIL SIMULASI (FALLBACK VIEW)                 */}
      {/* ========================================================================= */}
      {tahap === 'evaluasi' && evaluasiAkhir && (
        renderKomponenReview(evaluasiAkhir, () => {
          setTabMenuSimulasi('riwayat');
          setTahap('persiapan');
        })
      )}
    </div>
  );
}
