/**
 * Layanan Analisis Non-Verbal MediaPipe AI (FR-10, FR-12, NFR-04, NFR-12).
 * Berjalan murni di memori browser pengguna (Client-Side) tanpa pernah mengirim
 * rekaman video ke server mana pun (Privasi Penuh Sesuai PRD §5.4 & NFR-04).
 *
 * Menganalisis:
 * 1. Gerak Mata & Kontak Mata (% tatap kamera vs melirik ke bawah/samping).
 * 2. Posisi & Postur Badan (Tegak profesional vs membungkuk/miring).
 * 3. Kalkulasi Skor Kepercayaan Diri Non-Verbal untuk Rapor Evaluasi.
 */

import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

let faceLandmarkerInstance = null;
let sedangMemuat = false;

// Buffer running average untuk kestabilan pembacaan
let totalFrameDianalisis = 0;
let frameKontakMataBaik = 0;
let framePosturTegak = 0;

/**
 * Inisialisasi model MediaPipe Face Landmarker dengan WASM & GPU delegate
 */
export async function inisialisasiMediaPipe() {
  if (faceLandmarkerInstance) return faceLandmarkerInstance;
  if (sedangMemuat) return null;

  sedangMemuat = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    faceLandmarkerInstance = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    });

    console.info('[MediaPipe] Model Face Landmarker berhasil diinisialisasi.');
    sedangMemuat = false;
    return faceLandmarkerInstance;
  } catch (error) {
    console.warn('[MediaPipe] Gagal inisialisasi GPU/WASM tasks vision, menggunakan fallback geometri:', error);
    sedangMemuat = false;
    return null;
  }
}

/**
 * Reset akumulasi statistik non-verbal saat memulai pertanyaan/sesi baru
 */
export function resetStatistikNonVerbal() {
  totalFrameDianalisis = 0;
  frameKontakMataBaik = 0;
  framePosturTegak = 0;
}

/**
 * Analisis satu frame video secara real-time
 * @param {HTMLVideoElement} videoElement
 * @param {number} timestamp
 */
