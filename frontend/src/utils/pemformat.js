/** Util pemformatan teks & waktu (Bahasa Indonesia). */

/** Sapaan sesuai jam: pagi/siang/sore/malam */
export function sapaanWaktu(tanggal = new Date()) {
  const jam = tanggal.getHours();
  if (jam >= 4 && jam < 11) return 'Selamat pagi';
  if (jam >= 11 && jam < 15) return 'Selamat siang';
  if (jam >= 15 && jam < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/** Inisial pertama untuk avatar cadangan */
export function inisial(nama) {
  const bersih = (nama || '').trim();
  if (!bersih) return 'M';
  return bersih.charAt(0).toUpperCase();
}

/** Nama depan saja untuk sapaan ringkas */
export function namaDepan(nama) {
  const bersih = (nama || '').trim();
  if (!bersih) return '';
  return bersih.split(/\s+/)[0];
}