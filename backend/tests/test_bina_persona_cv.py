# Test Suite: Karakter AI Bina & CV Grounding Adaptive Engine
# Lokasi: backend/tests/test_bina_persona_cv.py
# Memverifikasi 7 Riset Praktisi HR, Ekstraksi CV, 6 Tahapan Percakapan,
# Strict 1 Pertanyaan per Giliran, Anti-Slop, dan Zero Em-Dash.

import pytest
from unittest.mock import patch, MagicMock
from app.services.bina_service import (
    ekstraksi_ringkasan_cv_untuk_bina,
    tentukan_fase_wawancara,
    bangun_sapaan_awal_bina,
    bangun_system_prompt_bina,
    hasilkan_respon_bina
)

DUMMY_CV_LENGKAP = {
    "data_kontak": {
        "nama_lengkap": "Budi Pratama",
        "domisili": "Jakarta Selatan",
        "email": "budi.pratama@example.com"
    },
    "ringkasan_eksekutif": "Senior Backend Engineer dengan 5+ tahun pengalaman membangun sistem terdistribusi skala besar.",
    "riwayat_edukasi": [
        {
            "institusi": "Institut Teknologi Bandung",
            "gelar": "S1",
            "jurusan": "Teknik Informatika",
            "tahun_selesai": "2019",
            "ipk": "3.85"
        }
    ],
    "pengalaman_kerja": [
        {
            "posisi": "Tech Lead",
            "perusahaan": "Fintech Nusantara",
            "periode_mulai": "2022",
            "periode_selesai": "2025",
            "deskripsi": "Memimpin arsitektur microservices pembayaran, meningkatkan throughput transaksi 300% dan memangkas p99 latency menjadi 45ms."
        },
        {
            "posisi": "Backend Developer",
            "perusahaan": "Ecommerce Maju",
            "periode_mulai": "2019",
            "periode_selesai": "2022",
            "deskripsi": "Mengembangkan REST API FastAPI dan mengoptimalkan query PostgreSQL."
        }
    ],
    "proyek_portofolio": [
        {
            "nama_proyek": "Sistem Kliring Realtime",
            "peran": "Lead Architect",
            "tech_stack": "Go, Kafka, Redis, PostgreSQL",
            "deskripsi": "Sistem pemrosesan mutasi perbankan dengan toleransi failover nol."
        }
    ],
    "keahlian": [
        {"nama_keahlian": "Python"},
        {"nama_keahlian": "Go"},
        {"nama_keahlian": "PostgreSQL"},
        {"nama_keahlian": "Docker"},
        {"nama_keahlian": "Kubernetes"}
    ],
    "sertifikasi": [
        {"nama_sertifikasi": "AWS Certified Solutions Architect"}
    ]
}


class TestEkstraksiRingkasanCV:
    def test_ekstraksi_cv_kosong(self):
        hasil = ekstraksi_ringkasan_cv_untuk_bina({}, "Backend Developer")
        assert "Target Posisi: Backend Developer" in hasil
        assert "belum diisi lengkap" in hasil

    def test_ekstraksi_cv_none(self):
        hasil = ekstraksi_ringkasan_cv_untuk_bina(None, "Data Analyst")
        assert "Target Posisi: Data Analyst" in hasil

    def test_ekstraksi_cv_lengkap(self):
        dossier = ekstraksi_ringkasan_cv_untuk_bina(DUMMY_CV_LENGKAP, "Principal Engineer")
        assert "Budi Pratama" in dossier
        assert "Jakarta Selatan" in dossier
        assert "Institut Teknologi Bandung" in dossier
        assert "3.85" in dossier
        assert "Fintech Nusantara" in dossier
        assert "300%" in dossier
        assert "Sistem Kliring Realtime" in dossier
        assert "Go, Kafka" in dossier
        assert "AWS Certified Solutions Architect" in dossier