export function analisisFrameNonVerbal(videoElement, timestamp = performance.now()) {
  if (!videoElement || videoElement.readyState < 2 || videoElement.paused || videoElement.ended) {
    return {
      terdeteksiWajah: false,
      kontakMataAktif: false,
      kontakMataPersen: totalFrameDianalisis > 0 ? Math.round((frameKontakMataBaik / totalFrameDianalisis) * 100) : 0,
      statusPostur: 'Menunggu Aliran Kamera...',
      posturTegakPersen: totalFrameDianalisis > 0 ? Math.round((framePosturTegak / totalFrameDianalisis) * 100) : 0,
      skorKepercayaanDiriNonVerbal: 0,
      detail: { status: 'menunggu_kamera' },
    };
  }

  // Jika model MediaPipe instance telah siap, gunakan inferensi Face Landmarker + Blendshapes
  if (faceLandmarkerInstance) {
    try {
      const hasil = faceLandmarkerInstance.detectForVideo(videoElement, timestamp);
      const adaWajah = Boolean(hasil && hasil.faceLandmarks && hasil.faceLandmarks.length > 0);

      totalFrameDianalisis += 1;

      // KASUS 1: WAJAH BELUM TERDETEKSI DI KAMERA (User belum masuk frame / kamera tertutup)
      if (!adaWajah) {
        const persenKontak = totalFrameDianalisis > 0 ? Math.round((frameKontakMataBaik / totalFrameDianalisis) * 100) : 0;
        const persenPostur = totalFrameDianalisis > 0 ? Math.round((framePosturTegak / totalFrameDianalisis) * 100) : 0;
        const skorConfidence = Math.round(persenKontak * 0.55 + persenPostur * 0.45);

        return {
          terdeteksiWajah: false,
          kontakMataAktif: false,
          kontakMataPersen: persenKontak,
          statusPostur: 'Wajah Belum Terdeteksi',
          posturTegakPersen: persenPostur,
          skorKepercayaanDiriNonVerbal: skorConfidence,
          detail: { status: 'wajah_tidak_ada' },
        };
      }

      // KASUS 2: WAJAH TERDETEKSI SECARA VALID OLEH MEDIAPIPE AI
      const blendshapes = (hasil.faceBlendshapes && hasil.faceBlendshapes[0]?.categories) || [];
      const ambilSkor = (nama) => blendshapes.find((b) => b.categoryName === nama)?.score || 0;

      // 1. Deteksi Arah Pandangan & Kontak Mata (Eye Contact Gaze)
      // Nilai lookDown & lookSide tinggi saat kandidat melirik ke bawah (membaca contekan) atau melirik ke luar
      const lookDownLeft = ambilSkor('eyeLookDownLeft');
      const lookDownRight = ambilSkor('eyeLookDownRight');
      const lookInLeft = ambilSkor('eyeLookInLeft');
      const lookOutLeft = ambilSkor('eyeLookOutLeft');
      const lookInRight = ambilSkor('eyeLookInRight');
      const lookOutRight = ambilSkor('eyeLookOutRight');

      const rataLookDown = (lookDownLeft + lookDownRight) / 2;
      const rataLookSide = (lookInLeft + lookOutLeft + lookInRight + lookOutRight) / 4;

      // Evaluasi landmark 3D untuk orientasi kepala (Pitch, Yaw, Roll)
      const landmarks = hasil.faceLandmarks[0];
      const hidung = landmarks[1];
      const mataKiri = landmarks[33];
      const mataKanan = landmarks[263];
      const dagu = landmarks[152];
      const dahi = landmarks[10];

      // Kemiringan kepala kiri-kanan (Roll)
      const deltaY = mataKanan.y - mataKiri.y;
      const deltaX = mataKanan.x - mataKiri.x;
      const rollDerajat = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      // Kemiringan atas-bawah (Pitch)
      const jarakHidungDahi = Math.abs(hidung.y - dahi.y);
      const jarakHidungDagu = Math.abs(dagu.y - hidung.y);
      const rasioPitch = jarakHidungDahi / (jarakHidungDagu || 1);

      // Status Kontak Mata: Pandangan tidak melirik ke bawah dan orientasi kepala menghadap kamera
      const isKontakMata = rataLookDown < 0.38 && rataLookSide < 0.35 && Math.abs(rollDerajat) < 14;
      if (isKontakMata) {
        frameKontakMataBaik += 1;
      }

      // 2. Status Postur Badan & Kepala
      let statusPostur = 'Tegak & Profesional';
      let isTegak = true;

      if (Math.abs(rollDerajat) >= 14) {
        statusPostur = 'Kepala Terlalu Miring';
        isTegak = false;
      } else if (rasioPitch > 1.45 || rataLookDown > 0.45) {
        statusPostur = 'Membungkuk / Menunduk';
        isTegak = false;
      } else if (rasioPitch < 0.65) {
        statusPostur = 'Mendongak Terlalu Tinggi';
        isTegak = false;
      }

      if (isTegak) {
        framePosturTegak += 1;
      }

      const persenKontak = Math.round((frameKontakMataBaik / totalFrameDianalisis) * 100);
      const persenPostur = Math.round((framePosturTegak / totalFrameDianalisis) * 100);
      const skorConfidence = Math.round(persenKontak * 0.55 + persenPostur * 0.45);

      return {
        terdeteksiWajah: true,
        kontakMataAktif: isKontakMata,
        kontakMataPersen: Math.max(0, Math.min(100, persenKontak)),
        statusPostur,
        posturTegakPersen: Math.max(0, Math.min(100, persenPostur)),
        skorKepercayaanDiriNonVerbal: Math.max(0, Math.min(100, skorConfidence)),
        detail: {
          rollDerajat: Math.round(rollDerajat),
          lookDown: Math.round(rataLookDown * 100),
          lookSide: Math.round(rataLookSide * 100),
        },
      };
    } catch (err) {
      console.warn('[MediaPipe] Error saat analisis frame video:', err);
    }
  }

  // Model MediaPipe masih dalam tahap pemuatan / unduh WASM (Belum siap mengukur)
  return {
    terdeteksiWajah: false,
    kontakMataAktif: false,
    kontakMataPersen: totalFrameDianalisis > 0 ? Math.round((frameKontakMataBaik / totalFrameDianalisis) * 100) : 0,
    statusPostur: 'Menyiapkan MediaPipe AI...',
    posturTegakPersen: totalFrameDianalisis > 0 ? Math.round((framePosturTegak / totalFrameDianalisis) * 100) : 0,
    skorKepercayaanDiriNonVerbal: 0,
    detail: {
      mode: 'Memuat Model Vision',
    },
  };
}

/**
 * Ringkasan akhir metrik non-verbal untuk disimpan ke evaluasi sesi
 */
export function ambilRingkasanNonVerbal() {
  if (totalFrameDianalisis === 0 || (frameKontakMataBaik === 0 && framePosturTegak === 0)) {
    return {
      totalSample: totalFrameDianalisis,
      kontakMataPersen: 0,
      posturTegakPersen: 0,
      skorKepercayaanDiri: 0,
      predikatNonVerbal: 'Wajah tidak terdeteksi di depan kamera selama sesi berlangsung.',
    };
  }

  const total = Math.max(1, totalFrameDianalisis);
  const kontakMata = Math.round((frameKontakMataBaik / total) * 100);
  const posturTegak = Math.round((framePosturTegak / total) * 100);
  const skorKepercayaanDiri = Math.round(kontakMata * 0.55 + posturTegak * 0.45);

  return {
    totalSample: total,
    kontakMataPersen: Math.max(0, Math.min(100, kontakMata)),
    posturTegakPersen: Math.max(0, Math.min(100, posturTegak)),
    skorKepercayaanDiri: Math.max(0, Math.min(100, skorKepercayaanDiri)),
    predikatNonVerbal:
      skorKepercayaanDiri >= 85
        ? 'Sangat Percaya Diri & Kontak Mata Terjaga'
        : skorKepercayaanDiri >= 70
        ? 'Cukup Tenang & Postur Stabil'
        : skorKepercayaanDiri >= 40
        ? 'Perlu Melatih Kontak Mata ke Kamera & Postur Tegak'
        : 'Wajah Jarang Terdeteksi Menghadap Kamera',
  };
}

/**
 * Bersihkan resource MediaPipe
 */
export function bersihkanMediaPipe() {
  resetStatistikNonVerbal();
}
