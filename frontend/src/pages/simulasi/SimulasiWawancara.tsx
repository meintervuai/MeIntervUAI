// Halaman Studio Simulasi Wawancara Adaptif (pages/simulasi/SimulasiWawancara.tsx)
// Berdasarkan Riset Praktisi HR (Vina Muliana, Eza Hazami, Yova Beltz, Apri Rokhyadi) & Metode Jev
// Modular Component Architecture (FE-02, FE-06, FE-07):
// - FormPersiapanSimulasi: Seleksi posisi kerja & format (Teks/Suara/Video) dengan Stale-While-Revalidate
// - VoiceRoomDedicated: Dedicated voice orb & waveform visualizer (Gemini Live / ChatGPT Voice Experience)
// - TextRoomChat: Dialog tertulis mengalir adaptif STAR/CAR dengan micro-feedback

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotifikasiToast } from '../../components/ui/NotifikasiToast';
import { api } from '../../services/api';
import { useBahasa } from '../../i18n';
import { ArrowLeft } from 'lucide-react';
import { PesanChat, ModeSimulasiTipe } from './komponen/types';
import { FormPersiapanSimulasi } from './komponen/FormPersiapanSimulasi';
import { VoiceRoomDedicated } from './komponen/VoiceRoomDedicated';
import { VideoRoomDedicated } from './komponen/VideoRoomDedicated';
import { TextRoomChat } from './komponen/TextRoomChat';
import { LaporanEvaluasiWawancara } from './komponen/LaporanEvaluasiWawancara';

