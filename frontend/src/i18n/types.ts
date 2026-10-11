export interface UlasanPenggunaItem {
  id: string;
  nama: string;
  peran: string;
  rating: number;
  tanggal: string;
  komentar: string;
}

export interface ModeSimulasiItem {
  id: string;
  nama: string;
  durasi: string;
  tag: string;
  ringkasan: string;
  penjelasan: string;
  fiturUtama: string[];
  gambar: string;
  ctaTeks: string;
}

export interface PusatBantuanKonten {
  nav: {
    logoText: string;
    ctaMasuk: string;
    ctaMulai: string;
  };
  hero: {
    kicker: string;
    judul: string;
    subjudul: string;
    ctaPrimer: string;
    ctaSekunder: string;
    pilarPlatform: Array<{ judul: string; label: string; keterangan: string }>;
  };
  simulator: {
    kicker: string;
    judul: string;
    subjudul: string;
    fokusLatihanLabel: string;
    daftarMode: ModeSimulasiItem[];
  };
  ulasan: {
    kicker: string;
    judul: string;
    subjudul: string;
    rataRataLabel: string;
    totalUlasanLabel: string;
    tombolTulisUlasan: string;
    tutupFormUlasan: string;
    form: {
      judul: string;
      labelNama: string;
      placeholderNama: string;
      labelPeran: string;
      placeholderPeran: string;
      labelRating: string;
      labelKomentar: string;
      placeholderKomentar: string;
      tombolKirim: string;
      suksesNotif: string;
      ratingDesc: { [key: number]: string };
    };
    daftarAwal: UlasanPenggunaItem[];
  };
  bankSoal: {
    judul: string;
    subjudul: string;
    kategori: Array<{ id: string; nama: string; jumlahSoal: string }>;
    daftarSoal: Array<{
      id: string;
      kategori: string;
      pertanyaan: string;
      tujuanPenguji: string;
      kunciJawabanSTAR: string;
    }>;
  };
  faq: {
    judul: string;
    subjudul: string;
    daftarFaq: Array<{ tanya: string; jawab: string }>;
  };
  kontak: {
    judul: string;
    subjudul: string;
    placeholderNama: string;
    placeholderEmail: string;
    placeholderPesan: string;
    tombolKirim: string;
    pesanTerkirim: string;
    slaResponse: string;
  };
  auth: {
    kembaliKeBeranda: string;
    judulMasuk: string;
    subjudulMasuk: string;
    judulDaftar: string;
    subjudulDaftar: string;
    tabMasuk: string;
    tabDaftar: string;
    tombolGoogle: string;
    pembatasAtau: string;
    labelEmail: string;
    placeholderEmail: string;
    labelUsername: string;
    placeholderUsername: string;
    labelKataSandi: string;
    placeholderKataSandi: string;
    labelKonfirmasiSandi: string;
    placeholderKonfirmasiSandi: string;
    ingatkanSayaLabel: string;
    lupaKataSandi: string;
    tombolSubmitMasuk: string;
    tombolSubmitDaftar: string;
    tokenSelamatDatangJudul: string;
    tokenSelamatDatangDesc: string;
    galatSandiPendek: string;
    galatSandiBeda: string;
    galatKredensialSalah: string;
    galatEmailTerdaftar: string;
    suksesDaftar: string;
    statusGoogleArah: string;
    // OTP Verifikasi
    judulVerifikasiOTP: string;
    subjudulVerifikasiOTP: string;
    labelKodeOTP: string;
    placeholderKodeOTP: string;
    tombolVerifikasiOTP: string;
    tombolKirimUlangOTP: string;
    tombolKembaliDaftar: string;
    countdownKirimUlang: string;
    suksesKirimUlangOTP: string;
    suksesVerifikasiOTP: string;
    // Lupa Sandi
    judulLupaSandi: string;
    subjudulLupaSandi: string;
    tombolKirimPemulihan: string;
    placeholderEmailLupaSandi: string;
    suksesKirimPemulihan: string;
    kembaliKeMasuk: string;
    // Atur Ulang Sandi
    judulAturUlangSandi: string;
    subjudulAturUlangSandi: string;
    labelSandiBaru: string;
    placeholderSandiBaru: string;
    labelKonfirmasiSandiBaru: string;
    placeholderKonfirmasiSandiBaru: string;
    tombolSimpanSandiBaru: string;
    tombolSedangMenyimpan: string;
    suksesPerbaruiSandi: string;
    tautanKedaluwarsaJudul: string;
    tautanKedaluwarsaDesc: string;
    tombolMintaTautanBaru: string;
    tipsSandi: string;
    butuhBantuanCSM: string;
    tautanBantuanCSM: string;
    // Kekuatan Sandi
    labelKekuatanSandi: string;
    kekuatanSandiLevel: Record<number, string>;
    // Ketentuan & Privasi
    disclaimerKetentuan: string;
    // Desktop / Tablet Showcase
    showcaseKicker: string;
    showcaseJudul: string;
    showcaseDesc: string;
    kutipanShowcase: string;
    penulisShowcase: string;
    simulasiLiveJudul: string;
    simulasiLivePeran: string;
    simulasiLiveSoal: string;
    simulasiLiveEvaluasi: string;
    fiturPoin: Array<{ judul: string; desc: string }>;
  };
  footer: {
    deskripsi: string;
    statusSistem: string;
    latency: string;
    kolomTautan: Array<{
      judul: string;
      tautan: Array<{ label: string; href: string }>;
    }>;
    hakCipta: string;
  };
}
