# Pengujian Stres & Verifikasi Empiris Challenger M1-1
# File: backend/tests/test_challenger_stress.py
# Memverifikasi ketahanan normalisasi mode, deduksi saldo batas (boundary), dan variasi input

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.routers.simulasi import (
    TARIF_SIMULASI_MODE,
    normalisasi_mode_simulasi,
    riwayat_pesan_user
)

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_rate_limit():
    riwayat_pesan_user.clear()
    yield
    riwayat_pesan_user.clear()

def test_stress_matrix_normalisasi_dan_tarif():
    """
    Stress-test seluruh kombinasi input untuk normalisasi mode dan mapping tarif token.
    Memastikan tidak ada unhandled exception pada whitespace, case variation, alias, atau None.
    """
    test_cases = [
        # (input_mode, expected_normalized, expected_cost, expected_jenis_transaksi)
        (None, "teks", 10, "simulasi_teks"),
        ("", "teks", 10, "simulasi_teks"),
        ("   ", "teks", 10, "simulasi_teks"),
        ("\t\n", "teks", 10, "simulasi_teks"),
        ("teks", "teks", 10, "simulasi_teks"),
        ("TEKS", "teks", 10, "simulasi_teks"),
        ("  Teks  ", "teks", 10, "simulasi_teks"),
        ("suara", "suara", 15, "simulasi_suara"),
        ("SUARA", "suara", 15, "simulasi_suara"),
        ("  suara  ", "suara", 15, "simulasi_suara"),
        ("audio", "suara", 15, "simulasi_suara"),
        ("AUDIO", "suara", 15, "simulasi_suara"),
        ("  Audio  ", "suara", 15, "simulasi_suara"),
        ("voice", "suara", 15, "simulasi_suara"),
        ("VOICE", "suara", 15, "simulasi_suara"),
        ("  Voice  ", "suara", 15, "simulasi_suara"),
        ("video", "video", 25, "simulasi_video"),
        ("VIDEO", "video", 25, "simulasi_video"),
        ("  Video  ", "video", 25, "simulasi_video"),
        ("vid", "video", 25, "simulasi_video"),
        ("VID", "video", 25, "simulasi_video"),
        ("  Vid  ", "video", 25, "simulasi_video"),
        # Unknown fallback cases
        ("random_mode", "teks", 10, "simulasi_teks"),
        ("123", "teks", 10, "simulasi_teks"),
        ("!@#$", "teks", 10, "simulasi_teks"),
    ]

    for raw_mode, exp_norm, exp_cost, exp_jenis in test_cases:
        norm = normalisasi_mode_simulasi(raw_mode)
        cost = TARIF_SIMULASI_MODE.get(norm, 10)
        jenis = f"simulasi_{norm}"
        assert norm == exp_norm, f"Gagal normalisasi untuk {raw_mode!r}: got {norm}, expected {exp_norm}"
        assert cost == exp_cost, f"Gagal tarif untuk {raw_mode!r}: got {cost}, expected {exp_cost}"
        assert jenis == exp_jenis, f"Gagal jenis transaksi untuk {raw_mode!r}: got {jenis}, expected {exp_jenis}"

@pytest.mark.parametrize("mode_input,expected_cost,expected_jenis", [
    (None, 10, "simulasi_teks"),
    ("teks", 10, "simulasi_teks"),
    (" TEKS ", 10, "simulasi_teks"),
    ("suara", 15, "simulasi_suara"),
    ("audio", 15, "simulasi_suara"),
    (" AUDIO ", 15, "simulasi_suara"),
    ("voice", 15, "simulasi_suara"),
    ("video", 25, "simulasi_video"),
    ("vid", 25, "simulasi_video"),
    (" VID ", 25, "simulasi_video"),
])
def test_stress_deduksi_endpoint_seluruh_mode(mode_input, expected_cost, expected_jenis):
    """
    Stress-test endpoint POST /api/simulasi/mulai untuk setiap mode input
    memastikan biaya yang dipotong dan ledger yang dicatat tepat 100%.
    """
    mock_sb = MagicMock()
    mock_saldo = MagicMock()
    mock_transaksi = MagicMock()
    mock_cv = MagicMock()

    saldo_awal = 100
    mock_saldo.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"saldo_id": "sald_stress", "jumlah_saldo": saldo_awal, "total_terpakai": 50}]
    )
    mock_saldo.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
    mock_cv.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"konten_json": {"data_kontak": {"nama_lengkap": "Kandidat Stres"}}}]
    )
    mock_transaksi.insert.return_value.execute.return_value = MagicMock(data=[])

    def table_router(nama):
        if nama == "saldo_token":
            return mock_saldo
        elif nama == "cv_pengguna":
            return mock_cv
        elif nama == "transaksi_token":
            return mock_transaksi
        return MagicMock()

    mock_sb.table.side_effect = table_router

    with patch("app.routers.simulasi.get_supabase_client", return_value=mock_sb), \
         patch("app.routers.simulasi.sintesis_suara_bina_base64", return_value="data:audio/mp3;base64,mockaudio"):
        payload = {
            "pengguna_id": "peng_stress_user",
            "target_role": "AI Engineer",
        }
        if mode_input is not None:
            payload["mode"] = mode_input

        res = client.post("/api/simulasi/mulai", json=payload)
        assert res.status_code == 200, f"Gagal POST /api/simulasi/mulai dengan mode={mode_input!r}: {res.text}"
        data = res.json()
        assert data["status"] == "sukses"
        assert data["saldo_token"] == saldo_awal - expected_cost

        # Verifikasi saldo_token update call
        mock_saldo.update.assert_called_with({
            "jumlah_saldo": saldo_awal - expected_cost,
            "total_terpakai": 50 + expected_cost
        })

        # Verifikasi transaksi_token ledger insert
        insert_payload = mock_transaksi.insert.call_args[0][0]
        assert insert_payload["pengguna_id"] == "peng_stress_user"
        assert insert_payload["jenis_transaksi"] == expected_jenis
        assert insert_payload["jumlah_token"] == -expected_cost
        assert insert_payload["saldo_sebelum"] == saldo_awal
        assert insert_payload["saldo_sesudah"] == saldo_awal - expected_cost

