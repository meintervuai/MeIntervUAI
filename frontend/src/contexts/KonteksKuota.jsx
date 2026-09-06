import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { pakaiOtentikasi } from './KonteksOtentikasi';
import { muatKuota } from '../services/api_kuota';

/**
 * Kuota AI harian (20 panggilan/hari — database.md §9).
 * Sisa kuota tampil di Home & Profil; setiap pemakaian AI nanti memanggil kurangi().
 */
const Konteks = createContext(null);

export function KonteksKuota({ children }) {
  const { pengguna } = pakaiOtentikasi();
  const [kuota, setKuota] = useState(null);
  const [memuat, setMemuat] = useState(true);

  const segarkan = useCallback(async () => {
    if (!pengguna) {
      setKuota(null);
      setMemuat(false);
      return;
    }
    setMemuat(true);
    try {
      setKuota(await muatKuota(pengguna.id));
    } catch (galat) {
      console.warn('[KonteksKuota] gagal memuat kuota:', galat.message);
      setKuota(null);
    } finally {
      setMemuat(false);
    }
  }, [pengguna]);

  useEffect(() => {
    segarkan();
  }, [segarkan]);

  /** Kurangi 1 panggilan (dipanggil setelah sukses memanggil LLM). */
  const kurangi = useCallback(() => {
    setKuota((sebelumnya) => {
      if (!sebelumnya) return sebelumnya;
      const terpakai = Math.min(sebelumnya.terpakai + 1, sebelumnya.batas);
      return { ...sebelumnya, terpakai, sisa: Math.max(0, sebelumnya.batas - terpakai) };
    });
  }, []);

  return (
    <Konteks.Provider value={{ kuota, memuat, segarkan, kurangi }}>
      {children}
    </Konteks.Provider>
  );
}

export function pakaiKuota() {
  const konteks = useContext(Konteks);
  if (!konteks) {
    throw new Error('pakaiKuota harus dipakai di dalam <KonteksKuota>.');
  }
  return konteks;
}