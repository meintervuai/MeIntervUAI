// Halaman Pengaturan Akun & Karir: Single Unified Responsive Component (pages/Pengaturan.tsx)
// Mematuhi FE-04 (Dwibahasa i18n), FE-06 (Mobile 320px s.d Desktop 1920px), UX-11, UX-16.
// Perilaku Adaptif:
// 1. Mobile (< 1024px): Mobile Hub (daftar menu) & Drill-Down sub-view dengan tombol "<- Kembali ke Pengaturan".
// 2. Desktop (>= 1024px): Two-Column Master-Detail Layout (max-w-6xl)
//    - Page Header desktop: "Pengaturan Akun & Karir"
//    - Sidebar Kiri (lg:col-span-4): Kartu profil ringkas + Menu navigasi dengan active state terracotta (#C84B31)
//    - Panel Kanan (lg:col-span-8): Panel putih bersih dengan header menu, form grid 2-kolom, tombol simpan di kanan bawah.

import React, { useState, useEffect } from 'react';
import { Tombol } from '../components/ui/Tombol';
import { NotifikasiToast } from '../components/ui/NotifikasiToast';
import { api } from '../services/api';
import { supabase } from '../services/supabase';
import { useBahasa, KodeBahasa } from '../i18n';
import { 
  User,
  Target,
  Briefcase,
  ShieldCheck, 
  Globe, 
  Star, 
  Save, 
  Lock, 
  Camera, 
  Trash2, 
  Loader2,
  ChevronRight,
  ArrowLeft,
  LogOut,
  Edit3
} from 'lucide-react';

interface PropertiPengaturan {
  pengguna: any;
  onPerbaruiPengguna: (pengguna: any) => void;
  onKeluar?: () => void;
}

export type SubPagePengaturan = 'personal' | 'career' | 'security' | 'language' | 'review';

