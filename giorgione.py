import argparse
import json
import time
from urllib.parse import parse_qs, urljoin, urlparse

import requests
from lxml import html

BASE_URL = "https://giorgione.in/"
DEFAULT_OUTPUT = "giorgione.json"
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


def clean_text(value):
    if value is None:
        return None
    return " ".join(str(value).split()).strip()


def get_with_retries(session, url, params=None):
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


def discover_category_slugs(session):
    response = get_with_retries(session, BASE_URL)
    doc = html.fromstring(response.text)
    slugs = set()

    for href in doc.xpath("//a[@href]/@href"):
        if not href:
            continue
        parsed = urlparse(href)
        query = parse_qs(parsed.query)
        if "product_cat" in query:
            slug = query["product_cat"][0].strip()
            if slug:
                slugs.add(slug)

    # Ensure "all" category is always attempted.
    slugs.add("all")
    return sorted(slugs)


def extract_product_from_card(card, source_category, source_page):
    product_url = card.xpath("string(.//h3//a[1]/@href)").strip() or None
    name = clean_text(card.xpath("string(.//h3//a[1])"))
    image = card.xpath("string(.//div[contains(@class,'product-img')]//img[1]/@src)").strip() or None
    price_text = clean_text(" ".join(card.xpath(".//span[contains(@class,'price')]//text()")))

    add_btn = card.xpath(".//a[contains(@class,'add_to_cart_button')][1]")
    product_id = None
    sku = None
    if add_btn:
        product_id_raw = add_btn[0].get("data-product_id")
        sku_raw = add_btn[0].get("data-product_sku")
        product_id = int(product_id_raw) if product_id_raw and product_id_raw.isdigit() else None
        sku = clean_text(sku_raw) if sku_raw else None

    class_attr = card.get("class") or ""
    category_slugs = []
    for token in class_attr.split():
        if token.startswith("product_cat-"):
            category_slugs.append(token.replace("product_cat-", "").strip())

    return {
        "id": product_id,
        "name": name,
        "url": product_url,
        "price": price_text,
        "sku": sku,
        "image": image,
        "category_slugs": sorted(set([c for c in category_slugs if c])),
        "source_category": source_category,
        "source_page": source_page,
    }


def scrape_listing_pages(session, category_slug):
    products = []
    page = 1
    while True:
        params = {"product_cat": category_slug}
        if page > 1:
            params["paged"] = page

        try:
            response = get_with_retries(session, BASE_URL, params=params)
        except requests.exceptions.HTTPError as exc:
            status = exc.response.status_code if exc.response is not None else None
            if status == 404:
                break
            raise
        doc = html.fromstring(response.text)
        cards = doc.xpath("//li[contains(@class,'product') and contains(@class,'type-product')]")
        if not cards:
            break

        for card in cards:
            products.append(extract_product_from_card(card, category_slug, page))

        page += 1
        time.sleep(REQUEST_DELAY_SECONDS)

    return products


def enrich_product_details(session, product):
    url = product.get("url")
    if not url:
        return product

    try:
        response = get_with_retries(session, url)
    except Exception:
        product["detail_fetch_error"] = True
        return product

    doc = html.fromstring(response.text)

    title = clean_text(doc.xpath("string(//h1[1])"))
    if title:
        product["name"] = title

    detail_price = clean_text(" ".join(doc.xpath("//p[contains(@class,'price')]//text()")))
    if detail_price:
        product["price"] = detail_price

    sku_text = clean_text("".join(doc.xpath("//span[contains(@class,'sku')]/text()")))
    if sku_text:
        # Example: SKU: GIO48ST
        product["sku"] = sku_text.replace("SKU:", "").strip()

    categories = [clean_text(c) for c in doc.xpath("//span[contains(@class,'posted_in')]/a/text()")]
    categories = [c for c in categories if c]
    if categories:
        product["categories"] = categories

    short_description = clean_text(
        " ".join(doc.xpath("//div[contains(@class,'woocommerce-product-details__short-description')]//text()"))
    )
    if short_description:
        product["short_description"] = short_description

    description = clean_text(
        " ".join(doc.xpath("//div[@id='tab-description' or contains(@class,'woocommerce-Tabs-panel--description')]//text()"))
    )
    if description:
        product["description"] = description

    images = []
    seen = set()
    for src in doc.xpath("//div[contains(@class,'woocommerce-product-gallery')]//img/@src"):
        src = src.strip()
        if not src:
            continue
        if src.startswith("/"):
            src = urljoin(BASE_URL, src)
        if src in seen:
            continue
        seen.add(src)
        images.append(src)
    if images:
        product["images"] = images
        product["image"] = images[0]

    return product


def merge_records(records):
    by_url = {}
    for item in records:
        key = item.get("url") or f"id:{item.get('id')}"
        if key not in by_url:
            by_url[key] = item
            by_url[key]["seen_in_categories"] = sorted(set(item.get("category_slugs") or []))
            continue

        existing = by_url[key]
        merged_categories = set(existing.get("seen_in_categories") or [])
        merged_categories.update(item.get("category_slugs") or [])
        existing["seen_in_categories"] = sorted(merged_categories)

        # Fill missing fields from later records if needed.
        for field in ("id", "name", "price", "sku", "image"):
            if not existing.get(field) and item.get(field):
                existing[field] = item[field]

    return list(by_url.values())


def main():
    parser = argparse.ArgumentParser(
        description="Scrape Giorgione products from giorgione.in into JSON."
    )
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Output JSON file")
    args = parser.parse_args()

    with requests.Session() as session:
        session.headers.update(HEADERS)

        categories = discover_category_slugs(session)
        print(f"Discovered categories: {', '.join(categories)}", flush=True)

        collected = []
        for slug in categories:
            items = scrape_listing_pages(session, slug)
            collected.extend(items)
            print(f"Category '{slug}': collected {len(items)} listing records", flush=True)

        merged = merge_records(collected)
        print(f"Unique products after merge: {len(merged)}", flush=True)

        enriched = []
        for idx, product in enumerate(merged, start=1):
            enriched.append(enrich_product_details(session, product))
            if idx % 10 == 0 or idx == len(merged):
                print(f"Enriched {idx}/{len(merged)} products", flush=True)
            time.sleep(REQUEST_DELAY_SECONDS)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(enriched)} products to {args.output}", flush=True)


if __name__ == "__main__":
    main()
