/**
 * Helper aksesibilitas — verifikasi kontras WCAG AA (≥ 4.5:1).
 * Dipakai saat menambah pasangan warna baru (prd.md §11.2).
 */

function hexKeRgb(hex) {
  const bersih = hex.replace('#', '');
  const penuh =
    bersih.length === 3
      ? bersih
          .split('')
          .map((c) => c + c)
          .join('')
      : bersih;
  const angka = parseInt(penuh, 16);
  return { r: (angka >> 16) & 255, g: (angka >> 8) & 255, b: angka & 255 };
}

function luminansi(hex) {
  const { r, g, b } = hexKeRgb(hex);
  const kanal = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * kanal[0] + 0.7152 * kanal[1] + 0.0722 * kanal[2];
}

/** Rasio kontras dua warna hex, mis. rasioKontras('#292524', '#FAFAF7') */
export function rasioKontras(depan, belakang) {
  const l1 = luminansi(depan);
  const l2 = luminansi(belakang);
  const terang = Math.max(l1, l2);
  const gelap = Math.min(l1, l2);
  return (terang + 0.05) / (gelap + 0.05);
}

/** true bila pasangan warna lolos WCAG AA untuk teks normal */
export function lolosAA(depan, belakang) {
  return rasioKontras(depan, belakang) >= 4.5;
}