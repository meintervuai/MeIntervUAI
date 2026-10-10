// Komponen Tombol standar (FE-02, UX-07): konsistensi ukuran kelipatan 4px, varian warna, dan loading state.
import React from 'react';

interface PropertiTombol extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  varian?: 'primer' | 'sekunder' | 'outline' | 'bahaya';
  ukuran?: 'sm' | 'md' | 'lg';
  sedangMemuat?: boolean;
}

export const Tombol: React.FC<PropertiTombol> = ({
  children,
  varian = 'primer',
  ukuran = 'md',
  sedangMemuat = false,
  disabled,
  className = '',
  ...props
}) => {
  const kelasDasar = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const kelasUkuran = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[ukuran];

  const kelasVarian = {
    primer: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus-visible:outline-brand-600 shadow-sm',
    sekunder: 'bg-slate-200 text-slate-800 hover:bg-slate-300 active:bg-slate-400 focus-visible:outline-slate-500',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-brand-600',
    bahaya: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:outline-rose-600 shadow-sm',
  }[varian];

  return (
    <button
      className={`${kelasDasar} ${kelasUkuran} ${kelasVarian} ${className}`}
      disabled={disabled || sedangMemuat}
      {...props}
    >
      {sedangMemuat ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Memuat...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
