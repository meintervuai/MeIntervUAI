# Pengujian Unit dan Integrasi untuk Tarif & Normalisasi Mode Simulasi Wawancara (Standar BE-01, DB-04)
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.routers.simulasi import (
    TARIF_SIMULASI_MODE,
    normalisasi_mode_simulasi,
)

client = TestClient(app)

def test_tarif_simulasi_mode_standar():
    """Memastikan konstanta tarif mode simulasi sesuai spesifikasi: Teks (10), Suara (15), Audio (15), Video (25)."""
    assert TARIF_SIMULASI_MODE["teks"] == 10
    assert TARIF_SIMULASI_MODE["suara"] == 15
    assert TARIF_SIMULASI_MODE["audio"] == 15
    assert TARIF_SIMULASI_MODE["video"] == 25

def test_normalisasi_mode_simulasi_alias_dan_formatting():
    """Memastikan fungsi normalisasi menangani huruf besar/kecil, spasi, dan alias secara konsisten."""
    # Default dan kosong
    assert normalisasi_mode_simulasi(None) == "teks"
    assert normalisasi_mode_simulasi("") == "teks"
    assert normalisasi_mode_simulasi("   ") == "teks"

    # Teks
    assert normalisasi_mode_simulasi("teks") == "teks"
    assert normalisasi_mode_simulasi("TEKS") == "teks"
    assert normalisasi_mode_simulasi("  teks  ") == "teks"

    # Suara & Audio & Voice
    assert normalisasi_mode_simulasi("suara") == "suara"
    assert normalisasi_mode_simulasi("SUARA") == "suara"
    assert normalisasi_mode_simulasi("audio") == "suara"
    assert normalisasi_mode_simulasi("  AUDIO  ") == "suara"
    assert normalisasi_mode_simulasi("voice") == "suara"

    # Video & Vid
    assert normalisasi_mode_simulasi("video") == "video"
    assert normalisasi_mode_simulasi("VIDEO") == "video"
    assert normalisasi_mode_simulasi("vid") == "video"
    assert normalisasi_mode_simulasi("  vid  ") == "video"

    # Fallback nilai tidak dikenal
    assert normalisasi_mode_simulasi("format_acak") == "teks"

def test_mulai_simulasi_saldo_tidak_cukup_blocking():
    """Memastikan request ditolak dengan HTTP 400 jika saldo kurang dari biaya token yang dibutuhkan."""
    mock_sb = MagicMock()
    # Mock data saldo_token = 5 token (kurang dari 10 teks, 15 suara, 25 video)
    mock_saldo_table = MagicMock()
    mock_saldo_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"saldo_id": "sald_test", "jumlah_saldo": 5, "total_terpakai": 20}]
    )

    def table_router(nama_tabel):
        if nama_tabel == "saldo_token":
            return mock_saldo_table
        return MagicMock()

    mock_sb.table.side_effect = table_router

    with patch("app.routers.simulasi.get_supabase_client", return_value=mock_sb):
        # 1. Coba mode video (butuh 25, saldo 5)
        resp_video = client.post("/api/simulasi/mulai", json={
            "pengguna_id": "peng_test_saldo_kurang",
            "target_role": "Backend Engineer",
            "mode": "video"
        })
        assert resp_video.status_code == 400
        assert "Saldo token tidak mencukupi untuk memulai simulasi mode video" in resp_video.json()["detail"]
        assert "25 token" in resp_video.json()["detail"]

        # 2. Coba mode suara (butuh 15, saldo 5)
        resp_suara = client.post("/api/simulasi/mulai", json={
            "pengguna_id": "peng_test_saldo_kurang",
            "target_role": "Backend Engineer",
            "mode": "suara"
        })
        assert resp_suara.status_code == 400
        assert "Saldo token tidak mencukupi untuk memulai simulasi mode suara" in resp_suara.json()["detail"]
        assert "15 token" in resp_suara.json()["detail"]

        # 3. Coba mode teks (butuh 10, saldo 5)
        resp_teks = client.post("/api/simulasi/mulai", json={
            "pengguna_id": "peng_test_saldo_kurang",
            "target_role": "Backend Engineer",
            "mode": "teks"
        })
        assert resp_teks.status_code == 400
        assert "Saldo token tidak mencukupi untuk memulai simulasi mode teks" in resp_teks.json()["detail"]
        assert "10 token" in resp_teks.json()["detail"]

def test_mulai_simulasi_deduksi_dan_buku_besar_berhasil():
    """Memastikan token terpotong dengan benar, CV diambil sebelum pemotongan, dan buku besar transaksi dicatat."""
    mock_sb = MagicMock()
    mock_saldo_table = MagicMock()
    mock_transaksi_table = MagicMock()
    mock_cv_table = MagicMock()

    # Saldo awal 50 token
    mock_saldo_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"saldo_id": "sald_test", "jumlah_saldo": 50, "total_terpakai": 10}]
    )
    mock_saldo_table.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    mock_cv_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"konten_json": {"data_kontak": {"nama_lengkap": "Budi Santoso"}}}]
    )

    mock_transaksi_table.insert.return_value.execute.return_value = MagicMock(data=[])

    def table_router(nama_tabel):
        if nama_tabel == "saldo_token":
            return mock_saldo_table
        elif nama_tabel == "cv_pengguna":
            return mock_cv_table
        elif nama_tabel == "transaksi_token":
            return mock_transaksi_table
        return MagicMock()

    mock_sb.table.side_effect = table_router

    with patch("app.routers.simulasi.get_supabase_client", return_value=mock_sb), \
         patch("app.routers.simulasi.sintesis_suara_bina_base64", return_value="data:audio/mp3;base64,mockaudio"):
        resp = client.post("/api/simulasi/mulai", json={
            "pengguna_id": "peng_test_deduksi",
            "target_role": "Product Manager",
            "mode": "audio" # Alias audio -> suara (biaya 15)
        })

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "sukses"
        assert data["saldo_token"] == 35 # 50 - 15
        assert "Budi Santoso" in data["pesan_awal"]["teks"]
        assert data["pesan_awal"]["audio_url"] == "data:audio/mp3;base64,mockaudio"

        # Verifikasi pemanggilan update saldo_token
        mock_saldo_table.update.assert_called_with({
            "jumlah_saldo": 35,
            "total_terpakai": 25
        })

        # Verifikasi pencatatan buku besar transaksi_token
        insert_args = mock_transaksi_table.insert.call_args[0][0]
        assert insert_args["pengguna_id"] == "peng_test_deduksi"
        assert insert_args["jenis_transaksi"] == "simulasi_suara"
        assert insert_args["jumlah_token"] == -15
        assert insert_args["saldo_sebelum"] == 50
        assert insert_args["saldo_sesudah"] == 35
