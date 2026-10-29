# Test Suite: Empirical Challenger M1-2
# Stress testing boundary conditions, failure paths, unknown modes, and live endpoints for Milestone 1.

import pytest
import requests
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.routers.simulasi import normalisasi_mode_simulasi, TARIF_SIMULASI_MODE

client = TestClient(app)

# ==============================================================================
# 1. PENGUJIAN ADVERSARIAL: SALDO TIDAK MENCUKUPI & ZERO DEDUCTION GUARANTEE
# ==============================================================================

@pytest.mark.parametrize("saldo,mode,biaya_diharapkan,nama_mode_diharapkan", [
    (0, "teks", 10, "teks"),
    (0, "suara", 15, "suara"),
    (0, "audio", 15, "suara"),
    (0, "video", 25, "video"),
    (9, "teks", 10, "teks"),
    (14, "suara", 15, "suara"),
    (14, "audio", 15, "suara"),
    (24, "video", 25, "video"),
    (-5, "teks", 10, "teks"),
    (-10, "video", 25, "video"),
])
def test_challenge_insufficient_balance_all_modes_blocking(saldo, mode, biaya_diharapkan, nama_mode_diharapkan):
    """
    Stress-test: Memastikan bahwa jika saldo < biaya mode, sistem menolak mutlak dengan HTTP 400
    dan memverifikasi secara ketat bahwa TIDAK ADA pemotongan saldo atau insert mutasi di database.
    """
    mock_sb = MagicMock()
    mock_saldo_table = MagicMock()
    mock_transaksi_table = MagicMock()
    mock_cv_table = MagicMock()

    mock_saldo_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"saldo_id": "sald_mock", "jumlah_saldo": saldo, "total_terpakai": 0}]
    )

    def table_router(nama_tabel):
        if nama_tabel == "saldo_token":
            return mock_saldo_table
        if nama_tabel == "transaksi_token":
            return mock_transaksi_table
        if nama_tabel == "cv_pengguna":
            return mock_cv_table
        return MagicMock()

    mock_sb.table.side_effect = table_router

    with patch("app.routers.simulasi.get_supabase_client", return_value=mock_sb):
        response = client.post("/api/simulasi/mulai", json={
            "pengguna_id": f"peng_test_{mode}_{saldo}",
            "target_role": "QA Engineer",
            "mode": mode
        })

        # 1. Verifikasi HTTP 400 Bad Request
        assert response.status_code == 400, f"Expected 400 for balance {saldo} with mode {mode}, got {response.status_code}"
        detail = response.json().get("detail", "")
        assert f"mode {nama_mode_diharapkan}" in detail
        assert f"Diperlukan {biaya_diharapkan} token" in detail

        # 2. ZERO DEDUCTION / MUTATION GUARANTEE
        mock_saldo_table.update.assert_not_called()
        mock_transaksi_table.insert.assert_not_called()


def test_challenge_missing_saldo_record_returns_400():
    """
    Edge case: Pengguna tidak memiliki baris di tabel saldo_token (data=[]).
    Sistem harus merespons 400 Bad Request secara elegan tanpa error 500.
    """
    mock_sb = MagicMock()
    mock_saldo_table = MagicMock()
    mock_transaksi_table = MagicMock()

    # Data kosong
    mock_saldo_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])

    def table_router(nama_tabel):
        if nama_tabel == "saldo_token":
            return mock_saldo_table
        if nama_tabel == "transaksi_token":
            return mock_transaksi_table
        return MagicMock()

    mock_sb.table.side_effect = table_router

    with patch("app.routers.simulasi.get_supabase_client", return_value=mock_sb):
        response = client.post("/api/simulasi/mulai", json={
            "pengguna_id": "peng_tanpa_saldo",
            "target_role": "Data Analyst",
            "mode": "teks"
        })
        assert response.status_code == 400
        assert "Saldo token tidak mencukupi" in response.json()["detail"]
        mock_saldo_table.update.assert_not_called()
        mock_transaksi_table.insert.assert_not_called()


# ==============================================================================
# 2. PENGUJIAN ADVERSARIAL: INVALID & UNKNOWN MODES SAFE FALLBACK TO 'TEKS'
# ==============================================================================