@pytest.mark.parametrize("mode_input,cost", [
    ("teks", 10),
    ("suara", 15),
    ("audio", 15),
    ("video", 25),
])
def test_stress_saldo_boundary_exact_and_insufficient(mode_input, cost):
    """
    Stress-test batas saldo eksak (boundary testing):
    1. Saldo tepat sama dengan biaya (saldo == cost) -> Berhasil, sisa 0.
    2. Saldo kurang 1 token (saldo == cost - 1) -> Ditolak HTTP 400.
    3. Saldo 0 -> Ditolak HTTP 400.
    """
    mock_sb = MagicMock()
    mock_saldo = MagicMock()
    mock_cv = MagicMock()
    mock_transaksi = MagicMock()

    def setup_mocks(saldo_val):
        mock_saldo.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[{"saldo_id": "sald_boundary", "jumlah_saldo": saldo_val, "total_terpakai": 0}]
        )
        mock_saldo.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        mock_cv.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[] # Empty CV to also test fallback
        )
        mock_transaksi.insert.return_value.execute.return_value = MagicMock(data=[])

    def table_router(nama):
        if nama == "saldo_token":
            return mock_saldo
        elif nama == "cv_pengguna":
            return mock_cv
        elif nama == "transaksi_token":
            return mock_transaksi
        return MagicMock()

    mock_sb.table.side_effect = table_router

    with patch("app.routers.simulasi.get_supabase_client", return_value=mock_sb), \
         patch("app.routers.simulasi.sintesis_suara_bina_base64", return_value="data:audio/mp3;base64,mock"):
        
        # Skenario 1: Saldo tepat sama (cost) -> Lolos, sisa 0
        setup_mocks(cost)
        res_exact = client.post("/api/simulasi/mulai", json={
            "pengguna_id": "peng_boundary",
            "target_role": "QA Lead",
            "mode": mode_input
        })
        assert res_exact.status_code == 200, f"Harusnya lolos jika saldo == biaya ({cost})"
        assert res_exact.json()["saldo_token"] == 0

        # Skenario 2: Saldo kurang 1 token (cost - 1) -> 400 Bad Request
        setup_mocks(cost - 1)
        res_less = client.post("/api/simulasi/mulai", json={
            "pengguna_id": "peng_boundary",
            "target_role": "QA Lead",
            "mode": mode_input
        })
        assert res_less.status_code == 400, f"Harusnya ditolak jika saldo kurang 1 ({cost - 1})"
        assert "Saldo token tidak mencukupi" in res_less.json()["detail"]

        # Skenario 3: Saldo 0 -> 400 Bad Request
        setup_mocks(0)
        res_zero = client.post("/api/simulasi/mulai", json={
            "pengguna_id": "peng_boundary",
            "target_role": "QA Lead",
            "mode": mode_input
        })
        assert res_zero.status_code == 400, "Harusnya ditolak jika saldo 0"
        assert "Saldo token tidak mencukupi" in res_zero.json()["detail"]

def test_stress_fallback_kandidat_jika_cv_kosong():
    """
    Memastikan jika user belum memiliki data CV di cv_pengguna,
    sapaan fallback tetap aman menggunakan 'Kandidat' dan tidak crash.
    """
    mock_sb = MagicMock()
    mock_saldo = MagicMock()
    mock_saldo.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"saldo_id": "sald_nocv", "jumlah_saldo": 100, "total_terpakai": 0}]
    )
    mock_cv = MagicMock()
    mock_cv.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[] # Tidak ada CV
    )
    mock_transaksi = MagicMock()

    def table_router(nama):
        if nama == "saldo_token":
            return mock_saldo
        elif nama == "cv_pengguna":
            return mock_cv
        elif nama == "transaksi_token":
            return mock_transaksi
        return MagicMock()

    mock_sb.table.side_effect = table_router

    with patch("app.routers.simulasi.get_supabase_client", return_value=mock_sb):
        res = client.post("/api/simulasi/mulai", json={
            "pengguna_id": "peng_tanpa_cv",
            "target_role": "Frontend Developer",
            "mode": "teks"
        })
        assert res.status_code == 200
        data = res.json()
        assert "Halo Kandidat!" in data["pesan_awal"]["teks"]
