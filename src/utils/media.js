function getApiOrigin() {
  const base = process.env.REACT_APP_API_BASE_URL || "http://ecomerce_back-end.test/api";
  try {
    return new URL(base).origin;
  } catch {
    return "";
  }
}

export function resolveMediaUrl(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url) return "";

  const apiOrigin = getApiOrigin();
  if (!apiOrigin) return url;

  
  if (url.startsWith("/")) {
    return `${apiOrigin}${url}`;
  }

  try {
    const parsed = new URL(url);
    // If importer stored old/wrong backend host, rewrite only for imported-products files.
    if (parsed.pathname.startsWith("/imported-products/") && parsed.origin !== apiOrigin) {
      return `${apiOrigin}${parsed.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}

