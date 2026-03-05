import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "../components/layout/Container";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import { CatalogAPI } from "../api/catalog";

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const category_id = sp.get("category_id") || "";
  const brand_id = sp.get("brand_id") || "";
  const q = sp.get("q") || "";

  useEffect(() => {
    CatalogAPI.categories().then(setCats).catch(() => {});
    CatalogAPI.brands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setApiError("");

    CatalogAPI.products({ category_id: category_id || undefined, brand_id: brand_id || undefined })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setProducts([]);
        setApiError("Unable to load products. Check backend API connection.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category_id, brand_id]);

  const filtered = useMemo(() => {
    if (!q.trim()) return products;
    const t = q.toLowerCase();
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(t) ||
        (p.brand?.name || "").toLowerCase().includes(t) ||
        (p.category?.name || "").toLowerCase().includes(t)
    );
  }, [products, q]);

  return (
    <Container className="py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Shop</h1>
          <p className="text-sm text-slate-600 mt-1">Filter by category, brand and search.</p>
        </div>

        <div className="w-full md:w-[420px]">
          <Input
            placeholder="Search..."
            value={q}
            onChange={(e) => {
              const next = new URLSearchParams(sp);
              next.set("q", e.target.value);
              setSp(next);
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-semibold">Filters</div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</div>
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={category_id}
                onChange={(e) => {
                  const next = new URLSearchParams(sp);
                  const v = e.target.value;
                  if (v) next.set("category_id", v);
                  else next.delete("category_id");
                  setSp(next);
                }}
              >
                <option value="">All</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</div>
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={brand_id}
                onChange={(e) => {
                  const next = new URLSearchParams(sp);
                  const v = e.target.value;
                  if (v) next.set("brand_id", v);
                  else next.delete("brand_id");
                  setSp(next);
                }}
              >
                <option value="">All</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant="soft" className="w-full" onClick={() => setSp(new URLSearchParams())}>
                Reset
              </Button>
            </div>
          </div>
        </aside>

        <main className="md:col-span-9">
          {loading && <div className="mt-6 text-slate-500">Loading products...</div>}
          {apiError && <div className="mt-6 text-rose-600">{apiError}</div>}

          {!loading && !apiError && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
              {filtered.length === 0 && <div className="mt-10 text-center text-slate-500">No products found.</div>}
            </>
          )}
        </main>
      </div>
    </Container>
  );
}