class TestTentukanFaseWawancara:
    def test_fase_1_pembuka(self):
        fase = tentukan_fase_wawancara([])
        assert fase["giliran"] == 1
        assert "Pembuka" in fase["nama_fase"]

    def test_fase_2_eksplorasi_pengalaman(self):
        riwayat = [{"pengirim": "pewawancara", "teks": "Halo"}]
        fase = tentukan_fase_wawancara(riwayat)
        assert fase["giliran"] == 2
        assert "Eksplorasi" in fase["nama_fase"]

    def test_fase_3_deep_probing_car_star(self):
        riwayat = [{"pengirim": "pewawancara", "teks": f"Q{i}"} for i in range(3)]
        fase = tentukan_fase_wawancara(riwayat)
        assert fase["giliran"] == 4
        assert "CAR/STAR" in fase["nama_fase"]

    def test_fase_4_simulasi_krisis(self):
        riwayat = [{"pengirim": "pewawancara", "teks": f"Q{i}"} for i in range(5)]
        fase = tentukan_fase_wawancara(riwayat)
        assert fase["giliran"] == 6
        assert "Krisis" in fase["nama_fase"]

    def test_fase_5_verifikasi_tools_dan_cv(self):
        riwayat = [{"pengirim": "pewawancara", "teks": f"Q{i}"} for i in range(7)]
        fase = tentukan_fase_wawancara(riwayat)
        assert fase["giliran"] == 8
        assert "Verifikasi" in fase["nama_fase"]

    def test_fase_6_penutupan(self):
        riwayat = [{"pengirim": "pewawancara", "teks": f"Q{i}"} for i in range(10)]
        fase = tentukan_fase_wawancara(riwayat)
        assert fase["giliran"] >= 10
        assert "Penutupan" in fase["nama_fase"] or "Sintesis" in fase["nama_fase"]


class TestBangunSapaanAwalBina:
    def test_sapaan_dengan_pengalaman_kerja(self):
        sapaan = bangun_sapaan_awal_bina("Principal Architect", DUMMY_CV_LENGKAP)
        assert "Budi Pratama" in sapaan
        assert "Fintech Nusantara" in sapaan
        assert "Principal Architect" in sapaan
        assert "\u2014" not in sapaan  # Zero em-dash
        assert sapaan.count("?") == 1  # Exactly 1 question

    def test_sapaan_dengan_edukasi_saja(self):
        cv_freshgrad = {
            "data_kontak": {"nama_lengkap": "Siti Aminah"},
            "riwayat_edukasi": [{"institusi": "Universitas Gadjah Mada", "jurusan": "Statistika"}]
        }
        sapaan = bangun_sapaan_awal_bina("Data Scientist", cv_freshgrad)
        assert "Siti Aminah" in sapaan
        assert "Universitas Gadjah Mada" in sapaan
        assert "Statistika" in sapaan
        assert "\u2014" not in sapaan
        assert sapaan.count("?") == 1

    def test_sapaan_tanpa_cv(self):
        sapaan = bangun_sapaan_awal_bina("Product Manager", None)
        assert "Bina" in sapaan
        assert "Product Manager" in sapaan
        assert "\u2014" not in sapaan
        assert sapaan.count("?") == 1


class TestSystemPromptBina:
    def test_system_prompt_menyerap_dossier_dan_riset(self):
        dossier = ekstraksi_ringkasan_cv_untuk_bina(DUMMY_CV_LENGKAP, "Engineering Lead")
        fase = tentukan_fase_wawancara([])
        prompt = bangun_system_prompt_bina("Engineering Lead", dossier, fase)

        # Cek Karakter Utama
        assert "BINA" in prompt
        assert "Engineering Lead" in prompt
        assert "Budi Pratama" in prompt
        assert "Fintech Nusantara" in prompt

        # Cek 4 Pilar Riset HR
        assert "VINA MULIANA" in prompt
        assert "EZA HAZAMI" in prompt
        assert "YOVA BELTZ" in prompt
        assert "APRI ROKHYADI" in prompt

        # Cek Zero Em-dash
        assert "\u2014" not in prompt


