/**
 * Hook Analisis Postur & Bahasa Tubuh Berbasis MediaPipe Tasks Vision (usePostureAnalysis.ts)
 * 100% Client-Side In-Browser Inference (Zero Server Load)
 * Menghasilkan: Kontak Mata (%), Postur (Tegak/Miring), Bibir (Jelas/Kurang Terbuka), Tangan (Normal/Menyentuh Wajah)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  FilesetResolver,
  FaceLandmarker,
  PoseLandmarker,
  HandLandmarker,
  DrawingUtils,
} from '@mediapipe/tasks-vision';

export interface PostureTelemetry {
  kontakMataPersen: number;
  postur: 'tegak' | 'miring' | 'bungkuk';
  bibirSuara: 'jelas' | 'kurang_terbuka' | 'normal';
  tangan: 'normal' | 'menyentuh_wajah' | 'menghalangi_kamera' | 'gestur_tidak_sopan';
  kameraAktif: boolean;
  sedangMemuatModel: boolean;
}

export interface PostureAlertEvent {
  tipe: 'postur' | 'tangan' | 'kontak_mata';
  subTipe?: 'menyentuh_wajah' | 'menghalangi_kamera' | 'gestur_tidak_sopan';
  pesan: string;
}

interface UsePostureAnalysisProps {
  sedangBicara: boolean;
  onTriggerAlert?: (alert: PostureAlertEvent) => void;
}

export const usePostureAnalysis = ({ sedangBicara, onTriggerAlert }: UsePostureAnalysisProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [telemetri, setTelemetri] = useState<PostureTelemetry>({
    kontakMataPersen: 92,
    postur: 'tegak',
    bibirSuara: 'jelas',
    tangan: 'normal',
    kameraAktif: false,
    sedangMemuatModel: true,
  });

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastProcessTimeRef = useRef<number>(0);

  // EMA & Persistence State Refs
  const smoothedEyeContactRef = useRef<number>(92);
  const touchFaceFrameCountRef = useRef<number>(0);
  const blockCameraFrameCountRef = useRef<number>(0);
  const inappropriateGestureFrameCountRef = useRef<number>(0);
  const slouchFrameCountRef = useRef<number>(0);
  const lastAlertTimeRef = useRef<number>(0);

  // Inisialisasi MediaPipe Vision & Model Bundle dari CDN Resmi Google
  useEffect(() => {
    let dibatalkan = false;

    const inisialisasiMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (dibatalkan) return;

        // Coba inisialisasi model dengan GPU, fallback ke CPU jika GPU tidak didukung
        const initModels = async (delegate: 'GPU' | 'CPU') => {
          return await Promise.all([
            FaceLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath:
                  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate,
              },
              outputFaceBlendshapes: true,
              runningMode: 'VIDEO',
              numFaces: 1,
            }),
            PoseLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath:
                  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                delegate,
              },
              runningMode: 'VIDEO',
              numPoses: 1,
            }),
            HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath:
                  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                delegate,
              },
              runningMode: 'VIDEO',
              numHands: 2,
            }),
          ]);
        };

        let models;
        try {
          models = await initModels('GPU');
        } catch {
          console.warn('MediaPipe GPU delegate tidak didukung, beralih ke CPU');
          models = await initModels('CPU');
        }

        if (dibatalkan) {
          models.forEach((m) => m?.close());
          return;
        }

        faceLandmarkerRef.current = models[0];
        poseLandmarkerRef.current = models[1];
        handLandmarkerRef.current = models[2];

        setTelemetri((prev) => ({ ...prev, sedangMemuatModel: false }));
      } catch (err) {
        console.warn('Peringatan saat inisialisasi MediaPipe Tasks Vision:', err);
        setTelemetri((prev) => ({ ...prev, sedangMemuatModel: false }));
      }
    };

    inisialisasiMediaPipe();

    return () => {
      dibatalkan = true;
      if (faceLandmarkerRef.current) {
        try { faceLandmarkerRef.current.close(); } catch {}
      }
      if (poseLandmarkerRef.current) {
        try { poseLandmarkerRef.current.close(); } catch {}
      }
      if (handLandmarkerRef.current) {
        try { handLandmarkerRef.current.close(); } catch {}
      }
    };
  }, []);

  // Memulai Kamera Webcam Pengguna
  const mulaiKamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      setTelemetri((prev) => ({ ...prev, kameraAktif: true }));

      // Pasang stream ke elemen video dan trigger play
      const pasangStream = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Video play tertunda:', e));
        }
      };

      pasangStream();
      setTimeout(pasangStream, 100);
      setTimeout(pasangStream, 300);
    } catch (err) {
      console.warn('Akses kamera tidak diizinkan atau tidak tersedia:', err);
      setTelemetri((prev) => ({ ...prev, kameraAktif: false }));
    }
  }, []);

  // Hentikan Kamera Webcam Pengguna
  const hentikanKamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTelemetri((prev) => ({ ...prev, kameraAktif: false }));
  }, []);

  // Loop Inferensi & Render Skeleton Canvas (Throttled ke ~18 FPS / 55ms)
  useEffect(() => {
    if (!telemetri.kameraAktif || telemetri.sedangMemuatModel) return;

    let aktif = true;

    const renderLoop = (timestamp: number) => {
      if (!aktif) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        // Throttling 55ms (~18 FPS) untuk performa halus & zero server load
        if (timestamp - lastProcessTimeRef.current >= 55) {
          lastProcessTimeRef.current = timestamp;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = video.videoWidth || 480;
            canvas.height = video.videoHeight || 360;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const drawingUtils = new DrawingUtils(ctx);
            let rawEyeScore = 90;
            let currentPostur: 'tegak' | 'miring' | 'bungkuk' = 'tegak';
            let currentBibir: 'jelas' | 'kurang_terbuka' | 'normal' = sedangBicara ? 'jelas' : 'normal';
            let currentTangan: 'normal' | 'menyentuh_wajah' | 'menghalangi_kamera' | 'gestur_tidak_sopan' = 'normal';

            const videoTime = performance.now();

            // 1. Face Landmarker & Mesh Overlay
            const faceBounds = { minX: 1, maxX: 0, minY: 1, maxY: 0 };
            let faceDetected = false;
            let currentFaceLandmarks: any[] = [];
            if (faceLandmarkerRef.current) {
              try {
                const faceResult = faceLandmarkerRef.current.detectForVideo(video, videoTime);
                if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
                  faceDetected = true;
                  const landmarks = faceResult.faceLandmarks[0];
                  currentFaceLandmarks = landmarks;

                  // Hitung Bounding Box Wajah dengan Margin Penyangga (Buffer 5%)
                  let fMinX = 1;
                  let fMaxX = 0;
                  let fMinY = 1;
                  let fMaxY = 0;
                  landmarks.forEach((p) => {
                    if (p.x < fMinX) fMinX = p.x;
                    if (p.x > fMaxX) fMaxX = p.x;
                    if (p.y < fMinY) fMinY = p.y;
                    if (p.y > fMaxY) fMaxY = p.y;
                  });

                  // Tambahkan buffer 4-5% ke area deteksi sekitar dagu, pipi, hidung, dan kening
                  const padX = (fMaxX - fMinX) * 0.05;
                  const padY = (fMaxY - fMinY) * 0.05;
                  faceBounds.minX = Math.max(0, fMinX - padX);
                  faceBounds.maxX = Math.min(1, fMaxX + padX);
                  faceBounds.minY = Math.max(0, fMinY - padY);
                  faceBounds.maxY = Math.min(1, fMaxY + padY);

                  // Render Face Mesh Halus (Teal / Cyan)
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                    { color: '#06b6d420', lineWidth: 0.8 }
                  );
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                    { color: '#38bdf8', lineWidth: 1.2 }
                  );
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                    { color: '#38bdf8', lineWidth: 1.2 }
                  );

                  // Estimasi Deviasi Kontak Mata via Hidung vs Simetri Pipi
                  const nose = landmarks[1];
                  const leftCheek = landmarks[234];
                  const rightCheek = landmarks[454];
                  if (nose && leftCheek && rightCheek) {
                    const yaw = Math.abs(nose.x - (leftCheek.x + rightCheek.x) / 2);
                    const leftEye = landmarks[33] || landmarks[133];
                    const rightEye = landmarks[263] || landmarks[362];
                    const eyeY = leftEye && rightEye ? (leftEye.y + rightEye.y) / 2 : nose.y;
                    const pitch = Math.abs(nose.y - eyeY);
                    const dev = Math.sqrt(yaw * yaw + pitch * pitch);
                    rawEyeScore = Math.max(30, Math.min(98, Math.round(100 - dev * 180)));
                  }

                  // Evaluasi Bukaan Bibir Saat Berbicara
                  if (sedangBicara) {
                    const upperLip = landmarks[13];
                    const lowerLip = landmarks[14];
                    const forehead = landmarks[10];
                    const chin = landmarks[152];
                    if (upperLip && lowerLip && forehead && chin) {
                      const faceHeight = Math.abs(chin.y - forehead.y) || 1;
                      const lipDist = Math.abs(lowerLip.y - upperLip.y) / faceHeight;
                      currentBibir = lipDist < 0.022 ? 'kurang_terbuka' : 'jelas';
                    }
                  }
                }
              } catch {}
            }

            // 2. Pose Landmarker & Skeleton Overlay
            if (poseLandmarkerRef.current) {
              try {
                const poseResult = poseLandmarkerRef.current.detectForVideo(video, videoTime);
                if (poseResult.landmarks && poseResult.landmarks.length > 0) {
                  const pose = poseResult.landmarks[0];

                  // Gambar Sambungan Pose Bahu & Lengan (Emerald & Purple)
                  drawingUtils.drawConnectors(
                    pose,
                    PoseLandmarker.POSE_CONNECTIONS,
                    { color: '#10b98180', lineWidth: 2 }
                  );
                  drawingUtils.drawLandmarks(
                    pose.slice(0, 15),
                    { color: '#a855f7', lineWidth: 1, radius: 2.5 }
                  );

                  // Analisis Sudut Kemiringan Bahu (Left Shoulder 11 vs Right Shoulder 12)
                  const leftShoulder = pose[11];
                  const rightShoulder = pose[12];
                  if (leftShoulder && rightShoulder) {
                    const dy = Math.abs(leftShoulder.y - rightShoulder.y);
                    const dx = Math.abs(leftShoulder.x - rightShoulder.x) || 1;
                    const shoulderAngle = Math.atan2(dy, dx) * (180 / Math.PI);

                    if (shoulderAngle > 8.5) {
                      currentPostur = 'miring';
                      slouchFrameCountRef.current += 1;
                    } else {
                      currentPostur = 'tegak';
                      slouchFrameCountRef.current = Math.max(0, slouchFrameCountRef.current - 1);
                    }
                  }
                }
              } catch {}
            }

            // 3. Hand Landmarker & Deteksi Analisis Gestur Tangan
            if (handLandmarkerRef.current) {
              try {
                const handResult = handLandmarkerRef.current.detectForVideo(video, videoTime);
                if (handResult.landmarks && handResult.landmarks.length > 0) {
                  for (const hand of handResult.landmarks) {
                    drawingUtils.drawConnectors(
                      hand,
                      HandLandmarker.HAND_CONNECTIONS,
                      { color: '#f59e0b', lineWidth: 1.5 }
                    );
                    drawingUtils.drawLandmarks(hand, { color: '#fbbf24', radius: 2 });

                    // Standard GitHub Open-Source MediaPipe Finger State Evaluation:
                    // Landmark index:
                    // Wrist: 0
                    // Thumb: tip=4, mcp=2
                    // Index: tip=8, pip=6, mcp=5
                    // Middle: tip=12, pip=10, mcp=9
                    // Ring: tip=16, pip=14, mcp=13
                    // Pinky: tip=20, pip=18, mcp=17
                    const wrist = hand[0];
                    const distSq = (p1: any, p2: any) => {
                      const dx = p1.x - p2.x;
                      const dy = p1.y - p2.y;
                      return dx * dx + dy * dy;
                    };

                    // Jari terentang jika jarak ujung jari ke wrist > jarak sendi tengah (pip) ke wrist
                    // dan posisi Y ujung jari di atas MCP (untuk gestur menghadap kamera)
                    const indexExtended = distSq(hand[8], wrist) > distSq(hand[6], wrist) * 1.15;
                    const middleExtended = distSq(hand[12], wrist) > distSq(hand[10], wrist) * 1.15;
                    const ringExtended = distSq(hand[16], wrist) > distSq(hand[14], wrist) * 1.15;
                    const pinkyExtended = distSq(hand[20], wrist) > distSq(hand[18], wrist) * 1.15;

                    // KASUS A: DETEKSI GESTUR TIDAK SOPAN (Jari Tengah Terentang Sendiri)
                    // Jari tengah terentang, sedangkan jari telunjuk, manis, dan kelingking terlipat
                    const isMiddleFingerOnly = middleExtended && !indexExtended && !ringExtended && !pinkyExtended;

                    if (isMiddleFingerOnly) {
                      currentTangan = 'gestur_tidak_sopan';
                      inappropriateGestureFrameCountRef.current = Math.min(20, inappropriateGestureFrameCountRef.current + 2);
                      break;
                    }

                    // KASUS B & C: POSISI TERHADAP WAJAH (Sentuh Pipi / Dagu / Menopang Dagu / Menutupi)
                    if (faceDetected && currentFaceLandmarks.length > 0) {
                      // Cek apakah ada ujung jari (index=8, middle=12, ring=16, pinky=20, thumb=4) atau sendi tangan yang sangat dekat/menempel wajah
                      let minDistanceToFace = 999;
                      for (const hp of hand) {
                        for (let fi = 0; fi < currentFaceLandmarks.length; fi += 4) { // Cek rapat sampel kontur wajah
                          const fp = currentFaceLandmarks[fi];
                          const d = Math.hypot(hp.x - fp.x, hp.y - fp.y);
                          if (d < minDistanceToFace) minDistanceToFace = d;
                        }
                      }

                      // Cek jumlah landmark tangan yang berada di dalam bounding box wajah (+ buffer)
                      const insideFacePoints = hand.filter(
                        (p) =>
                          p.x >= faceBounds.minX &&
                          p.x <= faceBounds.maxX &&
                          p.y >= faceBounds.minY &&
                          p.y <= faceBounds.maxY
                      );

                      // Jika titik tangan berada di dalam batas wajah ATAU sangat dekat (minDistanceToFace < 0.09)
                      if (insideFacePoints.length > 0 || minDistanceToFace < 0.09) {
                        const handSpanX = Math.abs(hand[4].x - hand[20].x);
                        const isBlocking = insideFacePoints.length >= 7 || handSpanX > 0.20;

                        if (isBlocking) {
                          currentTangan = 'menghalangi_kamera';
                          blockCameraFrameCountRef.current = Math.min(20, blockCameraFrameCountRef.current + 2);
                        } else {
                          // Sentuhan langsung pada dagu, pipi, rahang bawah (menopang dagu)
                          currentTangan = 'menyentuh_wajah';
                          touchFaceFrameCountRef.current = Math.min(20, touchFaceFrameCountRef.current + 2);
                        }
                        break;
                      }
                    }
                  }

                  if (currentTangan === 'normal') {
                    touchFaceFrameCountRef.current = Math.max(0, touchFaceFrameCountRef.current - 1);
                    blockCameraFrameCountRef.current = Math.max(0, blockCameraFrameCountRef.current - 1);
                    inappropriateGestureFrameCountRef.current = Math.max(0, inappropriateGestureFrameCountRef.current - 1);
                  }
                } else {
                  touchFaceFrameCountRef.current = Math.max(0, touchFaceFrameCountRef.current - 1);
                  blockCameraFrameCountRef.current = Math.max(0, blockCameraFrameCountRef.current - 1);
                  inappropriateGestureFrameCountRef.current = Math.max(0, inappropriateGestureFrameCountRef.current - 1);
                }
              } catch {}
            }

            // Ambang batas persistensi per jenis pelanggaran (Respons Cepat: Mulai 2 frame / ~90ms)
            if (inappropriateGestureFrameCountRef.current >= 2) {
              currentTangan = 'gestur_tidak_sopan';
            } else if (blockCameraFrameCountRef.current >= 2) {
              currentTangan = 'menghalangi_kamera';
            } else if (touchFaceFrameCountRef.current >= 2) {
              currentTangan = 'menyentuh_wajah';
            }

            // Smoothing Kontak Mata via EMA (Alpha = 0.10)
            smoothedEyeContactRef.current = Math.round(
              0.90 * smoothedEyeContactRef.current + 0.10 * rawEyeScore
            );

            // Debounce Trigger Alert HUD di Kanan Atas Video (Respons Cepat: >= 3 frame / ~140ms, Cooldown 6 Detik)
            const sekarang = Date.now();
            if (sekarang - lastAlertTimeRef.current > 6000) {
              if (inappropriateGestureFrameCountRef.current >= 3) {
                lastAlertTimeRef.current = sekarang;
                inappropriateGestureFrameCountRef.current = 0;
                onTriggerAlert?.({
                  tipe: 'tangan',
                  subTipe: 'gestur_tidak_sopan',
                  pesan: 'Hindari gestur jari yang tidak pantas atau konfrontatif demi menjaga etika wawancara formal.',
                });
              } else if (blockCameraFrameCountRef.current >= 3) {
                lastAlertTimeRef.current = sekarang;
                blockCameraFrameCountRef.current = 0;
                onTriggerAlert?.({
                  tipe: 'tangan',
                  subTipe: 'menghalangi_kamera',
                  pesan: 'Jangan menghadapkan atau menutupi wajah dengan tangan agar kontak visual dengan pewawancara tetap terjaga.',
                });
              } else if (touchFaceFrameCountRef.current >= 3) {
                lastAlertTimeRef.current = sekarang;
                touchFaceFrameCountRef.current = 0;
                onTriggerAlert?.({
                  tipe: 'tangan',
                  subTipe: 'menyentuh_wajah',
                  pesan: 'Hindari menyentuh wajah terlalu sering saat berbicara agar tetap fokus dan meyakinkan.',
                });
              } else if (slouchFrameCountRef.current >= 15) {
                lastAlertTimeRef.current = sekarang;
                slouchFrameCountRef.current = 0;
                onTriggerAlert?.({
                  tipe: 'postur',
                  pesan: 'Posisikan bahu tegak dan seimbang agar postur tubuh memancarkan rasa percaya diri.',
                });
              }
            }

            setTelemetri((prev) => ({
              ...prev,
              kontakMataPersen: smoothedEyeContactRef.current,
              postur: currentPostur,
              bibirSuara: currentBibir,
              tangan: currentTangan,
            }));
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      aktif = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [telemetri.kameraAktif, telemetri.sedangMemuatModel, sedangBicara, onTriggerAlert]);

  return {
    videoRef,
    canvasRef,
    telemetri,
    mulaiKamera,
    hentikanKamera,
  };
};
