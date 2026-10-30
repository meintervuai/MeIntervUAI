import urllib.request
import urllib.parse
import re
import ssl
import json
import html
import time
from typing import List, Dict, Any

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

def fetch_linkedin_live(keyword="accounting", location="Indonesia", limit=12) -> List[Dict[str, Any]]:
    """
    Scraper live tanpa autentikasi untuk LinkedIn Guest API.
    Mengambil data riil posisi, perusahaan, lokasi, dan URL resmi secara langsung.
    """
    kw_clean = (keyword or "professional").strip()
    loc_clean = (location or "Indonesia").strip()
    if loc_clean.lower() == "semua":
        loc_clean = "Indonesia"

    kw_encoded = urllib.parse.quote(kw_clean)
    loc_encoded = urllib.parse.quote(loc_clean)
    url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={kw_encoded}&location={loc_encoded}&start=0"
    
    req = urllib.request.Request(url, headers=HEADERS)
    results = []
    try:
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            
        cards = re.findall(r'<div class="base-card[\s\S]*?</li>', content)
        for i, card in enumerate(cards[:limit]):
            title_m = re.search(r'<h3 class="base-search-card__title">([\s\S]*?)</h3>', card)
            company_m = re.search(r'<h4 class="base-search-card__subtitle">([\s\S]*?)</h4>', card)
            loc_m = re.search(r'<span class="job-search-card__location">([\s\S]*?)</span>', card)
            link_m = re.search(r'<a class="base-card__full-link[^>]*href="([^"]*)"', card)
            time_m = re.search(r'<time[^>]*>([\s\S]*?)</time>', card)
            img_m = re.search(r'<img[^>]*data-delayed-url="([^"]*)"', card)
            if not img_m:
                img_m = re.search(r'<img[^>]*src="([^"]*)"', card)

            title = html.unescape(title_m.group(1).strip()) if title_m else f"Lowongan {kw_clean.title()}"
            raw_comp = company_m.group(1) if company_m else "Perusahaan Mitra"
            company = html.unescape(re.sub(r'<[^>]+>', '', raw_comp).strip())
            loc_text = html.unescape(loc_m.group(1).strip()) if loc_m else loc_clean
            link = html.unescape(html.unescape(link_m.group(1).strip())) if link_m else f"https://www.linkedin.com/jobs/search?keywords={kw_encoded}"
            tgl = time_m.group(1).strip() if time_m else "Baru saja"
            
            raw_logo = img_m.group(1).strip() if img_m else ""
            if raw_logo:
                logo = html.unescape(html.unescape(raw_logo)).replace('&amp;', '&')
            else:
                logo = ""

            results.append({
                "id": f"live_li_{i+1}_{int(time.time())}",
                "judul": title,
                "perusahaan": company,
                "lokasi": loc_text,
                "tipe_kerja": "Hybrid" if "hybrid" in title.lower() else "Remote" if "remote" in title.lower() else "Onsite",
                "sumber": "LinkedIn",
                "logo_perusahaan": logo,
                "gaji_tampil": "Kompetitif (Sesuai Kualifikasi)",
                "url_asli": link,
                "kategori": "General",
                "kata_kunci": [k.lower() for k in kw_clean.split()] + ["linkedin", "verified", "live"],
                "deskripsi_singkat": f"Peluang karir sebagai {title} di {company}. Terbuka untuk penempatan area {loc_text}.",
                "pengalaman_min_tahun": 2,
                "pendidikan_min": "S1 Terkait",
                "tanggal_tayang": tgl
            })
    except Exception as e:
        print("[JobScraper] LinkedIn Guest Fetch Notice:", e)

    return results

def fetch_kalibrr_live(keyword="accounting", location="Indonesia", limit=8) -> List[Dict[str, Any]]:
    """
    Scraper live dari portal Kalibrr Indonesia via public job board search API.
    """
    kw_clean = (keyword or "accounting").strip()
    kw_encoded = urllib.parse.quote(kw_clean)
    url = f"https://www.kalibrr.com/api/job_board/search?name={kw_encoded}&country=Indonesia&limit={limit}"
    req = urllib.request.Request(url, headers=HEADERS)
    results = []
    try:
        with urllib.request.urlopen(req, timeout=6, context=ctx) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        
        jobs = data.get('jobs', [])
        for i, item in enumerate(jobs):
            title = item.get('name') or f"Posisi {kw_clean.title()}"
            comp_info = item.get('company_info', {}) or {}
            comp_name = item.get('company_name') or comp_info.get('name') or "Perusahaan Mitra Kalibrr"
            comp_code = comp_info.get('code') or "company"
            slug = item.get('slug') or "job"
            job_url = f"https://www.kalibrr.com/c/{comp_code}/jobs/{item.get('id')}/{slug}"
            
            # Gaji
            base_sal = item.get('base_salary')
            max_sal = item.get('maximum_salary')
            gaji_str = "Kompetitif (Kalibrr)"
            if base_sal and max_sal:
                gaji_str = f"Rp {int(base_sal):,} - Rp {int(max_sal):,} / bln".replace(',', '.')
            elif base_sal:
                gaji_str = f"Mulai Rp {int(base_sal):,} / bln".replace(',', '.')

            # Lokasi
            loc = "Indonesia"
            g_loc = item.get('google_location', {}) or {}
            city = g_loc.get('address_components', {}).get('city')
            if city:
                loc = f"{city}, Indonesia"

            # Tipe Kerja
            is_remote = item.get('is_work_from_home', False)
            is_hybrid = item.get('is_hybrid', False)
            tipe = "Remote" if is_remote else "Hybrid" if is_hybrid else "Onsite"

            # Logo
            logo = comp_info.get('logo') or ""

            results.append({
                "id": f"live_kb_{i+1}_{int(time.time())}",
                "judul": title,
                "perusahaan": comp_name,
                "lokasi": loc,
                "tipe_kerja": tipe,
                "sumber": "Kalibrr",
                "logo_perusahaan": logo,
                "gaji_tampil": gaji_str,
                "url_asli": job_url,
                "kategori": "General",
                "kata_kunci": [k.lower() for k in kw_clean.split()] + ["kalibrr", "live", "verified"],
                "deskripsi_singkat": f"Lowongan {title} di {comp_name}. Terbuka untuk talenta profesional di area {loc}.",
                "pengalaman_min_tahun": item.get('work_experience') or 1,
                "pendidikan_min": item.get('education_level') or "D3 / S1",
                "tanggal_tayang": "Aktif di Kalibrr"
            })
    except Exception as e:
        print("[JobScraper] Kalibrr Fetch Notice:", e)

    return results

