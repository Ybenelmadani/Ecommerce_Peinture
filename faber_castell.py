import argparse
import html
import json
import time

import requests

BASE_URL = "https://fabercastell.com"
COLLECTION_ENDPOINT = f"{BASE_URL}/collections/all-products/products.json"
DEFAULT_OUTPUT = "faber castell.json"
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
            return response.json()
        except Exception as exc:
            last_error = exc
            if attempt < RETRIES - 1:
                time.sleep(1.5 ** attempt)
            else:
                raise last_error
    raise last_error


def normalize_variant(variant):
    return {
        "id": variant.get("id"),
        "title": html.unescape(variant.get("title") or ""),
        "sku": variant.get("sku"),
        "barcode": variant.get("barcode"),
        "price": variant.get("price"),
        "compare_at_price": variant.get("compare_at_price"),
        "available": variant.get("available"),
        "inventory_quantity": variant.get("inventory_quantity"),
        "option1": variant.get("option1"),
        "option2": variant.get("option2"),
        "option3": variant.get("option3"),
    }


def normalize_image(image):
    return {
        "id": image.get("id"),
        "src": image.get("src"),
        "alt": html.unescape(image.get("alt") or ""),
        "position": image.get("position"),
    }


def normalize_product(product):
    variants = product.get("variants") or []
    images = product.get("images") or []
    raw_tags = product.get("tags")
    if isinstance(raw_tags, list):
        tags = [str(t).strip() for t in raw_tags if str(t).strip()]
    else:
        tags = [t.strip() for t in (raw_tags or "").split(",") if t.strip()]

    handle = product.get("handle") or ""

    return {
        "id": product.get("id"),
        "title": html.unescape(product.get("title") or ""),
        "handle": handle,
        "url": f"{BASE_URL}/products/{handle}" if handle else None,
        "vendor": product.get("vendor"),
        "product_type": product.get("product_type"),
        "status": product.get("status"),
        "published_at": product.get("published_at"),
        "created_at": product.get("created_at"),
        "updated_at": product.get("updated_at"),
        "body_html": html.unescape(product.get("body_html") or ""),
        "tags": tags,
        "variants": [normalize_variant(v) for v in variants],
        "skus": [v.get("sku") for v in variants if v.get("sku")],
        "image": (product.get("image") or {}).get("src"),
        "images": [normalize_image(i) for i in images],
    }


def scrape_all_products(session, per_page=250):
    page = 1
    all_products = []

    while True:
        payload = request_json(
            session,
            COLLECTION_ENDPOINT,
            params={"limit": per_page, "page": page},
        )
        products = payload.get("products", [])
        if not products:
            break

        all_products.extend(products)
        print(f"Fetched page {page} ({len(products)} products)", flush=True)
        page += 1
        time.sleep(REQUEST_DELAY_SECONDS)

    return all_products


def main():
    parser = argparse.ArgumentParser(
        description="Scrape Faber-Castell products from /collections/all-products into JSON."
    )
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Output JSON path")
    parser.add_argument("--per-page", type=int, default=250, help="Products per request (max 250)")
    args = parser.parse_args()

    per_page = max(1, min(args.per_page, 250))

    with requests.Session() as session:
        session.headers.update(HEADERS)
        raw_products = scrape_all_products(session, per_page=per_page)
        final_products = [normalize_product(p) for p in raw_products]

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(final_products, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(final_products)} products to {args.output}", flush=True)


if __name__ == "__main__":
    main()