class TestHasilkanResponBinaAntiSlopAndEnforcement:
    @patch("app.services.bina_service.panggil_cohere_chat")
    def test_membersihkan_klise_ai_terima_kasih(self, mock_cohere):
        mock_cohere.return_value = "Terima kasih banyak atas jawabannya! Pengalaman Anda di Fintech Nusantara sangat baik. Bagaimana Anda menangani lonjakan transaksi mendadak?"
        
        respon = hasilkan_respon_bina(
            target_role="Tech Lead",
            jawaban_kandidat="Saya mengoptimalkan query DB.",
            riwayat_chat=[],
            cv_data=DUMMY_CV_LENGKAP
        )
        assert not respon.lower().startswith("terima kasih")
        assert "Bagaimana Anda menangani lonjakan transaksi mendadak?" in respon
        assert "\u2014" not in respon
        assert respon.count("?") == 1

    @patch("app.services.bina_service.panggil_cohere_chat")
    def test_membersihkan_klise_jawaban_luar_biasa(self, mock_cohere):
        mock_cohere.return_value = "Jawaban yang sangat luar biasa. Mengapa Anda memilih Kafka dibanding RabbitMQ untuk sistem tersebut?"
        
        respon = hasilkan_respon_bina(
            target_role="Tech Lead",
            jawaban_kandidat="Kami memakai Kafka.",
            riwayat_chat=[],
            cv_data=DUMMY_CV_LENGKAP
        )
        assert not respon.lower().startswith("jawaban yang")
        assert "Mengapa Anda memilih Kafka dibanding RabbitMQ" in respon
        assert respon.count("?") == 1

    @patch("app.services.bina_service.panggil_cohere_chat")
    def test_membersihkan_platitudes_terima_kasih_sudah_berbagi(self, mock_cohere):
        mock_cohere.return_value = "Terima kasih sudah berbagi cerita Anda. Di posisi ini, bagaimana Anda mengukur efisiensi sistem?"
        
        respon = hasilkan_respon_bina(
            target_role="Tech Lead",
            jawaban_kandidat="Saya membangun sistem monitoring.",
            riwayat_chat=[],
            cv_data=DUMMY_CV_LENGKAP
        )
        assert not respon.lower().startswith("terima kasih")
        assert "bagaimana Anda mengukur efisiensi sistem?" in respon
        assert respon.count("?") == 1

    @patch("app.services.bina_service.panggil_cohere_chat")
    def test_membersihkan_bullet_points_dan_format_markdown(self, mock_cohere):
        mock_cohere.return_value = "**Tanggapan:** Menarik sekali.\n* Poin arsitektur solid\n* Skalabilitas teruji\nBagaimana cara Anda memitigasi risiko kegagalan sistem tersebut?"
        
        respon = hasilkan_respon_bina(
            target_role="Tech Lead",
            jawaban_kandidat="Sistem kami punya replikasi.",
            riwayat_chat=[],
            cv_data=DUMMY_CV_LENGKAP
        )
        assert "**" not in respon
        assert "* " not in respon
        assert "\n" not in respon
        assert "Bagaimana cara Anda memitigasi risiko kegagalan sistem tersebut?" in respon
        assert respon.count("?") == 1

    @patch("app.services.bina_service.panggil_cohere_chat")
    def test_enforce_strictly_single_question_when_multiple_present(self, mock_cohere):
        mock_cohere.return_value = "Arsitektur tersebut cukup berani. Mengapa memilih Kafka? Dan bagaimana strategi replikasinya? Apakah latency-nya terjaga?"
        
        respon = hasilkan_respon_bina(
            target_role="Tech Lead",
            jawaban_kandidat="Kami mengimplementasikan Kafka.",
            riwayat_chat=[],
            cv_data=DUMMY_CV_LENGKAP
        )
        # Wajib dipangkas sehingga tepat 1 pertanyaan
        assert respon.count("?") == 1
        assert "Mengapa memilih Kafka?" in respon
        assert "replikasinya" not in respon

    @patch("app.services.bina_service.panggil_cohere_chat")
    def test_appends_question_when_llm_omits_question_mark(self, mock_cohere):
        mock_cohere.return_value = "Pencapaian throughput 300% di Fintech Nusantara adalah angka yang signifikan untuk sistem perbankan"
        
        respon = hasilkan_respon_bina(
            target_role="Tech Lead",
            jawaban_kandidat="Saya berhasil menaikkan throughput 300%.",
            riwayat_chat=[],
            cv_data=DUMMY_CV_LENGKAP
        )
        assert respon.count("?") == 1
        assert respon.strip().endswith("?")

    @patch("app.services.bina_service.panggil_cohere_chat")
    def test_replaces_em_dash_with_hyphen(self, mock_cohere):
        mock_cohere.return_value = "Pilihan teknologi yang menarik \u2014 namun bagaimana cara Anda mengukur efisiensi sistem tersebut?"
        
        respon = hasilkan_respon_bina(
            target_role="Tech Lead",
            jawaban_kandidat="Saya merancang sistem baru.",
            riwayat_chat=[],
            cv_data=DUMMY_CV_LENGKAP
        )
        assert "\u2014" not in respon
        assert " - " in respon or "-" in respon

    @patch("app.services.bina_service.panggil_cohere_chat")
    @patch("app.services.bina_service.panggil_gemini_chat")
    def test_fallback_dinamis_humanis_saat_kedua_llm_gagal(self, mock_gemini, mock_cohere):
        mock_cohere.return_value = ""
        mock_gemini.return_value = ""

        # Test pada giliran ke-4 (Fase CAR/STAR)
        riwayat_turn_4 = [{"pengirim": "pewawancara", "teks": f"Q{i}"} for i in range(3)]
        respon = hasilkan_respon_bina(
            target_role="Tech Lead",
            jawaban_kandidat="Saya mengelola 5 engineer.",
            riwayat_chat=riwayat_turn_4,
            cv_data=DUMMY_CV_LENGKAP
        )
        assert len(respon) > 20
        assert respon.count("?") == 1
        assert "\u2014" not in respon