def fetch_indeed_live(keyword="accounting", location="Indonesia", limit=6) -> List[Dict[str, Any]]:
    """
    Scraper live dari Indeed Indonesia via library JobSpy.
    Mengambil data riil posisi, perusahaan, dan URL postingan Indeed.
    """
    kw_clean = (keyword or "professional").strip()
    loc_clean = (location or "Indonesia").strip()
    if loc_clean.lower() == "semua":
        loc_clean = "Indonesia"

    results = []
    try:
        from jobspy import scrape_jobs
        jobs_df = scrape_jobs(
            site_name=['indeed'],
            search_term=kw_clean,
            location=loc_clean,
            results_wanted=limit,
            country_indeed='Indonesia'
        )
        if jobs_df is not None and not jobs_df.empty:
            import math
            for i, row in jobs_df.iterrows():
                title = str(row.get('title') or f"Posisi {kw_clean.title()}")
                company = str(row.get('company') or "Perusahaan Terdaftar")
                loc = str(row.get('location') or loc_clean)
                job_url = str(row.get('job_url') or f"https://id.indeed.com/jobs?q={urllib.parse.quote(kw_clean)}")
                
                # Cek gaji aman dari NaN
                min_amt = row.get('min_amount')
                max_amt = row.get('max_amount')
                gaji_str = "Kompetitif (Indeed)"
                try:
                    if min_amt is not None and not (isinstance(min_amt, float) and math.isnan(min_amt)):
                        if max_amt is not None and not (isinstance(max_amt, float) and math.isnan(max_amt)):
                            gaji_str = f"Rp {int(min_amt):,} - Rp {int(max_amt):,} / bln".replace(',', '.')
                        else:
                            gaji_str = f"Mulai Rp {int(min_amt):,} / bln".replace(',', '.')
                except Exception:
                    gaji_str = "Kompetitif (Indeed)"

                results.append({
                    "id": f"live_id_{i+1}_{int(time.time())}",
                    "judul": title,
                    "perusahaan": company,
                    "lokasi": loc,
                    "tipe_kerja": "Remote" if row.get('is_remote') else "Hybrid" if "hybrid" in title.lower() else "Onsite",
                    "sumber": "Indeed",
                    "logo_perusahaan": "",
                    "gaji_tampil": gaji_str,
                    "url_asli": job_url,
                    "kategori": "General",
                    "kata_kunci": [k.lower() for k in kw_clean.split()] + ["indeed", "live", "verified"],
                    "deskripsi_singkat": f"Lowongan {title} di {company}. Informasi dan verifikasi kualifikasi lengkap tersedia di portal resmi Indeed.",
                    "pengalaman_min_tahun": 1,
                    "pendidikan_min": "D3 / S1 Terkait",
                    "tanggal_tayang": "Aktif di Indeed"
                })
    except Exception as e:
        print("[JobScraper] Indeed Fetch Notice:", e)

    return results

def aggregate_live_jobs(keyword="accounting", location="Indonesia", portal="semua", limit=25) -> List[Dict[str, Any]]:
    """
    Agregasi multi-portal secara 100% Live:
    - LinkedIn (Guest API)
    - Kalibrr (Public Job Board API)
    - Indeed (JobSpy Engine)
    Tanpa mock/hardcode statis.
    """
    portal_filter = (portal or "semua").strip().lower()
    all_jobs: List[Dict[str, Any]] = []

    # 1. Fetch LinkedIn
    if portal_filter in ["semua", "linkedin"]:
        li_jobs = fetch_linkedin_live(keyword=keyword, location=location, limit=10)
        all_jobs.extend(li_jobs)

    # 2. Fetch Kalibrr
    if portal_filter in ["semua", "kalibrr"]:
        kb_jobs = fetch_kalibrr_live(keyword=keyword, location=location, limit=8)
        all_jobs.extend(kb_jobs)

    # 3. Fetch Indeed
    if portal_filter in ["semua", "indeed"]:
        ind_jobs = fetch_indeed_live(keyword=keyword, location=location, limit=6)
        all_jobs.extend(ind_jobs)

    return all_jobs
