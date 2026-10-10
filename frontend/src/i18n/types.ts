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
