import argparse
import json
import re
import time
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

import requests
from lxml import html

BASE_URL = "https://fabriano.com"
SITEMAP_URL = f"{BASE_URL}/product_post_type-sitemap.xml"
DEFAULT_OUTPUT = "fabriano.json"

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


def slug_to_sku(slug):
    if not slug:
        return None
    return re.sub(r"[^A-Za-z0-9]+", "-", slug).strip("-").upper()


def get_with_retries(session, url):
    last_error = None
    for attempt in range(RETRIES):
        try:
            response = session.get(url, timeout=TIMEOUT_SECONDS)
            response.raise_for_status()
            return response
        except Exception as exc:
            last_error = exc
            if attempt < RETRIES - 1:
                time.sleep(1.5 ** attempt)
            else:
                raise last_error
    raise last_error


def discover_english_product_urls(session):
    xml_text = get_with_retries(session, SITEMAP_URL).text
    root = ET.fromstring(xml_text)
    locs = [el.text.strip() for el in root.findall(".//{*}loc") if el.text]

    urls = []
    seen = set()
    for url in locs:
        lower = url.lower()
        # Keep only English product pages with a slug.
        if "/en/product/" not in lower:
            continue
        if lower.rstrip("/") == "https://fabriano.com/en/product":
            continue
        if url in seen:
            continue
        seen.add(url)
        urls.append(url)

    return urls


def parse_properties(article):
    properties = {}
    for group in article.xpath(".//div[contains(@class,'property-group')]"):
        label = clean_text(group.xpath("string(.//h3[1])"))
        values = [clean_text(x) for x in group.xpath(".//div[contains(@class,'properties-list')]//text()")]
        values = [v for v in values if v]
        if label:
            properties[label] = values
    return properties


def parse_details(article):
    details = {}
    for block in article.xpath(".//div[contains(@class,'product-detail-block')]"):
        label = clean_text(block.xpath("string(.//h3[1])"))
        value = clean_text(block.xpath("string(.//div[contains(@class,'detail-content')][1])"))
        if label and value:
            details[label] = value
    return details


def extract_sku(doc, article, page_html, slug):
    # Try explicit sku fields if present.
    sku_candidates = [
        clean_text(article.xpath("string(.//*[contains(@class,'sku')][1])")),
        clean_text(doc.xpath("string(//meta[@itemprop='sku']/@content)")),
    ]
    for candidate in sku_candidates:
        if candidate:
            normalized = candidate.replace("SKU", "").replace(":", "").strip()
            if normalized:
                return normalized, "page"

    # Try common textual/json patterns.
    patterns = [
        r"\bSKU\b\s*[:#-]?\s*([A-Za-z0-9][A-Za-z0-9\-_/]{2,})",
        r'"sku"\s*:\s*"([^"]+)"',
    ]
    for pattern in patterns:
        match = re.search(pattern, page_html, flags=re.IGNORECASE)
        if match:
            value = clean_text(match.group(1))
            if value:
                return value, "page"

    # Fabriano EN product pages usually have no explicit SKU: fallback to slug.
    return slug_to_sku(slug), "slug_fallback"


def parse_product_page(page_url, page_html):
    doc = html.fromstring(page_html)
    article_nodes = doc.xpath("//article[contains(@class,'product_post_type')]")
    article = article_nodes[0] if article_nodes else doc

    title = clean_text(article.xpath("string(.//h1[1])"))
    category = clean_text(article.xpath("string(.//a[contains(@class,'product-category-link')][1])"))
    abstract = clean_text(article.xpath("string(.//div[contains(@class,'page-header-abstract')][1])"))
    description = clean_text(article.xpath("string(.//div[contains(@class,'product-description-block')][1])"))
    hero_image = article.xpath(".//img[contains(@class,'page-header-image')][1]/@src")
    hero_image = hero_image[0].strip() if hero_image else None
    og_image = doc.xpath("//meta[@property='og:image']/@content")
    og_image = og_image[0].strip() if og_image else None

    properties = parse_properties(article)
    details = parse_details(article)

    pdf_links = []
    seen = set()
    for href in article.xpath(".//a[@href]/@href"):
        if ".pdf" not in href.lower():
            continue
        if href in seen:
            continue
        seen.add(href)
        pdf_links.append(href.strip())

    path = urlparse(page_url).path.rstrip("/")
    slug = path.split("/")[-1] if path else None
    sku, sku_source = extract_sku(doc, article, page_html, slug)

    return {
        "sku": sku,
        "sku_source": sku_source,
        "name": title,
        "slug": slug,
        "url": page_url,
        "category": category,
        "abstract": abstract,
        "description": description,
        "hero_image": hero_image,
        "og_image": og_image,
        "properties": properties,
        "details": details,
        "pdf_links": pdf_links,
    }


def scrape_fabriano_products(session):
    product_urls = discover_english_product_urls(session)
    print(f"Discovered {len(product_urls)} English product URLs", flush=True)

    products = []
    failed_urls = []
    for idx, url in enumerate(product_urls, start=1):
        try:
            response = get_with_retries(session, url)
            product = parse_product_page(url, response.text)
            products.append(product)
        except Exception as exc:
            failed_urls.append({"url": url, "error": str(exc)})

        if idx % 20 == 0 or idx == len(product_urls):
            print(
                f"Processed {idx}/{len(product_urls)} URLs "
                f"(ok={len(products)}, failed={len(failed_urls)})",
                flush=True,
            )
        time.sleep(REQUEST_DELAY_SECONDS)

    if failed_urls:
        print(f"Failed URLs: {len(failed_urls)}", flush=True)
        for item in failed_urls[:10]:
            print(f"- {item['url']} :: {item['error']}", flush=True)

    return products


def main():
    parser = argparse.ArgumentParser(
        description="Scrape Fabriano English product pages into JSON."
    )
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Output JSON file")
    args = parser.parse_args()

    with requests.Session() as session:
        session.headers.update(HEADERS)
        products = scrape_fabriano_products(session)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(products)} products to {args.output}", flush=True)


if __name__ == "__main__":
    main()
