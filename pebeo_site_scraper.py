import argparse
import html
import json
import os
import time
from pathlib import Path

import requests

BASE_API_URL = "https://pebeo.com/en/wp-json/wc/store/v1/products"
DEFAULT_OUTPUT_JSON = "pebeo_products_from_site.json"
DEFAULT_IMAGE_DIR = "product_images_official"
TIMEOUT_SECONDS = 30
REQUEST_DELAY_SECONDS = 0.2
RETRIES = 3

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
}


def request_json(session, url, params=None):
    last_error = None
    for attempt in range(RETRIES):
        try:
            response = session.get(url, params=params, timeout=TIMEOUT_SECONDS)
            response.raise_for_status()
            return response
        except Exception as exc:
            last_error = exc
            if attempt < RETRIES - 1:
                time.sleep(1.5 ** attempt)
            else:
                raise last_error
    raise last_error


def to_product_record(item):
    images = item.get("images") or []
    image_urls = [img.get("src") for img in images if img.get("src")]
    categories = item.get("categories") or []
    tags = item.get("tags") or []

    return {
        "id": item.get("id"),
        "sku": item.get("sku"),
        "name": html.unescape(item.get("name") or ""),
        "slug": item.get("slug"),
        "permalink": item.get("permalink"),
        "short_description": html.unescape(item.get("short_description") or ""),
        "description": html.unescape(item.get("description") or ""),
        "price_currency": (item.get("prices") or {}).get("currency_code"),
        "price": (item.get("prices") or {}).get("price"),
        "regular_price": (item.get("prices") or {}).get("regular_price"),
        "sale_price": (item.get("prices") or {}).get("sale_price"),
        "is_in_stock": item.get("is_in_stock"),
        "average_rating": item.get("average_rating"),
        "review_count": item.get("review_count"),
        "categories": [
            {"id": c.get("id"), "name": c.get("name"), "slug": c.get("slug"), "link": c.get("link")}
            for c in categories
        ],
        "tags": [
            {"id": t.get("id"), "name": t.get("name"), "slug": t.get("slug"), "link": t.get("link")}
            for t in tags
        ],
        "image": image_urls[0] if image_urls else None,
        "images": image_urls,
    }


def scrape_all_products(session, per_page):
    response = request_json(session, BASE_API_URL, params={"page": 1, "per_page": per_page})
    total_pages = int(response.headers.get("X-WP-TotalPages", "1"))
    total_items = int(response.headers.get("X-WP-Total", "0"))

    all_products = []
    page_data = response.json()
    all_products.extend(page_data)
    print(f"Fetched page 1/{total_pages} ({len(page_data)} items)", flush=True)

    for page in range(2, total_pages + 1):
        response = request_json(session, BASE_API_URL, params={"page": page, "per_page": per_page})
        page_data = response.json()
        all_products.extend(page_data)
        print(f"Fetched page {page}/{total_pages} ({len(page_data)} items)", flush=True)
        time.sleep(REQUEST_DELAY_SECONDS)

    print(f"API reported total products: {total_items}", flush=True)
    print(f"Collected products: {len(all_products)}", flush=True)
    return all_products


def normalize_filename(name):
    safe = "".join(ch if ch.isalnum() or ch in ("-", "_", ".") else "_" for ch in name)
    return safe[:180]


def download_images(session, products, image_dir):
    Path(image_dir).mkdir(parents=True, exist_ok=True)
    downloaded = 0
    failed = 0

    for idx, p in enumerate(products, start=1):
        image_url = p.get("image")
        if not image_url:
            continue

        sku_or_id = p.get("sku") or str(p.get("id") or f"product_{idx}")
        ext = ".jpg"
        for candidate in (".jpg", ".jpeg", ".png", ".webp"):
            if candidate in image_url.lower():
                ext = candidate
                break
        filename = normalize_filename(f"{sku_or_id}{ext}")
        destination = os.path.join(image_dir, filename)

        try:
            r = session.get(image_url, timeout=TIMEOUT_SECONDS, stream=True)
            r.raise_for_status()
            with open(destination, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            p["image_local_path"] = destination
            downloaded += 1
        except Exception:
            failed += 1
        if idx % 100 == 0:
            print(f"Image progress: {idx}/{len(products)}", flush=True)
        time.sleep(REQUEST_DELAY_SECONDS)

    print(f"Images downloaded: {downloaded}, failed: {failed}", flush=True)


def main():
    parser = argparse.ArgumentParser(
        description="Scrape all PEBEO product data directly from pebeo.com official API."
    )
    parser.add_argument("--output", default=DEFAULT_OUTPUT_JSON, help="Output JSON path")
    parser.add_argument("--per-page", type=int, default=100, help="Products per API page (max 100)")
    parser.add_argument(
        "--download-images",
        action="store_true",
        help="Download each product's main image to local folder",
    )
    parser.add_argument("--image-dir", default=DEFAULT_IMAGE_DIR, help="Folder for downloaded images")
    args = parser.parse_args()

    per_page = max(1, min(args.per_page, 100))

    with requests.Session() as session:
        session.headers.update(HEADERS)
        raw_products = scrape_all_products(session, per_page=per_page)
        products = [to_product_record(item) for item in raw_products]

        if args.download_images:
            download_images(session, products, args.image_dir)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(products)} products to {args.output}", flush=True)


if __name__ == "__main__":
    main()
