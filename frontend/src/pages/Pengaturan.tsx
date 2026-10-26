// Halaman Pengaturan Akun: Single Unified Responsive Component (pages/Pengaturan.tsx)
// Pola Mobile App Native Modern (iOS Settings / Gojek / Glints Hub Pattern):
// 1. Color Palette: Background krem lembut (#FAF8F5 / #FDFBF7), kartu putih (#FFFFFF) dengan hairline border,
//    aksen utama terracotta/oranye (#C84B31 / #D95326), dan badge token kuning keemasan.
// 2. Hub Pattern (Main View):
//    - Top Bar bersih & minimalis.
//    - Compact Profile Card: Avatar inisial dengan tombol kamera, Nama, Email, badge status, & tombol Edit.
//    - Grup 1: PROFIL & KARIR (Informasi Pribadi & Kontak, Profil Karir & Target Wawancara).
//    - Grup 2: PENGATURAN AKUN (Keamanan & Kata Sandi, Bahasa Aplikasi dengan nilai saat ini).
//    - Grup 3: LAINNYA (Beri Ulasan Aplikasi, Keluar Akun dengan teks merah lembut).
// 3. Sub-View View:
//    - Dibuka saat menu diklik dengan tombol "<- Kembali ke Pengaturan".
//    - Input field standar mobile (height: 44px-48px, padding: 10px 14px, radius: 12px, font-size: 14px).
//    - Umur & Jenis Kelamin dalam Grid 2 kolom bersebelahan.
//    - Sticky primary button "Simpan Identitas Profil" di atas Bottom Navigation.
// 4. Preserved Logic: Seluruh data binding, supabase photo upload & compression, API handlers, dan notifikasi toast tetap utuh.

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

export type SubPagePengaturan = null | 'personal' | 'career' | 'security' | 'language' | 'review';

