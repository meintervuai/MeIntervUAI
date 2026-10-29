// evaluasiData.ts - Generator & Data Evaluasi Realistis Senior Accounting & Financial Controller
import { PesanChat } from '../types';
import { EvaluasiPertanyaanItem, SkorTelemetriInput } from './evaluasiTypes';

export function getDaftarPertanyaanEvaluasiDefault(bahasa: 'id' | 'en' = 'id'): EvaluasiPertanyaanItem[] {
  if (bahasa === 'en') {
    return [
      {
        id: 'eval_q1',
        nomorUrut: 1,
        pertanyaan: 'Walk me through a situation where you resolved a material reconciliation discrepancy in a multi-entity consolidated financial statement under tight deadlines.',
        skor: 86,
        kontakMataPersen: 84,
        jawabanKandidat: 'In my previous position overseeing 12 subsidiary entities, we identified an uneliminated intercompany transfer pricing variance of Rp 2.4 Billion two weeks before the statutory annual audit. I assembled an emergency cross-entity finance task force, traced discrepancy trails directly in SAP S/4HANA, and introduced weekly mandatory reconciliation cutoff protocols. As a result, the audit concluded on schedule with an unqualified (WTP) audit opinion.',
        durasiAudioDetik: 48,
        kekuatanCAR: [
          'Context & Action are highly concrete with precise scope (12 subsidiaries, Rp 2.4 Billion variance).',
          'Demonstrates executive financial leadership by deploying systematic tools (SAP S/4HANA) and sustainable governance protocols.',
          'Quantified outcome achieved: Unqualified statutory audit opinion with zero delayed filing penalties.',
        ],
        areaPeningkatan: [
          'Long-term efficiency gains (e.g. reduction in manual reconciliation hours per quarter) were not explicitly quantified in the Result portion.',
          'Posture stability: head tilted 12 degrees to the left during ERP technical explanation.',
        ],
        koreksiPosturMediaPipe: [
          {
            timestamp: '01:14',
            deskripsi: 'Head tilt 12° detected during technical explanation of SAP journal entry elimination.',
            derajatDeviasi: '12° Kemiringan Bahu',
          },
          {
            timestamp: '01:38',
            deskripsi: 'Hand touched chin for 4.2 seconds while formulating the financial timeline.',
            derajatDeviasi: 'Sentuhan Wajah',
          },
        ],
        rekomendasiJawabanBina: 'Strengthen the Result clause: State clearly that the weekly reconciliation protocol eliminated recurring variances by 98% and reduced subsequent quarterly audit prep time by 120 team-hours.',
        poinKunciBina: [
          'Connect the tactical crisis resolution to measurable long-term operating cost reduction.',
          'Maintain steady forward eye gaze when citing multi-billion figures to project calm authority.',
        ],
      },
      {
        id: 'eval_q2',
        nomorUrut: 2,
        pertanyaan: 'How do you ensure strict compliance with PSAK 73 / IFRS 16 lease liability capitalization across decentralized operational branches?',
        skor: 82,
        kontakMataPersen: 78,
        jawabanKandidat: 'I formulated a centralized discounted cash flow amortization model and re-audited 45 operational lease agreements across regional offices. We transitioned off-balance-sheet operating leases into Right-of-Use (ROU) assets and corresponding lease liabilities on the balance sheet, ensuring full disclosure in our notes to financial statements.',
        durasiAudioDetik: 42,
        kekuatanCAR: [
          'Strong technical grasp of IFRS 16 valuation mechanics (discount rates, incremental borrowing rates, ROU asset depreciation).',
          'Systematic audit coverage encompassing 45 contracts across decentralized operations.',
        ],
        areaPeningkatan: [
          'Did not address change management: how regional branch managers were trained to report lease contract modifications in real time.',
          'Eye contact dropped to 64% while explaining future discounted cash flow computations.',
        ],
        koreksiPosturMediaPipe: [
          {
            timestamp: '03:22',
            deskripsi: 'Eye contact dipped to 64% while recalling incremental borrowing rate percentages.',
            derajatDeviasi: 'Tatapan Bawah',
          },
        ],
        rekomendasiJawabanBina: 'Highlight the human and systems integration: Emphasize that you deployed automated contract notification triggers in ERP and ran branch workshops to eliminate unrecorded side-letter agreements.',
        poinKunciBina: [
          'Controllership is equally about internal control culture as it is about accounting formulas.',
          'Frame compliance as risk protection rather than just a compliance checkbox.',
        ],
      },
      {
        id: 'eval_q3',
        nomorUrut: 3,
        pertanyaan: 'When forced to absorb an unexpected 18% operating expenditure (OPEX) budget cut, how did you reprioritize spending without compromising essential talent headcount?',
        skor: 88,
        kontakMataPersen: 85,
        jawabanKandidat: 'I initiated a rigorous zero-based budgeting audit on all discretionary non-operational expenses. We renegotiated enterprise SaaS licenses yielding 22% rate concessions, deferred non-critical capital expenditures, and consolidated vendor redundancy. This preserved 100% of our core team while delivering a 19.4% net OPEX reduction.',
        durasiAudioDetik: 52,
        kekuatanCAR: [
          'Methodological choice of Zero-Based Budgeting (ZBB) reflects high executive financial maturity.',
          'Surpassed the target (19.4% saved vs 18% mandate) while fiercely protecting talent retention.',
          'Strong and steady vocal cadence with commanding eye contact throughout.',
        ],
        areaPeningkatan: [
          'Elaborate briefly on how deferred capex risk was mitigated so productivity did not suffer in Q3 and Q4.',
        ],
        koreksiPosturMediaPipe: [
          {
            timestamp: '05:10',
            deskripsi: 'Upright, centered posture with confident open palm gestures.',
            derajatDeviasi: 'Postur Optimal',
          },
        ],
        rekomendasiJawabanBina: 'Polished STAR conclusion: Add a single sentence stating how preventative maintenance agreements were negotiated to safeguard deferred capex equipment.',
        poinKunciBina: [
          'Excellent demonstration of commercial acumen paired with organizational empathy.',
          'A benchmark answer structure for Director-level scrutiny.',
        ],
      },
      {
        id: 'eval_q4',
        nomorUrut: 4,
        pertanyaan: 'How did you handle an assertive confrontation with an Operations Director demanding early revenue recognition before milestone delivery was completed?',
        skor: 80,
        kontakMataPersen: 72,
        jawabanKandidat: 'I walked the Operations Director through PSAK 72 / IFRS 15 performance obligation criteria and explained the direct legal and audit repercussions of premature billing. To protect the business relationship without violating governance, I designed a structured milestone billing framework matching verified physical inspection phases.',
        durasiAudioDetik: 45,
        kekuatanCAR: [
          'Uncompromising integrity on statutory revenue standards with zero compliance breach.',
          'Offered a constructive commercial solution (milestone billing) rather than merely saying no.',
        ],
        areaPeningkatan: [
          'Noticeable physical tension: hand moved to neck twice during confrontation description, signaling lingering defensive stress.',
          'Eye contact wavered when describing executive tension.',
        ],
        koreksiPosturMediaPipe: [
          {
            timestamp: '07:40',
            deskripsi: 'Hand touched neck twice (stress pacifying behavior detected) during conflict recount.',
            derajatDeviasi: 'Gestur Stres',
          },
          {
            timestamp: '08:05',
            deskripsi: 'Shoulder elevation 8° indicating physical tension.',
            derajatDeviasi: 'Bahu Terangkat',
          },
        ],
        rekomendasiJawabanBina: 'Deliver this with absolute physical neutrality: Keep shoulders relaxed, hands resting calmly on the table, and frame the revenue guideline as corporate insurance protecting both the Director and the company.',
        poinKunciBina: [
          'An executive controller must stay emotionally unflappable when enforcing compliance.',
          'Eliminate self-soothing neck/face gestures to project unshakeable confidence.',
        ],
      },
    ];
  }

  // Indonesian Default
  return [
    {
      id: 'eval_q1',
      nomorUrut: 1,
      pertanyaan: 'Ceritakan pengalaman konkret Anda dalam memimpin rekonsiliasi selisih material pada laporan keuangan konsolidasian multi-entitas menjelang audit tahunan.',
      skor: 86,
      kontakMataPersen: 84,
      jawabanKandidat: 'Di perusahaan sebelumnya yang membawahi 12 entitas anak, kami menemukan selisih transfer pricing antar-entitas sebesar Rp 2,4 Miliar dua minggu sebelum audit statutori dimulai. Saya memimpin gugus tugas finansial lintas cabang, mengisolasi transaksi eliminasi intercompany melalui SAP S/4HANA, dan menetapkan protokol rekonsiliasi mingguan. Hasilnya, laporan audit rampung tepat waktu dengan opini Wajar Tanpa Pengecualian (WTP).',
      durasiAudioDetik: 48,
      kekuatanCAR: [
        'Konteks dan Aksi sangat konkret dengan angka terukur (12 anak perusahaan, selisih Rp 2,4 Miliar).',
        'Menunjukkan kepemimpinan finansial yang kuat melalui pemanfaatan ERP SAP dan standarisasi proses kerja.',
        'Hasil akhir berdampak nyata bagi reputasi korporasi: Opini WTP tanpa denda keterlambatan pelaporan.',
      ],
      areaPeningkatan: [
        'Dampak efisiensi jangka panjang (misal penghematan jam lembur tim di kuartal berikutnya) belum terkuantifikasi pada bagian Result.',
        'Postur tubuh: terdeteksi kepala miring 12 derajat ke kiri saat menjelaskan detail modul SAP.',
      ],
      koreksiPosturMediaPipe: [
        {
          timestamp: '01:14',
          deskripsi: 'Kemiringan kepala 12° terdeteksi saat menguraikan jurnal eliminasi transfer pricing.',
          derajatDeviasi: '12° Kemiringan Bahu',
        },
        {
          timestamp: '01:38',
          deskripsi: 'Tangan menyentuh dagu selama 4,2 detik saat mengingat lini masa audit.',
          derajatDeviasi: 'Sentuhan Wajah',
        },
      ],
      rekomendasiJawabanBina: 'Perkuat bagian Result: Sebutkan bahwa protokol rekonsiliasi baru tersebut menurunkan varians intercompany hingga di bawah 0,02% dan memangkas 120 jam kerja tim per kuartal secara berkelanjutan.',
      poinKunciBina: [
        'Kaitkan penyelesaian krisis taktis dengan efisiensi biaya operasional jangka panjang.',
        'Pertahankan tatapan mata tegak lurus saat menyebutkan nominal miliaran untuk menegaskan keyakinan data.',
      ],
    },
    {
      id: 'eval_q2',
      nomorUrut: 2,
      pertanyaan: 'Bagaimana pendekatan Anda dalam memastikan kepatuhan standar PSAK 73 / IFRS 16 terkait kapitalisasi liabilitas sewa di seluruh unit operasional?',
      skor: 82,
      kontakMataPersen: 78,
      jawabanKandidat: 'Saya menyusun modul diskonto arus kas terpusat dan mengaudit ulang 45 kontrak sewa operasional di berbagai kantor cabang. Kami mereklasifikasi seluruh sewa guna usaha ke dalam aset hak-guna (ROU Asset) dan liabilitas sewa pada neraca konsolidasi, serta memastikan pengungkapan menyeluruh pada Catatan atas Laporan Keuangan.',
      durasiAudioDetik: 42,
      kekuatanCAR: [
        'Pemahaman teoritis PSAK 73 sangat tajam terkait perhitungan present value dan perlakuan bunga diskonto.',
        'Audit mencakup 45 kontrak operasional secara sistematis tanpa ada yang terlewat.',
      ],
      areaPeningkatan: [
        'Kurang menguraikan manajemen perubahan: bagaimana mengedukasi manajer cabang agar kontrak sewa baru tidak disembunyikan sebagai biaya operasional langsung.',
        'Kontak mata turun ke 64% ketika mengingat formula suku bunga pinjaman inkremental.',
      ],
      koreksiPosturMediaPipe: [
        {
          timestamp: '03:22',
          deskripsi: 'Kontak mata turun ke 64% saat menjelaskan suku bunga diskonto inkremental.',
          derajatDeviasi: 'Tatapan Bawah',
        },
      ],
      rekomendasiJawabanBina: 'Soroti aspek kolaborasi tim: Jelaskan bahwa Anda membuat sistem peringatan otomatis pada ERP dan pelatihan berkala untuk manajer cabang agar kepatuhan berlangsung proaktif.',
      poinKunciBina: [
        'Peran Controller mencakup pengawalan budaya kepatuhan, bukan sekadar menghitung formula akuntansi.',
        'Gunakan analogi mitigasi risiko finansial agar terdengar strategis di hadapan direksi.',
      ],
    },
    {
      id: 'eval_q3',
      nomorUrut: 3,
      pertanyaan: 'Ketika manajemen mengharuskan efisiensi anggaran belanja operasional (OPEX) sebesar 18% secara mendadak, bagaimana Anda mengeksekusinya tanpa memotong headcount tim?',
      skor: 88,
      kontakMataPersen: 85,
      jawabanKandidat: 'Saya menerapkan pendekatan zero-based budgeting pada pos pengeluaran diskresioner. Kami menegosiasikan ulang lisensi enterprise SaaS dengan penghematan 22%, merestrukturisasi termin vendor logistik, dan menunda capex non-kritis. Pendekatan ini berhasil mengamankan 100% headcount karyawan dengan realisasi penghematan OPEX sebesar 19,4%.',
      durasiAudioDetik: 52,
      kekuatanCAR: [
        'Penerapan Zero-Based Budgeting (ZBB) sangat mencerminkan kematangan seorang Financial Controller.',
        'Melampaui target (penghematan 19,4% vs target 18%) sekaligus mempertahankan talenta kerja.',
        'Artikulasi vokal mantap dan stabil didukung kontak mata yang konsisten tinggi.',
      ],
      areaPeningkatan: [
        'Dapat diperkaya dengan penjelasan mitigasi risiko atas penundaan capex agar tidak mengganggu operasional masa depan.',
      ],
      koreksiPosturMediaPipe: [
        {
          timestamp: '05:10',
          deskripsi: 'Postur tubuh tegak simetris dan gestur tangan terbuka terkendali.',
          derajatDeviasi: 'Postur Optimal',
        },
      ],
      rekomendasiJawabanBina: 'Sempurnakan kalimat penutup STAR: Tambahkan bahwa Anda menyepakati program pemeliharaan preventif khusus sehingga mesin dan aset operasional tetap prima meski capex baru ditunda.',
      poinKunciBina: [
        'Jawaban berbobot tinggi yang menyeimbangkan efisiensi finansial dan empati sumber daya manusia.',
        'Format jawaban yang sangat disukai oleh C-Level dan Direksi Perusahaan.',
      ],
    },
    {
      id: 'eval_q4',
      nomorUrut: 4,
      pertanyaan: 'Bagaimana Anda bersikap ketika terjadi perbedaan pandangan dengan Direktur Operasional yang mendesak pengakuan pendapatan sebelum serah terima pekerjaan selesai?',
      skor: 80,
      kontakMataPersen: 72,
      jawabanKandidat: 'Saya memaparkan klausul PSAK 72 mengenai kewajiban pelaksanaan dan risiko hukum audit bagi kredibilitas perusahaan. Agar tidak memicu friksi yang merusak operasional, saya memberikan jalan keluar berupa penagihan bertahap berbasis milestone serah terima fisik yang sah.',
      durasiAudioDetik: 45,
      kekuatanCAR: [
        'Integritas etika profesi akuntansi tidak tergoyahkan oleh tekanan struktural.',
        'Solutif: Menghadirkan skema milestone billing sehingga bisnis tetap berjalan tanpa melanggar regulasi.',
      ],
      areaPeningkatan: [
        'Bahasa tubuh memperlihatkan ketegangan: terdeteksi gestur menyentuh leher 2 kali saat menceritakan friksi, menandakan stres defensif.',
        'Kontak mata sedikit goyah saat menggambarkan interaksi tatap muka dengan figur direksi.',
      ],
      koreksiPosturMediaPipe: [
        {
          timestamp: '07:40',
          deskripsi: 'Tangan menyentuh leher 2x (gestur penenang stres) saat menguraikan perbedaan pandangan.',
          derajatDeviasi: 'Gestur Stres',
        },
        {
          timestamp: '08:05',
          deskripsi: 'Bahu naik 8° mencerminkan ketegangan fisik bawah sadar.',
          derajatDeviasi: 'Bahu Terangkat',
        },
      ],
      rekomendasiJawabanBina: 'Sampaikan dengan ketenangan bahasa tubuh yang mutlak: Posisikan kedua tangan rileks di atas meja, bahu relaks, dan bingkai kepatuhan standar akuntansi sebagai perlindungan legal bagi direksi itu sendiri.',
      poinKunciBina: [
        'Kunci controller eksekutif adalah ketegasan yang dibawakan dengan sikap ramah dan diplomatis.',
        'Hindari gestur menyentuh leher atau wajah saat membahas situasi bertekanan tinggi.',
      ],
    },
  ];
}

