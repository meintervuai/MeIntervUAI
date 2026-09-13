import { supabase } from './klien_supabase';
import { panggilApi } from './klien_api';

/**
 * Layanan penyimpanan sesi simulasi wawancara kerja AI (FR-09, FR-10, FR-12, FR-13).
 * Menyimpan data sesi, rangkaian pertanyaan (berbasis CV & follow-up dinamis),
 * jawaban pengguna, serta evaluasi skor komprehensif ke Supabase dengan fallback localStorage.
 */

const LOCAL_STORAGE_KEY = 'mentervu_riwayat_simulasi';

/**
 * Buat sesi wawancara baru di database (atau simpan lokal)
 */
export async function buatSesiWawancara({
  profilId,
  posisiTarget,
  perusahaanTarget = null,
  mode,
  bahasa = 'id',
}) {
  const dataSesi = {
    id: `sesi-${Date.now()}`,
    profil_id: profilId || null,
    posisi_target: posisiTarget,
    perusahaan_target: perusahaanTarget,
    mode,
    bahasa,
    status: 'berlangsung',
    tanggal_mulai: new Date().toISOString(),
  };

  if (profilId) {
    try {
      const payload = {
        profil_id: profilId,
        posisi_target: posisiTarget,
        mode,
        bahasa,
        status: 'berlangsung',
      };
      if (perusahaanTarget) {
        payload.perusahaan_target = perusahaanTarget;
      }

      const { data, error } = await supabase
        .from('sesi_wawancara')
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('[api_simulasi] Fallback ke sesi lokal:', e);
    }
  }

  return dataSesi;
}

/**
 * Simpan atau perbarui pertanyaan sesi ke database
 */
export async function simpanPertanyaanSesi({
  sesiId,
  pertanyaan,
  kategori,
  urutan,
  tipe = 'inti',
  sumberKonteks = 'cv_proyek',
  pertanyaanIndukId = null,
}) {
  const dataPertanyaan = {
    id: `pertanyaan-${Date.now()}-${urutan}`,
    sesi_id: sesiId,
    pertanyaan,
    kategori,
    urutan,
    tipe,
    sumber_konteks: sumberKonteks,
    pertanyaan_induk_id: pertanyaanIndukId,
    status: 'terjawab',
  };

  // Cek apakah sesiId adalah UUID valid (Supabase)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sesiId);
  if (isUuid) {
    try {
      const { data, error } = await supabase
        .from('pertanyaan_sesi')
        .insert({
          sesi_id: sesiId,
          pertanyaan,
          kategori,
          urutan,
          tipe,
          sumber_konteks: sumberKonteks,
          pertanyaan_induk_id: pertanyaanIndukId,
          status: 'terjawab',
        })
        .select()
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.warn('[api_simulasi] Gagal simpan pertanyaan ke DB:', e);
    }
  }

  return dataPertanyaan;
}

/**
 * Simpan jawaban pengguna per pertanyaan
 */
export async function simpanJawabanSesi({
  pertanyaanSesiId,
  teksMentah,
  durasiDetik = 0,
  skorPertanyaan = 75,
  evaluasiSingkat = '',
  jawabanIdeal = '',
}) {
  const dataJawaban = {
    id: `jawaban-${Date.now()}`,
    pertanyaan_sesi_id: pertanyaanSesiId,
    teks_mentah: teksMentah,
    durasi_detik: durasiDetik,
    skor_pertanyaan: skorPertanyaan,
    evaluasi_singkat: evaluasiSingkat,
    jawaban_ideal: jawabanIdeal,
  };

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(pertanyaanSesiId);
  if (isUuid) {
    try {
      const { data, error } = await supabase
        .from('jawaban_sesi')
        .insert({
          pertanyaan_sesi_id: pertanyaanSesiId,
          teks_mentah: teksMentah,
          durasi_detik: durasiDetik,
          skor_pertanyaan: skorPertanyaan,
          evaluasi_singkat: evaluasiSingkat,
          jawaban_ideal: jawabanIdeal,
        })
        .select()
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.warn('[api_simulasi] Gagal simpan jawaban ke DB:', e);
    }
  }

  return dataJawaban;
}

/**
 * Simpan laporan evaluasi komprehensif setelah seluruh sesi selesai
 */
