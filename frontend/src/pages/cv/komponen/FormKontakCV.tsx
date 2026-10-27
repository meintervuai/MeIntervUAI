import React from 'react';
import { Kartu } from '../../../components/ui/Kartu';
import { useBahasa } from '../../../i18n';
import { User, Mail, Phone, MapPin, Globe, Camera, Info, Target, FileText, Code2, ExternalLink } from 'lucide-react';
import { KonfigurasiVisualCV } from '../tipePengaturanCV';

interface PropertiFormKontakCV {
  targetRole: string;
  setTargetRole: (val: string) => void;
  namaLengkap: string;
  setNamaLengkap: (val: string) => void;
  emailKontak: string;
  setEmailKontak: (val: string) => void;
  teleponKontak: string;
  setTeleponKontak: (val: string) => void;
  linkedinKontak: string;
  setLinkedinKontak: (val: string) => void;
  domisiliKontak: string;
  setDomisiliKontak: (val: string) => void;
  ringkasan: string;
  setRingkasan: (val: string) => void;
  tempatTanggalLahir?: string;
  setTempatTanggalLahir?: (val: string) => void;
  githubKontak?: string;
  setGithubKontak?: (val: string) => void;
  portofolioKontak?: string;
  setPortofolioKontak?: (val: string) => void;
  konfigurasiVisual: KonfigurasiVisualCV;
  setKonfigurasiVisual: React.Dispatch<React.SetStateAction<KonfigurasiVisualCV>>;
  urlFotoProfilAkun?: string;
}

