import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { http } from "../../api/http";
import AdminAlert from "../../components/admin/AdminAlert";

const STATUS_STYLE = {
  active: { background: "#dcfce7", color: "#166534" },
  inactive: { background: "#fee2e2", color: "#991b1b" },
};

function getMainImage(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  if (!images.length) return "";
  const main = images.find((img) => img?.is_main);
  return (main || images[0])?.image_path || "";
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [importing, setImporting] = useState(false);
  const [importLimit, setImportLimit] = useState(20);
  const [importSource, setImportSource] = useState("auto");
  const [importOnlyNew, setImportOnlyNew] = useState(true);
  const [importUploadFile, setImportUploadFile] = useState(null);
  const [importFilePath, setImportFilePath] = useState("");

  const [importHistory, setImportHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("admin_product_import_history");
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });
  const [lastImportPayload, setLastImportPayload] = useState(null);
  const [importErrors, setImportErrors] = useState([]);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 25,
  });

  const persistHistory = (next) => {
    setImportHistory(next);
    localStorage.setItem("admin_product_import_history", JSON.stringify(next));
  };

  const pushImportHistory = (entry) => {
    const next = [entry, ...importHistory].slice(0, 8);
    persistHistory(next);
  };

  const loadProducts = async (targetPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const res = await http.get("/admin/products", {
        params: {
          page: targetPage,
          per_page: pagination.per_page,
          q: search.trim() || undefined,
          sort_by: sortBy,
          sort_dir: sortDir,
        },
      });
      const payload = res?.data ?? {};
      setProducts(Array.isArray(payload.data) ? payload.data : []);
      setPagination({
        current_page: Number(payload.current_page) || targetPage,
        last_page: Number(payload.last_page) || 1,
        total: Number(payload.total) || 0,
        per_page: Number(payload.per_page) || pagination.per_page,
      });
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(page);
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) loadProducts(1);
      else setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [search, sortBy, sortDir]);

  const deleteProduct = async (id) => {
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/products/${id}`);
      setSuccess("Product deleted successfully.");

      if (products.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadProducts(page);
      }
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || "Failed to delete product.");
    }
  };

  const runImport = async (overridePayload = null) => {
    const payloadBase = overridePayload || {
      limit: Number(importLimit) || 20,
      source: importSource,
      only_new: importOnlyNew,
      file_path: importSource === "file" ? importFilePath.trim() : undefined,
    };

    if (payloadBase.source === "upload" && !importUploadFile) {
      setError("Please choose an Excel/CSV file.");
      return;
    }

    if (payloadBase.source === "file" && !String(payloadBase.file_path || "").trim()) {
      setError("Please enter a JSON file path.");
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");
    setImportErrors([]);

    try {
      let res;
      if (payloadBase.source === "upload") {
        const form = new FormData();
        form.append("limit", String(payloadBase.limit));
        form.append("source", payloadBase.source);
        form.append("only_new", payloadBase.only_new ? "1" : "0");
        form.append("import_file", importUploadFile);
        res = await http.post("/admin/products/import-painting", form);
      } else {
        res = await http.post("/admin/products/import-painting", payloadBase);
      }

      const stats = res?.data?.stats || {};
      const message = `Import done. Created: ${stats.created ?? 0}, Updated: ${stats.updated ?? 0}, Skipped: ${stats.skipped ?? 0}, Source: ${stats.source_used ?? "-"}`;

      setSuccess(message);
      setLastImportPayload(payloadBase);

      pushImportHistory({
        at: new Date().toISOString(),
        source: payloadBase.source,
        limit: payloadBase.limit,
        only_new: payloadBase.only_new,
        created: Number(stats.created ?? 0),
        updated: Number(stats.updated ?? 0),
        skipped: Number(stats.skipped ?? 0),
      });

      if (payloadBase.source === "upload") setImportUploadFile(null);
      await loadProducts(1);
      setPage(1);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const allErrors = apiErrors ? Object.values(apiErrors).flat().filter(Boolean) : [];

      setImportErrors(allErrors);
      setError(allErrors[0] || apiMsg || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  const exportImportErrors = () => {
    const content = JSON.stringify({ generated_at: new Date().toISOString(), errors: importErrors }, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasPrev = pagination.current_page > 1;
  const hasNext = pagination.current_page < pagination.last_page;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "10px", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0 }}>Products</h2>
        <Link to="/admin/products/new" style={{ padding: "10px 16px", borderRadius: "10px", background: "#0369a1", color: "#fff", fontWeight: 700, textDecoration: "none" }}>
          New Product
        </Link>
      </div>

      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "16px", display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Import source</label>
            <select
              value={importSource}
              onChange={(e) => setImportSource(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            >
              <option value="auto">Auto (eBay -{">"} Dummy -{">"} Fallback)</option>
              <option value="upload">Excel/CSV upload (recommended)</option>
              <option value="ebay">eBay only</option>
              <option value="dummy">Dummy only</option>
              <option value="fallback">Fallback only</option>
              <option value="file">Local JSON path (advanced)</option>
            </select>
          </div>

          {importSource === "upload" ? (
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Excel/CSV file</label>
              <input
                type="file"
                accept=".xlsx,.csv,.txt,.json"
                onChange={(e) => setImportUploadFile(e.target.files?.[0] || null)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
              />
            </div>
          ) : null}

          {importSource === "file" ? (
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>File path (JSON)</label>
              <input
                value={importFilePath}
                onChange={(e) => setImportFilePath(e.target.value)}
                placeholder="C:\\path\\products.json"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              />
            </div>
          ) : null}

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Limit</label>
            <input
              type="number"
              min={1}
              max={100}
              value={importLimit}
              onChange={(e) => setImportLimit(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155" }}>
            <input type="checkbox" checked={importOnlyNew} onChange={(e) => setImportOnlyNew(e.target.checked)} />
            Only new (safe)
          </label>

          <button
            onClick={() => runImport()}
            disabled={importing}
            style={{ padding: "10px 16px", border: 0, borderRadius: "10px", background: importing ? "#94a3b8" : "#0f172a", color: "#fff", fontWeight: 800 }}
          >
            {importing ? "Importing..." : "Import painting products"}
          </button>
        </div>

        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {lastImportPayload ? (
            <button
              onClick={() => runImport(lastImportPayload)}
              disabled={importing}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #0f172a", background: "#fff", color: "#0f172a", fontWeight: 700 }}
            >
              Retry last import
            </button>
          ) : null}
          {importErrors.length > 0 ? (
            <button
              onClick={exportImportErrors}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontWeight: 700 }}
            >
              Export import errors
            </button>
          ) : null}
        </div>

        {importHistory.length > 0 ? (
          <div style={{ marginBottom: "14px", padding: "10px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "13px", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>Recent imports</div>
            <div style={{ display: "grid", gap: "6px" }}>
              {importHistory.map((h, i) => (
                <div key={`${h.at}-${i}`} style={{ fontSize: "12px", color: "#475569" }}>
                  {new Date(h.at).toLocaleString()} | source: {h.source} | limit: {h.limit} | created: {h.created} | updated: {h.updated} | skipped: {h.skipped}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            style={{ flex: "1 1 260px", minWidth: "220px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name"
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}>
            <option>choisir un plan de tri</option>
            <option value="id">Sort by ID</option>
            <option value="created_at">Sort by date</option>
            <option value="name">Sort by name</option>
            <option value="status">Sort by status</option>
          </select>
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}>
            <option value="desc">DESC</option>
            <option value="asc">ASC</option>
          </select>
          <button
            onClick={async () => {
              setSearch("");
              setSortBy("created_at");
              setSortDir("desc");
              if (page === 1) await loadProducts(1);
              else setPage(1);
            }}
            style={{ padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
          >
            Reset
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>No products found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>Image</th>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Category</th>
                  <th style={{ textAlign: "left" }}>Brand</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>SKU</th>
                  <th style={{ textAlign: "left" }}>Barcode</th>
                  <th style={{ textAlign: "left" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => {
                  const statusKey = p.status ? "active" : "inactive";
                  const thumb = getMainImage(p);

                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td>
                        {thumb ? (
                          <img src={thumb} alt={p.name} style={{ width: "46px", height: "46px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e2e8f0" }} />
                        ) : (
                          <div style={{ width: "46px", height: "46px", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #e2e8f0" }} />
                        )}
                      </td>
                      <td>{p.id}</td>
                      <td><div style={{ fontWeight: 700 }}>{p.name}</div></td>
                      <td>{p.category?.name || "-"}</td>
                      <td>{p.brand?.name || "-"}</td>
                      <td>
                        <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontWeight: 700, fontSize: "12px", ...STATUS_STYLE[statusKey] }}>
                          {statusKey}
                        </span>
                      </td>
                      <td>{p.variants?.[0]?.sku || "-"}</td>
                      <td>{p.variants?.[0]?.barcode || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Link to={`/admin/products/${p.id}/edit`} style={{ padding: "6px 10px", borderRadius: "8px", background: "#0f172a", color: "#fff", fontWeight: 700, textDecoration: "none" }}>
                            Edit
                          </Link>
                          <button onClick={() => deleteProduct(p.id)} style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#ef4444", color: "#fff", fontWeight: 700 }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading ? (
          <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ color: "#475569", fontSize: "14px" }}>
              Total: {pagination.total} products | Page {pagination.current_page} / {pagination.last_page}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: hasPrev ? "#fff" : "#f1f5f9", color: "#0f172a", fontWeight: 700, cursor: hasPrev ? "pointer" : "not-allowed" }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
                disabled={!hasNext}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #0f172a", background: hasNext ? "#0f172a" : "#cbd5e1", color: "#fff", fontWeight: 700, cursor: hasNext ? "pointer" : "not-allowed" }}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
