import argparse
import gzip
import json
import re
import time
from collections import deque
from html import unescape
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.lapajarita.es/en"
OUTPUT_FILE = "pajarita.json"
TIMEOUT_SECONDS = 20
REQUEST_DELAY_SECONDS = 0.35
RETRIES = 3
MAX_PAGES_DEFAULT = 400

START_PATHS = [
    "/products",
]

SITEMAP_URLS = [
    f"{BASE_URL}/sitemap.xml",
    "https://www.lapajarita.es/sitemap.xml",
    "https://www.lapajarita.es/sitemap_index.xml",
    "https://www.lapajarita.es/sitemap.xml.gz",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
}


def request_url(session, url):
    for attempt in range(RETRIES):
        try:
            response = session.get(url, headers=HEADERS, timeout=TIMEOUT_SECONDS)
            if response.status_code >= 500:
                if attempt < RETRIES - 1:
                    time.sleep(1.5 ** attempt)
                    continue
                return None
            response.raise_for_status()
            if not response.encoding:
                response.encoding = response.apparent_encoding
            return response
        except Exception:
            if attempt < RETRIES - 1:
                time.sleep(1.5 ** attempt)
            else:
                return None
    return None


def parse_sitemap_urls(xml_text):
    return [u.strip() for u in re.findall(r"<loc>(.*?)</loc>", xml_text, re.IGNORECASE | re.DOTALL)]


def fetch_sitemap_urls(session):
    all_urls = []
    queue = deque(SITEMAP_URLS)
    seen = set()

    while queue:
        sitemap_url = queue.popleft()
        if sitemap_url in seen:
            continue
        seen.add(sitemap_url)

        response = request_url(session, sitemap_url)
        if not response:
            continue

        if sitemap_url.endswith(".gz"):
            try:
                xml_text = gzip.decompress(response.content).decode("utf-8", errors="ignore")
            except Exception:
                continue
        else:
            xml_text = response.text

        urls = parse_sitemap_urls(xml_text)
        for loc in urls:
            if "sitemap" in loc and (loc.endswith(".xml") or loc.endswith(".xml.gz")):
                queue.append(loc)
            else:
                all_urls.append(loc)

    return all_urls


def normalize_url(base, href):
    if not href:
        return None
    if href.startswith("mailto:") or href.startswith("tel:"):
        return None
    abs_url = urljoin(base, href)
    parsed = urlparse(abs_url)
    if parsed.scheme not in {"http", "https"}:
        return None
    return parsed._replace(fragment="", query="").geturl()


def parse_json_ld(soup):
    items = []
    for node in soup.select("script[type='application/ld+json']"):
        try:
            data = json.loads(node.get_text(strip=True))
            if isinstance(data, list):
                items.extend(data)
            else:
                items.append(data)
        except Exception:
            continue
    return items


def extract_product_data(url, soup):
    json_ld_items = parse_json_ld(soup)
    product_ld = None
    for item in json_ld_items:
        if isinstance(item, dict) and item.get("@type") == "Product":
            product_ld = item
            break

    h1 = soup.find("h1")
    title = unescape(h1.get_text(" ", strip=True)) if h1 else ""

    if product_ld:
        title = title or unescape(str(product_ld.get("name") or ""))

    if not title:
        return None

    description = ""
    if product_ld and product_ld.get("description"):
        description = unescape(str(product_ld.get("description") or ""))
    else:
        meta_desc = soup.select_one("meta[name='description']")
        if meta_desc and meta_desc.get("content"):
            description = unescape(meta_desc["content"])

    images = []
    if product_ld and product_ld.get("image"):
        image_field = product_ld.get("image")
        if isinstance(image_field, list):
            images.extend(image_field)
        else:
            images.append(image_field)

    og_image = soup.select_one("meta[property='og:image']")
    if og_image and og_image.get("content"):
        images.append(urljoin(url, og_image["content"]))

    for img in soup.select("img"):
        src = img.get("src") or img.get("data-src")
        if not src:
            srcset = img.get("srcset") or ""
            if srcset:
                src = srcset.split(",")[-1].strip().split(" ")[0]
        if src:
            images.append(urljoin(url, src))

    normalized_images = []
    for src in images:
        if not src:
            continue
        normalized = urljoin(url, src).split("?")[0]
        if normalized not in normalized_images:
            normalized_images.append(normalized)

    if not normalized_images and not description and not product_ld:
        return None

    return {
        "url": url,
        "title": title,
        "description": description,
        "images": normalized_images,
    }


def safe_print(message):
    try:
        print(message, flush=True)
    except OSError:
        pass


def scrape_products(session, max_pages, checkpoint_path):
    sitemap_urls = fetch_sitemap_urls(session)
    if sitemap_urls:
        queue = deque(u for u in sitemap_urls if urlparse(u).netloc.endswith("lapajarita.es"))
    else:
        queue = deque(urljoin(BASE_URL, p) for p in START_PATHS)

    seen = set()
    products = []

    with open(checkpoint_path, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    while queue and len(seen) < max_pages:
        url = queue.popleft()
        if url in seen:
            continue
        seen.add(url)

        response = request_url(session, url)
        if not response:
            continue

        soup = BeautifulSoup(response.text, "html.parser")
        product = extract_product_data(url, soup)
        if product:
            products.append(product)
            safe_print(f"Product: {product['title']}")
            if len(products) % 10 == 0:
                with open(checkpoint_path, "w", encoding="utf-8") as f:
                    json.dump(products, f, ensure_ascii=False, indent=2)

        for link in soup.find_all("a", href=True):
            normalized = normalize_url(url, link["href"])
            if normalized and normalized not in seen:
                queue.append(normalized)

        time.sleep(REQUEST_DELAY_SECONDS)

    return products


def main():
    parser = argparse.ArgumentParser(description="Scrape La Pajarita product pages and save JSON.")
    parser.add_argument("--output", default=OUTPUT_FILE, help="Output JSON path")
    parser.add_argument("--max-pages", type=int, default=MAX_PAGES_DEFAULT, help="Max pages to crawl")
    args = parser.parse_args()

    with requests.Session() as session:
        products = scrape_products(session, max_pages=max(1, args.max_pages), checkpoint_path=args.output)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    safe_print(f"Saved {len(products)} products to {args.output}")


if __name__ == "__main__":
    main()
