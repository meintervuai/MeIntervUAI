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
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border rounded-lg transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100 disabled:text-slate-500 ${
          pesanGalat ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {pesanGalat && (
        <p className="mt-1.5 text-xs text-rose-600 font-medium">{pesanGalat}</p>
      )}
      {keteranganBantuan && !pesanGalat && (
        <p className="mt-1.5 text-xs text-slate-500">{keteranganBantuan}</p>
      )}
    </div>
  );
};
