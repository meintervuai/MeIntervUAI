// Komponen Ruang Chat Simulasi Teks (TextRoomChat.tsx)
import React from 'react';
import { useBahasa } from '../../../i18n';
import { PesanChat } from './types';
import { Bot, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PropertiTextRoom {
  daftarPesan: PesanChat[];
  inputJawaban: string;
  setInputJawaban: (val: string) => void;
  sedangMerespon: boolean;
  onKirimPesan: (e?: React.FormEvent) => void;
  ujungChatRef: React.RefObject<HTMLDivElement>;
}

export const TextRoomChat: React.FC<PropertiTextRoom> = ({
  daftarPesan,
  inputJawaban,
  setInputJawaban,
  sedangMerespon,
  onKirimPesan,
  ujungChatRef,
}) => {
  const { t } = useBahasa();

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Box Area Pesan Chat */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 min-h-[450px] max-h-[580px] overflow-y-auto space-y-4 shadow-2xs">
        {daftarPesan.map((pesan) => {
          const adalahPewawancara = pesan.pengirim === 'pewawancara';
          return (
            <div
              key={pesan.id}
              className={`flex flex-col ${adalahPewawancara ? 'items-start' : 'items-end'} space-y-1 max-w-[88%] sm:max-w-[78%] ${
                adalahPewawancara ? 'mr-auto' : 'ml-auto'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 px-1">
                {adalahPewawancara ? (
                  <>
                    <Bot className="w-3.5 h-3.5 text-orange-700" />
                    <span className="text-orange-950 font-bold">{pesan.nama}</span>
                    {pesan.peran && <span className="text-[10px] text-stone-400">({pesan.peran})</span>}
                  </>
                ) : (
                  <span>{pesan.nama}</span>
                )}
              </div>

              <div
                className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  adalahPewawancara
                    ? 'bg-stone-100 text-stone-900 rounded-tl-sm border border-stone-200/60'
                    : 'bg-orange-700 text-white rounded-tr-sm shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-line">{pesan.teks}</p>
              </div>

              {/* Micro Feedback Badge (Jika ada deteksi kondisi Jev) */}
              {pesan.kondisi_terdeteksi && (
                <div className="px-1 text-[10px]">
                  {pesan.kondisi_terdeteksi === 'BANYAK_KAMI' && (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{t.simulasiWawancara.peringatanKami}</span>
                    </span>
                  )}
                  {pesan.kondisi_terdeteksi === 'KLISE_HAFALAN' && (
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{t.simulasiWawancara.peringatanKlise}</span>
                    </span>
                  )}
                  {pesan.kondisi_terdeteksi === 'SOLID_BERMETRIK' && (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.simulasiWawancara.apresiasiAngka}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Indikator Typing Saat Pewawancara Merumuskan Pertanyaan */}
        {sedangMerespon && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 max-w-sm animate-pulse">
            <Bot className="w-4 h-4 text-orange-700 shrink-0" />
            <span>{t.simulasiWawancara.sedangMerespon}</span>
          </div>
        )}

        <div ref={ujungChatRef} />
      </div>

      {/* Kolom Input Chat Jawaban Kandidat */}
      <form onSubmit={onKirimPesan} className="flex gap-2 items-center">
        <input
          type="text"
          value={inputJawaban}
          onChange={(e) => setInputJawaban(e.target.value)}
          disabled={sedangMerespon}
          placeholder={t.simulasiWawancara.ketikJawabanPlaceholder}
          className="flex-1 px-4 py-3 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 min-h-[48px] shadow-2xs"
        />
        <button
          type="submit"
          disabled={sedangMerespon || !inputJawaban.trim()}
          className="px-5 py-3 rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm min-h-[48px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <span>{t.simulasiWawancara.tombolKirimJawaban}</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

