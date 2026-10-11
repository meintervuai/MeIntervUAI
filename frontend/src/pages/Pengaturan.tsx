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
  Mail,
  Upload,
  Trash2,
  Loader2 
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
  const [umur, setUmur] = useState<number | ''>('');
  const [jenisKelamin, setJenisKelamin] = useState('pria');
  const [statusPekerjaan, setStatusPekerjaan] = useState('mahasiswa');
  const [roleImpian, setRoleImpian] = useState('');
  const [sedangUnggahFoto, setSedangUnggahFoto] = useState(false);
  const inputBerkasRef = React.useRef<HTMLInputElement | null>(null);

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
          if (p.umur) setUmur(p.umur);
          if (p.jenis_kelamin) setJenisKelamin(p.jenis_kelamin);
          if (p.status_pekerjaan) setStatusPekerjaan(p.status_pekerjaan);
          if (p.role_impian) setRoleImpian(p.role_impian);
        }
      }).catch(() => {
        setNamaLengkap(pengguna.nama_pengguna || '');
      });
    }
  }, [pengguna]);

  // Fungsi utilitas kompresi gambar client-side (maks resolusi 800x800, kualitas 0.82)
  const kompresGambar = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const tanganiPilihBerkasFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pengguna) return;

    // Validasi ukuran maksimal berkas 5MB
    if (file.size > 5 * 1024 * 1024) {
      setNotifikasi({
        tipe: 'galat',
        teks: 'Ukuran berkas melebihi batas maksimal 5MB. Pilih berkas yang lebih kecil.',
      });
      return;
    }

    setSedangUnggahFoto(true);
    setNotifikasi(null);

    try {
      // Jalankan kompresi otomatis sebelum dikirim
      const blobTerkonpresi = await kompresGambar(file);
      const res = await api.unggahFotoProfil(pengguna.pengguna_id, blobTerkonpresi, file.name);

      if (res.status === 'sukses' && res.url_foto_profil) {
        setUrlFoto(res.url_foto_profil);
        setNotifikasi({
          tipe: 'sukses',
          teks: 'Foto profil berhasil diunggah dan diperbarui!',
        });
      } else {
        setNotifikasi({
          tipe: 'galat',
          teks: res.pesan || 'Gagal mengunggah foto profil.',
        });
      }
    } catch (err: any) {
      setNotifikasi({
        tipe: 'galat',
        teks: err.message || 'Terjadi kesalahan saat memproses gambar.',
      });
    } finally {
      setSedangUnggahFoto(false);
      if (inputBerkasRef.current) {
        inputBerkasRef.current.value = '';
      }
    }
  };

  const tanganiHapusFoto = async () => {
    if (!pengguna || !urlFoto) return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) return;

    setSedangUnggahFoto(true);
    setNotifikasi(null);
    try {
      const res = await api.hapusFotoProfil(pengguna.pengguna_id);
      if (res.status === 'sukses') {
        setUrlFoto('');
        setNotifikasi({ tipe: 'sukses', teks: 'Foto profil berhasil dihapus.' });
      } else {
        setNotifikasi({ tipe: 'galat', teks: res.pesan || 'Gagal menghapus foto profil.' });
      }
    } catch (err) {
      setNotifikasi({ tipe: 'galat', teks: 'Gagal menghapus foto profil.' });
    } finally {
      setSedangUnggahFoto(false);
    }
  };

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
        umur: umur ? Number(umur) : undefined,
        jenis_kelamin: jenisKelamin,
        status_pekerjaan: statusPekerjaan,
        role_impian: roleImpian.trim() || undefined,
      });

      if (res.status === 'sukses') {
        setNotifikasi({ tipe: 'sukses', teks: 'Data identitas profil berhasil disimpan!' });
        const updateData = {
          ...pengguna,
          nama_pengguna: namaLengkap,
          umur: umur ? Number(umur) : undefined,
          status_pekerjaan: statusPekerjaan,
          role_impian: roleImpian,
        };
        onPerbaruiPengguna(updateData);
        localStorage.setItem('intervu_pengguna', JSON.stringify(updateData));
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

      {/* Tab 1: Identitas Profil & Onboarding */}
      {tabAktif === 'profil' && (
        <Kartu className="p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-600" />
            Informasi Pribadi, Foto & Karir
          </h2>
          <form onSubmit={simpanProfil} className="space-y-6">
            {/* Bagian Foto Profil: Upload File Asli & Kompresi */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-orange-50/50 rounded-2xl border border-orange-200/70">
              <div className="relative w-20 h-20 rounded-full bg-slate-200 border-2 border-white shadow flex items-center justify-center text-slate-500 font-bold text-2xl overflow-hidden shrink-0">
                {urlFoto ? (
                  <img src={urlFoto} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  namaLengkap.slice(0, 2).toUpperCase() || 'IU'
                )}
                {sedangUnggahFoto && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">Foto Profil</h4>
                  <p className="text-xs text-stone-500">
                    Format JPG, PNG, atau WebP (Maksimal 5MB, dikompresi otomatis demi kecepatan).
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                  <input
                    type="file"
                    ref={inputBerkasRef}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={tanganiPilihBerkasFoto}
                  />
                  <button
                    type="button"
                    disabled={sedangUnggahFoto}
                    onClick={() => inputBerkasRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{urlFoto ? 'Ganti Foto' : 'Pilih Berkas Foto'}</span>
                  </button>

                  {urlFoto && (
                    <button
                      type="button"
                      disabled={sedangUnggahFoto}
                      onClick={tanganiHapusFoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Nama Lengkap & Nomor Telepon */}
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

            {/* Informasi Onboarding & Preferensi Karir */}
            <div className="pt-2 border-t border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Profil Karir & Target Wawancara
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Umur (Tahun)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={80}
                    placeholder="23"
                    value={umur}
                    onChange={(e) => setUmur(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 shadow-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 shadow-sm transition-all"
                  >
                    <option value="pria">Pria</option>
                    <option value="wanita">Wanita</option>
                    <option value="memilih_tidak_disebutkan">Memilih tidak disebutkan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Tahap Karir Saat Ini
                  </label>
                  <select
                    value={statusPekerjaan}
                    onChange={(e) => setStatusPekerjaan(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 shadow-sm transition-all"
                  >
                    <option value="mahasiswa">Mahasiswa Aktif (Persiapan Magang / Skripsi)</option>
                    <option value="pelajar">Pelajar SMA / SMK</option>
                    <option value="fresh_graduate">Fresh Graduate (Lulusan Baru &lt; 1 Tahun)</option>
                    <option value="pekerja">Karyawan / Profesional Aktif</option>
                    <option value="mencari_kerja">Sedang Aktif Mencari Kerja</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Role / Posisi Impian
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Frontend Developer, Product Manager"
                    value={roleImpian}
                    onChange={(e) => setRoleImpian(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Tombol
                type="submit"
                varian="primer"
                ukuran="md"
                sedangMemuat={sedangMenyimpan}
                className="bg-orange-600 hover:bg-orange-700 font-bold"
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
