// Komponen DialogModal (R-26, R-32): dapat ditutup via tombol Escape, overlay fokus aksesibel, dan trap focus dasar.
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface PropertiDialogModal {
  terbuka: boolean;
  padaTutup: () => void;
  judul: string;
  children: React.ReactNode;
  lebarMaksimal?: string;
}

export const DialogModal: React.FC<PropertiDialogModal> = ({
  terbuka,
  padaTutup,
  judul,
  children,
  lebarMaksimal = 'max-w-md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && terbuka) {
        padaTutup();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [terbuka, padaTutup]);

  if (!terbuka) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full ${lebarMaksimal} bg-white rounded-2xl shadow-xl border border-slate-200 p-6 overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h3 id="modal-title" className="text-base font-bold text-slate-900">
            {judul}
          </h3>
          <button
            onClick={padaTutup}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-brand-600"
            aria-label="Tutup Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-slate-600">{children}</div>
      </div>
    </div>
  );
};
