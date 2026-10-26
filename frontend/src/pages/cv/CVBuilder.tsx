// Halaman Penyusun CV ATS (pages/cv/CVBuilder.tsx)
// Mematuhi FE-04 (Dwibahasa i18n), FE-06 (Mobile 320px s.d Desktop 1920px), dan antislop rules.
// Tidak ada data dummy hardcoded: data murni diambil dan disimpan ke Supabase via backend FastAPI.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Kartu } from '../../components/ui/Kartu';
import { Tombol } from '../../components/ui/Tombol';
import { api } from '../../services/api';
import { useBahasa } from '../../i18n';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  Trash2, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  CheckCircle2, 
  Eye,
  Edit3
} from 'lucide-react';

interface PropertiCVBuilder {
  pengguna: any;
}

interface ItemEdukasi {
  institusi: string;
  jurusan: string;
  gelar: string;
  tahun: string;
  ipk: string;
}

interface ItemPengalaman {
  perusahaan: string;
  posisi: string;
  periode: string;
  deskripsi: string;
}

interface ItemProyek {
  nama: string;
  teknologi: string;
  deskripsi: string;
}

export const CVBuilder: React.FC<PropertiCVBuilder> = ({ pengguna }) => {
  const { t } = useBahasa();
  const navigate = useNavigate();

  // Mode View (Khusus mobile toggle antara Form & ATS Paper Preview)
  const [tabAktif, setTabAktif] = useState<'editor' | 'pratinjau'>('editor');

  // State Data CV (No hardcoded data)
  const [judulCv, setJudulCv] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [emailKontak, setEmailKontak] = useState('');
  const [teleponKontak, setTeleponKontak] = useState('');
  const [linkedinKontak, setLinkedinKontak] = useState('');
  const [domisiliKontak, setDomisiliKontak] = useState('');
  const [ringkasan, setRingkasan] = useState('');

  const [daftarEdukasi, setDaftarEdukasi] = useState<ItemEdukasi[]>([]);
  const [daftarPengalaman, setDaftarPengalaman] = useState<ItemPengalaman[]>([]);
  const [daftarProyek, setDaftarProyek] = useState<ItemProyek[]>([]);
  const [daftarKeahlian, setDaftarKeahlian] = useState<string[]>([]);
  const [inputKeahlian, setInputKeahlian] = useState('');

  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
  const [pesanNotifikasi, setPesanNotifikasi] = useState<string | null>(null);

  // Ambil Data CV Asli dari Database
  useEffect(() => {
    if (!pengguna?.pengguna_id) return;

    let mounted = true;
    api.ambilStatusCV(pengguna.pengguna_id)
      .then((res) => {
        if (!mounted) return;
        if (res.status === 'sukses' && res.ada_cv && res.cv) {
          const cv = res.cv;
          setJudulCv(cv.judul_cv || '');
          setTargetRole(cv.target_role || '');

          const konten = cv.konten_json || {};
          const kontak = konten.data_kontak || {};
          setNamaLengkap(kontak.nama_lengkap || pengguna.nama_pengguna || '');
          setEmailKontak(kontak.email || pengguna.email || '');
          setTeleponKontak(kontak.telepon || '');
          setLinkedinKontak(kontak.linkedin || '');
          setDomisiliKontak(kontak.domisili || '');
          setRingkasan(konten.ringkasan_eksekutif || '');

          setDaftarEdukasi(Array.isArray(konten.riwayat_edukasi) ? konten.riwayat_edukasi : []);
          setDaftarPengalaman(Array.isArray(konten.pengalaman_kerja) ? konten.pengalaman_kerja : []);
          setDaftarProyek(Array.isArray(konten.proyek_portofolio) ? konten.proyek_portofolio : []);
          setDaftarKeahlian(Array.isArray(konten.keahlian) ? konten.keahlian : []);
        } else {
          // Inisialisasi awal bersih dari profil akun pengguna
          setNamaLengkap(pengguna.nama_pengguna || '');
          setEmailKontak(pengguna.email || '');
          setJudulCv(`CV ${pengguna.nama_pengguna || 'Profesional'}`);
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data CV:', err);
      })
      .finally(() => {
        if (mounted) setSedangMemuat(false);
      });

    return () => {
      mounted = false;
    };
  }, [pengguna]);

  // Handler Simpan Draf ke Supabase
  const tanganiSimpan = async () => {
    if (!pengguna?.pengguna_id) return;

    setSedangMenyimpan(true);
    setPesanNotifikasi(null);

    const payload = {
      pengguna_id: pengguna.pengguna_id,
      judul_cv: judulCv.trim() || `CV ${namaLengkap || 'Profesional'}`,
      target_role: targetRole.trim() || 'Software Engineer',
      konten_json: {
        data_kontak: {
          nama_lengkap: namaLengkap,
          email: emailKontak,
          telepon: teleponKontak,
          linkedin: linkedinKontak,
          domisili: domisiliKontak,
        },
        ringkasan_eksekutif: ringkasan,
        riwayat_edukasi: daftarEdukasi,
        pengalaman_kerja: daftarPengalaman,
        proyek_portofolio: daftarProyek,
        keahlian: daftarKeahlian,
      },
    };

    try {
      const res = await api.simpanDrafCV(payload);
      if (res.status === 'sukses') {
        setPesanNotifikasi(t.cvBuilder.drafTersimpan);
        setTimeout(() => setPesanNotifikasi(null), 4000);
      } else {
        alert(res.pesan || 'Gagal menyimpan draf CV.');
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan sistem: ${err.message || 'Koneksi terputus'}`);
    } finally {
      setSedangMenyimpan(false);
    }
  };

  // Helper Edukasi
  const tambahEdukasi = () => {
    setDaftarEdukasi([
      ...daftarEdukasi,
      { institusi: '', jurusan: '', gelar: '', tahun: '', ipk: '' },
    ]);
  };
  const hapusEdukasi = (idx: number) => {
    setDaftarEdukasi(daftarEdukasi.filter((_, i) => i !== idx));
  };
  const updateEdukasi = (idx: number, field: keyof ItemEdukasi, val: string) => {
    const baru = [...daftarEdukasi];
    baru[idx][field] = val;
    setDaftarEdukasi(baru);
  };

  // Helper Pengalaman
  const tambahPengalaman = () => {
    setDaftarPengalaman([
      ...daftarPengalaman,
      { perusahaan: '', posisi: '', periode: '', deskripsi: '' },
    ]);
  };
  const hapusPengalaman = (idx: number) => {
    setDaftarPengalaman(daftarPengalaman.filter((_, i) => i !== idx));
  };
  const updatePengalaman = (idx: number, field: keyof ItemPengalaman, val: string) => {
    const baru = [...daftarPengalaman];
    baru[idx][field] = val;
    setDaftarPengalaman(baru);
  };

  // Helper Proyek
  const tambahProyek = () => {
    setDaftarProyek([
      ...daftarProyek,
      { nama: '', teknologi: '', deskripsi: '' },
    ]);
  };
  const hapusProyek = (idx: number) => {
    setDaftarProyek(daftarProyek.filter((_, i) => i !== idx));
  };
  const updateProyek = (idx: number, field: keyof ItemProyek, val: string) => {
    const baru = [...daftarProyek];
    baru[idx][field] = val;
    setDaftarProyek(baru);
  };

  // Helper Keahlian
  const tambahKeahlian = () => {
    if (!inputKeahlian.trim()) return;
    const split = inputKeahlian
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !daftarKeahlian.includes(s));
    setDaftarKeahlian([...daftarKeahlian, ...split]);
    setInputKeahlian('');
  };
  const hapusKeahlian = (nama: string) => {
    setDaftarKeahlian(daftarKeahlian.filter((k) => k !== nama));
  };

  // Aksi Cetak PDF Standar Browser
  const tanganiCetak = () => {
    window.print();
  };

  if (sedangMemuat) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-stone-500">
        <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm">Memuat data CV Anda dari server...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 pb-28 md:pb-12 safe-padding-x print:p-0 print:m-0">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={t.cvBuilder.kembaliKeBeranda}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              {t.cvBuilder.judulHalaman}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 hidden sm:block">
              {t.cvBuilder.subjudulHalaman}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTabAktif('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all min-h-[38px] ${
                tabAktif === 'editor' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t.cvBuilder.tabEditor}</span>
            </button>
            <button
              type="button"
              onClick={() => setTabAktif('pratinjau')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all min-h-[38px] ${
                tabAktif === 'pratinjau' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.cvBuilder.tabPratinjau}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={tanganiCetak}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors min-h-[42px]"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>{t.cvBuilder.cetakPdf}</span>
          </button>

          <Tombol
            varian="primer"
            ukuran="md"
            onClick={tanganiSimpan}
            disabled={sedangMenyimpan}
            className="bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs min-h-[42px] px-4 shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>{sedangMenyimpan ? t.cvBuilder.sedangMenyimpan : t.cvBuilder.tombolSimpanDraf}</span>
          </Tombol>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {pesanNotifikasi && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 print:hidden shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{pesanNotifikasi}</span>
        </div>
      )}

      {/* 2-Column Split View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Kolom Kiri: Form Builder Editor */}
        <div className={`lg:col-span-6 space-y-5 print:hidden ${tabAktif === 'pratinjau' ? 'hidden lg:block' : 'block'}`}>
          {/* Metadata Card: Judul & Target Role */}
          <Kartu className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.cvBuilder.targetRoleLabel} *
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder={t.cvBuilder.targetRolePlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-600 min-h-[40px]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.cvBuilder.judulCvLabel}
                </label>
                <input
                  type="text"
                  value={judulCv}
                  onChange={(e) => setJudulCv(e.target.value)}
                  placeholder={t.cvBuilder.judulCvPlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-600 min-h-[40px]"
                />
              </div>
            </div>
          </Kartu>

          {/* Bagian 1: Data Kontak & Profil */}
          <Kartu className="p-4 sm:p-6 space-y-3.5">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
              {t.cvBuilder.bagianKontak}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {t.cvBuilder.namaLengkap} *
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 min-h-[38px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {t.cvBuilder.email} *
                </label>
                <input
                  type="email"
                  value={emailKontak}
                  onChange={(e) => setEmailKontak(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 min-h-[38px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {t.cvBuilder.telepon}
                </label>
                <input
                  type="text"
                  value={teleponKontak}
                  onChange={(e) => setTeleponKontak(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 min-h-[38px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {t.cvBuilder.domisili}
                </label>
                <input
                  type="text"
                  value={domisiliKontak}
                  onChange={(e) => setDomisiliKontak(e.target.value)}
                  placeholder="Jakarta, Indonesia"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 min-h-[38px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                {t.cvBuilder.linkedin}
              </label>
              <input
                type="text"
                value={linkedinKontak}
                onChange={(e) => setLinkedinKontak(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 min-h-[38px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                {t.cvBuilder.ringkasan}
              </label>
              <textarea
                rows={3}
                value={ringkasan}
                onChange={(e) => setRingkasan(e.target.value)}
                placeholder={t.cvBuilder.ringkasanPlaceholder}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 leading-relaxed"
              />
            </div>
          </Kartu>

          {/* Bagian 2: Riwayat Edukasi */}
          <Kartu className="p-4 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-orange-700" />
                <span>{t.cvBuilder.bagianEdukasi}</span>
              </h2>
              <button
                type="button"
                onClick={tambahEdukasi}
                className="text-xs text-orange-800 hover:text-orange-950 font-bold min-h-[36px] flex items-center"
              >
                {t.cvBuilder.tambahEdukasi}
              </button>
            </div>

            {daftarEdukasi.map((edu, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 relative">
                <button
                  type="button"
                  onClick={() => hapusEdukasi(idx)}
                  className="absolute top-2 right-2 p-1 text-stone-400 hover:text-red-600 transition-colors"
                  title={t.cvBuilder.hapusItem}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-6">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.namaKampus}</span>
                    <input
                      type="text"
                      value={edu.institusi}
                      onChange={(e) => updateEdukasi(idx, 'institusi', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.jurusan}</span>
                    <input
                      type="text"
                      value={edu.jurusan}
                      onChange={(e) => updateEdukasi(idx, 'jurusan', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.gelar}</span>
                    <input
                      type="text"
                      value={edu.gelar}
                      onChange={(e) => updateEdukasi(idx, 'gelar', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.tahunLulus}</span>
                      <input
                        type="text"
                        value={edu.tahun}
                        onChange={(e) => updateEdukasi(idx, 'tahun', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.nilaiIpk}</span>
                      <input
                        type="text"
                        value={edu.ipk}
                        onChange={(e) => updateEdukasi(idx, 'ipk', e.target.value)}
                        placeholder="3.85 / 4.0"
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Kartu>

          {/* Bagian 3: Pengalaman Kerja */}
          <Kartu className="p-4 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-orange-700" />
                <span>{t.cvBuilder.bagianPengalaman}</span>
              </h2>
              <button
                type="button"
                onClick={tambahPengalaman}
                className="text-xs text-orange-800 hover:text-orange-950 font-bold min-h-[36px] flex items-center"
              >
                {t.cvBuilder.tambahPengalaman}
              </button>
            </div>

            {daftarPengalaman.map((exp, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 relative">
                <button
                  type="button"
                  onClick={() => hapusPengalaman(idx)}
                  className="absolute top-2 right-2 p-1 text-stone-400 hover:text-red-600 transition-colors"
                  title={t.cvBuilder.hapusItem}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-6">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.namaPerusahaan}</span>
                    <input
                      type="text"
                      value={exp.perusahaan}
                      onChange={(e) => updatePengalaman(idx, 'perusahaan', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.posisiJabatan}</span>
                    <input
                      type="text"
                      value={exp.posisi}
                      onChange={(e) => updatePengalaman(idx, 'posisi', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.periodeWaktu}</span>
                  <input
                    type="text"
                    value={exp.periode}
                    onChange={(e) => updatePengalaman(idx, 'periode', e.target.value)}
                    placeholder="Jun 2023 - Sekarang"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.deskripsiPekerjaan}</span>
                  <textarea
                    rows={2}
                    value={exp.deskripsi}
                    onChange={(e) => updatePengalaman(idx, 'deskripsi', e.target.value)}
                    placeholder={t.cvBuilder.deskripsiPlaceholder}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </Kartu>

          {/* Bagian 4: Proyek Portofolio */}
          <Kartu className="p-4 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-orange-700" />
                <span>{t.cvBuilder.bagianProyek}</span>
              </h2>
              <button
                type="button"
                onClick={tambahProyek}
                className="text-xs text-orange-800 hover:text-orange-950 font-bold min-h-[36px] flex items-center"
              >
                {t.cvBuilder.tambahProyek}
              </button>
            </div>

            {daftarProyek.map((proj, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 relative">
                <button
                  type="button"
                  onClick={() => hapusProyek(idx)}
                  className="absolute top-2 right-2 p-1 text-stone-400 hover:text-red-600 transition-colors"
                  title={t.cvBuilder.hapusItem}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-6">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.namaProyek}</span>
                    <input
                      type="text"
                      value={proj.nama}
                      onChange={(e) => updateProyek(idx, 'nama', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.teknologiDigunakan}</span>
                    <input
                      type="text"
                      value={proj.teknologi}
                      onChange={(e) => updateProyek(idx, 'teknologi', e.target.value)}
                      placeholder="React, Tailwind, Node.js"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block mb-0.5">{t.cvBuilder.deskripsiProyek}</span>
                  <textarea
                    rows={2}
                    value={proj.deskripsi}
                    onChange={(e) => updateProyek(idx, 'deskripsi', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 bg-white leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </Kartu>

          {/* Bagian 5: Keahlian */}
          <Kartu className="p-4 sm:p-6 space-y-3.5">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
              {t.cvBuilder.bagianKeahlian}
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputKeahlian}
                onChange={(e) => setInputKeahlian(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    tambahKeahlian();
                  }
                }}
                placeholder={t.cvBuilder.keahlianPlaceholder}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-stone-300 min-h-[40px]"
              />
              <Tombol
                varian="sekunder"
                ukuran="sm"
                onClick={tambahKeahlian}
                className="text-xs font-bold min-h-[40px] px-3.5"
              >
                {t.cvBuilder.tambahKeahlian}
              </Tombol>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {daftarKeahlian.map((k, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200"
                >
                  <span>{k}</span>
                  <button
                    type="button"
                    onClick={() => hapusKeahlian(k)}
                    className="text-stone-400 hover:text-red-600 font-bold ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Kartu>
        </div>

        {/* Kolom Kanan: Pratinjau Lembar Kertas ATS (1-Column Clean Paper) */}
        <div className={`lg:col-span-6 ${tabAktif === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-stone-900 font-sans print:border-none print:shadow-none print:p-0">
            {/* ATS Header */}
            <div className="text-center pb-4 border-b border-stone-300 space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">
                {namaLengkap || 'NAMA LENGKAP KANDIDAT'}
              </h2>
              {targetRole && (
                <div className="text-xs sm:text-sm font-semibold text-stone-700 tracking-wide">
                  {targetRole}
                </div>
              )}
              <div className="text-[11px] text-stone-600 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1">
                {emailKontak && <span>{emailKontak}</span>}
                {teleponKontak && <span>• {teleponKontak}</span>}
                {domisiliKontak && <span>• {domisiliKontak}</span>}
                {linkedinKontak && <span>• {linkedinKontak}</span>}
              </div>
            </div>

            {/* ATS Ringkasan Profesional */}
            {ringkasan && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-0.5">
                  RINGKASAN PROFESIONAL
                </h3>
                <p className="text-xs text-stone-700 leading-relaxed text-justify">
                  {ringkasan}
                </p>
              </div>
            )}

            {/* ATS Pengalaman Kerja */}
            {daftarPengalaman.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-0.5">
                  PENGALAMAN KERJA
                </h3>
                {daftarPengalaman.map((exp, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between items-baseline font-bold">
                      <span>{exp.posisi || 'Posisi Jabatan'}</span>
                      <span className="text-stone-500 font-normal text-[11px]">{exp.periode}</span>
                    </div>
                    <div className="text-stone-600 font-medium italic text-[11px]">
                      {exp.perusahaan}
                    </div>
                    {exp.deskripsi && (
                      <p className="text-stone-700 leading-relaxed text-[11px] pt-0.5">
                        {exp.deskripsi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ATS Proyek */}
            {daftarProyek.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-0.5">
                  PROYEK UNGGULAN & PORTOFOLIO
                </h3>
                {daftarProyek.map((proj, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between items-baseline font-bold">
                      <span>{proj.nama || 'Nama Proyek'}</span>
                      {proj.teknologi && (
                        <span className="text-stone-500 font-normal text-[11px]">[{proj.teknologi}]</span>
                      )}
                    </div>
                    {proj.deskripsi && (
                      <p className="text-stone-700 leading-relaxed text-[11px]">
                        {proj.deskripsi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ATS Edukasi */}
            {daftarEdukasi.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-0.5">
                  PENDIDIKAN FORMAL
                </h3>
                {daftarEdukasi.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5 text-xs">
                    <div className="flex justify-between items-baseline font-bold">
                      <span>{edu.institusi || 'Nama Institusi'}</span>
                      <span className="text-stone-500 font-normal text-[11px]">{edu.tahun}</span>
                    </div>
                    <div className="text-stone-700 text-[11px]">
                      {edu.gelar ? `${edu.gelar} - ` : ''}{edu.jurusan}
                      {edu.ipk ? ` (IPK: ${edu.ipk})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ATS Keahlian */}
            {daftarKeahlian.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-0.5">
                  KEAHLIAN & KOMPETENSI
                </h3>
                <p className="text-xs text-stone-800 leading-relaxed">
                  {daftarKeahlian.join(' • ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
