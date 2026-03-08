import json
import os
import re
import time
import xml.etree.ElementTree as ET
from urllib.parse import urljoin

import requests

BASE_URL = "https://pebeo.com"
OUTPUT_FOLDER = "product_images"
INPUT_JSON = "pebeo.json"

# Keep requests polite and reduce blocking risk.
REQUEST_DELAY_SECONDS = 0.3
TIMEOUT_SECONDS = 20
MAX_PRODUCT_URLS = int(os.getenv("MAX_PRODUCT_URLS", "0"))

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
}


def normalize_sku(value):
    if value is None:
        return ""
    return re.sub(r"[^A-Za-z0-9]", "", str(value)).upper()


def fetch_text(session, url):
    response = session.get(url, timeout=TIMEOUT_SECONDS)
    response.raise_for_status()
    time.sleep(REQUEST_DELAY_SECONDS)
    return response.text


def extract_xml_locs(xml_text):
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return []
    return [loc.text.strip() for loc in root.findall(".//{*}loc") if loc.text]


def discover_sitemap_urls(session):
    candidates = []

    robots_url = urljoin(BASE_URL, "/robots.txt")
    try:
        robots_txt = fetch_text(session, robots_url)
        for line in robots_txt.splitlines():
            if line.lower().startswith("sitemap:"):
                sitemap_url = line.split(":", 1)[1].strip()
                if sitemap_url:
                    candidates.append(sitemap_url)
    except Exception:
        pass

    fallback_candidates = [
        urljoin(BASE_URL, "/sitemap_index.xml"),
        urljoin(BASE_URL, "/sitemap.xml"),
        urljoin(BASE_URL, "/wp-sitemap.xml"),
    ]
    for url in fallback_candidates:
        if url not in candidates:
            candidates.append(url)

    valid = []
    for url in candidates:
        try:
            xml_text = fetch_text(session, url)
            if "<loc>" in xml_text.lower():
                valid.append(url)
        except Exception:
            continue
    return valid


def discover_product_urls(session):
    product_urls = set()
    sitemap_urls = discover_sitemap_urls(session)

    queue = list(sitemap_urls)
    seen = set()

    while queue:
        sitemap_url = queue.pop(0)
        if sitemap_url in seen:
            continue
        seen.add(sitemap_url)

        try:
            xml_text = fetch_text(session, sitemap_url)
        except Exception:
            continue

        locs = extract_xml_locs(xml_text)
        for loc in locs:
            lower = loc.lower()
            if lower.endswith(".xml"):
                if loc not in seen:
                    queue.append(loc)
                continue
            if "/product/" in lower and "/en/" in lower:
                product_urls.add(loc)

    return sorted(product_urls)


def extract_sku(html):
    # Common patterns: SKU: 123-456, "sku":"123-456", productCode fields, etc.
    patterns = [
        r"SKU\s*[:#]?\s*</?[^>]*>\s*([A-Za-z0-9-]{3,})",
        r"SKU\s*[:#]?\s*([A-Za-z0-9-]{3,})",
        r'"sku"\s*:\s*"([A-Za-z0-9-]{3,})"',
        r'"productCode"\s*:\s*"([A-Za-z0-9-]{3,})"',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def extract_image_url(html):
    # Prefer social meta image; fallback to JSON-LD image.
    og_match = re.search(
        r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']',
        html,
        flags=re.IGNORECASE,
    )
    if og_match:
        return og_match.group(1).strip()

    jsonld_match = re.search(r'"image"\s*:\s*"([^"]+)"', html, flags=re.IGNORECASE)
    if jsonld_match:
        return jsonld_match.group(1).strip()

    return None


def build_product_image_index(session, product_urls):
    index = {}
    if MAX_PRODUCT_URLS > 0:
        product_urls = product_urls[:MAX_PRODUCT_URLS]
    total = len(product_urls)
    for i, url in enumerate(product_urls, start=1):
        try:
            html = fetch_text(session, url)
            sku = extract_sku(html)
            image_url = extract_image_url(html)
            if not sku or not image_url:
                continue
            key = normalize_sku(sku)
            if key and key not in index:
                index[key] = image_url
            if i % 25 == 0:
                print(f"Indexed {i}/{total} product pages", flush=True)
        except Exception:
            continue
    return index


def download_image(session, url, filename):
    try:
        response = session.get(url, timeout=TIMEOUT_SECONDS, stream=True)
        response.raise_for_status()
        with open(filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        return True
    except Exception:
        return False


def main():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    with open(INPUT_JSON, "r", encoding="utf-8") as f:
        products = json.load(f)

    target_skus = {}
    for product in products:
        sku = product.get("sku")
        if sku:
            target_skus[normalize_sku(sku)] = sku

    with requests.Session() as session:
        session.headers.update(HEADERS)

        print("Discovering product URLs on pebeo.com...", flush=True)
        product_urls = discover_product_urls(session)
        print(f"Found {len(product_urls)} product URLs", flush=True)

        print("Building SKU -> image index from official product pages...", flush=True)
        image_index = build_product_image_index(session, product_urls)
        print(f"Indexed {len(image_index)} SKU-image pairs", flush=True)

        downloaded = 0
        missing = 0
        failed = 0

        for normalized_sku, original_sku in target_skus.items():
            image_url = image_index.get(normalized_sku)
            if not image_url:
                print(f"No official image found for {original_sku}", flush=True)
                missing += 1
                continue

            file_path = os.path.join(OUTPUT_FOLDER, f"{original_sku}.jpg")
            if download_image(session, image_url, file_path):
                print(f"Downloaded {original_sku}", flush=True)
                downloaded += 1
            else:
                print(f"Failed {original_sku}", flush=True)
                failed += 1

            time.sleep(REQUEST_DELAY_SECONDS)

    print(
        "Done. "
        f"Downloaded={downloaded}, Missing={missing}, Failed={failed}"
    , flush=True)


if __name__ == "__main__":
    main()