class TestSimulasiRouterCVIntegration:
    """Memverifikasi integrasi router simulasi dengan data CV kandidat."""

    @patch("app.routers.simulasi.get_supabase_client")
    def test_mulai_simulasi_integrasi_sapaan_cv(self, mock_get_sb):
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)

        mock_sb = MagicMock()
        # Mock saldo_token
        mock_saldo_table = MagicMock()
        mock_saldo_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[{"saldo_id": "sald_123", "jumlah_saldo": 500, "total_terpakai": 0}]
        )
        mock_saldo_table.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[{}])

        # Mock cv_pengguna
        mock_cv_table = MagicMock()
        mock_cv_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[{"konten_json": DUMMY_CV_LENGKAP}]
        )

        def table_router(table_name):
            if table_name == "saldo_token":
                return mock_saldo_table
            elif table_name == "cv_pengguna":
                return mock_cv_table
            return MagicMock()

        mock_sb.table.side_effect = table_router
        mock_get_sb.return_value = mock_sb

        resp = client.post("/api/simulasi/mulai", json={
            "pengguna_id": "user202610290001",
            "target_role": "Lead Systems Engineer",
            "mode": "teks"
        })

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "sukses"
        pesan = data["pesan_awal"]["teks"]
        # Harus memuat nama dan perusahaan dari CV kandidat
        assert "Budi Pratama" in pesan
        assert "Fintech Nusantara" in pesan
        assert "Lead Systems Engineer" in pesan
        assert "\u2014" not in pesan
        assert pesan.count("?") == 1

    @patch("app.routers.simulasi.evaluasi_biner_relevansi_kerja", return_value=True)
    @patch("app.routers.simulasi.hasilkan_respon_bina")
    @patch("app.routers.simulasi.get_supabase_client")
    def test_jawab_simulasi_meneruskan_cv_ke_bina(self, mock_get_sb, mock_hasilkan, mock_eval):
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)

        mock_sb = MagicMock()
        mock_cv_table = MagicMock()
        mock_cv_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[{"konten_json": DUMMY_CV_LENGKAP}]
        )
        mock_sb.table.return_value = mock_cv_table
        mock_get_sb.return_value = mock_sb

        mock_hasilkan.return_value = "Bagus. Bagaimana Anda menjaga konsistensi data pada kluster Kafka tersebut?"

        resp = client.post("/api/simulasi/jawab", json={
            "sesi_id": "sesi_test_123",
            "pengguna_id": "user202610290002",
            "target_role": "Lead Systems Engineer",
            "jawaban_kandidat": "Saya menggunakan transactional outbox pattern.",
            "riwayat_chat": []
        })

        assert resp.status_code == 200
        assert resp.json()["status"] == "sukses"
        # Verifikasi bahwa hasilkan_respon_bina dipanggil dengan cv_data
        mock_hasilkan.assert_called_once()
        _, kwargs = mock_hasilkan.call_args
        assert kwargs.get("cv_data") == DUMMY_CV_LENGKAP

