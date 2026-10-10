// Komponen Kartu standar (FE-02, UX-02, UX-06): batas proporsional, tanpa glassmorphism berlebihan, bayangan terarah.
import React from 'react';

interface PropertiKartu {
  children: React.ReactNode;
  className?: string;
  denganHover?: boolean;
}

export const Kartu: React.FC<PropertiKartu> = ({
  children,
  className = '',
  denganHover = false,
}) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm ${
        denganHover ? 'hover:shadow-md hover:border-slate-300 transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
