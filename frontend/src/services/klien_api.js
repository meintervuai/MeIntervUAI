import { supabase } from './klien_supabase';

/**
 * Pembungkus fetch ke backend FastAPI (klien_api).
 * Semua respons backend berbentuk: { status: 'sukses'|'gagal', data?, pesan? }
 * (struktur_file.md §7).
 */
const DASAR = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export async function panggilApi(jalur, { metode = 'GET', isi, kueri } = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = new URL(DASAR + jalur);
  if (kueri) {
    for (const [kunci, nilai] of Object.entries(kueri)) {
      if (nilai !== undefined && nilai !== null) url.searchParams.set(kunci, String(nilai));
    }
  }

  const tanggapan = await fetch(url.toString(), {
    method: metode,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    body: isi !== undefined ? JSON.stringify(isi) : undefined,
  });

  let badan = null;
  try {
    badan = await tanggapan.json();
  } catch {
    badan = null;
  }

  if (!tanggapan.ok) {
    const galat = new Error(badan?.pesan || `Permintaan gagal (${tanggapan.status})`);
    galat.status = tanggapan.status;
    throw galat;
  }
  return badan?.data ?? badan;
}