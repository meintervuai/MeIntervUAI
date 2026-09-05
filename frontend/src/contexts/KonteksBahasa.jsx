import { createContext, useContext, useState, useCallback } from 'react';
import { pakaiOtentikasi } from './KonteksOtentikasi';
import { perbaruiProfil } from '../services/api_profil';
import { terjemahanId } from '../i18n/terjemahan_id';
import { terjemahanEn } from '../i18n/terjemahan_en';

/**
 * Bahasa antarmuka — Indonesia default (id), Inggris opsi (en).
 * Pilihan disimpan ke profil.bahasa (database.md §5.1).
 */
const kamus = { id: terjemahanId, en: terjemahanEn };
const Konteks = createContext(null);

export function KonteksBahasa({ children }) {
  const { profil, setProfil } = pakaiOtentikasi();
  const [bahasa, setBahasaState] = useState(profil?.bahasa ?? 'id');

  // Sinkron saat profil selesai dimuat / berganti
  if (profil?.bahasa && profil.bahasa !== bahasa && profil.bahasa !== undefined) {
    // hanya untuk kasus profil terlambat dimuat dengan nilai berbeda
    setBahasaState(profil.bahasa);
  }

  const gantiBahasa = useCallback(
    async (baru) => {
      setBahasaState(baru);
      if (profil?.id) {
        try {
          const diperbarui = await perbaruiProfil(profil.id, { bahasa: baru });
          setProfil(diperbarui);
        } catch (galat) {
          console.warn('[KonteksBahasa] gagal simpan bahasa:', galat.message);
        }
      }
    },
    [profil, setProfil],
  );

  const t = kamus[bahasa] ?? terjemahanId;

  return (
    <Konteks.Provider value={{ bahasa, gantiBahasa, t }}>{children}</Konteks.Provider>
  );
}

export function pakaiBahasa() {
  const konteks = useContext(Konteks);
  if (!konteks) {
    throw new Error('pakaiBahasa harus dipakai di dalam <KonteksBahasa>.');
  }
  return konteks;
}