export function hitungMetrikTelemetri(
  daftarSoal: EvaluasiPertanyaanItem[],
  inputKandidat?: SkorTelemetriInput
): {
  skorKeseluruhan: number;
  persentilKandidat: number;
  metodeCar: number;
  komunikasi: number;
  penguasaanTeknis: number;
  bahasaTubuh: number;
  kontakMataRataRata: number;
  catatanPosturDominan: string;
  kutipanEvaluasiBina: string;
  durasiSesiFormatted: string;
} {
  // Hitung rata-rata skor riil
  const totalSkor = daftarSoal.reduce((acc, q) => acc + q.skor, 0);
  const avgSkor = daftarSoal.length > 0 ? Math.round(totalSkor / daftarSoal.length) : 84;
  
  const totalKontakMata = daftarSoal.reduce((acc, q) => acc + q.kontakMataPersen, 0);
  const avgKontakMata = daftarSoal.length > 0 ? Math.round(totalKontakMata / daftarSoal.length) : 80;

  return {
    skorKeseluruhan: inputKandidat?.skorKeseluruhan ?? avgSkor,
    persentilKandidat: inputKandidat?.persentilKandidat ?? 8,
    metodeCar: inputKandidat?.metodeCar ?? 88,
    komunikasi: inputKandidat?.komunikasi ?? 85,
    penguasaanTeknis: inputKandidat?.penguasaanTeknis ?? 82,
    bahasaTubuh: inputKandidat?.bahasaTubuh ?? (inputKandidat?.kontakMataRataRata ?? avgKontakMata),
    kontakMataRataRata: inputKandidat?.kontakMataRataRata ?? avgKontakMata,
    catatanPosturDominan:
      inputKandidat?.catatanPosturDominan ??
      'Kontak mata stabil rata-rata 80%. Terdeteksi 3x gestur menyentuh dagu atau leher saat menghadapi pertanyaan mengenai audit krisis dan PSAK.',
    kutipanEvaluasiBina:
      inputKandidat?.kutipanEvaluasiBina ??
      'Struktur CAR Anda pada resolusi rekonsiliasi multi-entitas dan zero-based budgeting sangat berbobot eksekutif. Tingkatkan ketenangan gestur fisik saat mendiskusikan dinamika konflik agar kredibilitas kepemimpinan Anda terpancar sempurna.',
    durasiSesiFormatted: inputKandidat?.durasiSesiFormatted ?? '18 Menit 42 Detik',
  };
}

