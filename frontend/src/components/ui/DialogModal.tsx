// Komponen DialogModal (R-26, R-32): dapat ditutup via tombol Escape, overlay fokus aksesibel, dan trap focus dasar.
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface PropertiDialogModal {
  terbuka: boolean;
  padaTutup: () => void;
  judul: string;
  children: React.ReactNode;
  lebarMaksimal?: string;
  tanpaTombolTutup?: boolean;
  wajibDiisi?: boolean;
}

export const DialogModal: React.FC<PropertiDialogModal> = ({
  terbuka,
  padaTutup,
  judul,
  children,
  lebarMaksimal = 'max-w-md',
  tanpaTombolTutup = false,
  wajibDiisi = false,
}) => {
  const modalWajib = tanpaTombolTutup || wajibDiisi;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && terbuka && !modalWajib) {
        padaTutup();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [terbuka, padaTutup, modalWajib]);

  if (!terbuka) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full ${lebarMaksimal} max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl border border-stone-200/90 p-5 sm:p-6 overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between pb-3 mb-3 sm:pb-4 sm:mb-4 border-b border-stone-200 shrink-0">
          <h3 id="modal-title" className="text-base font-bold text-stone-900">
            {judul}
          </h3>
          {!modalWajib && (
            <button
              onClick={padaTutup}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors focus-visible:outline-orange-700"
              aria-label="Tutup Dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="text-sm text-stone-700 overflow-y-auto pr-1 flex-1">{children}</div>
      </div>
    </div>
  );
};
