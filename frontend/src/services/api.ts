// API client wrapper untuk berkomunikasi dengan backend FastAPI MeIntervUAI.
// Mengelola panggilan autentikasi, profil, CSM publik, dan pengaturan akun.

const BASE_URL = '/api';

export interface ResponApi<T = any> {
  status: 'sukses' | 'galat' | 'perlu_verifikasi_otp_30hari' | 'belum_verifikasi';
  pesan?: string;
  data?: T;
  [key: string]: any;
}

export const api = {
  // Autentikasi
  async daftar(email: string, nama_pengguna: string, kata_sandi: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/auth/daftar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nama_pengguna, kata_sandi }),
    });
    return res.json();
  },

  async masuk(email: string, kata_sandi?: string, token_google?: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/auth/masuk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, kata_sandi, token_google }),
    });
    return res.json();
  },

  async verifikasiOTP(email: string, kode_otp: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/auth/verifikasi-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, kode_otp }),
    });
    return res.json();
  },

  async kirimUlangOTP(email: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/auth/kirim-ulang-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  // CSM Publik
  async kirimTiketPublik(data: {
    nama_pengirim: string;
    email_pengirim: string;
    kategori_kendala: string;
    subjek_pesan: string;
    isi_pesan: string;
  }): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/csm/tiket-publik`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getFAQPublik(): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/csm/faq-publik`);
    return res.json();
  },

  async getUlasanPublik(): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/csm/ulasan-publik`);
    return res.json();
  },

  // Profil & Onboarding
  async getProfil(pengguna_id: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/profil/${pengguna_id}`);
    return res.json();
  },

  async updateProfil(data: {
    pengguna_id: string;
    umur?: number;
    status_pekerjaan?: string;
    jenis_kelamin?: string;
    industri_impian?: string;
    role_impian?: string;
  }): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/profil`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Pengaturan
  async updateIdentitas(data: {
    pengguna_id: string;
    nama_lengkap?: string;
    nomor_telepon?: string;
    url_foto_profil?: string;
    preferensi_bahasa?: string;
    umur?: number;
    jenis_kelamin?: string;
    status_pekerjaan?: string;
    role_impian?: string;
  }): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/pengaturan/identitas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async unggahFotoProfil(pengguna_id: string, berkas: File | Blob, namaBerkas: string = 'foto.jpg'): Promise<ResponApi> {
    const formData = new FormData();
    formData.append('pengguna_id', pengguna_id);
    formData.append('berkas', berkas, namaBerkas);

    const res = await fetch(`${BASE_URL}/pengaturan/foto-profil`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async hapusFotoProfil(pengguna_id: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/pengaturan/foto-profil`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pengguna_id }),
    });
    return res.json();
  },

  async ajukanUbahEmail(data: { pengguna_id: string; email_baru: string }): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/pengaturan/ubah-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async kirimUlasan(data: {
    pengguna_id: string;
    bintang_rating: number;
    isi_ulasan?: string;
  }): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/pengaturan/ulasan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // CV ATS
  async ambilStatusCV(pengguna_id: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/cv/status/${pengguna_id}`);
    return res.json();
  },

  async simpanDrafCV(data: {
    pengguna_id: string;
    judul_cv: string;
    target_role: string;
    konten_json: any;
  }): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/cv/simpan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async analisisSkorCV(data: { pengguna_id: string }): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/cv/analisis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Simulasi Wawancara Adaptif
  async cekKelayakanSimulasi(pengguna_id: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/simulasi/kelayakan/${pengguna_id}`);
    return res.json();
  },

  async mulaiSimulasi(data: {
    pengguna_id: string;
    target_role: string;
    mode?: string;
  }): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/simulasi/mulai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        status: 'galat',
        pesan: json.detail || json.message || json.pesan || 'Gagal memulai simulasi.'
      };
    }
    return json;
  },

  async kirimJawabanSimulasi(data: {
    sesi_id: string;
    pengguna_id: string;
    target_role: string;
    jawaban_kandidat: string;
    riwayat_chat: any[];
  }): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/simulasi/jawab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        status: 'galat',
        pesan: json.detail || json.message || json.pesan || 'Gagal mengirim jawaban simulasi.'
      };
    }
    return json;
  },

  async prosesInteraksiSuara(formData: FormData): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/simulasi/suara/proses`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        status: 'galat',
        pesan: json.detail || json.message || json.pesan || 'Gagal memproses interaksi suara.'
      };
    }
    return json;
  },

  async simpanEvaluasiSimulasi(payload: any): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/simulasi/evaluasi/simpan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        status: 'galat',
        pesan: json.detail || json.message || json.pesan || 'Gagal menyimpan evaluasi.'
      };
    }
    return json;
  },

  async ambilHistoriSimulasi(pengguna_id: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/simulasi/histori/${pengguna_id}`);
    const json = await res.json();
    if (!res.ok) {
      return {
        status: 'galat',
        pesan: json.detail || json.message || json.pesan || 'Gagal mengambil histori simulasi.'
      };
    }
    return json;
  },

  // Modul Lowongan Kerja (Job Board Aggregator)
  async cariLowongan(params?: {
    kata_kunci?: string;
    lokasi?: string;
    sumber?: string;
    tipe_kerja?: string;
    kategori?: string;
  }): Promise<ResponApi> {
    const q = new URLSearchParams();
    if (params?.kata_kunci) q.append('kata_kunci', params.kata_kunci);
    if (params?.lokasi) q.append('lokasi', params.lokasi);
    if (params?.sumber) q.append('sumber', params.sumber);
    if (params?.tipe_kerja) q.append('tipe_kerja', params.tipe_kerja);
    if (params?.kategori) q.append('kategori', params.kategori);

    const res = await fetch(`${BASE_URL}/lowongan/cari?${q.toString()}`);
    return res.json();
  },

  async ambilRekomendasiLowongan(pengguna_id: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/lowongan/rekomendasi/${pengguna_id}`);
    return res.json();
  },

  async ambilBookmarkLowongan(pengguna_id: string): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/lowongan/bookmark/${pengguna_id}`);
    return res.json();
  },

  async toggleBookmarkLowongan(pengguna_id: string, lowongan_id: string, lowongan_data?: any): Promise<ResponApi> {
    const res = await fetch(`${BASE_URL}/lowongan/bookmark/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pengguna_id, lowongan_id, lowongan_data }),
    });
    return res.json();
  },
};



