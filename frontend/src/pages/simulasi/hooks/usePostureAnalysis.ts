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
  tangan: 'normal' | 'menyentuh_wajah';
  kameraAktif: boolean;
  sedangMemuatModel: boolean;
}

export interface PostureAlertEvent {
  tipe: 'postur' | 'tangan' | 'kontak_mata';
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

      // Attach stream segera & pastikan play terpanggil
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Video play tertunda:', e));
        }
      }, 50);
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
            let currentTangan: 'normal' | 'menyentuh_wajah' = 'normal';

            const videoTime = performance.now();

            // 1. Face Landmarker & Mesh Overlay
            const faceBounds = { minX: 1, maxX: 0, minY: 1, maxY: 0 };
            if (faceLandmarkerRef.current) {
              try {
                const faceResult = faceLandmarkerRef.current.detectForVideo(video, videoTime);
                if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
                  const landmarks = faceResult.faceLandmarks[0];

                  // Hitung Bounding Box Wajah
                  landmarks.forEach((p) => {
                    if (p.x < faceBounds.minX) faceBounds.minX = p.x;
                    if (p.x > faceBounds.maxX) faceBounds.maxX = p.x;
                    if (p.y < faceBounds.minY) faceBounds.minY = p.y;
                    if (p.y > faceBounds.maxY) faceBounds.maxY = p.y;
                  });

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

            // 3. Hand Landmarker & Deteksi Sentuh Wajah
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

                    // Periksa apakah sendi jari berada dalam area bounding wajah
                    const isTouching = hand.some(
                      (p) =>
                        p.x >= faceBounds.minX &&
                        p.x <= faceBounds.maxX &&
                        p.y >= faceBounds.minY &&
                        p.y <= faceBounds.maxY
                    );

                    if (isTouching) {
                      currentTangan = 'menyentuh_wajah';
                      touchFaceFrameCountRef.current += 1;
                      break;
                    }
                  }
                } else {
                  touchFaceFrameCountRef.current = Math.max(0, touchFaceFrameCountRef.current - 1);
                }
              } catch {}
            }

            // Smoothing Kontak Mata via EMA (Alpha = 0.10)
            smoothedEyeContactRef.current = Math.round(
              0.90 * smoothedEyeContactRef.current + 0.10 * rawEyeScore
            );

            // Debounce Inline AI Vision Alert Card (Cooldown 35 Detik)
            const sekarang = Date.now();
            if (sekarang - lastAlertTimeRef.current > 35000) {
              if (touchFaceFrameCountRef.current >= 35) {
                lastAlertTimeRef.current = sekarang;
                touchFaceFrameCountRef.current = 0;
                onTriggerAlert?.({
                  tipe: 'tangan',
                  pesan: 'Hindari menyentuh wajah terlalu sering saat berbicara agar tetap fokus dan meyakinkan.',
                });
              } else if (slouchFrameCountRef.current >= 45) {
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
