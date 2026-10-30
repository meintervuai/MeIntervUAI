// evaluasiI18n.ts - Lokalisasi Dwibahasa Laporan Evaluasi Wawancara (FE-04)
// Patuh anti-slop: Tanpa em-dash, tanpa kalimat klise/robotik.

export interface EvaluasiI18nDict {
  header: {
    kembaliKeStudio: string;
    judulLaporan: string;
    subjudulLaporan: string;
    unduhPdf: string;
    latihUlang: string;
    labelPosisi: string;
    labelMode: string;
    labelDurasi: string;
  };
  bento: {
    judulSkorKeseluruhan: string;
    statusSangatBaik: string;
    statusBaik: string;
    statusCukup: string;
    statusPerluLatihan: string;
    statusTidakLolos: string;
    tagPersentil: (persen: number, bidang: string) => string;
    pilarMetrikJudul: string;
    pilarCar: string;
    pilarCarDesc: string;
    pilarKomunikasi: string;
    pilarKomunikasiDesc: string;
    pilarTeknis: string;
    pilarTeknisDesc: string;
    pilarMediaPipe: string;
    pilarMediaPipeDesc: string;
    binaExecutiveJudul: string;
    binaRoleBadge: string;
    gesturDominanJudul: string;
  };
  accordion: {
    judulBagian: string;
    subjudulBagian: string;
    skorLabel: string;
    kontakMataLabel: string;
    transkripJawaban: string;
    putarAudio: string;
    jedaAudio: string;
    simulasiAudioLabel: string;
    kotakKekuatanJudul: string;
    kotakPeningkatanJudul: string;
    koreksiPosturJudul: string;
    rekomendasiBinaJudul: string;
    poinKunciJudul: string;
    tutupSemua: string;
    bukaSemua: string;
  };
  footerMobile: {
    latihUlangCta: string;
    unduhPdfCta: string;
  };
}

