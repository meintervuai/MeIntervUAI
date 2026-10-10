// Halaman Pengaturan Akun: kelola nama, no telp, foto profil, ganti email/password, bahasa, dan ulasan aplikasi (1-5 bintang).
import React, { useState, useEffect } from 'react';
import { Kartu } from '../components/ui/Kartu';
import { KotakInput } from '../components/ui/KotakInput';
import { Tombol } from '../components/ui/Tombol';
import { api } from '../services/api';
import { 
  User, 
  ShieldCheck, 
  Globe, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Lock, 
  Mail 
} from 'lucide-react';

interface PropertiPengaturan {
  pengguna: any;
  onPerbaruiPengguna: (pengguna: any) => void;
}

export const Pengaturan: React.FC<PropertiPengaturan> = ({ pengguna, onPerbaruiPengguna }) => {
  const [tabAktif, setTabAktif] = useState<'profil' | 'keamanan' | 'bahasa' | 'ulasan'>('profil');

  // Tab Profil State
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [urlFoto, setUrlFoto] = useState('');

  // Tab Keamanan State
  const [emailBaru, setEmailBaru] = useState('');

  // Tab Bahasa State
  const [bahasaDipilih, setBahasaDipilih] = useState('id');

  // Tab Ulasan State
  const [ratingBintang, setRatingBintang] = useState(5);
  const [isiUlasan, setIsiUlasan] = useState('');

  // Notification & Loading
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
  const [notifikasi, setNotifikasi] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);

  useEffect(() => {
    if (pengguna && pengguna.pengguna_id) {
      api.getProfil(pengguna.pengguna_id).then((res) => {
        if (res.status === 'sukses' && res.profil) {
          const p = res.profil;
          setNamaLengkap(p.nama_lengkap || pengguna.nama_pengguna || '');
          setNomorTelepon(p.nomor_telepon || '');
          setUrlFoto(p.url_foto_profil || '');
          setBahasaDipilih(p.preferensi_bahasa || 'id');
        }
      }).catch(() => {
        setNamaLengkap(pengguna.nama_pengguna || '');
      });
    }
  }, [pengguna]);

  const simpanProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengguna) return;
    setSedangMenyimpan(true);
    setNotifikasi(null);

    try {
      const res = await api.updateIdentitas({
        pengguna_id: pengguna.pengguna_id,
        nama_lengkap: namaLengkap,
        nomor_telepon: nomorTelepon,
        url_foto_profil: urlFoto,
        preferensi_bahasa: bahasaDipilih,
      });

      if (res.status === 'sukses') {
        setNotifikasi({ tipe: 'sukses', teks: 'Data identitas profil berhasil disimpan!' });
        onPerbaruiPengguna({ ...pengguna, nama_pengguna: namaLengkap });
      } else {
        setNotifikasi({ tipe: 'galat', teks: res.pesan || 'Gagal menyimpan perubahan.' });
      }
    } catch (err) {
      setNotifikasi({ tipe: 'galat', teks: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  const ajukanGantiEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengguna) return;
    setSedangMenyimpan(true);
    setNotifikasi(null);

    try {
      const res = await api.ajukanUbahEmail({ pengguna_id: pengguna.pengguna_id, email_baru: emailBaru });
      if (res.status === 'sukses') {
        setNotifikasi({
          tipe: 'sukses',
          teks: res.pesan || 'Permintaan perubahan email telah diajukan. Cek inbox email baru Anda untuk konfirmasi.',
        });
        setEmailBaru('');
      } else {
        setNotifikasi({ tipe: 'galat', teks: res.pesan || 'Gagal mengajukan perubahan email.' });
      }
    } catch (err) {
      setNotifikasi({ tipe: 'galat', teks: 'Gagal mengajukan perubahan email.' });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  const kirimUlasan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengguna) return;
    setSedangMenyimpan(true);
    setNotifikasi(null);

    try {
      const res = await api.kirimUlasan({
        pengguna_id: pengguna.pengguna_id,
        bintang_rating: ratingBintang,
        isi_ulasan: isiUlasan,
      });

      if (res.status === 'sukses') {
        setNotifikasi({ tipe: 'sukses', teks: 'Terima kasih atas ulasan dan masukan Anda!' });
        setIsiUlasan('');
      } else {
        setNotifikasi({ tipe: 'galat', teks: res.pesan || 'Gagal mengirim ulasan.' });
      }
    } catch (err) {
      setNotifikasi({ tipe: 'galat', teks: 'Gagal menyimpan ulasan.' });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 safe-padding-x">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Akun & Preferensi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola informasi identitas pribadi, keamanan akun, dan berikan penilaian aplikasi.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        <button
          onClick={() => { setTabAktif('profil'); setNotifikasi(null); }}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            tabAktif === 'profil'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" /> Identitas Profil
        </button>
        <button
          onClick={() => { setTabAktif('keamanan'); setNotifikasi(null); }}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            tabAktif === 'keamanan'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Keamanan & Akun
        </button>
        <button
          onClick={() => { setTabAktif('bahasa'); setNotifikasi(null); }}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            tabAktif === 'bahasa'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" /> Pengaturan Bahasa
        </button>
        <button
          onClick={() => { setTabAktif('ulasan'); setNotifikasi(null); }}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            tabAktif === 'ulasan'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" /> Ulasan Aplikasi
        </button>
      </div>

      {/* Notification Banner */}
      {notifikasi && (
        <div
          className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm ${
            notifikasi.tipe === 'sukses'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notifikasi.tipe === 'sukses' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{notifikasi.teks}</span>
        </div>
      )}

      {/* Tab 1: Identitas Profil */}
      {tabAktif === 'profil' && (
        <Kartu className="p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Informasi Pribadi & Kontak
          </h2>
          <form onSubmit={simpanProfil} className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl overflow-hidden">
                {urlFoto ? (
                  <img src={urlFoto} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  namaLengkap.slice(0, 2).toUpperCase() || 'IU'
                )}
              </div>
              <div className="flex-1">
                <KotakInput
                  label="URL Foto Profil"
                  placeholder="https://example.com/foto-anda.jpg"
                  value={urlFoto}
                  onChange={(e) => setUrlFoto(e.target.value)}
                  keteranganBantuan="Tautan foto profil Anda (opsional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <KotakInput
                label="Nama Lengkap"
                required
                placeholder="Nama Anda"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
              />
              <KotakInput
                label="Nomor Telepon / WhatsApp"
                placeholder="+62 812-3456-7890"
                value={nomorTelepon}
                onChange={(e) => setNomorTelepon(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Tombol
                type="submit"
                varian="primer"
                ukuran="md"
                sedangMemuat={sedangMenyimpan}
              >
                <Save className="w-4 h-4 mr-2" /> Simpan Perubahan Profil
              </Tombol>
            </div>
          </form>
        </Kartu>
      )}

      {/* Tab 2: Keamanan & Akun */}
      {tabAktif === 'keamanan' && (
        <div className="space-y-6">
          <Kartu className="p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-600" />
              Perbarui Alamat Email
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Email saat ini: <strong className="text-slate-800">{pengguna?.email || 'Belum terdaftar'}</strong>
            </p>
            <form onSubmit={ajukanGantiEmail} className="space-y-4 max-w-md">
              <KotakInput
                label="Alamat Email Baru"
                type="email"
                required
                placeholder="emailbaru@domain.com"
                value={emailBaru}
                onChange={(e) => setEmailBaru(e.target.value)}
              />
              <Tombol
                type="submit"
                varian="primer"
                ukuran="md"
                sedangMemuat={sedangMenyimpan}
              >
                Ajukan Perubahan Email
              </Tombol>
            </form>
          </Kartu>

          <Kartu className="p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              Pemulihan / Reset Kata Sandi
            </h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Jika Anda ingin mengganti kata sandi atau lupa kata sandi lama Anda, kami akan mengirimkan tautan pemulihan aman ke email terdaftar Anda.
            </p>
            <Tombol
              varian="sekunder"
              ukuran="md"
              onClick={() => {
                setNotifikasi({
                  tipe: 'sukses',
                  teks: `Tautan pemulihan kata sandi telah dikirimkan ke ${pengguna?.email}. Silakan cek kotak masuk Anda.`,
                });
              }}
            >
              Kirim Tautan Reset Kata Sandi
            </Tombol>
          </Kartu>
        </div>
      )}

      {/* Tab 3: Pengaturan Bahasa */}
      {tabAktif === 'bahasa' && (
        <Kartu className="p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-600" />
            Preferensi Bahasa Aplikasi & Simulasi
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Pilih bahasa utama untuk navigasi antarmuka dan default bahasa wawancara AI.
          </p>

          <div className="space-y-3 max-w-md">
            <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
              bahasaDipilih === 'id' ? 'border-brand-600 bg-brand-50/50' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🇮🇩</span>
                <div>
                  <div className="text-sm font-bold text-slate-900">Bahasa Indonesia</div>
                  <div className="text-xs text-slate-500">Antarmuka & pewawancara berbahasa Indonesia</div>
                </div>
              </div>
              <input
                type="radio"
                name="bahasa"
                checked={bahasaDipilih === 'id'}
                onChange={() => setBahasaDipilih('id')}
                className="w-4 h-4 text-brand-600"
              />
            </label>

            <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
              bahasaDipilih === 'en' ? 'border-brand-600 bg-brand-50/50' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🇬🇧</span>
                <div>
                  <div className="text-sm font-bold text-slate-900">English (Global)</div>
                  <div className="text-xs text-slate-500">Interface & interviewer in English language</div>
                </div>
              </div>
              <input
                type="radio"
                name="bahasa"
                checked={bahasaDipilih === 'en'}
                onChange={() => setBahasaDipilih('en')}
                className="w-4 h-4 text-brand-600"
              />
            </label>

            <div className="pt-4">
              <Tombol
                varian="primer"
                ukuran="md"
                onClick={simpanProfil}
                sedangMemuat={sedangMenyimpan}
              >
                Terapkan Pilihan Bahasa
              </Tombol>
            </div>
          </div>
        </Kartu>
      )}

      {/* Tab 4: Ulasan Aplikasi */}
      {tabAktif === 'ulasan' && (
        <Kartu className="p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Ulasan & Masukan untuk Tim Pengembang
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Beri tahu kami pengalaman Anda menggunakan MeIntervUAI agar tim Customer Success dapat terus meningkatkan kualitas layanan.
          </p>

          <form onSubmit={kirimUlasan} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Rating Kepuasan
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((bintang) => (
                  <button
                    key={bintang}
                    type="button"
                    onClick={() => setRatingBintang(bintang)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`${bintang} Bintang`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        bintang <= ratingBintang
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-700">
                  {ratingBintang} dari 5 Bintang
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Pesan Ulasan / Saran Perbaikan
              </label>
              <textarea
                rows={4}
                required
                placeholder="Bagikan apa yang Anda sukai atau fitur yang ingin Anda tambahkan..."
                value={isiUlasan}
                onChange={(e) => setIsiUlasan(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
              ></textarea>
            </div>

            <Tombol
              type="submit"
              varian="primer"
              ukuran="md"
              sedangMemuat={sedangMenyimpan}
            >
              Kirim Ulasan Aplikasi
            </Tombol>
          </form>
        </Kartu>
      )}
    </div>
  );
};