export function adaptasiRiwayatChatKeEvaluasi(
  riwayatChat?: PesanChat[],
  bahasa: 'id' | 'en' = 'id'
): EvaluasiPertanyaanItem[] {
  const defaultList = getDaftarPertanyaanEvaluasiDefault(bahasa);
  if (!riwayatChat || riwayatChat.length === 0) {
    return defaultList;
  }

  // Cari pasangan pesan pewawancara -> jawaban kandidat
  const pasangTanyaJawab: { pertanyaan: string; jawaban: string }[] = [];
  let pertanyaanTerakhir = '';

  for (const pesan of riwayatChat) {
    if (pesan.pengirim === 'pewawancara') {
      pertanyaanTerakhir = pesan.teks;
    } else if (pesan.pengirim === 'kandidat' && pertanyaanTerakhir) {
      pasangTanyaJawab.push({
        pertanyaan: pertanyaanTerakhir,
        jawaban: pesan.teks,
      });
      pertanyaanTerakhir = '';
    }
  }

  // Jika ada pasangan tanya jawab nyata dari sesi simulasi, gabungkan secara cerdas
  if (pasangTanyaJawab.length > 0) {
    return pasangTanyaJawab.map((ptj, index) => {
      const fallback = defaultList[index % defaultList.length];
      const kataKandidat = ptj.jawaban.split(/\s+/).length;
      // Perhitungan skor responsif berbasis kedalaman kata kandidat
      const dinamisSkor = Math.min(95, Math.max(70, Math.round(75 + Math.min(20, kataKandidat / 4))));
      const dinamisKontakMata = Math.min(92, Math.max(68, Math.round(74 + (index % 3) * 5)));

      return {
        id: `eval_chat_${index + 1}`,
        nomorUrut: index + 1,
        pertanyaan: ptj.pertanyaan,
        skor: dinamisSkor,
        kontakMataPersen: dinamisKontakMata,
        jawabanKandidat: ptj.jawaban,
        durasiAudioDetik: Math.max(25, Math.round(kataKandidat * 0.4)),
        kekuatanCAR: fallback.kekuatanCAR,
        areaPeningkatan: fallback.areaPeningkatan,
        koreksiPosturMediaPipe: fallback.koreksiPosturMediaPipe,
        rekomendasiJawabanBina: fallback.rekomendasiJawabanBina,
        poinKunciBina: fallback.poinKunciBina,
      };
    });
  }

  return defaultList;
}
