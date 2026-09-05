// Tipe entitas — mencerminkan database.md §5 (jangan menyimpang).

export type Bahasa = 'id' | 'en';

export interface Profil {
  id: string;
  email: string | null;
  nama_lengkap: string | null;
  url_avatar: string | null;
  status_akun: string | null;
  posisi_target: string | null;
  bahasa: Bahasa;
  batas_panggilan_harian: number;
  token_hari_ini: number;
  kuota_tambahan: number | null;
  terakhir_reset_kuota: string;
  peran: 'pengguna' | 'admin';
}

export interface InfoKuota {
  batas: number;
  terpakai: number;
  sisa: number;
}