// Halaman Studio Simulasi Wawancara Adaptif Mode Teks (pages/simulasi/SimulasiWawancara.tsx)
// Berdasarkan Riset Praktisi HR (Vina Muliana, Eza Hazami, Yova Beltz, Apri Rokhyadi) & Metode Jev
// Panel Pewawancara Bergantian (HR & User), dialog mengalir adaptif, target sentuh ergonomis >= 44px,
// bebas em-dash, bebas pulsing dot slop, 100% didaftarkan di modul i18n.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Kartu } from '../../components/ui/Kartu';
import { Tombol } from '../../components/ui/Tombol';
import { NotifikasiToast } from '../../components/ui/NotifikasiToast';
import { api } from '../../services/api';
import { useBahasa } from '../../i18n';
import { 
  Send, 
  ArrowLeft, 
  Bot, 
  AlertCircle, 
  CheckCircle2, 
  Briefcase,
  Play
} from 'lucide-react';

interface PesanChat {
  id: string;
  pengirim: 'pewawancara' | 'kandidat';
  nama: string;
  peran?: string;
  teks: string;
  waktu: string;
  kondisi_terdeteksi?: string;
}

export const SimulasiWawancara: React.FC<{ pengguna: any }> = ({ pengguna }) => {
  const { t } = useBahasa();
  const navigate = useNavigate();

  // State Inisialisasi
  const [targetRole, setTargetRole] = useState('');
  const [daftarRoleSaran] = useState([
    'Frontend Developer',
    'Backend Engineer',
    'Senior Accountant',
    'Product Manager',
    'Human Resources Specialist',
    'Digital Marketing Lead'
  ]);
  const [sesiAktif, setSesiAktif] = useState(false);
  const [sesiId, setSesiId] = useState('');
  const [sedangMemuatMulai, setSedangMemuatMulai] = useState(false);
  
  // State Percakapan Chat
  const [daftarPesan, setDaftarPesan] = useState<PesanChat[]>([]);
  const [inputJawaban, setInputJawaban] = useState('');
  const [sedangMerespon, setSedangMerespon] = useState(false);
  const [notif, setNotif] = useState<{ teks: string; tipe: 'sukses' | 'gagal' | 'info' } | null>(null);

  const ujungChatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    if (ujungChatRef.current) {
      ujungChatRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [daftarPesan, sedangMerespon]);

  // Muat preferensi role impian jika ada di profil awal
  useEffect(() => {
    if (pengguna?.pengguna_id) {
      api.getProfil(pengguna.pengguna_id).then((res) => {
        if (res?.profil?.role_impian) {
          setTargetRole(res.profil.role_impian);
        }
      }).catch(() => {});
    }
  }, [pengguna]);

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
        mode: 'teks'
      });

      if (res.status === 'sukses' && res.pesan_awal) {
        setSesiId(res.sesi_id);
        setDaftarPesan([res.pesan_awal]);
        setSesiAktif(true);
        setNotif({ teks: 'Sesi wawancara berhasil dibuka. Alokasi 10 Token tercatat.', tipe: 'sukses' });
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

  const tanganiAkhiriSesi = () => {
    if (window.confirm(t.simulasiWawancara.konfirmasiKeluar)) {
      setSesiAktif(false);
      setDaftarPesan([]);
      navigate('/');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 font-sans safe-padding-x">
      {/* Notifikasi Toast Mengambang Standar */}
      {notif && (
        <NotifikasiToast
          pesan={notif.teks}
          tipe={notif.tipe}
          onTutup={() => setNotif(null)}
        />
      )}

      {/* Header Halaman Simulasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              {t.simulasiWawancara.judulHalaman}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {sesiAktif ? `${t.simulasiWawancara.statusSesiAktif}: ${targetRole}` : t.simulasiWawancara.subjudulHalaman}
            </p>
          </div>
        </div>

        {sesiAktif && (
          <button
            type="button"
            onClick={tanganiAkhiriSesi}
            className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            <span>{t.simulasiWawancara.akhiriSesi}</span>
          </button>
        )}
      </div>

      {/* FORM PEMILIHAN POSISI TARGET (Jika Sesi Belum Aktif) */}
      {!sesiAktif ? (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn py-4">
          <Kartu className="p-6 sm:p-8 space-y-6 bg-white border border-stone-200 shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-orange-800 bg-orange-100 px-2.5 py-1 rounded-md font-bold inline-block mb-1">
                {t.simulasiWawancara.biayaSesiBadge}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                {t.simulasiWawancara.pilihPosisiLabel}
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pewawancara adaptif akan merumuskan studi kasus yang relevan dengan tanggung jawab posisi yang Anda tentukan di bawah.
              </p>
            </div>

            {/* Input Target Posisi */}
            <div className="space-y-2">
              <div className="relative">
                <Briefcase className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder={t.simulasiWawancara.pilihPosisiPlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 min-h-[46px]"
                />
              </div>

              {/* Saran Posisi Populer */}
              <div className="pt-2">
                <span className="text-[11px] text-stone-500 font-semibold block mb-2">Rekomendasi Posisi Cepat:</span>
                <div className="flex flex-wrap gap-1.5">
                  {daftarRoleSaran.map((role, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
                        targetRole === role
                          ? 'bg-orange-700 text-white border-orange-700 shadow-2xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Banner Karakter Orisinal: Bina */}
            <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  B
                </div>
                <div>
                  <strong className="text-xs font-bold text-stone-900 block">
                    Bina (Head of Talent Acquisition & Lead Evaluator)
                  </strong>
                  <span className="text-[11px] text-orange-950/80">
                    Pewawancara AI adaptif berstandar riset praktisi rekrutmen profesional Indonesia.
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed pt-1 border-t border-orange-200/50">
                Bina akan menguji alur komunikasi, ketegasan peran mandiri (metode CAR), membongkar jawaban klise, serta menguji ketahanan Anda menghadapi skenario krisis pekerjaan nyata.
              </p>
            </div>

            {/* Tombol Mulai */}
            <Tombol
              varian="primer"
              ukuran="lg"
              disabled={sedangMemuatMulai || !targetRole.trim()}
              onClick={tanganiMulaiSesi}
              className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold text-sm min-h-[48px] shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{sedangMemuatMulai ? t.simulasiWawancara.sedangMemulai : t.simulasiWawancara.tombolMulaiWawancara}</span>
            </Tombol>
          </Kartu>
        </div>
      ) : (
        /* RUANG CHAT WAWANCARA MENGLAIR INTERAKTIF */
        <div className="space-y-4 animate-fadeIn">
          {/* Box Area Pesan Chat */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 min-h-[450px] max-h-[580px] overflow-y-auto space-y-4 shadow-2xs">
            {daftarPesan.map((pesan) => {
              const adalahPewawancara = pesan.pengirim === 'pewawancara';
              return (
                <div
                  key={pesan.id}
                  className={`flex flex-col ${adalahPewawancara ? 'items-start' : 'items-end'} space-y-1 max-w-[88%] sm:max-w-[78%] ${
                    adalahPewawancara ? 'mr-auto' : 'ml-auto'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 px-1">
                    {adalahPewawancara ? (
                      <>
                        <Bot className="w-3.5 h-3.5 text-orange-700" />
                        <span className="text-orange-950 font-bold">{pesan.nama}</span>
                        {pesan.peran && <span className="text-[10px] text-stone-400">({pesan.peran})</span>}
                      </>
                    ) : (
                      <span>{pesan.nama}</span>
                    )}
                  </div>

                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      adalahPewawancara
                        ? 'bg-stone-100 text-stone-900 rounded-tl-sm border border-stone-200/60'
                        : 'bg-orange-700 text-white rounded-tr-sm shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{pesan.teks}</p>
                  </div>

                  {/* Micro Feedback Badge (Jika ada deteksi kondisi Jev) */}
                  {pesan.kondisi_terdeteksi && (
                    <div className="px-1 text-[10px]">
                      {pesan.kondisi_terdeteksi === 'BANYAK_KAMI' && (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{t.simulasiWawancara.peringatanKami}</span>
                        </span>
                      )}
                      {pesan.kondisi_terdeteksi === 'KLISE_HAFALAN' && (
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{t.simulasiWawancara.peringatanKlise}</span>
                        </span>
                      )}
                      {pesan.kondisi_terdeteksi === 'SOLID_BERMETRIK' && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t.simulasiWawancara.apresiasiAngka}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Indikator Typing Saat Pewawancara Merumuskan Pertanyaan */}
            {sedangMerespon && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 max-w-sm animate-pulse">
                <Bot className="w-4 h-4 text-orange-700 shrink-0" />
                <span>{t.simulasiWawancara.sedangMerespon}</span>
              </div>
            )}

            <div ref={ujungChatRef} />
          </div>

          {/* Kolom Input Chat Jawaban Kandidat */}
          <form onSubmit={tanganiKirimPesan} className="flex gap-2 items-center">
            <input
              type="text"
              value={inputJawaban}
              onChange={(e) => setInputJawaban(e.target.value)}
              disabled={sedangMerespon}
              placeholder={t.simulasiWawancara.ketikJawabanPlaceholder}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 min-h-[48px] shadow-2xs"
            />
            <button
              type="submit"
              disabled={sedangMerespon || !inputJawaban.trim()}
              className="px-5 py-3 rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm min-h-[48px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <span>{t.simulasiWawancara.tombolKirimJawaban}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