export async function simpanEvaluasiSesi({
  sesiId,
  posisiTarget = 'Software Engineer',
  mode = 'video',
  bahasa = 'id',
  skorTotal,
  skorVerbal = 80,
  skorNonVerbal = 85,
  predikat,
  metrik,
  kekuatan,
  areaPeningkatan,
  rincianEvaluasi,
}) {
  const payloadEvaluasi = {
    id: `eval-${Date.now()}`,
    sesi_id: sesiId,
    posisi_target: posisiTarget,
    mode,
    bahasa,
    skor_total: skorTotal,
    skor_verbal: skorVerbal,
    skor_non_verbal: skorNonVerbal,
    predikat,
    metrik,
    kekuatan,
    area_peningkatan: areaPeningkatan,
    rincian_evaluasi: rincianEvaluasi,
    dibuat_pada: new Date().toISOString(),
  };

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sesiId);
  if (isUuid) {
    try {
      // Update status sesi_wawancara jadi 'selesai' dan skor_total
      await supabase
        .from('sesi_wawancara')
        .update({
          status: 'selesai',
          skor_total: skorTotal,
          tanggal_selesai: new Date().toISOString(),
          diperbarui_pada: new Date().toISOString(),
        })
        .eq('id', sesiId);

      const { data, error } = await supabase
        .from('evaluasi_sesi')
        .insert({
          sesi_id: sesiId,
          skor_total: skorTotal,
          skor_verbal: skorVerbal,
          skor_non_verbal: skorNonVerbal,
          predikat,
          metrik,
          kekuatan,
          area_peningkatan: areaPeningkatan,
          rincian_evaluasi: rincianEvaluasi,
        })
        .select()
        .single();

      if (!error && data) payloadEvaluasi.id = data.id;
    } catch (e) {
      console.warn('[api_simulasi] Gagal simpan evaluasi ke DB:', e);
    }
  }

  // Simpan juga ke localStorage agar riwayat offline selalu tersedia
  try {
    const tersimpan = localStorage.getItem(LOCAL_STORAGE_KEY);
    const listLama = tersimpan ? JSON.parse(tersimpan) : [];
    // Simpan data lengkap evaluasi
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([payloadEvaluasi, ...listLama.filter((x) => (x.sesi_id || x.id) !== sesiId).slice(0, 19)])
    );
  } catch (e) {
    console.warn('[api_simulasi] Gagal update localStorage:', e);
  }

  return payloadEvaluasi;
}

/**
 * Ambil riwayat simulasi pengguna dengan data ulasan dan metrik lengkap
 */
export async function ambilRiwayatSimulasi(profilId) {
  let rawList = [];
  if (profilId) {
    try {
      const { data, error } = await supabase
        .from('sesi_wawancara')
        .select(`
          id, posisi_target, mode, bahasa, status, skor_total, tanggal_mulai, tanggal_selesai,
          evaluasi_sesi (
            id, skor_total, skor_verbal, skor_non_verbal, predikat, metrik, kekuatan, area_peningkatan, rincian_evaluasi, dibuat_pada
          )
        `)
        .eq('profil_id', profilId)
        .order('tanggal_mulai', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        rawList = data.map((sesi) => {
          const evalItem = Array.isArray(sesi.evaluasi_sesi) ? sesi.evaluasi_sesi[0] : sesi.evaluasi_sesi;
          return {
            id: sesi.id,
            evaluasiId: evalItem?.id || null,
            posisiTarget: sesi.posisi_target || 'Posisi Wawancara',
            mode: sesi.mode || 'video',
            bahasa: sesi.bahasa || 'id',
            tanggal: sesi.tanggal_selesai || sesi.tanggal_mulai || evalItem?.dibuat_pada || new Date().toISOString(),
            skorTotal: sesi.skor_total ?? evalItem?.skor_total ?? 75,
            predikat: evalItem?.predikat || (sesi.skor_total >= 85 ? 'Sangat Kompeten' : 'Cukup Kompeten'),
            metrik: evalItem?.metrik || {
              relevansiIsi: 80,
              strukturStar: 75,
              kosaKataProfesional: 85,
              kepercayaanDiri: 80,
            },
            kekuatan: evalItem?.kekuatan || ['Menjawab dengan runut', 'Komunikasi terstruktur'],
            areaPeningkatan: evalItem?.area_peningkatan || ['Perkuat metode STAR pada bagian Result'],
            rincianPertanyaan: evalItem?.rincian_evaluasi || [],
          };
        });
      }
    } catch (e) {
      console.warn('[api_simulasi] Gagal ambil riwayat dari DB:', e);
    }
  }

  // Jika DB kosong atau error, gunakan data localStorage
  if (rawList.length === 0) {
    try {
      const tersimpan = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (tersimpan) {
        const parsed = JSON.parse(tersimpan);
        rawList = parsed.map((item) => ({
          id: item.sesi_id || item.id,
          evaluasiId: item.id,
          posisiTarget: item.posisi_target || item.posisi || 'Posisi Wawancara',
          mode: item.mode || 'video',
          bahasa: item.bahasa || 'id',
          tanggal: item.dibuat_pada || new Date().toISOString(),
          skorTotal: item.skor_total ?? item.skorTotal ?? 80,
          predikat: item.predikat || 'Kompeten',
          metrik: item.metrik || {
            relevansiIsi: 80,
            strukturStar: 78,
            kosaKataProfesional: 82,
            kepercayaanDiri: 85,
          },
          kekuatan: item.kekuatan || ['Struktur jawaban jelas', 'Contoh kerja relevan'],
          areaPeningkatan: item.area_peningkatan || item.areaPeningkatan || ['Tingkatkan kuantifikasi dampak (angka/metrik)'],
          rincianPertanyaan: item.rincian_evaluasi || item.rincianEvaluasi || [],
        }));
      }
    } catch {
      rawList = [];
    }
  }

  return rawList;
}

