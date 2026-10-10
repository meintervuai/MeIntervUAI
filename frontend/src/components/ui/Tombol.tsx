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
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  }[ukuran];

  const kelasVarian = {
    primer: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 focus-visible:outline-brand-700 shadow-sm',
    sekunder: 'bg-stone-200 text-stone-800 hover:bg-stone-300 active:bg-stone-400 focus-visible:outline-stone-500',
    outline: 'border border-stone-300 text-stone-800 hover:bg-stone-100 active:bg-stone-200 focus-visible:outline-brand-700',
    bahaya: 'bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 focus-visible:outline-rose-700 shadow-sm',
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
