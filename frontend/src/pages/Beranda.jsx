import { Link } from 'react-router-dom';
import IkonLogo from '../components/icons/IkonLogo';
import IkonSimulasi from '../components/icons/IkonSimulasi';
import IkonAnalisis from '../components/icons/IkonAnalisis';
import IkonPerisai from '../components/icons/IkonPerisai';
import { pakaiBahasa } from '../contexts/KonteksBahasa';

/** Landing publik (rute `/`) — mobile-first, tanpa AI-slop. */
export default function Beranda() {
  const { t } = pakaiBahasa();

  const poin = [
    { Ikon: IkonSimulasi, teks: t.beranda.poin1 },
    { Ikon: IkonAnalisis, teks: t.beranda.poin2 },
    { Ikon: IkonPerisai, teks: t.beranda.poin3 },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-latar">
      <header className="mx-auto flex w-full max-w-md items-center gap-2.5 px-5 pt-aman md:max-w-2xl lg:max-w-5xl">
        <IkonLogo className="h-9 w-9" />
        <span className="font-display text-sm font-extrabold tracking-tight text-batu-800">
          {t.umum.appName}
        </span>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 md:max-w-2xl lg:max-w-5xl">
        <section className="pt-10 md:pt-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-oranye-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-oranye-700">
            {t.umum.tagline}
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-batu-900 md:text-4xl">
            {t.beranda.judul}
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-batu-600">
            {t.beranda.deskripsi}
          </p>

          <div className="mt-6">
            <Link to="/masuk" className="tombol-utama w-full sm:w-auto sm:px-8">
              {t.beranda.ctaMulai}
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-3 pb-10 md:mt-14 md:grid-cols-3" aria-label="Fitur utama">
          {poin.map(({ Ikon, teks }) => (
            <div key={teks} className="kartu flex items-start gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-oranye-50 text-oranye-600">
                <Ikon className="h-[22px] w-[22px]" />
              </span>
              <p className="text-sm font-semibold leading-snug text-batu-700">{teks}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-batu-200 bg-white">
        <p className="mx-auto w-full max-w-md px-5 py-4 text-center text-xs text-batu-400 md:max-w-2xl lg:max-w-5xl">
          © {new Date().getFullYear()} {t.umum.appName}
        </p>
      </footer>
    </div>
  );
}