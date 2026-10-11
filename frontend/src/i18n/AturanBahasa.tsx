// Modul Manajemen Dwibahasa MeIntervUAI (AturanBahasa)
// Menyatukan React Context, hook useBahasa, dan kamus terjemahan dalam satu arsitektur bersih tanpa duplikasi.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PusatBantuanKonten } from './types';
import { kontenId } from './locales/id';
import { kontenEn } from './locales/en';

export type KodeBahasa = 'id' | 'en';

export const kamusPusatBantuan: Record<KodeBahasa, PusatBantuanKonten> = {
  id: kontenId,
  en: kontenEn,
};

interface KonteksBahasa {
  bahasa: KodeBahasa;
  setBahasa: (lang: KodeBahasa) => void;
  t: PusatBantuanKonten;
}

const BahasaContext = createContext<KonteksBahasa | null>(null);

export const AturanBahasa: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bahasa, setBahasaState] = useState<KodeBahasa>(() => {
    const saved = localStorage.getItem('intervu_locale');
    if (saved === 'id' || saved === 'en') return saved;
    return 'id';
  });

  const setBahasa = (lang: KodeBahasa) => {
    setBahasaState(lang);
    localStorage.setItem('intervu_locale', lang);
  };

  useEffect(() => {
    document.documentElement.lang = bahasa;
  }, [bahasa]);

  const value = {
    bahasa,
    setBahasa,
    t: kamusPusatBantuan[bahasa],
  };

  return <BahasaContext.Provider value={value}>{children}</BahasaContext.Provider>;
};

// Alias PenyediaBahasa untuk menjaga kompatibilitas ke belakang jika ada impor lama
export const PenyediaBahasa = AturanBahasa;

export const useBahasa = () => {
  const context = useContext(BahasaContext);
  if (!context) {
    throw new Error('useBahasa harus digunakan di dalam komponen pembungkus <AturanBahasa>');
  }
  return context;
};

export * from './types';
