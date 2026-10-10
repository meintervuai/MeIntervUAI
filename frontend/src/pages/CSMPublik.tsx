// Halaman CSM & Bantuan Publik: Formulir kontak bantuan Customer Success dan FAQ interaktif.
import React, { useState, useEffect } from 'react';
import { Kartu } from '../components/ui/Kartu';
import { KotakInput } from '../components/ui/KotakInput';
import { Tombol } from '../components/ui/Tombol';
import { api } from '../services/api';
import { LifeBuoy, Send, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

export const CSMPublik: React.FC = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [kategori, setKategori] = useState('simulasi');
  const [subjek, setSubjek] = useState('');
  const [pesan, setPesan] = useState('');
  const [sedangKirim, setSedangKirim] = useState(false);
  const [notifikasi, setNotifikasi] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);

  // FAQ state
  const [faqList, setFaqList] = useState<Array<{ pertanyaan: string; jawaban: string }>>([]);
  const [faqTerbuka, setFaqTerbuka] = useState<number | null>(0);

  useEffect(() => {
    api.getFAQPublik().then((res) => {
      if (res.faq) setFaqList(res.faq);
    }).catch(() => {
      // Fallback data lokal jika server belum running
      setFaqList([
        {
          pertanyaan: "Berapa banyak kuota token gratis yang saya dapatkan?",
          jawaban: "Setiap pendaftar baru secara otomatis mendapatkan 100 Token Gratis yang dapat digunakan untuk analisis CV dan simulasi wawancara."
        },
        {
          pertanyaan: "Mengapa tombol Mulai Simulasi di Beranda terkunci?",
          jawaban: "Pewawancara AI membutuhkan data riwayat dan pengalaman dari CV Anda untuk menghasilkan pertanyaan adaptif yang realistis. Isi minimal 1 bagian CV untuk membuka simulasi."
        },
        {
          pertanyaan: "Apakah video wawancara saya direkam ke server?",
          jawaban: "Tidak. Seluruh deteksi postur dan tatapan mata diproses secara lokal di peramban Anda menggunakan MediaPipe. Privasi kamera Anda terlindungi 100%."
        },
        {
          pertanyaan: "Bagaimana jika saldo token saya habis?",
          jawaban: "Anda dapat menghubungi tim Customer Success melalui formulir bantuan di halaman ini untuk mengajukan penambahan kuota token pendampingan."
        }
      ]);
    });
  }, []);

  const tanganiKirimTiket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSedangKirim(true);
    setNotifikasi(null);

    try {
      const res = await api.kirimTiketPublik({
        nama_pengirim: nama,
        email_pengirim: email,
        kategori_kendala: kategori,
        subjek_pesan: subjek,
        isi_pesan: pesan,
      });

      if (res.status === 'sukses') {
        setNotifikasi({
          tipe: 'sukses',
          teks: res.pesan || 'Tiket bantuan berhasil dikirim. Tim CSM akan segera merespons email Anda.',
        });
        setNama('');
        setEmail('');
        setSubjek('');
        setPesan('');
      } else {
        setNotifikasi({
          tipe: 'galat',
          teks: res.pesan || 'Terjadi kesalahan saat mengirim tiket bantuan.',
        });
      }
    } catch (err: any) {
      setNotifikasi({
        tipe: 'galat',
        teks: 'Koneksi ke server gagal. Silakan coba kembali sesaat lagi.',
      });
    } finally {
      setSedangKirim(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-4">
          <LifeBuoy className="w-4 h-4" />
          <span>Pusat Dukungan & Customer Success Management</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Kami Siap Membantu Persiapan Karir Anda
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          Punya pertanyaan seputar simulasi wawancara, alokasi token kredit, atau ingin berkonsultasi? Hubungi tim Customer Success kami langsung melalui formulir di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Formulir Tiket Bantuan */}
        <div className="lg:col-span-7">
          <Kartu className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              Kirim Pesan ke Tim CSM
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Respon rata-rata tim kami adalah dalam waktu 1x24 jam kerja.
            </p>

            {notifikasi && (
              <div
                className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm ${
                  notifikasi.tipe === 'sukses'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {notifikasi.tipe === 'sukses' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{notifikasi.teks}</span>
              </div>
            )}

            <form onSubmit={tanganiKirimTiket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KotakInput
                  label="Nama Lengkap"
                  required
                  placeholder="Contoh: Agil Pratama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
                <KotakInput
                  label="Alamat Email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori Kendala
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="simulasi">Simulasi Wawancara AI</option>
                  <option value="kuota_token">Permohonan Tambahan Token</option>
                  <option value="cv_builder">Format CV ATS</option>
                  <option value="teknis">Kendala Teknis Kamera / Audio</option>
                  <option value="lainnya">Pertanyaan Lainnya</option>
                </select>
              </div>

              <KotakInput
                label="Subjek Pesan"
                required
                placeholder="Ringkasan singkat kendala Anda"
                value={subjek}
                onChange={(e) => setSubjek(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Isi Pesan
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ceritakan detail kendala atau kebutuhan Anda..."
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-400"
                ></textarea>
              </div>

              <Tombol
                type="submit"
                varian="primer"
                ukuran="lg"
                sedangMemuat={sedangKirim}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Kirim Tiket ke CSM
              </Tombol>
            </form>
          </Kartu>
        </div>

        {/* Kolom Kanan: FAQ Terverifikasi */}
        <div className="lg:col-span-5 space-y-4">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-slate-900">Pertanyaan Populer (FAQ)</h2>
            <p className="text-xs text-slate-500 mt-1">
              Jawaban cepat seputar sistem dan operasional IntervU AI.
            </p>
          </div>

          {faqList.map((item, idx) => {
            const terbuka = faqTerbuka === idx;
            return (
              <Kartu key={idx} className="p-4 cursor-pointer" denganHover>
                <div
                  className="flex items-center justify-between gap-3"
                  onClick={() => setFaqTerbuka(terbuka ? null : idx)}
                >
                  <span className="text-sm font-semibold text-slate-800">
                    {item.pertanyaan}
                  </span>
                  {terbuka ? (
                    <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>
                {terbuka && (
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.jawaban}
                  </p>
                )}
              </Kartu>
            );
          })}
        </div>
      </div>
    </div>
  );
};
