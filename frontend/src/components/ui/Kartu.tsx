// Komponen Kartu standar (FE-02, UX-02, UX-06): batas proporsional hairline, bayangan halus bertingkat, tanpa elemen slop.
import React from 'react';

interface PropertiKartu {
  children: React.ReactNode;
  className?: string;
  denganHover?: boolean;
  varian?: 'standar' | 'halus' | 'gelap';
}

export const Kartu: React.FC<PropertiKartu> = ({
  children,
  className = '',
  denganHover = false,
  varian = 'standar',
}) => {
  const kelasVarian = {
    standar: 'bg-white border border-orange-200/80 shadow-[0_1px_3px_0_rgba(234,88,12,0.03),0_1px_2px_-1px_rgba(234,88,12,0.02)]',
    halus: 'bg-orange-50/40 border border-orange-200/60',
    gelap: 'bg-stone-900 border border-stone-800 text-white shadow-lg',
  }[varian];

  const efekHover = denganHover
    ? 'hover:border-orange-400 hover:shadow-[0_6px_20px_rgba(234,88,12,0.08)] hover:-translate-y-[1px] transition-all duration-200'
    : '';

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 ${kelasVarian} ${efekHover} ${className}`}
    >
      {children}
    </div>
  );
};

