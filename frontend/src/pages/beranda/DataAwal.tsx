// Komponen DataAwal: Dialog modal profil awal kandidat (pages/beranda/DataAwal.tsx)
// Mematuhi antislop-copywriting & antislop-human: Tanpa ikon/badge AI slop, dilengkapi ilustrasi SVG resmi dan animasi transisi halus.
import React, { useState } from 'react';
import { DialogModal } from '../../components/ui/DialogModal';
import { Tombol } from '../../components/ui/Tombol';
import { api } from '../../services/api';
import { ArrowRight } from 'lucide-react';

interface PropertiDataAwal {
  terbuka: boolean;
  pengguna: any;
  profilAwal?: {
    umur?: number | '';
    jenis_kelamin?: string;
    status_pekerjaan?: string;
    role_impian?: string;
  };
  onSelesai: (dataProfil: {
    umur?: number;
    jenis_kelamin: string;
    status_pekerjaan: string;
    role_impian?: string;
  }) => void;
}

export const DataAwal: React.FC<PropertiDataAwal> = ({
  terbuka,
  pengguna,
  profilAwal,
  onSelesai,
}) => {
  const [umur, setUmur] = useState<number | ''>(profilAwal?.umur || '');
  const [jenisKelamin, setJenisKelamin] = useState(profilAwal?.jenis_kelamin || 'pria');
  const [statusPekerjaan, setStatusPekerjaan] = useState(profilAwal?.status_pekerjaan || 'mahasiswa');
  const [roleImpian, setRoleImpian] = useState(profilAwal?.role_impian || '');
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const tanganiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengguna) return;

    setSedangSimpan(true);
    const payload = {
      umur: umur ? Number(umur) : undefined,
      jenis_kelamin: jenisKelamin,
      status_pekerjaan: statusPekerjaan,
      role_impian: roleImpian.trim() || undefined,
    };

    try {
      const res = await api.updateProfil({
        pengguna_id: pengguna.pengguna_id,
        umur: payload.umur,
        status_pekerjaan: payload.status_pekerjaan,
        jenis_kelamin: payload.jenis_kelamin,
        role_impian: payload.role_impian,
      });

      if (res && res.status === 'sukses') {
        // Tandai di profil lokal agar modal tidak muncul kembali
        const profilTersimpan = {
          ...pengguna,
          umur: payload.umur,
          status_pekerjaan: payload.status_pekerjaan,
          jenis_kelamin: payload.jenis_kelamin,
          role_impian: payload.role_impian,
        };
        localStorage.setItem('intervu_pengguna', JSON.stringify(profilTersimpan));
      }
      onSelesai(payload);
    } catch (err) {
      console.error('Gagal memperbarui profil onboarding:', err);
      onSelesai(payload);
    } finally {
      setSedangSimpan(false);
    }
  };

  return (
    <DialogModal
      terbuka={terbuka}
      padaTutup={() => {}}
      wajibDiisi={true}
      tanpaTombolTutup={true}
      lebarMaksimal="max-w-2xl"
      judul="Lengkapi Profil Awal Anda"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1 animate-in fade-in zoom-in-95 duration-300">
        {/* Kolom Visual Kiri: Ilustrasi Karir & Konteks Humanis */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 text-center space-y-3">
          <div className="w-full max-w-[180px] py-2">
            <img
              src="/illustrations/career-development.svg"
              alt="Pengembangan Karir"
              className="w-full h-auto object-contain filter drop-shadow-sm transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-stone-900 tracking-tight">
              Personalisasi Sesi Latihan
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed max-w-[32ch] mx-auto">
              Informasi profil membantu menyesuaikan topik dan tingkat kesulitan studi kasus wawancara Anda.
            </p>
          </div>
        </div>

        {/* Kolom Formulir Kanan */}
        <div className="md:col-span-7">
          <form onSubmit={tanganiSubmit} className="space-y-3.5">
            {/* Umur & Jenis Kelamin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Umur (Tahun) <span className="text-rose-600 text-xs">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={15}
                  max={80}
                  placeholder="22"
                  value={umur}
                  onChange={(e) => setUmur(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Jenis Kelamin <span className="text-rose-600 text-xs">*</span>
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

            {/* Status Karir Saat Ini */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Tahap Karir Saat Ini <span className="text-rose-600 text-xs">*</span>
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

            {/* Role / Posisi Impian (Opsional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-800">
                  Role atau Posisi Impian
                </label>
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                  Opsional
                </span>
              </div>
              <input
                type="text"
                placeholder="Contoh: Frontend Developer, Product Manager"
                value={roleImpian}
                onChange={(e) => setRoleImpian(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 shadow-sm transition-all"
              />
            </div>

            <div className="pt-2">
              <Tombol
                type="submit"
                varian="primer"
                ukuran="md"
                sedangMemuat={sedangSimpan}
                className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[42px] shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                <span>Simpan Profil & Lanjut ke Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Tombol>
            </div>
          </form>
        </div>
      </div>
    </DialogModal>
  );
};
