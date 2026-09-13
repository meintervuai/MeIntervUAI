/**
 * Layanan Data & Rekomendasi Lowongan Kerja Berbasis Live Aggregator & AI Smart Matching (FR-16, FR-17, FR-18).
 * 
 * Data lowongan 100% riil diambil secara dinamis dari JSearch API (RapidAPI) / Live Job Aggregators publik
 * (LinkedIn, Jobstreet, Indeed, Glints, Arbeitnow, Remotive).
 * Tidak ada data mockup atau nama perusahaan fiktif yang di-hardcode.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Mengambil daftar rekomendasi lowongan kerja hasil Smart Matching AI real-time dari profil CV pengguna
 * dan integrasi Live Job Board Aggregator.
 */
export async function ambilRekomendasiLowongan(
  cvData,
  { kataKunci = '', sistemKerja = 'Semua', urutan = 'skor' } = {}
) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const respons = await fetch(`${BACKEND_URL}/api/lowongan/analisis-kecocokan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data_cv: cvData || null,
        kata_kunci: kataKunci || '',
        sistem_kerja: sistemKerja || 'Semua',
        urutan: urutan || 'skor',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!respons.ok) {
      const errorText = await respons.text();
      console.error('[api_lowongan] Backend mengembalikan status error:', respons.status, errorText);
      return [];
    }

    const json = await respons.json();
    const daftar = json?.data?.rekomendasi;
    if (Array.isArray(daftar) && daftar.length > 0) {
      // Normalisasi atribut untuk tampilan kartu frontend
      const terformat = daftar.map((item, index) => {
        const skor = item.persentase_kecocokan ?? item.skorKecocokan ?? 80;
        const skillsCocok = item.skills_cocok || item.skillsCocok || [];
        const skillsGap = item.skills_gap || item.skillsGap || [];
        const alasan = item.alasan_kecocokan || item.alasanAi || 'Sesuai dengan kualifikasi pada profil Anda.';
        const fokus = item.fokus_wawancara || item.rekomendasiPersiapan || 'Pertajam penjelasan studi kasus konkret dan metode STAR.';

        return {
          ...item,
          id: item.id || `low-live-${index + 1}`,
          skorKecocokan: skor,
          persentase_kecocokan: skor,
          skillsCocok,
          skills_cocok: skillsCocok,
          skillsGap,
          skills_gap: skillsGap,
          alasanAi: alasan,
          alasan_kecocokan: alasan,
          rekomendasiPersiapan: fokus,
          fokus_wawancara: fokus,
          logo_singkatan: (item.perusahaan || 'P')
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .split(' ')
            .filter(Boolean)
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'JB',
          warna_aksen: index % 3 === 0 ? 'bg-oranye-600' : index % 3 === 1 ? 'bg-blue-600' : 'bg-emerald-600',
        };
      });

      // Pengurutan di sisi klien jika diperlukan
      if (urutan === 'skor') {
        terformat.sort((a, b) => b.skorKecocokan - a.skorKecocokan);
      } else if (urutan === 'gaji') {
        terformat.sort((a, b) => (b.gaji_maks || 0) - (a.gaji_maks || 0));
      }

      return terformat;
    }

    return [];
  } catch (err) {
    console.error('[api_lowongan] Gagal melakukan fetch lowongan live dari backend:', err);
    return [];
  }
}

/**
 * Format Gaji Rupiah / Mata Uang Singkat (misal: "Rp 18 - 28 Juta / bln" atau "$80,000 - $110,000 / thn")
 */
export function formatGajiRingkas(min, maks, mataUang = 'IDR') {
  if (!min && !maks) return 'Gaji Kompetitif (Negosiasi)';

  if (mataUang === 'USD') {
    const minK = min ? `$${Math.round(min / 1000)}k` : '';
    const maksK = maks ? `$${Math.round(maks / 1000)}k` : '';
    if (minK && maksK) return `${minK} - ${maksK} / thn`;
    if (minK) return `Mulai ${minK} / thn`;
    return `Hingga ${maksK} / thn`;
  }

  // IDR
  const minJt = min ? (min / 1000000).toFixed(0) : '';
  const maksJt = maks ? (maks / 1000000).toFixed(0) : '';
  if (minJt && maksJt) {
    return `Rp ${minJt} - ${maksJt} Juta / bln`;
  }
  if (minJt) return `Mulai Rp ${minJt} Juta / bln`;
  return `Hingga Rp ${maksJt} Juta / bln`;
}
