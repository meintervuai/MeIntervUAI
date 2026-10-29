// Tipe data sesi dan pesan simulasi wawancara
export interface PesanChat {
  id: string;
  pengirim: 'pewawancara' | 'kandidat';
  nama: string;
  peran?: string;
  teks: string;
  waktu: string;
  audio_url?: string;
  kondisi_terdeteksi?: string;
}

export type ModeSimulasiTipe = 'teks' | 'suara' | 'video';

