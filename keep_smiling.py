import argparse
import json
import re
import time
from urllib.parse import urljoin, urlparse

import requests
from lxml import html

BASE_URL = "https://waqarmart.pk"
BRAND_PATH = "/brand/keep-smiling-vlzzu"
DEFAULT_OUTPUT = "keep smiling.json"

REQUEST_DELAY_SECONDS = 0.2
TIMEOUT_SECONDS = 30
RETRIES = 3

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
}


def clean_text(value):
    if value is None:
        return None
    return " ".join(str(value).split()).strip()


def build_sku(product_url, product_id):
    """
    waqarmart Keep Smiling pages do not expose explicit SKU reliably.
    Build a stable SKU from URL slug, fallback to product id.
    """
    if product_url:
        path = urlparse(product_url).path.rstrip("/")
        slug = path.split("/")[-1] if path else ""
        normalized = re.sub(r"[^A-Za-z0-9]+", "-", slug).strip("-").upper()
        if normalized:
            return normalized
    if product_id:
        return f"WAQAR-{product_id}"
    return None


def fetch_page(session, page_number):
    url = urljoin(BASE_URL, BRAND_PATH)
    params = {"page": page_number} if page_number > 1 else None

    last_error = None
    for attempt in range(RETRIES):
        try:
            response = session.get(url, params=params, timeout=TIMEOUT_SECONDS)
            response.raise_for_status()
            return response.text
        except Exception as exc:
            last_error = exc
            if attempt < RETRIES - 1:
                time.sleep(1.5 ** attempt)
            else:
                raise last_error
    raise last_error


def parse_product_cards(page_html, page_number):
    doc = html.fromstring(page_html)
    cards = doc.xpath("//div[contains(@class,'aiz-card-box')]")
    records = []

    for card in cards:
        product_link = card.xpath(".//a[contains(@href,'/product/')][1]/@href")
        product_url = product_link[0].strip() if product_link else None
        if product_url and product_url.startswith("/"):
            product_url = urljoin(BASE_URL, product_url)

        name_nodes = card.xpath(".//h3//a/text()")
        name = clean_text(name_nodes[0]) if name_nodes else None

        img_nodes = card.xpath(".//img[1]")
        image_url = None
        if img_nodes:
            image_url = img_nodes[0].get("data-src") or img_nodes[0].get("src")
            if image_url and image_url.startswith("/"):
                image_url = urljoin(BASE_URL, image_url)

        price_text = " ".join(card.xpath(".//div[contains(@class,'fs-15')]//text()"))
        price_text = clean_text(price_text)

        # Product ID appears in onclick handlers like addToWishList(3526).
        onclick_text = " ".join(card.xpath(".//*[@onclick]/@onclick"))
        id_match = re.search(r"\((\d+)\)", onclick_text)
        product_id = int(id_match.group(1)) if id_match else None
        sku = build_sku(product_url, product_id)

        records.append(
            {
                "id": product_id,
                "sku": sku,
                "name": name,
                "url": product_url,
                "price": price_text,
                "image": image_url,
                "brand": "Keep Smiling",
                "source_page": page_number,
            }
        )

    return records


def scrape_brand_products(session):
    all_records = []
    seen_urls = set()

    page = 1
    while True:
        page_html = fetch_page(session, page_number=page)
        page_records = parse_product_cards(page_html, page_number=page)
        if not page_records:
            break

        new_count = 0
        for record in page_records:
            product_url = record.get("url")
            if product_url and product_url in seen_urls:
                continue
            if product_url:
                seen_urls.add(product_url)
            all_records.append(record)
            new_count += 1

        print(
            f"Page {page}: parsed {len(page_records)} cards, added {new_count} unique products",
            flush=True,
        )

        page += 1
        time.sleep(REQUEST_DELAY_SECONDS)

    return all_records


def main():
    parser = argparse.ArgumentParser(
        description="Scrape Keep Smiling products from waqarmart.pk brand page."
    )
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Output JSON file path")
    args = parser.parse_args()

    with requests.Session() as session:
        session.headers.update(HEADERS)
        products = scrape_brand_products(session)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(products)} products to {args.output}", flush=True)


if __name__ == "__main__":
    main()