export const Pengaturan: React.FC<PropertiPengaturan> = ({ pengguna, onPerbaruiPengguna, onKeluar }) => {
  const { bahasa, setBahasa, t } = useBahasa();

  // State Sub-Page aktif:
  // Di mobile: null berarti tampilan daftar menu Hub.
  // Di desktop: default langsung 'personal' agar panel kanan tidak pernah kosong.
  const [activeMobileSubPage, setActiveMobileSubPage] = useState<SubPagePengaturan | null>(null);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<SubPagePengaturan>('personal');

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
  const [bahasaDipilih, setBahasaDipilih] = useState<KodeBahasa>(bahasa);

  // Tab Ulasan State
  const [ratingBintang, setRatingBintang] = useState(5);
  const [isiUlasan, setIsiUlasan] = useState('');

  // Notification & Loading
  const [sedangMemuatData, setSedangMemuatData] = useState(true);
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
  const [notifikasi, setNotifikasi] = useState<{ tipe: 'sukses' | 'gagal'; teks: string } | null>(null);

  const kunciCacheProfil = pengguna?.pengguna_id ? `profil_cache_${pengguna.pengguna_id}` : null;

  useEffect(() => {
    setBahasaDipilih(bahasa);
  }, [bahasa]);

  // 1. Caching Instan: Baca profil dari localStorage seketika (0 ms)
  useEffect(() => {
    if (!kunciCacheProfil) return;
    try {
      const cached = localStorage.getItem(kunciCacheProfil);
      if (cached) {
        const p = JSON.parse(cached);
        if (p) {
          if (p.nama_lengkap) setNamaLengkap(p.nama_lengkap);
          if (p.nomor_telepon) setNomorTelepon(p.nomor_telepon);
          if (p.url_foto_profil) setUrlFoto(p.url_foto_profil);
          if (p.umur) setUmur(p.umur);
          if (p.jenis_kelamin) setJenisKelamin(p.jenis_kelamin);
          if (p.status_pekerjaan) setStatusPekerjaan(p.status_pekerjaan);
          if (p.role_impian) setRoleImpian(p.role_impian);
          // Langsung buka layar form tanpa skeleton
          setSedangMemuatData(false);
        }
      }
    } catch {
      // Abaikan jika parsing gagal
    }
  }, [kunciCacheProfil]);

  // 2. Background Revalidation ke Server Supabase
  useEffect(() => {
    if (pengguna && pengguna.pengguna_id) {
      api.getProfil(pengguna.pengguna_id).then((res) => {
        if (res.status === 'sukses' && res.profil) {
          const p = res.profil;
          const namaAwal = p.nama_lengkap || (pengguna.nama_pengguna && !pengguna.nama_pengguna.includes('@') ? pengguna.nama_pengguna : '');
          setNamaLengkap(namaAwal);
          let telp = p.nomor_telepon || '';
          if (telp.startsWith('+62')) telp = telp.replace('+62', '').trim();
          else if (telp.startsWith('62')) telp = telp.replace(/^62/, '').trim();
          setNomorTelepon(telp);
          setUrlFoto(p.url_foto_profil || '');
          if (p.preferensi_bahasa === 'id' || p.preferensi_bahasa === 'en') {
            setBahasaDipilih(p.preferensi_bahasa);
            setBahasa(p.preferensi_bahasa);
          }
          if (p.umur) setUmur(p.umur);
          if (p.jenis_kelamin) setJenisKelamin(p.jenis_kelamin);
          if (p.status_pekerjaan) setStatusPekerjaan(p.status_pekerjaan);
          if (p.role_impian) setRoleImpian(p.role_impian);

          // Simpan ke cache lokal
          if (kunciCacheProfil) {
            try {
              localStorage.setItem(kunciCacheProfil, JSON.stringify(p));
            } catch {}
          }
        }
      }).catch(() => {
        const namaFallback = pengguna.nama_pengguna && !pengguna.nama_pengguna.includes('@') ? pengguna.nama_pengguna : '';
        setNamaLengkap(namaFallback);
      }).finally(() => {
        setSedangMemuatData(false);
      });
    }
  }, [pengguna, kunciCacheProfil]);

  // Utilitas kompresi gambar client-side
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
              if (blob) resolve(blob);
              else resolve(file);
            },
            'image/webp',
            0.8
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const tanganiPilihBerkasFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setNotifikasi({ tipe: 'gagal', teks: 'Format berkas harus berupa JPG, PNG, atau WebP.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotifikasi({ tipe: 'gagal', teks: 'Ukuran foto maksimal adalah 5MB.' });
      return;
    }

    setSedangUnggahFoto(true);
    setNotifikasi(null);

    try {
      const blobKompresi = await kompresGambar(file);
      const ekstensi = 'webp';
      const namaBerkas = `${pengguna.pengguna_id}_${Date.now()}.${ekstensi}`;
      const pathStorage = `foto-profil/${namaBerkas}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(pathStorage, blobKompresi, {
          contentType: 'image/webp',
          upsert: true,
        });

      let publicUrlFinal = '';

      if (uploadError) {
        const resBackend = await api.unggahFotoProfil(pengguna.pengguna_id, blobKompresi, namaBerkas);
        if (resBackend.status === 'sukses' && resBackend.url_foto) {
          publicUrlFinal = resBackend.url_foto;
        } else {
          throw new Error(uploadError.message || 'Gagal mengunggah foto profil.');
        }
      } else {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(pathStorage);
        publicUrlFinal = urlData.publicUrl;
      }

      const resUpdate = await api.updateIdentitas({
        pengguna_id: pengguna.pengguna_id,
        url_foto_profil: publicUrlFinal,
      });

      if (resUpdate.status === 'sukses') {
        setUrlFoto(publicUrlFinal);
        onPerbaruiPengguna({ ...pengguna, url_foto_profil: publicUrlFinal });
        setNotifikasi({ tipe: 'sukses', teks: 'Foto profil berhasil diperbarui!' });
      } else {
        throw new Error(resUpdate.detail || 'Gagal menyimpan URL foto profil.');
      }
    } catch (err: any) {
      setNotifikasi({ tipe: 'gagal', teks: err.message || 'Terjadi kesalahan saat mengunggah foto.' });
    } finally {
      setSedangUnggahFoto(false);
      if (inputBerkasRef.current) inputBerkasRef.current.value = '';
    }
  };

  const tanganiHapusFoto = async () => {
    if (!urlFoto) return;
    setSedangUnggahFoto(true);
    setNotifikasi(null);

    try {
      const res = await api.hapusFotoProfil(pengguna.pengguna_id);
      if (res.status === 'sukses') {
        setUrlFoto('');
        onPerbaruiPengguna({ ...pengguna, url_foto_profil: '' });
        setNotifikasi({ tipe: 'sukses', teks: 'Foto profil berhasil dihapus.' });
      } else {
        throw new Error(res.detail || 'Gagal menghapus foto profil.');
      }
    } catch (err: any) {
      setNotifikasi({ tipe: 'gagal', teks: err.message || 'Terjadi kesalahan saat menghapus foto.' });
    } finally {
      setSedangUnggahFoto(false);
    }
  };

  const simpanProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSedangMenyimpan(true);
    setNotifikasi(null);

    let telpFormatted = nomorTelepon.trim();
    if (telpFormatted) {
      if (telpFormatted.startsWith('0')) telpFormatted = telpFormatted.replace(/^0/, '');
      if (!telpFormatted.startsWith('+62')) telpFormatted = `+62${telpFormatted}`;
    }

    try {
      const res = await api.updateIdentitas({
        pengguna_id: pengguna.pengguna_id,
        nama_lengkap: namaLengkap.trim(),
        nomor_telepon: telpFormatted || undefined,
        preferensi_bahasa: bahasaDipilih,
        umur: umur ? Number(umur) : undefined,
        jenis_kelamin: jenisKelamin,
        status_pekerjaan: statusPekerjaan,
        role_impian: roleImpian.trim() || undefined,
      });

      if (res.status === 'sukses') {
        setNotifikasi({ tipe: 'sukses', teks: 'Profil berhasil diperbarui!' });
        onPerbaruiPengguna({
          ...pengguna,
          nama_pengguna: namaLengkap.trim() || pengguna.nama_pengguna,
          profil: {
            ...pengguna.profil,
            nama_lengkap: namaLengkap.trim(),
            nomor_telepon: telpFormatted,
            preferensi_bahasa: bahasaDipilih,
            umur: umur ? Number(umur) : undefined,
            jenis_kelamin: jenisKelamin,
            status_pekerjaan: statusPekerjaan,
            role_impian: roleImpian.trim(),
          },
        });
      } else {
        setNotifikasi({ tipe: 'gagal', teks: res.detail || 'Gagal memperbarui profil.' });
      }
    } catch (err: any) {
      setNotifikasi({ tipe: 'gagal', teks: err.message || 'Gagal memperbarui profil.' });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  const tanganiGantiEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailBaru || emailBaru === pengguna.email) {
      setNotifikasi({ tipe: 'gagal', teks: 'Silakan masukkan alamat email baru yang berbeda.' });
      return;
    }

    setSedangMenyimpan(true);
    setNotifikasi(null);

    try {
      const res = await api.ajukanUbahEmail({
        pengguna_id: pengguna.pengguna_id,
        email_baru: emailBaru,
      });

      if (res.status === 'sukses') {
        setNotifikasi({
          tipe: 'sukses',
          teks: 'Permohonan berhasil. Silakan periksa tautan verifikasi pada email baru Anda.',
        });
        setEmailBaru('');
      } else {
        setNotifikasi({ tipe: 'gagal', teks: res.detail || 'Gagal mengajukan perubahan email.' });
      }
    } catch (err: any) {
      setNotifikasi({ tipe: 'gagal', teks: err.message || 'Gagal mengajukan perubahan email.' });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  const tanganiMintaResetPassword = async () => {
    if (!pengguna.email) return;
    setSedangMenyimpan(true);
    setNotifikasi(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(pengguna.email, {
        redirectTo: `${window.location.origin}/reset-sandi`,
      });

      if (error) throw error;
      setNotifikasi({
        tipe: 'sukses',
        teks: 'Tautan pemulihan kata sandi telah dikirimkan ke email terdaftar Anda.',
      });
    } catch (err: any) {
      setNotifikasi({
        tipe: 'gagal',
        teks: err.message || 'Gagal mengirimkan email pemulihan kata sandi.',
      });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  const kirimUlasan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isiUlasan.trim()) return;
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
        setNotifikasi({ tipe: 'gagal', teks: res.detail || 'Gagal mengirimkan ulasan.' });
      }
    } catch (err: any) {
      setNotifikasi({ tipe: 'gagal', teks: err.message || 'Gagal mengirimkan ulasan.' });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  const statusLabelMap: Record<string, string> = {
    mahasiswa: t.pengaturan.profil.statusMahasiswa,
    fresh_grad: t.pengaturan.profil.statusFreshGrad,
    bekerja: t.pengaturan.profil.statusBekerja,
    pencari_kerja: t.pengaturan.profil.statusPencariKerja,
  };

  const namaTampilanHeader = namaLengkap || (pengguna.nama_pengguna && !pengguna.nama_pengguna.includes('@') ? pengguna.nama_pengguna : 'Kandidat MeIntervUAI');

  // Helper untuk memilih item menu (sinkron mobile & desktop)
  const pilihMenu = (menu: SubPagePengaturan) => {
    setActiveMobileSubPage(menu);
    setActiveDesktopMenu(menu);
  };

  // Render Form Detail Content (Dapat digunakan baik di Sub-view Mobile maupun Panel Kanan Desktop)
  const renderDetailContent = (menu: SubPagePengaturan, isDesktop: boolean = false) => {
    switch (menu) {
      case 'personal':
        return (
          <form onSubmit={simpanProfil} className="space-y-5 animate-fadeIn">
            {/* Foto Profil Card */}
            <div className={`bg-stone-50 rounded-xl border border-stone-200/90 p-4 sm:p-5 flex ${isDesktop ? 'flex-row items-center gap-6 text-left' : 'flex-col items-center justify-center text-center gap-3.5'}`}>
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-stone-100 border-2 border-stone-200 overflow-hidden flex items-center justify-center text-stone-600 font-bold text-2xl shadow-inner">
                  {urlFoto ? (
                    <img src={urlFoto} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    namaTampilanHeader.slice(0, 2).toUpperCase()
                  )}
                  {sedangUnggahFoto && (
                    <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-stone-900">{namaTampilanHeader}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Format JPG, PNG, atau WebP (Maks. 5MB)</p>
                </div>

                <div className="flex items-center gap-2 pt-0.5 justify-center sm:justify-start">
                  <button
                    type="button"
                    disabled={sedangUnggahFoto}
                    onClick={() => inputBerkasRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-sm transition-colors min-h-[34px] active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-stone-500" />
                    <span>Ubah Foto</span>
                  </button>

                  {urlFoto && (
                    <button
                      type="button"
                      disabled={sedangUnggahFoto}
                      onClick={tanganiHapusFoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors min-h-[34px] active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={inputBerkasRef}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={tanganiPilihBerkasFoto}
                />
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {t.pengaturan.profil.labelNama} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-normal text-stone-900 bg-white border border-stone-300 rounded-xl min-h-[46px] focus:outline-none focus:ring-2 focus:ring-orange-600 placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {t.pengaturan.profil.labelNomorHp}
                  </label>
                  <div className="flex rounded-xl border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-orange-600">
                    <span className="inline-flex items-center px-3.5 bg-stone-100 text-stone-600 text-xs font-semibold border-r border-stone-300">
                      +62
                    </span>
                    <input
                      type="tel"
                      placeholder="81234567890"
                      value={nomorTelepon}
                      onChange={(e) => setNomorTelepon(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-normal text-stone-900 bg-white border-0 min-h-[46px] focus:outline-none placeholder:text-stone-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Email Akun (Terkunci)
                </label>
                <input
                  type="email"
                  disabled
                  value={pengguna?.email || ''}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-100 text-stone-500 border border-stone-300 rounded-xl min-h-[46px] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className={`pt-4 border-t border-stone-100 ${isDesktop ? 'flex justify-end' : 'sticky bottom-20 z-30'}`}>
              <Tombol
                type="submit"
                varian="primer"
                sedangMemuat={sedangMenyimpan}
                className={`${isDesktop ? 'px-6' : 'w-full'} font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[46px] rounded-xl shadow-md text-sm active:scale-98 transition-transform`}
              >
                <Save className="w-4 h-4 mr-2" />
                <span>{t.pengaturan.profil.tombolSimpan}</span>
              </Tombol>
            </div>
          </form>
        );

      case 'career':
        return (
          <form onSubmit={simpanProfil} className="space-y-5 animate-fadeIn">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {t.pengaturan.profil.labelRoleImpian}
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Frontend Developer, Product Manager"
                    value={roleImpian}
                    onChange={(e) => setRoleImpian(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-normal text-stone-900 bg-white border border-stone-300 rounded-xl min-h-[46px] focus:outline-none focus:ring-2 focus:ring-orange-600 placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {t.pengaturan.profil.labelStatus}
                  </label>
                  <select
                    value={statusPekerjaan}
                    onChange={(e) => setStatusPekerjaan(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-normal text-stone-900 bg-white border border-stone-300 rounded-xl min-h-[46px] focus:outline-none focus:ring-2 focus:ring-orange-600"
                  >
                    <option value="mahasiswa">{t.pengaturan.profil.statusMahasiswa}</option>
                    <option value="fresh_grad">{t.pengaturan.profil.statusFreshGrad}</option>
                    <option value="bekerja">{t.pengaturan.profil.statusBekerja}</option>
                    <option value="pencari_kerja">{t.pengaturan.profil.statusPencariKerja}</option>
                  </select>
                </div>
              </div>

              {/* Umur & Gender 2 Kolom Berdampingan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {t.pengaturan.profil.labelUmur}
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="80"
                    placeholder="22"
                    value={umur}
                    onChange={(e) => setUmur(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 text-sm font-normal text-stone-900 bg-white border border-stone-300 rounded-xl min-h-[46px] focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {t.pengaturan.profil.labelGender}
                  </label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-normal text-stone-900 bg-white border border-stone-300 rounded-xl min-h-[46px] focus:outline-none focus:ring-2 focus:ring-orange-600"
                  >
                    <option value="pria">{t.pengaturan.profil.genderPria}</option>
                    <option value="wanita">{t.pengaturan.profil.genderWanita}</option>
                    <option value="rahasia">{t.pengaturan.profil.genderRahasia}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className={`pt-4 border-t border-stone-100 ${isDesktop ? 'flex justify-end' : 'sticky bottom-20 z-30'}`}>
              <Tombol
                type="submit"
                varian="primer"
                sedangMemuat={sedangMenyimpan}
                className={`${isDesktop ? 'px-6' : 'w-full'} font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[46px] rounded-xl shadow-md text-sm active:scale-98 transition-transform`}
              >
                <Save className="w-4 h-4 mr-2" />
                <span>{t.pengaturan.profil.tombolSimpan}</span>
              </Tombol>
            </div>
          </form>
        );

      case 'security':
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Ubah Email */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                {t.pengaturan.keamanan.judulEmail}
              </span>
              <p className="text-xs text-stone-500 leading-relaxed">{t.pengaturan.keamanan.subjudulEmail}</p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email Saat Ini</label>
                <input
                  type="email"
                  disabled
                  value={pengguna?.email || ''}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-100 text-stone-500 border border-stone-300 rounded-xl min-h-[46px] cursor-not-allowed"
                />
              </div>

              <form onSubmit={tanganiGantiEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {t.pengaturan.keamanan.labelEmailBaru}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="emailbaru@domain.com"
                    value={emailBaru}
                    onChange={(e) => setEmailBaru(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-normal text-stone-900 bg-white border border-stone-300 rounded-xl min-h-[46px] focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>

                <div className={isDesktop ? 'flex justify-end' : ''}>
                  <Tombol
                    type="submit"
                    varian="primer"
                    sedangMemuat={sedangMenyimpan}
                    className={`${isDesktop ? 'px-6' : 'w-full'} bg-orange-700 hover:bg-orange-800 text-white font-bold min-h-[46px] rounded-xl text-sm`}
                  >
                    {t.pengaturan.keamanan.tombolGantiEmail}
                  </Tombol>
                </div>
              </form>
            </div>

            <hr className="border-stone-200" />

            {/* Reset Password */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                {t.pengaturan.keamanan.judulReset}
              </span>
              <p className="text-xs text-stone-500 leading-relaxed">{t.pengaturan.keamanan.subjudulReset}</p>

              <div className={isDesktop ? 'flex justify-start' : ''}>
                <Tombol
                  type="button"
                  varian="sekunder"
                  onClick={tanganiMintaResetPassword}
                  sedangMemuat={sedangMenyimpan}
                  className={`${isDesktop ? 'px-6' : 'w-full'} min-h-[46px] rounded-xl font-bold text-sm border-stone-300`}
                >
                  <Lock className="w-4 h-4 mr-2 text-stone-600" />
                  <span>{t.pengaturan.keamanan.tombolKirimReset}</span>
                </Tombol>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                {t.pengaturan.bahasa.judul}
              </span>
              <p className="text-xs text-stone-500 mt-1">{t.pengaturan.bahasa.subjudul}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Bahasa Indonesia */}
              <button
                type="button"
                onClick={() => {
                  setBahasaDipilih('id');
                  setBahasa('id');
                }}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all min-h-[56px] active:scale-98 ${
                  bahasaDipilih === 'id'
                    ? 'border-orange-600 bg-orange-50/50 shadow-sm'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label="Bendera Indonesia">🇮🇩</span>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">{t.pengaturan.bahasa.labelId}</div>
                    <div className="text-xs text-stone-500">{t.pengaturan.bahasa.descId}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                  bahasaDipilih === 'id' ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  ID
                </span>
              </button>

              {/* English */}
              <button
                type="button"
                onClick={() => {
                  setBahasaDipilih('en');
                  setBahasa('en');
                }}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all min-h-[56px] active:scale-98 ${
                  bahasaDipilih === 'en'
                    ? 'border-orange-600 bg-orange-50/50 shadow-sm'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label="English flag">🌐</span>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">{t.pengaturan.bahasa.labelEn}</div>
                    <div className="text-xs text-stone-500">{t.pengaturan.bahasa.descEn}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                  bahasaDipilih === 'en' ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  EN
                </span>
              </button>
            </div>

            <div className={`pt-4 border-t border-stone-100 ${isDesktop ? 'flex justify-end' : ''}`}>
              <Tombol
                type="button"
                varian="primer"
                onClick={(e) => {
                  setBahasa(bahasaDipilih);
                  simpanProfil(e);
                }}
                sedangMemuat={sedangMenyimpan}
                className={`${isDesktop ? 'px-6' : 'w-full'} bg-orange-700 hover:bg-orange-800 text-white font-bold min-h-[46px] rounded-xl text-sm active:scale-98 transition-transform`}
              >
                {t.pengaturan.bahasa.tombolTerapkan}
              </Tombol>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                {t.pengaturan.ulasan.judul}
              </span>
              <p className="text-xs text-stone-500 mt-1">{t.pengaturan.ulasan.subjudul}</p>
            </div>

            <form onSubmit={kirimUlasan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  {t.pengaturan.ulasan.labelRating}
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((bintang) => (
                    <button
                      key={bintang}
                      type="button"
                      onClick={() => setRatingBintang(bintang)}
                      className="p-1.5 -m-1 hover:scale-110 active:scale-95 transition-transform focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={`${bintang} Bintang`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          bintang <= ratingBintang
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs sm:text-sm font-semibold text-stone-700">
                    {ratingBintang} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t.pengaturan.ulasan.labelIsi} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={t.pengaturan.ulasan.placeholderIsi}
                  value={isiUlasan}
                  onChange={(e) => setIsiUlasan(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-normal text-stone-900 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 placeholder:text-stone-400"
                />
              </div>

              <div className={isDesktop ? 'flex justify-end pt-2' : 'pt-2'}>
                <Tombol
                  type="submit"
                  varian="primer"
                  sedangMemuat={sedangMenyimpan}
                  className={`${isDesktop ? 'px-6' : 'w-full'} bg-orange-700 hover:bg-orange-800 text-white font-bold min-h-[46px] rounded-xl text-sm active:scale-98 transition-transform`}
                >
                  {t.pengaturan.ulasan.tombolKirim}
                </Tombol>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  // Metadata Panel Kanan Desktop
  const headerPanelMap: Record<SubPagePengaturan, { judul: string; desc: string; icon: React.ReactNode }> = {
    personal: {
      judul: 'Informasi Pribadi & Kontak',
      desc: 'Perbarui nama lengkap, nomor WhatsApp, dan foto profil akun Anda.',
      icon: <User className="w-5 h-5 text-orange-700" />,
    },
    career: {
      judul: 'Profil Karir & Target Wawancara',
      desc: 'Tentukan posisi impian, tahap karir, dan data demografis untuk simulasi AI.',
      icon: <Target className="w-5 h-5 text-orange-700" />,
    },
    security: {
      judul: 'Keamanan & Kata Sandi',
      desc: 'Kelola email akun resmi dan permintaan pemulihan kata sandi.',
      icon: <ShieldCheck className="w-5 h-5 text-orange-700" />,
    },
    language: {
      judul: 'Bahasa Aplikasi',
      desc: 'Sesuaikan bahasa navigasi antarmuka dan interaksi simulasi.',
      icon: <Globe className="w-5 h-5 text-orange-700" />,
    },
    review: {
      judul: 'Beri Ulasan Aplikasi',
      desc: 'Kritik dan saran konstruktif untuk pengembangan berkelanjutan platform.',
      icon: <Star className="w-5 h-5 text-orange-700" />,
    },
  };

  if (sedangMemuatData) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 pb-28 md:pb-12 safe-padding-x font-sans animate-pulse">
        {/* Skeleton Header */}
        <div className="hidden lg:block pb-4 border-b border-stone-200">
          <div className="w-56 h-7 bg-stone-200 rounded-lg" />
          <div className="w-96 h-4 bg-stone-100 rounded-md mt-2" />
        </div>

        {/* Skeleton Two-Column Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Sidebar Kiri */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-stone-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-32 h-4 bg-stone-200 rounded" />
                  <div className="w-24 h-3 bg-stone-100 rounded" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-full h-10 bg-stone-100 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Panel Kanan */}
          <div className="hidden lg:block lg:col-span-8">
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="w-48 h-6 bg-stone-200 rounded" />
              <div className="w-full h-24 bg-stone-100 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-12 bg-stone-100 rounded-xl" />
                <div className="w-full h-12 bg-stone-100 rounded-xl" />
              </div>
              <div className="w-32 h-10 bg-stone-300 rounded-xl ml-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 pb-28 md:pb-12 safe-padding-x font-sans">
      {/* Toast Notification (Melayang Anti Layout Shift) */}
      {notifikasi && (
        <NotifikasiToast
          tipe={notifikasi.tipe}
          pesan={notifikasi.teks}
          onTutup={() => setNotifikasi(null)}
          durasiMs={4000}
        />
      )}

      {/* ========================================================= */}
      {/* DESKTOP PAGE HEADER (Hanya Tampil di Layar Desktop >= 1024px) */}
      {/* ========================================================= */}
      <div className="hidden lg:block pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Pengaturan Akun & Karir
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Kelola identitas profil, target karir wawancara, dan preferensi akun Anda.
        </p>
      </div>

      {/* ========================================================= */}
      {/* RESPONSIVE LAYOUT CONTAINER                              */}
      {/* Mobile: 1 Kolom Hub/Detail                               */}
      {/* Desktop (lg:): 2 Kolom Master-Detail (3 Kolom / 9 Kolom)  */}
      {/* ========================================================= */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        
        {/* ========================================================= */}
        {/* KOLOM KIRI (Sidebar Master di Desktop / Menu Hub di Mobile) */}
        {/* Di mobile: Tersembunyi saat sub-page aktif                 */}
        {/* Di desktop: Selalu tampil sebagai sidebar navigasi sticky */}
        {/* ========================================================= */}
        <div className={`lg:col-span-3 lg:sticky lg:top-24 space-y-4 ${activeMobileSubPage !== null ? 'hidden lg:block' : 'block'}`}>
          {/* A. Compact Profile Card: HANYA TAMPIL DI MOBILE (< lg) UNTUK MENCEGAH DUPLIKASI KEMBAR DI DESKTOP */}
          <div className="lg:hidden bg-white rounded-2xl border border-stone-200/90 p-4 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-stone-100 border-2 border-stone-200 overflow-hidden flex items-center justify-center text-stone-600 font-bold text-lg shadow-inner">
                  {urlFoto ? (
                    <img src={urlFoto} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    namaTampilanHeader.slice(0, 2).toUpperCase()
                  )}
                  {sedangUnggahFoto && (
                    <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={sedangUnggahFoto}
                  onClick={() => inputBerkasRef.current?.click()}
                  aria-label="Ubah foto profil"
                  title="Pilih foto profil"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-700 hover:bg-orange-800 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-bold text-stone-900 truncate">
                  {namaTampilanHeader}
                </h2>
                <p className="text-xs text-stone-500 truncate">{pengguna.email}</p>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-orange-50 text-orange-900 border border-orange-200/80">
                    <Briefcase className="w-2.5 h-2.5 text-orange-700 shrink-0" />
                    <span className="truncate max-w-[150px]">{statusLabelMap[statusPekerjaan] || 'Kandidat'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Edit di pojok kartu profil: Hanya muncul di mobile (< lg) */}
            <button
              type="button"
              onClick={() => pilihMenu('personal')}
              className="shrink-0 p-2 text-stone-500 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-all active:scale-95 flex items-center gap-1 text-xs font-semibold"
              title="Edit Profil"
            >
              <Edit3 className="w-4 h-4 text-orange-700" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>

          {/* B. Grup Menu 1: PROFIL & KARIR */}
          <div className="space-y-1 sm:space-y-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Profil & Karir
            </span>
            <div className="bg-white lg:bg-transparent rounded-2xl lg:rounded-none border lg:border-none border-stone-200/90 overflow-hidden shadow-sm lg:shadow-none divide-y lg:divide-y-0 divide-stone-100 lg:space-y-1">
              {/* Item 1: Informasi Pribadi & Kontak */}
              <button
                type="button"
                onClick={() => pilihMenu('personal')}
                className={`w-full p-3.5 sm:p-4 lg:py-2.5 lg:px-3 flex items-center justify-between text-left transition-all min-h-[50px] lg:min-h-[42px] lg:rounded-xl ${
                  activeDesktopMenu === 'personal'
                    ? 'lg:bg-orange-50 lg:border-l-4 lg:border-orange-700 lg:text-orange-950 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 lg:hover:bg-stone-100/70 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg flex items-center justify-center shrink-0 ${
                    activeDesktopMenu === 'personal' ? 'bg-orange-100 text-orange-800' : 'bg-orange-50 text-orange-700'
                  }`}>
                    <User className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold lg:font-normal lg:text-xs truncate">Informasi Pribadi & Kontak</div>
                    <div className="text-[11px] text-stone-500 truncate lg:hidden">Nama, foto profil, nomor WhatsApp</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 ml-2 lg:hidden" />
              </button>

              {/* Item 2: Profil Karir & Target Wawancara */}
              <button
                type="button"
                onClick={() => pilihMenu('career')}
                className={`w-full p-3.5 sm:p-4 lg:py-2.5 lg:px-3 flex items-center justify-between text-left transition-all min-h-[50px] lg:min-h-[42px] lg:rounded-xl ${
                  activeDesktopMenu === 'career'
                    ? 'lg:bg-orange-50 lg:border-l-4 lg:border-orange-700 lg:text-orange-950 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 lg:hover:bg-stone-100/70 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg flex items-center justify-center shrink-0 ${
                    activeDesktopMenu === 'career' ? 'bg-orange-100 text-orange-800' : 'bg-orange-50 text-orange-700'
                  }`}>
                    <Target className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold lg:font-normal lg:text-xs truncate">Profil Karir & Target Wawancara</div>
                    <div className="text-[11px] text-stone-500 truncate lg:hidden">
                      {roleImpian || 'Posisi impian'} • {statusLabelMap[statusPekerjaan]}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 ml-2 lg:hidden" />
              </button>
            </div>
          </div>

          {/* C. Grup Menu 2: PENGATURAN AKUN */}
          <div className="space-y-1 sm:space-y-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Pengaturan Akun
            </span>
            <div className="bg-white lg:bg-transparent rounded-2xl lg:rounded-none border lg:border-none border-stone-200/90 overflow-hidden shadow-sm lg:shadow-none divide-y lg:divide-y-0 divide-stone-100 lg:space-y-1">
              {/* Item 3: Keamanan & Kata Sandi */}
              <button
                type="button"
                onClick={() => pilihMenu('security')}
                className={`w-full p-3.5 sm:p-4 lg:py-2.5 lg:px-3 flex items-center justify-between text-left transition-all min-h-[50px] lg:min-h-[42px] lg:rounded-xl ${
                  activeDesktopMenu === 'security'
                    ? 'lg:bg-orange-50 lg:border-l-4 lg:border-orange-700 lg:text-orange-950 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 lg:hover:bg-stone-100/70 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg flex items-center justify-center shrink-0 ${
                    activeDesktopMenu === 'security' ? 'bg-orange-100 text-orange-800' : 'bg-orange-50 text-orange-700'
                  }`}>
                    <ShieldCheck className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold lg:font-normal lg:text-xs truncate">Keamanan & Kata Sandi</div>
                    <div className="text-[11px] text-stone-500 truncate lg:hidden">Ubah email dan pemulihan kata sandi</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 ml-2 lg:hidden" />
              </button>

              {/* Item 4: Bahasa Aplikasi */}
              <button
                type="button"
                onClick={() => pilihMenu('language')}
                className={`w-full p-3.5 sm:p-4 lg:py-2.5 lg:px-3 flex items-center justify-between text-left transition-all min-h-[50px] lg:min-h-[42px] lg:rounded-xl ${
                  activeDesktopMenu === 'language'
                    ? 'lg:bg-orange-50 lg:border-l-4 lg:border-orange-700 lg:text-orange-950 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 lg:hover:bg-stone-100/70 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg flex items-center justify-center shrink-0 ${
                    activeDesktopMenu === 'language' ? 'bg-orange-100 text-orange-800' : 'bg-orange-50 text-orange-700'
                  }`}>
                    <Globe className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold lg:font-normal lg:text-xs truncate">Bahasa Aplikasi</div>
                    <div className="text-[11px] text-stone-500 truncate lg:hidden">Pilihan bahasa antarmuka</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[11px] font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    {bahasa === 'id' ? 'ID' : 'EN'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400 lg:hidden" />
                </div>
              </button>
            </div>
          </div>

          {/* D. Grup Menu 3: LAINNYA */}
          <div className="space-y-1 sm:space-y-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Lainnya
            </span>
            <div className="bg-white lg:bg-transparent rounded-2xl lg:rounded-none border lg:border-none border-stone-200/90 overflow-hidden shadow-sm lg:shadow-none divide-y lg:divide-y-0 divide-stone-100 lg:space-y-1">
              {/* Item 5: Beri Ulasan Aplikasi */}
              <button
                type="button"
                onClick={() => pilihMenu('review')}
                className={`w-full p-3.5 sm:p-4 lg:py-2.5 lg:px-3 flex items-center justify-between text-left transition-all min-h-[50px] lg:min-h-[42px] lg:rounded-xl ${
                  activeDesktopMenu === 'review'
                    ? 'lg:bg-orange-50 lg:border-l-4 lg:border-orange-700 lg:text-orange-950 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 lg:hover:bg-stone-100/70 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg flex items-center justify-center shrink-0 ${
                    activeDesktopMenu === 'review' ? 'bg-orange-100 text-orange-800' : 'bg-orange-50 text-orange-700'
                  }`}>
                    <Star className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold lg:font-normal lg:text-xs truncate">Beri Ulasan Aplikasi</div>
                    <div className="text-[11px] text-stone-500 truncate lg:hidden">Rating dan masukan platform</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 ml-2 lg:hidden" />
              </button>

              {/* Item 6: Keluar Akun */}
              {onKeluar && (
                <button
                  type="button"
                  onClick={onKeluar}
                  className="w-full p-3.5 sm:p-4 lg:py-2.5 lg:px-3 flex items-center justify-between text-left text-rose-700 hover:bg-rose-50/50 transition-colors min-h-[50px] lg:min-h-[42px] lg:rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold lg:font-normal lg:text-xs truncate">Keluar Akun</div>
                      <div className="text-[11px] text-rose-500 truncate lg:hidden">Akhiri sesi di perangkat ini</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0 ml-2 lg:hidden" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* KOLOM KANAN (Detail Panel di Desktop / Sub-View di Mobile) */}
        {/* ========================================================= */}
        <div className="lg:col-span-9">
          {/* TAMPILAN MOBILE (Hanya saat ada sub-page aktif di mobile) */}
          <div className="lg:hidden">
            {activeMobileSubPage !== null && (
              <div className="space-y-4">
                {/* Mobile Sub-view Header with Back Button */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <button
                    type="button"
                    onClick={() => setActiveMobileSubPage(null)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 min-h-[40px] px-2 py-1 -ml-1 rounded-xl hover:bg-stone-100 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 text-orange-700" />
                    <span>Kembali ke Pengaturan</span>
                  </button>
                  <span className="text-xs font-bold text-orange-800 tracking-wide uppercase">
                    {headerPanelMap[activeMobileSubPage]?.judul.split('&')[0]}
                  </span>
                </div>

                {/* Sub-view Form */}
                <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-sm">
                  {renderDetailContent(activeMobileSubPage, false)}
                </div>
              </div>
            )}
          </div>

          {/* TAMPILAN DESKTOP (Selalu Terbuka dengan Menu Aktif) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 lg:p-8 shadow-sm space-y-6">
              {/* Header Panel Desktop */}
              <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  {headerPanelMap[activeDesktopMenu]?.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                    {headerPanelMap[activeDesktopMenu]?.judul}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {headerPanelMap[activeDesktopMenu]?.desc}
                  </p>
                </div>
              </div>

              {/* Form Content Panel */}
              <div>
                {renderDetailContent(activeDesktopMenu, true)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
