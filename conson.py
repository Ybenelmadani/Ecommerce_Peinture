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

BASE_URL = "https://en.canson.com"
OUTPUT_FILE = "conson.json"
TIMEOUT_SECONDS = 20
REQUEST_DELAY_SECONDS = 0.35
RETRIES = 3
MAX_PAGES_DEFAULT = 400

START_PATHS = [
    "/fine-art",
    "/school",
    "/leisure",
    "/digital-technical",
]

SITEMAP_URLS = [
    f"{BASE_URL}/sitemap.xml",
    f"{BASE_URL}/sitemap_index.xml",
    f"{BASE_URL}/sitemap.xml.gz",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
}


def request_url(session, url):
    last_error = None
    for attempt in range(RETRIES):
        try:
            response = session.get(url, headers=HEADERS, timeout=TIMEOUT_SECONDS)
            if response.status_code >= 500:
                last_error = requests.exceptions.HTTPError(
                    f"{response.status_code} Server Error for url: {response.url}"
                )
                if attempt < RETRIES - 1:
                    time.sleep(1.5 ** attempt)
                    continue
                return None
            response.raise_for_status()
            if not response.encoding:
                response.encoding = response.apparent_encoding
            return response
        except Exception as exc:
            last_error = exc
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
    if parsed.netloc and parsed.netloc != urlparse(BASE_URL).netloc:
        return None
    return parsed._replace(fragment="", query="").geturl()


def extract_product_data(url, soup):
    h1 = soup.find("h1")
    if not h1:
        return None
    title = unescape(h1.get_text(" ", strip=True))
    if "newsletter" in title.lower():
        return None

    headings = {h.get_text(" ", strip=True).lower() for h in soup.find_all(["h2", "h3"])}
    if not headings.intersection({"description", "formats and packaging", "formats & packaging", "colours", "colors"}):
        return None

    description = ""
    for selector in (
        "div.field--name-field-description",
        "div.field--name-body",
        "div.product-description",
        "article .content",
    ):
        block = soup.select_one(selector)
        if block:
            description = block.get_text(" ", strip=True)
            break

    images = []
    og_image = soup.select_one("meta[property='og:image']")
    if og_image and og_image.get("content"):
        images.append(urljoin(BASE_URL, og_image["content"]))
    for img in soup.select("img[typeof='foaf:Image'], .field--name-field-image img, .product-media img"):
        src = img.get("src") or img.get("data-src")
        if not src:
            srcset = img.get("srcset") or ""
            if srcset:
                src = srcset.split(",")[-1].strip().split(" ")[0]
        if src:
            src = urljoin(BASE_URL, src).split("?")[0]
            if src not in images:
                images.append(src)

    pdf_links = []
    for link in soup.find_all("a", href=lambda x: x and x.lower().endswith(".pdf")):
        pdf_url = link.get("href")
        if pdf_url:
            pdf_links.append(urljoin(BASE_URL, pdf_url))

    return {
        "url": url,
        "title": title,
        "description": description,
        "images": images,
        "pdf_links": pdf_links,
    }


def safe_print(message):
    try:
        print(message, flush=True)
    except OSError:
        # Some titles contain characters not supported by the console encoding.
        # Skip printing in that case to avoid aborting the scraper.
        pass


def scrape_products(session, max_pages, checkpoint_path):
    sitemap_urls = fetch_sitemap_urls(session)
    if sitemap_urls:
        allowed_prefixes = tuple(urljoin(BASE_URL, p) for p in START_PATHS)
        queue = deque(
            u
            for u in sitemap_urls
            if u.startswith(BASE_URL) and (u == BASE_URL or u.startswith(allowed_prefixes))
        )
        if not queue:
            queue = deque(urljoin(BASE_URL, p) for p in START_PATHS)
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
    parser = argparse.ArgumentParser(description="Scrape Canson product pages and save JSON.")
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
