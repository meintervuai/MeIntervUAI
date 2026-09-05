// Kamus Bahasa Indonesia (DEFAULT) — kunci dipakai lintas halaman.
export const terjemahanId = {
  umum: {
    appName: 'MENTERVU AI',
    tagline: 'Simulasi Wawancara Kerja Berbasis AI',
    masuk: 'Masuk',
    keluar: 'Keluar',
    simpan: 'Simpan',
    menyimpan: 'Menyimpan…',
    tersimpan: 'Tersimpan',
    batal: 'Batal',
    kembali: 'Kembali',
    segera: 'Segera',
    beranda: 'Beranda',
    profil: 'Profil',
  },
  masuk: {
    judul: 'Masuk ke akun Anda',
    deskripsi: 'Latih wawancara kerja dengan AI, susun CV kuat, dan siapkan karier Anda.',
    tombolGoogle: 'Masuk dengan Google',
    sedangProses: 'Mengalihkan ke Google…',
    gagal: 'Gagal memulai proses masuk. Coba lagi.',
    catatanPrivasi: 'Video wawancara Anda tidak pernah disimpan di server mana pun.',
  },
  beranda: {
    judul: 'Berlatih wawancara kini lebih tenang',
    deskripsi:
      'AI berperan sebagai pewawancara profesional: pertanyaan dinamis, umpan balik objektif, dan analisis CV ramah ATS — semuanya dari ponsel Anda.',
    ctaMulai: 'Mulai Latihan',
    poin1: 'Simulasi teks, audio, dan video',
    poin2: 'Analisis CV dengan skor objektif',
    poin3: 'Privasi utama — video tidak disimpan',
  },
  home: {
    sapaan: 'Halo',
    kuotaJudul: 'Kuota AI hari ini',
    kuotaSisa: 'sisa panggilan',
    tindakanJudul: 'Tindakan cepat',
    analisisJudul: 'Analisis CV',
    analisisKosong:
      'Belum ada CV untuk dianalisis. Susun CV Anda terlebih dahulu, lalu jalankan analisis ATS.',
    analisisBuat: 'Buat CV',
    tindakan: {
      analisis: 'Analisis CV',
      buatCv: 'Buat CV',
      simulasi: 'Simulasi',
      lowongan: 'Lowongan',
    },
  },
  profil: {
    judul: 'Profil',
    foto: 'Foto profil',
    gantiFoto: 'Ganti foto',
    nama: 'Nama lengkap',
    posisiTarget: 'Posisi target',
    posisiPlaceholder: 'mis. Frontend Developer',
    bahasa: 'Bahasa aplikasi',
    bahasaId: 'Indonesia',
    bahasaEn: 'Inggris',
    email: 'Email',
    kuota: 'Kuota AI hari ini',
    simpanPerubahan: 'Simpan perubahan',
    berhasilDisimpan: 'Perubahan profil tersimpan.',
    gagalSimpan: 'Gagal menyimpan perubahan. Coba lagi.',
    gagalUnggah: 'Gagal mengunggah foto. Coba lagi.',
  },
  segera: {
    judul: 'Segera hadir',
    deskripsi:
      'Modul ini sedang disiapkan. Fokus saat ini: masuk, beranda, CV, dan profil (Milestone 1).',
  },
  navigasi: {
    beranda: 'Home',
    cv: 'CV',
    simulasi: 'Simulasi',
    lowongan: 'Lowongan',
    profil: 'Profil',
  },
};

export type Kamus = typeof terjemahanId;