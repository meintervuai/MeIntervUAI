import { useContext } from 'react';
import { KonteksKuota } from '../contexts/KonteksKuota';

/** Akses kuota AI harian (batas/terpakai/sisa) dari mana saja di dalam provider. */
export function pakaiKuota() {
  const konteks = useContext(KonteksKuota);
  if (!konteks) {
    throw new Error('pakaiKuota harus dipakai di dalam <KonteksKuota>.');
  }
  return konteks;
}