export const Pengaturan: React.FC<PropertiPengaturan> = ({ pengguna, onPerbaruiPengguna, onKeluar }) => {
  const { bahasa, setBahasa, t } = useBahasa();
  const [activeSubPage, setActiveSubPage] = useState<SubPagePengaturan>(null);

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
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
  const [notifikasi, setNotifikasi] = useState<{ tipe: 'sukses' | 'gagal'; teks: string } | null>(null);

  useEffect(() => {
    setBahasaDipilih(bahasa);
  }, [bahasa]);

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
        }
      }).catch(() => {
        const namaFallback = pengguna.nama_pengguna && !pengguna.nama_pengguna.includes('@') ? pengguna.nama_pengguna : '';
        setNamaLengkap(namaFallback);
      });
    }
  }, [pengguna]);

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
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Gagal kompresi kanvas.'));
              },
              'image/webp',
              0.82
            );
          } else {
            reject(new Error('Gagal inisialisasi kanvas 2D.'));
          }
        };
        img.onerror = () => reject(new Error('Gagal memproses gambar.'));
      };
      reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    });
  };

  const tanganiPilihBerkasFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotifikasi({ tipe: 'gagal', teks: 'Format berkas harus berupa gambar (JPG, PNG, WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotifikasi({ tipe: 'gagal', teks: 'Ukuran berkas melebihi batas 5MB.' });
      return;
    }

    setSedangUnggahFoto(true);
    setNotifikasi(null);

    try {
      const blobTerkonversi = await kompresGambar(file);
      const ekstensi = 'webp';
      const namaFileUnik = `${pengguna.pengguna_id}-${Date.now()}.${ekstensi}`;
      const pathFile = `profil/${namaFileUnik}`;

      const { error: errUpload } = await supabase.storage
        .from('avatars')
        .upload(pathFile, blobTerkonversi, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (errUpload) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setUrlFoto(base64Data);
          setNotifikasi({ tipe: 'sukses', teks: 'Foto profil berhasil dimuat lokal.' });
        };
        reader.readAsDataURL(blobTerkonversi);
        return;
      }

      const { data: dataUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(pathFile);

      if (dataUrl?.publicUrl) {
        setUrlFoto(dataUrl.publicUrl);
        setNotifikasi({ tipe: 'sukses', teks: 'Foto profil berhasil diperbarui.' });
      }
    } catch (err: any) {
      setNotifikasi({ tipe: 'gagal', teks: err.message || 'Gagal memproses berkas foto.' });
    } finally {
      setSedangUnggahFoto(false);
      if (inputBerkasRef.current) inputBerkasRef.current.value = '';
    }
  };

  const tanganiHapusFoto = () => {
    setUrlFoto('');
    setNotifikasi({ tipe: 'sukses', teks: 'Foto profil dihapus. Klik simpan untuk menerapkan.' });
  };

  const simpanProfil = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSedangMenyimpan(true);
    setNotifikasi(null);

    const formattedTelepon = nomorTelepon ? (nomorTelepon.startsWith('0') ? `+62${nomorTelepon.slice(1)}` : `+62${nomorTelepon}`) : '';

    try {
      const res = await api.updateIdentitas({
        pengguna_id: pengguna.pengguna_id,
        nama_lengkap: namaLengkap,
        nomor_telepon: formattedTelepon,
        url_foto_profil: urlFoto,
        preferensi_bahasa: bahasaDipilih,
        umur: umur ? Number(umur) : undefined,
        status_pekerjaan: statusPekerjaan,
        jenis_kelamin: jenisKelamin,
        role_impian: roleImpian,
      });

      if (res.status === 'sukses') {
        setNotifikasi({ tipe: 'sukses', teks: 'Profil berhasil diperbarui!' });
        onPerbaruiPengguna({
          ...pengguna,
          nama_pengguna: namaLengkap || pengguna.nama_pengguna,
          url_foto_profil: urlFoto,
          preferensi_bahasa: bahasaDipilih,
          umur: umur ? Number(umur) : undefined,
          status_pekerjaan: statusPekerjaan,
          jenis_kelamin: jenisKelamin,
          role_impian: roleImpian,
        });
      } else {
        setNotifikasi({ tipe: 'gagal', teks: res.detail || 'Gagal menyimpan profil.' });
      }
    } catch (err: any) {
      setNotifikasi({ tipe: 'gagal', teks: err.message || 'Gagal memperbarui profil.' });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  const tanganiGantiEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailBaru) return;
    setSedangMenyimpan(true);
    setNotifikasi(null);

    try {
      const res = await api.ajukanUbahEmail({ pengguna_id: pengguna.pengguna_id, email_baru: emailBaru });
      if (res.status === 'sukses') {
        setNotifikasi({ tipe: 'sukses', teks: res.pesan || 'Pengajuan ubah email berhasil diproses.' });
        setEmailBaru('');
      } else {
        setNotifikasi({ tipe: 'gagal', teks: res.detail || 'Gagal mengajukan ganti email.' });
      }
    } catch (err: any) {
      setNotifikasi({ tipe: 'gagal', teks: err.message || 'Gagal mengubah email.' });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  const tanganiMintaResetPassword = async () => {
    setSedangMenyimpan(true);
    setNotifikasi(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(pengguna.email, {
        redirectTo: `${window.location.origin}/atur-ulang-sandi`,
      });

      if (error) {
        setNotifikasi({ tipe: 'gagal', teks: error.message });
      } else {
        setNotifikasi({
          tipe: 'sukses',
          teks: `Tautan reset kata sandi telah dikirimkan ke ${pengguna.email}. Silakan periksa kotak masuk email Anda.`,
        });
      }
    } catch (err: any) {
      setNotifikasi({ tipe: 'gagal', teks: err.message || 'Gagal meminta reset sandi.' });
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

  return (
    <div className="max-w-2xl mx-auto px-3.5 sm:px-6 py-3.5 sm:py-6 space-y-4 pb-28 md:pb-12 safe-padding-x font-sans">
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
      {/* HEADER NAVIGASI SUB-LAYAR (Muncul saat masuk ke sub-view) */}
      {/* ========================================================= */}
      {activeSubPage !== null && (
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setActiveSubPage(null)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 min-h-[40px] px-2 py-1 -ml-1 rounded-xl hover:bg-stone-100 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-orange-700" />
            <span>Kembali ke Pengaturan</span>
          </button>
          <span className="text-xs font-bold text-orange-800 tracking-wide uppercase">
            {activeSubPage === 'personal' ? 'Informasi Pribadi' :
             activeSubPage === 'career' ? 'Target Karir' :
             activeSubPage === 'security' ? 'Keamanan' :
             activeSubPage === 'language' ? 'Bahasa' : 'Ulasan'}
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. MAIN VIEW: VERTICAL MENU LIST (HUB PATTERN)             */}
      {/* ========================================================= */}
      {activeSubPage === null && (
        <div className="space-y-4 animate-fadeIn">
          {/* A. Compact Profile Card (Atas) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-sm flex items-center justify-between gap-3">
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
                <input
                  type="file"
                  ref={inputBerkasRef}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={tanganiPilihBerkasFoto}
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-stone-900 truncate">
                  {namaTampilanHeader}
                </h1>
                <p className="text-xs text-stone-500 truncate">{pengguna.email}</p>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-orange-50 text-orange-900 border border-orange-200/80">
                    <Briefcase className="w-2.5 h-2.5 text-orange-700 shrink-0" />
                    <span className="truncate max-w-[150px]">{statusLabelMap[statusPekerjaan] || 'Kandidat'}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubPage('personal')}
              className="shrink-0 p-2 text-stone-500 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-all active:scale-95 flex items-center gap-1 text-xs font-semibold"
              title="Edit Profil"
            >
              <Edit3 className="w-4 h-4 text-orange-700" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>

          {/* B. Grup Menu 1: PROFIL & KARIR */}
          <div className="space-y-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Profil & Karir
            </span>
            <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm divide-y divide-stone-100">
              {/* Item 1: Informasi Pribadi & Kontak */}
              <button
                type="button"
                onClick={() => setActiveSubPage('personal')}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:scale-99 min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-stone-900">Informasi Pribadi & Kontak</div>
                    <div className="text-[11px] text-stone-500">Nama lengkap, foto profil, nomor WhatsApp</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Item 2: Profil Karir & Target Wawancara */}
              <button
                type="button"
                onClick={() => setActiveSubPage('career')}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:scale-99 min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-stone-900">Profil Karir & Target Wawancara</div>
                    <div className="text-[11px] text-stone-500 truncate max-w-[200px] sm:max-w-xs">
                      {roleImpian || 'Posisi impian'} • {statusLabelMap[statusPekerjaan]}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>

          {/* C. Grup Menu 2: PENGATURAN AKUN */}
          <div className="space-y-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Pengaturan Akun
            </span>
            <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm divide-y divide-stone-100">
              {/* Item 3: Keamanan & Kata Sandi */}
              <button
                type="button"
                onClick={() => setActiveSubPage('security')}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:scale-99 min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-stone-900">Keamanan & Kata Sandi</div>
                    <div className="text-[11px] text-stone-500">Ubah email dan pemulihan kata sandi</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Item 4: Bahasa Aplikasi */}
              <button
                type="button"
                onClick={() => setActiveSubPage('language')}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:scale-99 min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-stone-900">Bahasa Aplikasi</div>
                    <div className="text-[11px] text-stone-500">
                      Pilihan bahasa navigasi & antarmuka
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    {bahasa === 'id' ? 'Indonesia' : 'English'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </button>
            </div>
          </div>

          {/* D. Grup Menu 3: LAINNYA */}
          <div className="space-y-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Lainnya
            </span>
            <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm divide-y divide-stone-100">
              {/* Item 5: Beri Ulasan Aplikasi */}
              <button
                type="button"
                onClick={() => setActiveSubPage('review')}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:scale-99 min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-stone-900">Beri Ulasan Aplikasi</div>
                    <div className="text-[11px] text-stone-500">Kritik, saran, dan rating pengalaman</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Item 6: Keluar Akun (Merah Lembut) */}
              {onKeluar && (
                <button
                  type="button"
                  onClick={onKeluar}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left text-rose-700 hover:bg-rose-50/50 transition-colors active:scale-99 min-h-[52px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold">Keluar Akun</div>
                      <div className="text-[11px] text-rose-500">Keluar dari sesi akun saat ini</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SUB-VIEW: INFORMASI PRIBADI & KONTAK                    */}
      {/* ========================================================= */}
      {activeSubPage === 'personal' && (
        <form onSubmit={simpanProfil} className="space-y-4 animate-fadeIn">
          {/* Card Foto Profil */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-stone-100 border-2 border-stone-200 overflow-hidden flex items-center justify-center text-stone-600 font-bold text-2xl shadow-inner">
                {urlFoto ? (
                  <img src={urlFoto} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  namaTampilanHeader.slice(0, 2).toUpperCase()
                )}
                {sedangUnggahFoto && (
                  <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 absolute -bottom-1 -right-1">
                {urlFoto && (
                  <button
                    type="button"
                    onClick={tanganiHapusFoto}
                    aria-label="Hapus foto profil"
                    title="Hapus foto"
                    className="w-7 h-7 rounded-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center shadow-md active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  disabled={sedangUnggahFoto}
                  onClick={() => inputBerkasRef.current?.click()}
                  aria-label="Ubah foto profil"
                  title="Pilih foto"
                  className="w-7 h-7 rounded-full bg-orange-700 hover:bg-orange-800 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-stone-500">Format JPG, PNG, atau WebP (Maks 5MB)</p>
          </div>

          {/* Form Fields: Compact Mobile Form */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-3 shadow-sm">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
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

            {/* Input Telepon dengan Prefix +62 Terpisah */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
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

          {/* Sticky Primary Action Button */}
          <div className="pt-2 sticky bottom-20 z-30">
            <Tombol
              type="submit"
              varian="primer"
              sedangMemuat={sedangMenyimpan}
              className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[48px] rounded-xl shadow-lg shadow-orange-700/20 text-sm active:scale-98 transition-transform"
            >
              <Save className="w-4 h-4 mr-2" />
              <span>{t.pengaturan.profil.tombolSimpan}</span>
            </Tombol>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* 3. SUB-VIEW: PROFIL KARIR & TARGET WAWANCARA              */}
      {/* ========================================================= */}
      {activeSubPage === 'career' && (
        <form onSubmit={simpanProfil} className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-3.5 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              {t.pengaturan.profil.subjudulKarir}
            </span>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
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
              <label className="block text-xs font-medium text-stone-700 mb-1">
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

            {/* Umur & Gender 2 Kolom Berdampingan (Hemat Ruang Vertikal) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
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
                <label className="block text-xs font-medium text-stone-700 mb-1">
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

          {/* Sticky Primary Action Button */}
          <div className="pt-2 sticky bottom-20 z-30">
            <Tombol
              type="submit"
              varian="primer"
              sedangMemuat={sedangMenyimpan}
              className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[48px] rounded-xl shadow-lg shadow-orange-700/20 text-sm active:scale-98 transition-transform"
            >
              <Save className="w-4 h-4 mr-2" />
              <span>{t.pengaturan.profil.tombolSimpan}</span>
            </Tombol>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* 4. SUB-VIEW: KEAMANAN & KATA SANDI                         */}
      {/* ========================================================= */}
      {activeSubPage === 'security' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Ubah Email */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-3 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              {t.pengaturan.keamanan.judulEmail}
            </span>
            <p className="text-xs text-stone-500">{t.pengaturan.keamanan.subjudulEmail}</p>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Email Saat Ini</label>
              <input
                type="email"
                disabled
                value={pengguna?.email || ''}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-100 text-stone-500 border border-stone-300 rounded-xl min-h-[44px] cursor-not-allowed"
              />
            </div>

            <form onSubmit={tanganiGantiEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
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

              <Tombol
                type="submit"
                varian="primer"
                sedangMemuat={sedangMenyimpan}
                className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold min-h-[46px] rounded-xl text-sm"
              >
                {t.pengaturan.keamanan.tombolGantiEmail}
              </Tombol>
            </form>
          </div>

          {/* Reset Password */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-3 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              {t.pengaturan.keamanan.judulReset}
            </span>
            <p className="text-xs text-stone-500 leading-relaxed">{t.pengaturan.keamanan.subjudulReset}</p>

            <Tombol
              type="button"
              varian="sekunder"
              onClick={tanganiMintaResetPassword}
              sedangMemuat={sedangMenyimpan}
              className="w-full min-h-[46px] rounded-xl font-bold text-sm border-stone-300"
            >
              <Lock className="w-4 h-4 mr-2 text-stone-600" />
              <span>{t.pengaturan.keamanan.tombolKirimReset}</span>
            </Tombol>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SUB-VIEW: BAHASA APLIKASI                               */}
      {/* ========================================================= */}
      {activeSubPage === 'language' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-3.5 shadow-sm animate-fadeIn">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            {t.pengaturan.bahasa.judul}
          </span>
          <p className="text-xs text-stone-500">{t.pengaturan.bahasa.subjudul}</p>

          <div className="space-y-2.5">
            {/* Bahasa Indonesia */}
            <button
              type="button"
              onClick={() => {
                setBahasaDipilih('id');
                setBahasa('id');
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all min-h-[52px] active:scale-98 ${
                bahasaDipilih === 'id'
                  ? 'border-orange-600 bg-orange-50/50'
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
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all min-h-[52px] active:scale-98 ${
                bahasaDipilih === 'en'
                  ? 'border-orange-600 bg-orange-50/50'
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

          <div className="pt-2">
            <Tombol
              type="button"
              varian="primer"
              onClick={(e) => {
                setBahasa(bahasaDipilih);
                simpanProfil(e);
              }}
              sedangMemuat={sedangMenyimpan}
              className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold min-h-[46px] rounded-xl text-sm active:scale-98 transition-transform"
            >
              {t.pengaturan.bahasa.tombolTerapkan}
            </Tombol>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. SUB-VIEW: BERI ULASAN APLIKASI                          */}
      {/* ========================================================= */}
      {activeSubPage === 'review' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-3.5 shadow-sm animate-fadeIn">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            {t.pengaturan.ulasan.judul}
          </span>
          <p className="text-xs text-stone-500">{t.pengaturan.ulasan.subjudul}</p>

          <form onSubmit={kirimUlasan} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-2">
                {t.pengaturan.ulasan.labelRating}
              </label>
              <div className="flex items-center gap-1 sm:gap-2">
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
              <label className="block text-xs font-medium text-stone-700 mb-1">
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

            <Tombol
              type="submit"
              varian="primer"
              sedangMemuat={sedangMenyimpan}
              className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold min-h-[46px] rounded-xl text-sm active:scale-98 transition-transform"
            >
              {t.pengaturan.ulasan.tombolKirim}
            </Tombol>
          </form>
        </div>
      )}
    </div>
  );
};
