import { useState, useEffect } from 'react';
import { PusatBantuanKonten } from './types';
import { kontenId } from './locales/id';
import { kontenEn } from './locales/en';

export type KodeBahasa = 'id' | 'en';

export const kamusPusatBantuan: Record<KodeBahasa, PusatBantuanKonten> = {
  id: kontenId,
  en: kontenEn,
};

export const useBahasa = (defaultBahasa: KodeBahasa = 'id') => {
  const [bahasa, setBahasaState] = useState<KodeBahasa>(() => {
    const saved = localStorage.getItem('intervu_locale');
    if (saved === 'id' || saved === 'en') return saved;
    return defaultBahasa;
  });

  const setBahasa = (lang: KodeBahasa) => {
    setBahasaState(lang);
    localStorage.setItem('intervu_locale', lang);
  };

  useEffect(() => {
    document.documentElement.lang = bahasa;
  }, [bahasa]);

  return {
    bahasa,
    setBahasa,
    t: kamusPusatBantuan[bahasa],
  };
};

export * from './types';