@pytest.mark.parametrize("invalid_mode", [
    "mode_ngawur_123",
    "HACKING_MODE",
    "SQLi' OR '1'='1",
    "",
    "   ",
    None,
    "telepathy",
    "hologram_3d",
    "undefined",
    "null"
])
def test_challenge_invalid_modes_fallback_normalization(invalid_mode):
    """
    Stress-test: Berbagai string aneh/tidak dikenal harus dinormalisasi menjadi 'teks'.
    """
    res = normalisasi_mode_simulasi(invalid_mode)
    assert res == "teks"
    assert TARIF_SIMULASI_MODE.get(res) == 10


@pytest.mark.parametrize("invalid_mode", [
    "mode_acak_kadut",
    "SUPER_QUANTUM",
    "undefined",
    "null"
])
def test_challenge_invalid_mode_execution_deducts_teks_token(invalid_mode):
    """
    Stress-test integrasi API: Saat mode tidak valid dikirimkan dalam request,
    sistem harus membebankan tarif default 'teks' (10 token) dan berhasil jika saldo cukup (>=10).
    """
    mock_sb = MagicMock()
    mock_saldo_table = MagicMock()
    mock_transaksi_table = MagicMock()
    mock_cv_table = MagicMock()

    # Saldo 20
    mock_saldo_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"saldo_id": "sald_mock", "jumlah_saldo": 20, "total_terpakai": 5}]
    )
    mock_saldo_table.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
    mock_cv_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"konten_json": {"data_kontak": {"nama_lengkap": "Kandidat Uji"}}}]
    )
    mock_transaksi_table.insert.return_value.execute.return_value = MagicMock(data=[])

    def table_router(nama_tabel):
        if nama_tabel == "saldo_token":
            return mock_saldo_table
        if nama_tabel == "cv_pengguna":
            return mock_cv_table
        if nama_tabel == "transaksi_token":
            return mock_transaksi_table
        return MagicMock()

    mock_sb.table.side_effect = table_router

    with patch("app.routers.simulasi.get_supabase_client", return_value=mock_sb):
        response = client.post("/api/simulasi/mulai", json={
            "pengguna_id": f"peng_invalid_{invalid_mode}",
            "target_role": "Site Reliability Engineer",
            "mode": invalid_mode
        })
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "sukses"
        assert body["saldo_token"] == 10  # 20 - 10 (biaya teks)

        # Cek update saldo
        mock_saldo_table.update.assert_called_with({
            "jumlah_saldo": 10,
            "total_terpakai": 15
        })

        # Cek ledger transaksi
        transaksi_entry = mock_transaksi_table.insert.call_args[0][0]
        assert transaksi_entry["jenis_transaksi"] == "simulasi_teks"
        assert transaksi_entry["jumlah_token"] == -10
        assert transaksi_entry["saldo_sebelum"] == 20
        assert transaksi_entry["saldo_sesudah"] == 10


# ==============================================================================
# 3. PENGUJIAN ADVERSARIAL: EXACT BOUNDARY CONDITIONS (SALDO TEPAT SEBESAR TARIF)
# ==============================================================================

@pytest.mark.parametrize("mode,biaya", [
    ("teks", 10),
    ("suara", 15),
    ("audio", 15),
    ("video", 25),
])
def test_challenge_exact_balance_boundary(mode, biaya):
    """
    Boundary test: Saldo pengguna PERSIS sama dengan biaya token.
    Harus berhasil dimulai, dan saldo akhir harus menjadi 0 (bukan negatif atau error).
    """
    mock_sb = MagicMock()
    mock_saldo_table = MagicMock()
    mock_transaksi_table = MagicMock()
    mock_cv_table = MagicMock()

    mock_saldo_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"saldo_id": "sald_boundary", "jumlah_saldo": biaya, "total_terpakai": 0}]
    )
    mock_saldo_table.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
    mock_cv_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
    mock_transaksi_table.insert.return_value.execute.return_value = MagicMock(data=[])

    def table_router(nama_tabel):
        if nama_tabel == "saldo_token":
            return mock_saldo_table
        if nama_tabel == "cv_pengguna":
            return mock_cv_table
        if nama_tabel == "transaksi_token":
            return mock_transaksi_table
        return MagicMock()

    mock_sb.table.side_effect = table_router

    with patch("app.routers.simulasi.get_supabase_client", return_value=mock_sb), \
         patch("app.routers.simulasi.sintesis_suara_bina_base64", return_value=""):
        response = client.post("/api/simulasi/mulai", json={
            "pengguna_id": f"peng_exact_{mode}_{biaya}",
            "target_role": "DevOps Specialist",
            "mode": mode
        })
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "sukses"
        assert body["saldo_token"] == 0

        # Verifikasi saldo terupdate ke 0
        mock_saldo_table.update.assert_called_with({
            "jumlah_saldo": 0,
            "total_terpakai": biaya
        })


