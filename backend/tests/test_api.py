# Pengujian unit otomatis (OT-01) untuk endpoint kesehatan dan CSM Publik IntervU AI.

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_kesehatan_api():
    """Memastikan endpoint /api/kesehatan mengembalikan status sehat."""
    response = client.get("/api/kesehatan")
    assert response.status_code == 200
    assert response.json()["status"] == "sehat"

def test_faq_csm_publik():
    """Memastikan endpoint FAQ CSM Publik mengembalikan daftar FAQ terverifikasi."""
    response = client.get("/api/csm/faq-publik")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "sukses"
    assert len(data["faq"]) >= 4
    assert "token" in data["faq"][0]["pertanyaan"].lower()
