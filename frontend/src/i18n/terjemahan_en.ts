// Kamus Bahasa Inggris (opsi kedua) — kunci WAJIB sama dengan terjemahan_id.ts.
import type { Kamus } from './terjemahan_id';

export const terjemahanEn: Kamus = {
  umum: {
    appName: 'MENTERVU AI',
    tagline: 'AI-Powered Job Interview Simulator',
    masuk: 'Sign in',
    keluar: 'Sign out',
    simpan: 'Save',
    menyimpan: 'Saving…',
    tersimpan: 'Saved',
    batal: 'Cancel',
    kembali: 'Back',
    segera: 'Soon',
    beranda: 'Home',
    profil: 'Profile',
  },
  masuk: {
    judul: 'Sign in to your account',
    deskripsi: 'Practice interviews with AI, build a strong CV, and get career-ready.',
    tombolGoogle: 'Continue with Google',
    sedangProses: 'Redirecting to Google…',
    gagal: 'Could not start the sign-in flow. Please try again.',
    catatanPrivasi: 'Your interview video is never stored on any server.',
  },
  beranda: {
    judul: 'Interview practice, without the nerves',
    deskripsi:
      'AI acts as your professional interviewer: dynamic questions, objective feedback, and ATS-friendly CV analysis — right from your phone.',
    ctaMulai: 'Start Practicing',
    poin1: 'Text, audio, and video modes',
    poin2: 'CV analysis with objective scores',
    poin3: 'Privacy first — videos are never stored',
  },
  home: {
    sapaan: 'Hello',
    kuotaJudul: "Today's AI quota",
    kuotaSisa: 'calls left',
    tindakanJudul: 'Quick actions',
    analisisJudul: 'CV Analysis',
    analisisKosong:
      'No CV to analyze yet. Create your CV first, then run the ATS analysis.',
    analisisBuat: 'Create CV',
    tindakan: {
      analisis: 'Analyze CV',
      buatCv: 'Create CV',
      simulasi: 'Simulate',
      lowongan: 'Jobs',
    },
  },
  profil: {
    judul: 'Profile',
    foto: 'Profile photo',
    gantiFoto: 'Change photo',
    nama: 'Full name',
    posisiTarget: 'Target position',
    posisiPlaceholder: 'e.g. Frontend Developer',
    bahasa: 'App language',
    bahasaId: 'Indonesian',
    bahasaEn: 'English',
    email: 'Email',
    kuota: "Today's AI quota",
    simpanPerubahan: 'Save changes',
    berhasilDisimpan: 'Profile changes saved.',
    gagalSimpan: 'Failed to save changes. Please try again.',
    gagalUnggah: 'Failed to upload photo. Please try again.',
  },
  segera: {
    judul: 'Coming soon',
    deskripsi:
      'This module is being prepared. Current focus: sign in, home, CV, and profile (Milestone 1).',
  },
  navigasi: {
    beranda: 'Home',
    cv: 'CV',
    simulasi: 'Simulate',
    lowongan: 'Jobs',
    profil: 'Profile',
  },
};