export const FormKontakCV: React.FC<PropertiFormKontakCV> = ({
  targetRole,
  setTargetRole,
  namaLengkap,
  setNamaLengkap,
  emailKontak,
  setEmailKontak,
  teleponKontak,
  setTeleponKontak,
  linkedinKontak,
  setLinkedinKontak,
  domisiliKontak,
  setDomisiliKontak,
  ringkasan,
  setRingkasan,
  tempatTanggalLahir = '',
  setTempatTanggalLahir,
  githubKontak = '',
  setGithubKontak,
  portofolioKontak = '',
  setPortofolioKontak,
  konfigurasiVisual,
  setKonfigurasiVisual,
  urlFotoProfilAkun,
}) => {
  const { t } = useBahasa();

  const isTemplateFormal = 
    konfigurasiVisual.templateId === 'bumn_nasional' || 
    konfigurasiVisual.templateId === 'europass_slate' || 
    konfigurasiVisual.templateId === 'executive_din' ||
    konfigurasiVisual.templateId === 'modern_ats';

  const inputFotoRef = React.useRef<HTMLInputElement>(null);

  const tanganiUnggahFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasi ukuran file max 3MB
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran foto maksimal 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const hasilDataUrl = event.target?.result as string;
      if (hasilDataUrl) {
        setKonfigurasiVisual((prev) => ({
          ...prev,
          tampilkanFoto: true,
          urlFoto: hasilDataUrl,
        }));
      }
    };
    reader.readAsDataURL(file);
    // Reset input agar bisa re-upload file yang sama jika diinginkan
    e.target.value = '';
  };

  const tanganiHapusFoto = () => {
    setKonfigurasiVisual((prev) => ({
      ...prev,
      urlFoto: '',
    }));
  };

  const fotoSaatIni = konfigurasiVisual.urlFoto || urlFotoProfilAkun || '';

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Hidden file input for headshot upload */}
      <input
        ref={inputFotoRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={tanganiUnggahFoto}
        className="hidden"
      />

      {/* Kartu Pasfoto CV - Hanya tampil jika template yang dipilih mendukung pasfoto (BUMN, Europass, DIN 5008) */}
      {isTemplateFormal && (
        <Kartu className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-14 rounded-lg border border-stone-300 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group">
                {fotoSaatIni ? (
                  <img
                    src={fotoSaatIni}
                    alt="Pasfoto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-5 h-5 text-stone-400" />
                )}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                  {t.cvBuilder.pasfotoJudul}
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {t.cvBuilder.pasfotoBantuan}
                </p>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Upload / Ganti / Hapus Foto */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100">
            <button
              type="button"
              onClick={() => inputFotoRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{fotoSaatIni ? t.cvBuilder.pasfotoGanti : t.cvBuilder.pasfotoUnggah}</span>
            </button>

            {fotoSaatIni && (
              <button
                type="button"
                onClick={tanganiHapusFoto}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              >
                <span>{t.cvBuilder.pasfotoHapus}</span>
              </button>
            )}

            <span className="text-[11px] text-stone-400 ml-auto">
              JPG, PNG, WebP (Maks. 3MB)
            </span>
          </div>



          {/* Notif Status Resmi Template */}
          <div className="p-2.5 rounded-xl border text-[11px] flex items-center gap-2 bg-amber-50/70 border-amber-200/80 text-amber-900">
            <Info className="w-3.5 h-3.5 shrink-0 text-amber-700" />
            <span>{t.cvBuilder.pasfotoStatusOtomatisAktif}</span>
          </div>
        </Kartu>
      )}

      {/* Kartu Form Isian Kontak */}
      <Kartu className="p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
          {t.cvBuilder.bagianKontak}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span>{t.cvBuilder.namaLengkap}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-stone-500" />
              <span>{t.cvBuilder.targetRoleLabel}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder={t.cvBuilder.targetRolePlaceholder}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-500" />
              <span>{t.cvBuilder.email}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={emailKontak}
              onChange={(e) => setEmailKontak(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-stone-500" />
              <span>{t.cvBuilder.telepon}</span>
            </label>
            <input
              type="text"
              value={teleponKontak}
              onChange={(e) => setTeleponKontak(e.target.value)}
              placeholder="+62 812-3456-7890"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              <span>{t.cvBuilder.domisili}</span>
            </label>
            <input
              type="text"
              value={domisiliKontak}
              onChange={(e) => setDomisiliKontak(e.target.value)}
              placeholder="Jakarta, Indonesia"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
            />
          </div>

          {/* Kolom Khusus: Tempat, Tanggal Lahir (KTP) - Wajib Standar Nasional BUMN */}
          {konfigurasiVisual.templateId === 'bumn_nasional' && setTempatTanggalLahir && (
            <div className="sm:col-span-2 p-3 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-1">
              <label className="block text-xs font-bold text-orange-950 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-700" />
                <span>{t.cvBuilder.tempatTanggalLahir}</span>
                <span className="text-rose-500">*</span>
                <span className="text-[10px] font-normal text-orange-800 ml-auto">Standar Seleksi BKN / BUMN</span>
              </label>
              <input
                type="text"
                value={tempatTanggalLahir}
                onChange={(e) => setTempatTanggalLahir(e.target.value)}
                placeholder={t.cvBuilder.tempatTanggalLahirPlaceholder}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-orange-300 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
              />
            </div>
          )}

          {/* Kolom Khusus: GitHub & Portfolio - Wajib Standar Tech Silicon Valley */}
          {konfigurasiVisual.templateId === 'tech_silicon' && (
            <>
              {setGithubKontak && (
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t.cvBuilder.github}</span>
                    <span className="text-[10px] font-normal text-stone-500 ml-auto">Tech Stack Repo</span>
                  </label>
                  <input
                    type="text"
                    value={githubKontak}
                    onChange={(e) => setGithubKontak(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
                  />
                </div>
              )}
              {setPortofolioKontak && (
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t.cvBuilder.portofolio}</span>
                  </label>
                  <input
                    type="text"
                    value={portofolioKontak}
                    onChange={(e) => setPortofolioKontak(e.target.value)}
                    placeholder="https://myportfolio.dev"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span>{t.cvBuilder.linkedin}</span>
          </label>
          <input
            type="text"
            value={linkedinKontak}
            onChange={(e) => setLinkedinKontak(e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            {t.cvBuilder.ringkasan}
          </label>
          <textarea
            rows={4}
            value={ringkasan}
            onChange={(e) => setRingkasan(e.target.value)}
            placeholder={t.cvBuilder.ringkasanPlaceholder}
            className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
          />
        </div>
      </Kartu>
    </div>
  );
};