/**
 * Evaluasi jawaban kandidat secara interaktif via Backend LLM (atau fallback lokal cerdas).
 * Memberikan respons percakapan manusiawi, skor objektif (0-100), dan evaluasi STAR.
 */
export async function evaluasiJawabanInteraktif({
  sesiId,
  pertanyaan,
  jawaban,
  posisiTarget,
  perusahaanTarget,
  kategori = 'Umum',
  jawabanIdeal = '',
  urutan = 1,
}) {
  const teksBersih = (jawaban || '').trim();

  // Deteksi cepat client-side untuk jawaban tidak tahu / menyerah / ngawur
  const lower = teksBersih.toLowerCase();
  const kataCount = lower.split(/\s+/).filter(Boolean).length;
  const kataKunciTidakTahu = [
    'gak tau',
    'nggak tau',
    'tidak tahu',
    'ngga tau',
    'gatau',
    'ndak tau',
    'ga faham',
    'tidak paham',
    'kurang tahu',
    'belum tahu',
    'idk',
    'dont know',
    "don't know",
    'no idea',
    'skip',
    'lewat',
    'entah',
    'kurang paham',
    'belum pernah',
  ];
  const isTidakTahu = kataKunciTidakTahu.some((k) => lower.includes(k)) && kataCount <= 12;
  const kataList = lower.split(/\s+/).filter(Boolean);

  // Cek transkrip verbal kosong
  if (
    lower === '(jawaban disampaikan secara verbal)' ||
    lower === 'jawaban disampaikan secara verbal' ||
    lower === '(jawaban verbal)' ||
    lower === 'verbal'
  ) {
    return {
      skor: 0,
      kategori_kualitas: 'kosong',
      reaksi_pewawancara:
        'Suara Anda belum tertangkap oleh mikrofon. Pastikan mikrofon aktif atau gunakan opsi ketik jawaban.',
      evaluasi_singkat: 'Kandidat belum memberikan jawaban suara atau teks nyata.',
      rekomendasi_star: 'Sampaikan jawaban secara verbal dengan artikulasi jelas atau gunakan koreksi teks.',
    };
  }

  // Deteksi keyboard smash / spam kata
  const apakahNgawur = (kata) => {
    if (kata.length < 4) return false;
    if (/(.)\1{3,}/.test(kata)) return true;
    if (kata.length >= 6 && /^[asdfghjkl]+$/.test(kata)) return true;
    if (kata.length >= 6 && /^[qwertyuiop]+$/.test(kata)) return true;
    if (kata.length >= 6 && /^[zxcvbnm]+$/.test(kata)) return true;
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(kata)) return true;
    if (kata.length >= 8) {
      const vokal = (kata.match(/[aiueo]/g) || []).length;
      if (vokal / kata.length < 0.22) return true;
    }
    if (kata.length > 7 && new Set(kata).size <= 4) return true;
    return false;
  };

  const isSpam = kataList.some(apakahNgawur);

  if (kataCount === 0) {
    return {
      skor: 0,
      kategori_kualitas: 'kosong',
      reaksi_pewawancara:
        'Sepertinya belum ada jawaban yang disampaikan. Tidak apa-apa, mari kita beralih ke pertanyaan berikutnya.',
      evaluasi_singkat: 'Kandidat tidak memberikan jawaban. Pertanyaan dilewati tanpa poin.',
      rekomendasi_star: 'Cobalah selalu memberikan jawaban dasar meski tidak menguasai topik secara penuh.',
    };
  }

  if (isTidakTahu) {
    return {
      skor: 15,
      kategori_kualitas: 'tidak_tahu',
      reaksi_pewawancara:
        'Baik, kejujuran Anda kami hargai. Tidak masalah jika Anda belum familiar dengan hal ini, mari kita beralih ke aspek lain yang pernah Anda tangani.',
      evaluasi_singkat: 'Kandidat menyatakan belum menguasai materi pertanyaan. Poin teknikal rendah namun jujur.',
      rekomendasi_star: 'Jika belum menguasai topik, jelaskan analogi atau kemauan mempelajari konsep tersebut secara terstruktur.',
    };
  }

  if (isSpam) {
    return {
      skor: 5,
      kategori_kualitas: 'ngawur',
      reaksi_pewawancara:
        'Mohon maaf, tanggapan Anda tidak tampak seperti jawaban profesional yang relevan. Mari kita fokus kembali ke pertanyaan wawancara ini.',
      evaluasi_singkat: 'Jawaban terdeteksi berupa ketikan acak/keyboard smash (spam) tanpa substansi percakapan.',
      rekomendasi_star: 'Hindari mengetik karakter sembarangan. Sampaikan jawaban profesional sesuai pengalaman riil Anda.',
    };
  }

  // Panggil endpoint backend FastAPI
  try {
    const hasil = await panggilApi('/simulasi/evaluasi-interaktif', {
      metode: 'POST',
      isi: {
        sesi_id: sesiId,
        pertanyaan,
        jawaban: teksBersih,
        posisi_target: posisiTarget,
        perusahaan_target: perusahaanTarget,
        kategori,
        jawaban_ideal: jawabanIdeal,
        urutan,
      },
    });
    if (hasil && typeof hasil.skor === 'number') {
      return hasil;
    }
  } catch (err) {
    console.warn('[api_simulasi] Panggilan backend evaluasi gagal, menggunakan fallback heuristik lokal:', err);
  }

  // Fallback heuristik lokal jika server backend tidak dapat dihubungi
  const namaPt = perusahaanTarget || 'perusahaan kami';
  let skor = 60;
  let reaksi = `Terima kasih atas penjelasannya. Poin yang Anda sampaikan cukup memberikan gambaran awal mengenai pendekatan Anda.`;
  let evaluasi = 'Penyampaian cukup jelas, disarankan memperkuat dampak kuantitatif (Result).';
  let kategoriKualitas = 'cukup';
  let pertanyaanLanjutan = '';

  if (kataCount < 4) {
    skor = 20;
    reaksi = `Jawaban Anda sangat singkat dan belum memberikan gambaran memadai mengenai kompetensi Anda untuk posisi ${posisiTarget || 'ini'}. Mari kita gali lebih dalam.`;
    evaluasi = 'Jawaban terlalu minim (kurang dari 4 kata), belum memuat metode STAR ataupun bukti kerja nyata.';
    kategoriKualitas = 'kurang';
  } else if (kataCount < 10) {
    skor = 35;
    reaksi = `Jawaban Anda cukup ringkas. Untuk posisi ${posisiTarget || 'ini'} di ${namaPt}, kami ingin mendengar contoh tindakan yang lebih mendalam.`;
    evaluasi = 'Jawaban terlalu singkat dan belum memaparkan tindakan konkrit.';
    kategoriKualitas = 'kurang';
  } else if (kataCount > 30) {
    skor = 82;
    reaksi = `Penjelasan yang sangat terstruktur dan runut! Contoh kasus yang Anda uraikan relevan dengan kebutuhan peran ${posisiTarget || 'ini'}.`;
    evaluasi = 'Struktur jawaban komprehensif, mencerminkan pemahaman alur kerja yang baik.';
    kategoriKualitas = 'baik';
    if (/arsitektur|optimasi|kinerja|skala|database/i.test(teksBersih)) {
      pertanyaanLanjutan = `Terkait optimasi teknis yang Anda uraikan barusan, apa pertimbangan atau trade-off utama yang Anda ambil dalam keputusan tersebut?`;
    }
  }

  return {
    skor,
    kategori_kualitas: kategoriKualitas,
    reaksi_pewawancara: reaksi,
    evaluasi_singkat: evaluasi,
    rekomendasi_star: 'Gunakan metode STAR untuk menegaskan peran pribadi dan dampak hasil kerja nyata.',
    pertanyaan_lanjutan: pertanyaanLanjutan,
  };
}

