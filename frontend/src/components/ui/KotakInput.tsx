// Komponen KotakInput standar (FE-02, UX-09): kontras teks aman, pesan error eksplisit, status fokus jelas.
import React from 'react';

interface PropertiKotakInput extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  pesanGalat?: string;
  keteranganBantuan?: string;
}

export const KotakInput: React.FC<PropertiKotakInput> = ({
  label,
  pesanGalat,
  keteranganBantuan,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-sm bg-white text-stone-900 border rounded-lg transition-colors placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 disabled:bg-stone-100 disabled:text-stone-500 ${
          pesanGalat ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-stone-300'
        } ${className}`}
        {...props}
      />
      {pesanGalat && (
        <p className="mt-1.5 text-xs text-rose-700 font-medium">{pesanGalat}</p>
      )}
      {keteranganBantuan && !pesanGalat && (
        <p className="mt-1.5 text-xs text-stone-600">{keteranganBantuan}</p>
      )}
    </div>
  );
};