export const SimulasiWawancara: React.FC<{ pengguna: any }> = ({ pengguna }) => {
  const { t } = useBahasa();
  const navigate = useNavigate();

  // Inisialisasi dari cache lokal browser (Stale-While-Revalidate: FE-07 / UX-17)
  const CACHE_KEY = `intervu_simulasi_kelayakan_${pengguna?.pengguna_id || 'guest'}`;
  const ACTIVE_SESSION_KEY = `intervu_simulasi_sesi_aktif_${pengguna?.pengguna_id || 'guest'}`;

  // Cek apakah ada sesi wawancara aktif yang tersimpan di localStorage (< 4 jam yang lalu)
  const savedActiveSession = (() => {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.sesiId && Array.isArray(parsed.daftarPesan) && parsed.daftarPesan.length > 0) {
          const waktuMulai = parsed.waktuMulai || 0;
          const empatJamMs = 4 * 60 * 60 * 1000;
          if (Date.now() - waktuMulai < empatJamMs) {
            return parsed;
          } else {
            localStorage.removeItem(ACTIVE_SESSION_KEY);
          }
        }
      }
    } catch {}
    return null;
  })();

  // State Inisialisasi, Saldo Token Reaktif & Kelayakan
  const [saldoTokenState, setSaldoTokenState] = useState<number>(() => pengguna?.saldo_token ?? 1000);
  const [targetRole, setTargetRole] = useState(() => savedActiveSession?.targetRole || '');
  const [modeSimulasi, setModeSimulasi] = useState<ModeSimulasiTipe>(() => savedActiveSession?.modeSimulasi || 'teks');
  const [tampilkanEvaluasi, setTampilkanEvaluasi] = useState<boolean>(false);

  useEffect(() => {
    if (pengguna?.saldo_token !== undefined) {
      setSaldoTokenState(pengguna.saldo_token);
    }
  }, [pengguna?.saldo_token]);
  const [daftarRoleSaran, setDaftarRoleSaran] = useState<string[]>(() => {
    try {
      const c = localStorage.getItem(CACHE_KEY);
      if (c) {
        const obj = JSON.parse(c);
        return Array.isArray(obj.posisi_rekomendasi) ? obj.posisi_rekomendasi : [];
      }
    } catch {}
    return [];
  });
  const [kelayakan, setKelayakan] = useState<{
    bisa_simulasi: boolean;
    alasan: string;
    cv_tersedia: boolean;
    kontak_terisi: boolean;
    edukasi_terisi: boolean;
    cv_teranalisis: boolean;
  }>(() => {
    try {
      const c = localStorage.getItem(CACHE_KEY);
      if (c) {
        const obj = JSON.parse(c);
        return {
          bisa_simulasi: obj.bisa_simulasi ?? true,
          alasan: obj.alasan || '',
          cv_tersedia: obj.cv_tersedia ?? true,
          kontak_terisi: obj.kontak_terisi ?? true,
          edukasi_terisi: obj.edukasi_terisi ?? true,
          cv_teranalisis: obj.cv_teranalisis ?? false,
        };
      }
    } catch {}
    return {
      bisa_simulasi: true,
      alasan: '',
      cv_tersedia: true,
      kontak_terisi: true,
      edukasi_terisi: true,
      cv_teranalisis: false,
    };
  });
  const [sedangMemeriksaKelayakan, setSedangMemeriksaKelayakan] = useState(() => {
    return !localStorage.getItem(CACHE_KEY);
  });
  const [sesiAktif, setSesiAktif] = useState(() => Boolean(savedActiveSession));
  const [sesiId, setSesiId] = useState(() => savedActiveSession?.sesiId || '');
  const [sedangMemuatMulai, setSedangMemuatMulai] = useState(false);
  
  // State Percakapan Chat & Audio Engine
  const [daftarPesan, setDaftarPesan] = useState<PesanChat[]>(() => savedActiveSession?.daftarPesan || []);
  const [inputJawaban, setInputJawaban] = useState('');
  const [sedangMerespon, setSedangMerespon] = useState(false);
  const [notif, setNotif] = useState<{ teks: string; tipe: 'sukses' | 'gagal' | 'info' } | null>(null);

  // Khusus Mode Suara (Gemini Live / ChatGPT Voice Experience)
  const [sedangMerekam, setSedangMerekam] = useState(false);
  const [sedangMemutarAudio, setSedangMemutarAudio] = useState(false);
  const [modeInteraksiSuara, setModeInteraksiSuara] = useState<'ptt' | 'handsfree'>('ptt');
  const [tampilkanTranskripSuara, setTampilkanTranskripSuara] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);
  const [liveTranscriptUser, setLiveTranscriptUser] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const ujungChatRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Putar audio otomatis dari pesan terbaru jika mode suara
  const putarAudioBina = (audioUrl?: string) => {
    if (!audioUrl || audioMuted) return;
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      setSedangMemutarAudio(true);
      audio.onended = () => setSedangMemutarAudio(false);
      audio.onerror = () => setSedangMemutarAudio(false);
      audio.play().catch((e) => {
        console.warn('Autoplay audio tercegah kebijakan browser:', e);
        setSedangMemutarAudio(false);
      });
    } catch (err) {
      console.error('Gagal memutar audio Bina:', err);
      setSedangMemutarAudio(false);
    }
  };

  // Bersihkan audio saat unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    if (ujungChatRef.current) {
      ujungChatRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [daftarPesan, sedangMerespon]);

  // Sinkronisasi Persistence Sesi Aktif ke localStorage (FE-07 / UX-17)
  useEffect(() => {
    if (sesiAktif && sesiId && daftarPesan.length > 0) {
      const dataSesi = {
        sesiId,
        targetRole,
        modeSimulasi,
        daftarPesan,
        waktuMulai: savedActiveSession?.waktuMulai || Date.now(),
      };
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(dataSesi));
    }
  }, [sesiAktif, sesiId, targetRole, modeSimulasi, daftarPesan, ACTIVE_SESSION_KEY]);

  // Peringatan Browser jika pengguna tidak sengaja merefresh tab saat sesi sedang aktif
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sesiAktif) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sesiAktif]);

  // Cek kelayakan CV & muat daftar posisi rekomendasi dinamis dari database (Zero Hardcode)
  useEffect(() => {
    if (pengguna?.pengguna_id) {
      // Ambil cache terlebih dahulu
      const c = localStorage.getItem(CACHE_KEY);
      if (!c) {
        setSedangMemeriksaKelayakan(true);
      }

      api.cekKelayakanSimulasi(pengguna.pengguna_id)
        .then((res) => {
          if (res?.status === 'sukses') {
            const dataKelayakan = {
              bisa_simulasi: res.bisa_simulasi,
              alasan: res.alasan || '',
              cv_tersedia: res.cv_tersedia,
              kontak_terisi: res.kontak_terisi,
              edukasi_terisi: res.edukasi_terisi,
              cv_teranalisis: res.cv_teranalisis,
            };
            setKelayakan(dataKelayakan);

            // Simpan cache lokal untuk instant render berikutnya (0 ms)
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify({
                ...dataKelayakan,
                posisi_rekomendasi: res.posisi_rekomendasi || [],
                target_posisi_utama: res.target_posisi_utama || ''
              }));
            } catch {}

            // Rekomendasi posisi murni dari database & CV
            if (Array.isArray(res.posisi_rekomendasi)) {
              setDaftarRoleSaran(res.posisi_rekomendasi);
            }

            // Set posisi default dari CV jika belum dipilih
            if (res.target_posisi_utama && !targetRole) {
              setTargetRole(res.target_posisi_utama);
            }
          }
        })
        .catch(() => {
          setNotif({ teks: 'Gagal memuat kelayakan CV. Pastikan server aktif.', tipe: 'gagal' });
        })
        .finally(() => {
          setSedangMemeriksaKelayakan(false);
        });
    } else {
      setSedangMemeriksaKelayakan(false);
    }
  }, [pengguna?.pengguna_id]);

  const tanganiMulaiSesi = async () => {
    if (!targetRole.trim()) {
      setNotif({ teks: 'Silakan pilih atau ketikkan posisi pekerjaan yang Anda lamar.', tipe: 'gagal' });
      return;
    }
    setSedangMemuatMulai(true);
    try {
      const res = await api.mulaiSimulasi({
        pengguna_id: pengguna.pengguna_id,
        target_role: targetRole.trim(),
        mode: modeSimulasi
      });

      if (res.status === 'sukses' && res.pesan_awal) {
        setSesiId(res.sesi_id);
        setDaftarPesan([res.pesan_awal]);
        setSesiAktif(true);

        // Perbarui saldo token reaktif di state aplikasi dan localStorage
        if (res.saldo_token !== undefined) {
          setSaldoTokenState(res.saldo_token);
          try {
            const cached = localStorage.getItem('intervu_pengguna');
            if (cached) {
              const parsed = JSON.parse(cached);
              parsed.saldo_token = res.saldo_token;
              localStorage.setItem('intervu_pengguna', JSON.stringify(parsed));
              window.dispatchEvent(new Event('storage'));
            }
          } catch {}
        }

        const biaya = modeSimulasi === 'suara' ? 15 : modeSimulasi === 'video' ? 25 : 10;
        setNotif({ teks: `Sesi wawancara mode ${modeSimulasi} berhasil dibuka. Alokasi ${biaya} Token tercatat.`, tipe: 'sukses' });

        // Jika mode suara atau video, langsung putar ucapan sambutan Bina
        if ((modeSimulasi === 'suara' || modeSimulasi === 'video') && res.pesan_awal.audio_url) {
          setTimeout(() => {
            putarAudioBina(res.pesan_awal.audio_url);
          }, 300);
        }
      } else {
        setNotif({ teks: res.pesan || 'Gagal memulai simulasi wawancara.', tipe: 'gagal' });
      }
    } catch (err: any) {
      setNotif({ teks: `Terjadi kendala jaringan: ${err.message || 'Gagal terhubung'}`, tipe: 'gagal' });
    } finally {
      setSedangMemuatMulai(false);
    }
  };

  const tanganiKirimPesan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const jawabanBersih = inputJawaban.trim();
    if (!jawabanBersih || sedangMerespon) return;

    const pesanKandidat: PesanChat = {
      id: `usr_${Date.now()}`,
      pengirim: 'kandidat',
      nama: pengguna.nama_pengguna || 'Anda (Kandidat)',
      teks: jawabanBersih,
      waktu: 'Baru saja'
    };

    const riwayatBaru = [...daftarPesan, pesanKandidat];
    setDaftarPesan(riwayatBaru);
    setInputJawaban('');
    setSedangMerespon(true);

    try {
      const res = await api.kirimJawabanSimulasi({
        sesi_id: sesiId,
        pengguna_id: pengguna.pengguna_id,
        target_role: targetRole,
        jawaban_kandidat: jawabanBersih,
        riwayat_chat: riwayatBaru
      });

      if (res.status === 'sukses' && res.pesan_pewawancara) {
        setDaftarPesan([...riwayatBaru, res.pesan_pewawancara]);
      } else {
        setNotif({ teks: res.pesan || 'Gagal menerima tanggapan pewawancara.', tipe: 'gagal' });
      }
    } catch (err: any) {
      setNotif({ teks: 'Koneksi terputus saat merespon.', tipe: 'gagal' });
    } finally {
      setSedangMerespon(false);
    }
  };

  // Logika Merekam Suara Kandidat (Microphone Stream & MediaRecorder + Web Speech API Real-Time Streaming)
  const mulaiMerekamSuara = async () => {
    if (sedangMerespon || sedangMemutarAudio) return;
    try {
      setLiveTranscriptUser('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await prosesAudioKandidat(audioBlob);
      };

      mediaRecorder.start();
      setSedangMerekam(true);

      // Inisialisasi Web Speech API untuk Live Real-Time Transcription saat kandidat bicara
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognizer = new SpeechRecognition();
          recognizer.lang = 'id-ID';
          recognizer.continuous = true;
          recognizer.interimResults = true;

          let akumulasiTeksFinal = '';

          recognizer.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const item = event.results[i];
              if (item.isFinal) {
                akumulasiTeksFinal += item[0].transcript + ' ';
              } else {
                interimTranscript += item[0].transcript;
              }
            }
            const totalTeks = (akumulasiTeksFinal + interimTranscript).trim();
            if (totalTeks) {
              setLiveTranscriptUser(totalTeks);
            }
          };

          recognizer.onerror = (e: any) => {
            console.warn('SpeechRecognition interim error:', e);
          };

          recognizer.start();
          speechRecognitionRef.current = recognizer;
        } catch (e) {
          console.warn('SpeechRecognition tidak dapat dimulai:', e);
        }
      }
    } catch (err) {
      console.error('Akses mikrofon gagal:', err);
      setNotif({ teks: t.simulasiWawancara.mikrofonTidakAktif, tipe: 'gagal' });
    }
  };

  const hentikanMerekamSuara = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && sedangMerekam) {
      mediaRecorderRef.current.stop();
      setSedangMerekam(false);
    }
  };

  const prosesAudioKandidat = async (blob: Blob) => {
    // Tampilkan placeholder transkripsi kandidat secara instan (Zero Lag Feedback)
    const teksAwalKandidat = liveTranscriptUser.trim().length > 0 
      ? liveTranscriptUser 
      : '🎙️ [Menganalisis audio ucapan Anda...]';

    const tempKandidatId = `usr_${Date.now()}`;
    const placeholderKandidat: PesanChat = {
      id: tempKandidatId,
      pengirim: 'kandidat',
      nama: pengguna.nama_pengguna || 'Anda (Kandidat)',
      teks: teksAwalKandidat,
      waktu: 'Baru saja'
    };
    setDaftarPesan((prev) => [...prev, placeholderKandidat]);
    setSedangMerespon(true);

    try {
      const formData = new FormData();
      formData.append('audio_file', blob, 'rekaman_kandidat.webm');
      formData.append('sesi_id', sesiId);
      formData.append('pengguna_id', pengguna.pengguna_id);
      formData.append('target_role', targetRole);
      formData.append('live_transcript', teksAwalKandidat);
      formData.append('riwayat_chat_json', JSON.stringify(daftarPesan));

      const res = await api.prosesInteraksiSuara(formData);
      if (res.status === 'sukses' && res.pesan_pewawancara) {
        const transkripTeks = res.transkripsi_kandidat && res.transkripsi_kandidat.trim().length > 0
          ? res.transkripsi_kandidat
          : liveTranscriptUser.trim().length > 0
          ? liveTranscriptUser
          : '(Suara kandidat terekam)';
        
        const pesanBina = res.pesan_pewawancara;
        
        // Perbarui pesan kandidat dengan teks transkripsi riil dan tambahkan respons Bina
        setDaftarPesan((prev) => {
          const updated = prev.map((p) => 
            p.id === tempKandidatId ? { ...p, teks: transkripTeks } : p
          );
          return [...updated, pesanBina];
        });

        setLiveTranscriptUser('');

        // Putar langsung audio suara Bina
        if (pesanBina.audio_url) {
          putarAudioBina(pesanBina.audio_url);
        }
      } else {
        // Hapus placeholder jika gagal
        setDaftarPesan((prev) => prev.filter((p) => p.id !== tempKandidatId));
        setNotif({ teks: res.pesan || 'Gagal memproses suara kandidat.', tipe: 'gagal' });
      }
    } catch (err: any) {
      setDaftarPesan((prev) => prev.filter((p) => p.id !== tempKandidatId));
      setNotif({ teks: `Gangguan audio: ${err.message || 'Koneksi gagal'}`, tipe: 'gagal' });
    } finally {
      setSedangMerespon(false);
      setLiveTranscriptUser('');
    }
  };

  const tanganiAkhiriSesi = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    // Hapus sesi aktif dari localStorage karena pengguna sudah selesai/mengakhiri secara resmi
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setSesiAktif(false);
    setTampilkanEvaluasi(true);
  };

  if (tampilkanEvaluasi) {
    return (
      <LaporanEvaluasiWawancara
        targetRole={targetRole}
        modeSimulasi={modeSimulasi}
        riwayatChat={daftarPesan}
        onKembaliKeStudio={() => {
          localStorage.removeItem(ACTIVE_SESSION_KEY);
          setTampilkanEvaluasi(false);
          setSesiAktif(false);
          setDaftarPesan([]);
        }}
      />
    );
  }

  return (
    <div className={`mx-auto font-sans safe-padding-x ${
      sesiAktif && (modeSimulasi === 'suara' || modeSimulasi === 'video')
        ? 'max-w-7xl px-3 sm:px-6 py-3 sm:py-5 space-y-4 h-screen md:h-auto overflow-hidden'
        : 'max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24'
    }`}>
      {/* Notifikasi Toast Mengambang Standar */}
      {notif && (
        <NotifikasiToast
          pesan={notif.teks}
          tipe={notif.tipe}
          onTutup={() => setNotif(null)}
        />
      )}

      {/* Header Halaman Simulasi */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight truncate">
              {t.simulasiWawancara.judulHalaman}
            </h1>
            <p className="text-[11px] sm:text-xs text-stone-500 truncate">
              {sesiAktif ? `Sesi Wawancara Aktif: ${targetRole}` : t.simulasiWawancara.subjudulHalaman}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Badge Token Pengguna Aktif (Responsif: Tampil di Seluler & Desktop) */}
          {saldoTokenState !== undefined && (
            <div className="flex items-center px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold shadow-2xs">
              <span>{saldoTokenState} {t.simulasiWawancara.biayaTokenUnit}</span>
            </div>
          )}

          {sesiAktif && (
            <button
              type="button"
              onClick={tanganiAkhiriSesi}
              className="px-3.5 py-1.5 sm:py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold transition-colors min-h-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <span>{t.simulasiWawancara.akhiriSesi}</span>
            </button>
          )}
        </div>
      </div>

      {/* TAMPILAN BERDASARKAN STATUS SESI & FORMAT */}
      {!sesiAktif ? (
        <FormPersiapanSimulasi
          targetRole={targetRole}
          setTargetRole={setTargetRole}
          modeSimulasi={modeSimulasi}
          setModeSimulasi={setModeSimulasi}
          daftarRoleSaran={daftarRoleSaran}
          kelayakan={kelayakan}
          sedangMemeriksaKelayakan={sedangMemeriksaKelayakan}
          sedangMemuatMulai={sedangMemuatMulai}
          saldoTokenPengguna={saldoTokenState}
          onMulaiSesi={tanganiMulaiSesi}
        />
      ) : modeSimulasi === 'video' ? (
        <VideoRoomDedicated
          targetRole={targetRole}
          daftarPesan={daftarPesan}
          sedangMemutarAudio={sedangMemutarAudio}
          sedangMerekam={sedangMerekam}
          sedangMerespon={sedangMerespon}
          liveTranscriptUser={liveTranscriptUser}
          modeInteraksiSuara={modeInteraksiSuara}
          setModeInteraksiSuara={setModeInteraksiSuara}
          audioMuted={audioMuted}
          onToggleMute={() => {
            if (!audioMuted && audioPlayerRef.current) {
              audioPlayerRef.current.pause();
              setSedangMemutarAudio(false);
            }
            setAudioMuted(!audioMuted);
          }}
          onMulaiMerekam={mulaiMerekamSuara}
          onHentikanMerekam={hentikanMerekamSuara}
          onPutarAudio={putarAudioBina}
          ujungChatRef={ujungChatRef}
          onTambahPesan={(pesan) => setDaftarPesan((prev) => [...prev, pesan])}
        />
      ) : modeSimulasi === 'suara' ? (
        <VoiceRoomDedicated
          targetRole={targetRole}
          daftarPesan={daftarPesan}
          sedangMemutarAudio={sedangMemutarAudio}
          sedangMerekam={sedangMerekam}
          sedangMerespon={sedangMerespon}
          liveTranscriptUser={liveTranscriptUser}
          modeInteraksiSuara={modeInteraksiSuara}
          setModeInteraksiSuara={setModeInteraksiSuara}
          tampilkanTranskripSuara={tampilkanTranskripSuara}
          setTampilkanTranskripSuara={setTampilkanTranskripSuara}
          audioMuted={audioMuted}
          onToggleMute={() => {
            if (!audioMuted && audioPlayerRef.current) {
              audioPlayerRef.current.pause();
              setSedangMemutarAudio(false);
            }
            setAudioMuted(!audioMuted);
          }}
          onMulaiMerekam={mulaiMerekamSuara}
          onHentikanMerekam={hentikanMerekamSuara}
          onPutarAudio={putarAudioBina}
          ujungChatRef={ujungChatRef}
        />
      ) : (
        <TextRoomChat
          daftarPesan={daftarPesan}
          inputJawaban={inputJawaban}
          setInputJawaban={setInputJawaban}
          sedangMerespon={sedangMerespon}
          onKirimPesan={tanganiKirimPesan}
          ujungChatRef={ujungChatRef}
        />
      )}
    </div>
  );
};
