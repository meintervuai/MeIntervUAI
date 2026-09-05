import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  ambilSesi,
  dengarPerubahanSesi,
  keluar as prosesKeluar,
} from '../services/api_otentikasi';
import { ambilProfil } from '../services/api_profil';

/**
 * Sumber tunggal status masuk: sesi, pengguna (auth.users), dan profil (public.profil).
 * Semua halaman mengambil data pengguna dari sini (FR-01, FR-02).
 */
const Konteks = createContext(null);

export function KonteksOtentikasi({ children }) {
  const [sesi, setSesi] = useState(null);
  const [pengguna, setPengguna] = useState(null);
  const [profil, setProfil] = useState(null);
  const [memuat, setMemuat] = useState(true);

  const muatProfil = useCallback(async (uid) => {
    try {
      const data = await ambilProfil(uid);
      setProfil(data);
      return data;
    } catch (galat) {
      console.warn('[KonteksOtentikasi] gagal memuat profil:', galat.message);
      setProfil(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        const sesiAwal = await ambilSesi();
        if (!aktif) return;
        setSesi(sesiAwal);
        setPengguna(sesiAwal?.user ?? null);
        if (sesiAwal?.user) await muatProfil(sesiAwal.user.id);
      } catch (galat) {
        console.warn('[KonteksOtentikasi] sesi awal:', galat.message);
      } finally {
        if (aktif) setMemuat(false);
      }
    })();

    const berhenti = dengarPerubahanSesi((sesiBaru) => {
      setSesi(sesiBaru);
      setPengguna(sesiBaru?.user ?? null);
      if (sesiBaru?.user) {
        muatProfil(sesiBaru.user.id);
      } else {
        setProfil(null);
      }
    });

    return () => {
      aktif = false;
      berhenti();
    };
  }, [muatProfil]);

  const keluar = useCallback(async () => {
    await prosesKeluar();
    setSesi(null);
    setPengguna(null);
    setProfil(null);
  }, []);

  return (
    <Konteks.Provider
      value={{ sesi, pengguna, profil, setProfil, memuat, keluar, muatProfil }}
    >
      {children}
    </Konteks.Provider>
  );
}

export function pakaiOtentikasi() {
  const konteks = useContext(Konteks);
  if (!konteks) {
    throw new Error('pakaiOtentikasi harus dipakai di dalam <KonteksOtentikasi>.');
  }
  return konteks;
}