# ==============================================================================
# 4. PENGUJIAN ADVERSARIAL: RATE LIMITING PER USER (BE-01: 20 REQ / MENIT)
# ==============================================================================

def test_challenge_rate_limiting_enforcement():
    """
    Stress-test BE-01: User mengirim lebih dari 20 request dalam 1 menit.
    Request ke-21 harus diblokir dengan HTTP 429 Too Many Requests.
    """
    user_test = "peng_rate_limit_challenger"
    mock_sb = MagicMock()
    mock_saldo_table = MagicMock()
    mock_saldo_table.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"saldo_id": "sald_rate", "jumlah_saldo": 500, "total_terpakai": 0}]
    )
    mock_saldo_table.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    def table_router(t):
        if t == "saldo_token":
            return mock_saldo_table
        return MagicMock()

    mock_sb.table.side_effect = table_router

    with patch("app.routers.simulasi.get_supabase_client", return_value=mock_sb):
        # Jalankan 20 request valid
        for i in range(20):
            res = client.post("/api/simulasi/mulai", json={
                "pengguna_id": user_test,
                "target_role": "Developer",
                "mode": "teks"
            })
            assert res.status_code == 200, f"Request {i+1} failed with {res.status_code}"

        # Request ke-21 HARUS ditolak dengan 429
        res_blocked = client.post("/api/simulasi/mulai", json={
            "pengguna_id": user_test,
            "target_role": "Developer",
            "mode": "teks"
        })
        assert res_blocked.status_code == 429
        assert "Batas laju percakapan tercapai" in res_blocked.json()["detail"]


# ==============================================================================
# 5. PENGUJIAN LIVE ENDPOINT (INTEGRASI NYATA DENGAN BACKEND BERJALAN)
# ==============================================================================

def test_challenge_live_profile_saldo_1000():
    """
    Verifikasi langsung terhadap server live (http://127.0.0.1:8609):
    Endpoint GET /api/profil/peng202610263154 harus mengembalikan status sukses dan jumlah_saldo == 1000.
    """
    url = "http://127.0.0.1:8609/api/profil/peng202610263154"
    resp = requests.get(url, timeout=5)
    assert resp.status_code == 200, f"Live profile returned {resp.status_code}"
    data = resp.json()
    assert data["status"] == "sukses"
    assert "saldo_token" in data
    saldo = data["saldo_token"]
    assert saldo["pengguna_id"] == "peng202610263154"
    assert saldo["jumlah_saldo"] == 1000, f"Expected 1000 tokens, got {saldo['jumlah_saldo']}"


def test_challenge_live_backend_nonexistent_user_insufficient_balance():
    """
    Verifikasi langsung terhadap server live:
    Memulai simulasi dengan ID acak yang tidak ada di database dan mode aneh
    harus mengembalikan HTTP 400 Bad Request (bukan 500) dan menyebut mode teks (10 token).
    """
    url = "http://127.0.0.1:8609/api/simulasi/mulai"
    payload = {
        "pengguna_id": "peng_challenger_nonexistent_9999",
        "target_role": "Security Researcher",
        "mode": "invalid_mode_adversarial_test"
    }
    resp = requests.post(url, json=payload, timeout=5)
    assert resp.status_code == 400, f"Expected live 400 for nonexistent user, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert "Saldo token tidak mencukupi untuk memulai simulasi mode teks" in data["detail"]
    assert "10 token" in data["detail"]