export const kamusEvaluasi: Record<'id' | 'en', EvaluasiI18nDict> = {
  id: {
    header: {
      kembaliKeStudio: 'Kembali ke Studio',
      judulLaporan: 'Laporan Evaluasi Simulasi Wawancara',
      subjudulLaporan: 'Analisis komprehensif struktur CAR, kompetensi teknis, dan telemetri bahasa tubuh MediaPipe.',
      unduhPdf: 'Unduh Laporan PDF',
      latihUlang: 'Latih Ulang Sesi',
      labelPosisi: 'Posisi Target',
      labelMode: 'Mode Simulasi',
      labelDurasi: 'Durasi Sesi',
    },
    bento: {
      judulSkorKeseluruhan: 'Skor Kesiapan Keseluruhan',
      statusSangatBaik: 'Sangat Baik - Siap Wawancara Kerja',
      statusBaik: 'Kompeten - Siap Bersaing',
      statusCukup: 'Cukup - Perlu Penajaman Bukti Nyata',
      statusPerluLatihan: 'Perlu Latihan - Struktur CAR Lemah',
      statusTidakLolos: 'Tidak Memenuhi Standar - Jawaban Tidak Berbobot',
      tagPersentil: (persen, bidang) => `Top ${persen}% Kandidat ${bidang}`,
      pilarMetrikJudul: '4 Pilar Evaluasi Kompetensi',
      pilarCar: 'Metode CAR & Struktur',
      pilarCarDesc: 'Kejelasan Context, Action, dan Result yang terukur',
      pilarKomunikasi: 'Artikulasi & Kejelasan',
      pilarKomunikasiDesc: 'Pacing bicara, intonasi mantap, dan ketegasan respon',
      pilarTeknis: 'Penguasaan Teknis Finansial',
      pilarTeknisDesc: 'Kesesuaian standar PSAK/IFRS, audit trail, dan rekonsiliasi',
      pilarMediaPipe: 'Bahasa Tubuh & Postur MediaPipe',
      pilarMediaPipeDesc: 'Stabilitas kontak mata, posisi bahu tegak, dan kontrol gestur',
      binaExecutiveJudul: 'Ringkasan Eksekutif Bina AI',
      binaRoleBadge: 'AI HR Lead & Panelis Eksekutif',
      gesturDominanJudul: 'Catatan Gestur Dominan MediaPipe',
    },
    accordion: {
      judulBagian: 'Evaluasi Mendalam Per Pertanyaan',
      subjudulBagian: 'Bedah komparatif respon kandidat, validasi metrik CAR, dan koreksi timestamp bahasa tubuh.',
      skorLabel: 'Skor Jawaban',
      kontakMataLabel: 'Kontak Mata',
      transkripJawaban: 'Transkrip Respon Kandidat',
      putarAudio: 'Putar Rekaman Suara',
      jedaAudio: 'Jeda Pemutaran',
      simulasiAudioLabel: 'Rekaman Audio Terverifikasi',
      kotakKekuatanJudul: 'Kekuatan & Bukti CAR',
      kotakPeningkatanJudul: 'Area Peningkatan & Catatan Kritis',
      koreksiPosturJudul: 'Koreksi Postur Real-Time MediaPipe',
      rekomendasiBinaJudul: 'Rekomendasi Jawaban Ideal dari Bina (STAR/CAR Polish)',
      poinKunciJudul: 'Poin Kunci Pembeda',
      tutupSemua: 'Tutup Semua',
      bukaSemua: 'Buka Semua',
    },
    footerMobile: {
      latihUlangCta: 'Latih Ulang',
      unduhPdfCta: 'Unduh PDF',
    },
  },
  en: {
    header: {
      kembaliKeStudio: 'Back to Studio',
      judulLaporan: 'Interview Simulation Evaluation Report',
      subjudulLaporan: 'Comprehensive analysis of CAR structure, technical mastery, and MediaPipe body language telemetry.',
      unduhPdf: 'Download PDF Report',
      latihUlang: 'Retrain Session',
      labelPosisi: 'Target Role',
      labelMode: 'Simulation Mode',
      labelDurasi: 'Session Duration',
    },
    bento: {
      judulSkorKeseluruhan: 'Overall Readiness Score',
      statusSangatBaik: 'Excellent - Job Interview Ready',
      statusBaik: 'Competent - Strong Contender',
      statusCukup: 'Fair - Needs Concrete Proof',
      statusPerluLatihan: 'Needs Practice - Weak CAR Structure',
      statusTidakLolos: 'Below Standard - Insufficient Substance',
      tagPersentil: (persen, bidang) => `Top ${persen}% ${bidang} Candidates`,
      pilarMetrikJudul: '4 Core Competency Pillars',
      pilarCar: 'CAR Method & Structure',
      pilarCarDesc: 'Clarity of Context, Action, and measurable Results',
      pilarKomunikasi: 'Articulation & Delivery',
      pilarKomunikasiDesc: 'Speaking pacing, confident pitch, and structured tone',
      pilarTeknis: 'Technical Domain Mastery',
      pilarTeknisDesc: 'Alignment with IFRS/GAAP standards, audit trail, and reconciliation',
      pilarMediaPipe: 'MediaPipe Body Language & Posture',
      pilarMediaPipeDesc: 'Eye contact stability, shoulder alignment, and gesture control',
      binaExecutiveJudul: 'Bina AI Executive Summary',
      binaRoleBadge: 'AI HR Lead & Executive Interviewer',
      gesturDominanJudul: 'MediaPipe Dominant Gesture Analysis',
    },
    accordion: {
      judulBagian: 'Deep-Dive Question Evaluation',
      subjudulBagian: 'Comparative breakdown of candidate responses, CAR metric validation, and timestamped posture corrections.',
      skorLabel: 'Response Score',
      kontakMataLabel: 'Eye Contact',
      transkripJawaban: 'Candidate Response Transcript',
      putarAudio: 'Play Voice Recording',
      jedaAudio: 'Pause Playback',
      simulasiAudioLabel: 'Verified Audio Recording',
      kotakKekuatanJudul: 'Strengths & CAR Evidence',
      kotakPeningkatanJudul: 'Areas for Improvement & Critical Notes',
      koreksiPosturJudul: 'MediaPipe Real-Time Posture Corrections',
      rekomendasiBinaJudul: 'Recommended Ideal Response from Bina (STAR/CAR Polish)',
      poinKunciJudul: 'Key Differentiators',
      tutupSemua: 'Collapse All',
      bukaSemua: 'Expand All',
    },
    footerMobile: {
      latihUlangCta: 'Retrain Session',
      unduhPdfCta: 'Download PDF',
    },
  },
};
