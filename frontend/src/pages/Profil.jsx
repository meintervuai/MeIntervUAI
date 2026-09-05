import { useRef, useState } from 'react';
import KartuKuota from '../components/KartuKuota';
import IkonKeluar from '../components/icons/IkonKeluar';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import { pakaiBahasa } from '../contexts/KonteksBahasa';
import { pakaiKuota } from '../hooks/pakai_kuota';
import { perbaruiProfil, unggahAvatar } from '../services/api_profil';
import { inisial } from '../utils/pemformat';

/**
 * Profil (FR-02): lihat & ubah nama, posisi target, bahasa, dan foto.
 * Bahasa langsung tersimpan via KonteksBahasa; nama & posisi via tombol Simpan.
 */
export default function Profil() {
  const { profil, setProfil, keluar } = pakaiOtentikasi();
  const { t, bahasa, gantiBahasa } = pakaiBahasa();
  const { kuota, memuat: memuatKuota } = pakaiKuota();

  const [nama, setNama] = useState(profil?.nama_lengkap ?? '');
  const [posisi, setPosisi] = useState(profil?.posisi_target ?? '');
  const [status, setStatus] = useState(null); // { jenis: 'sukses'|'gagal', teks }
  const [menyimpan, setMenyimpan] = useState(false);
  const [mengunggah, setMengunggah] = useState(false);
  const rujukBerkas = useRef(null);

  if (!profil) return null;

  async function tanganiSimpan(e) {
    e.preventDefault();
    setMenyimpan(true);
    setStatus(null);
    try {
      const diperbarui = await perbaruiProfil(profil.id, {
        nama_lengkap: nama.trim(),
        posisi_target: posisi.trim() || null,
      });
      setProfil(diperbarui);
      setStatus({ jenis: 'sukses', teks: t.profil.berhasilDisimpan });
    } catch {
      setStatus({ jenis: 'gagal', teks: t.profil.gagalSimpan });
    } finally {
      setMenyimpan(false);
    }
  }

  async function tanganiGantiFoto(e) {
    const berkas = e.target.files?.[0];
    e.target.value = '';
    if (!berkas) return;
    setMengunggah(true);
    setStatus(null);
    try {
      const diperbarui = await unggahAvatar(profil.id, berkas);
      setProfil(diperbarui);
      setStatus({ jenis: 'sukses', teks: t.profil.berhasilDisimpan });
    } catch {
      setStatus({ jenis: 'gagal', teks: t.profil.gagalUnggah });
    } finally {
      setMengunggah(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-extrabold tracking-tight text-batu-900">
        {t.profil.judul}
      </h1>

      {/* Kartu identitas */}
      <section className="kartu flex items-center gap-4 p-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-oranye-100 font-display text-xl font-extrabold text-oranye-700">
          {profil.url_avatar ? (
            <img
              src={profil.url_avatar}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            inisial(profil.nama_lengkap)
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-batu-800">
            {profil.nama_lengkap || '—'}
          </p>
          <p className="truncate text-sm text-batu-500">{profil.email}</p>
          <button
            type="button"
            className="mt-1.5 text-xs font-bold text-oranye-700 hover:underline disabled:opacity-50"
            onClick={() => rujukBerkas.current?.click()}
            disabled={mengunggah}
          >
            {mengunggah ? '…' : t.profil.gantiFoto}
          </button>
          <input
            ref={rujukBerkas}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={tanganiGantiFoto}
            aria-label={t.profil.gantiFoto}
          />
        </div>
      </section>

      {/* Form profil */}
      <form onSubmit={tanganiSimpan} className="kartu space-y-4 p-4">
        <div>
          <label htmlFor="nama" className="label-form">
            {t.profil.nama}
          </label>
          <input
            id="nama"
            className="bidang-masukan"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            maxLength={80}
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="posisi" className="label-form">
            {t.profil.posisiTarget}
          </label>
          <input
            id="posisi"
            className="bidang-masukan"
            value={posisi ?? ''}
            onChange={(e) => setPosisi(e.target.value)}
            placeholder={t.profil.posisiPlaceholder}
            maxLength={80}
          />
        </div>

        <div>
          <span className="label-form">{t.profil.bahasa}</span>
          <div className="grid grid-cols-2 gap-1 rounded-tombol border border-batu-300 bg-batu-100 p-1">
            {[
              { kode: 'id', label: t.profil.bahasaId },
              { kode: 'en', label: t.profil.bahasaEn },
            ].map(({ kode, label }) => (
              <button
                key={kode}
                type="button"
                onClick={() => gantiBahasa(kode)}
                aria-pressed={bahasa === kode}
                className={`min-h-[40px] rounded-[10px] px-3 text-sm font-semibold transition-colors ${
                  bahasa === kode
                    ? 'bg-oranye-600 text-white shadow-kartu'
                    : 'text-batu-600 hover:text-batu-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {status && (
          <p
            role="status"
            className={`rounded-tombol px-3 py-2 text-xs font-medium ${
              status.jenis === 'sukses'
                ? 'border border-sukses/30 bg-green-50 text-sukses'
                : 'border border-bahaya/30 bg-red-50 text-bahaya'
            }`}
          >
            {status.teks}
          </p>
        )}

        <button type="submit" className="tombol-utama w-full" disabled={menyimpan}>
          {menyimpan ? t.umum.menyimpan : t.profil.simpanPerubahan}
        </button>
      </form>

      {/* Kuota */}
      <KartuKuota kuota={kuota} memuat={memuatKuota} />

      {/* Keluar */}
      <button
        type="button"
        onClick={keluar}
        className="tombol-netral w-full text-bahaya hover:bg-red-50 active:bg-red-100"
      >
        <IkonKeluar className="h-[18px] w-[18px]" />
        {t.umum.keluar}
      </button>

      <p className="pb-2 text-center text-[11px] text-batu-400">
        {t.umum.appName} · v0.1.0 (Milestone 1)
      </p>
    </div>
  );
}