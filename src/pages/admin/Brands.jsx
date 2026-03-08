import { useEffect, useState } from "react";
import { http } from "../../api/http";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 25,
  });

  const loadBrands = async (targetPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const res = await http.get("/admin/brands", {
        params: {
          page: targetPage,
          per_page: pagination.per_page,
          q: search.trim() || undefined,
        },
      });

      const payload = res?.data ?? {};
      setBrands(Array.isArray(payload.data) ? payload.data : []);
      setPagination({
        current_page: Number(payload.current_page) || targetPage,
        last_page: Number(payload.last_page) || 1,
        total: Number(payload.total) || 0,
        per_page: Number(payload.per_page) || pagination.per_page,
      });
    } catch {
      setError("Failed to load brands.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands(page);
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) {
        loadBrands(1);
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  const createBrand = async () => {
    const cleanName = name.trim();
    if (!cleanName) return;

    setError("");
    setSuccess("");

    try {
      await http.post("/admin/brands", {
        name: cleanName,
        description: description.trim() || null,
      });

      setName("");
      setDescription("");
      setSuccess("Brand created successfully.");

      await loadBrands(page === 1 ? 1 : page);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || "Failed to create brand.");
    }
  };

  const startEdit = (brand) => {
    setEditingId(brand.id);
    setEditName(brand.name || "");
    setEditDescription(brand.description || "");
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const saveEdit = async (id) => {
    const cleanName = editName.trim();
    if (!cleanName) return;

    setError("");
    setSuccess("");

    try {
      await http.put(`/admin/brands/${id}`, {
        name: cleanName,
        description: editDescription.trim() || null,
      });

      setSuccess("Brand updated successfully.");
      cancelEdit();
      await loadBrands(page);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || "Failed to update brand.");
    }
  };

  const deleteBrand = async (id) => {
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/brands/${id}`);
      setSuccess("Brand deleted successfully.");

      if (brands.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadBrands(page);
      }
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || "Failed to delete brand.");
    }
  };

  const hasPrev = pagination.current_page > 1;
  const hasNext = pagination.current_page < pagination.last_page;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", marginBottom: "14px" }}>Brands</h2>

      {error ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", marginBottom: "12px" }}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#dcfce7", color: "#166534", marginBottom: "12px" }}>
          {success}
        </div>
      ) : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "16px", display: "grid", gap: "10px", gridTemplateColumns: "2fr 2fr auto" }}>
          <input
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Brand name"
          />

          <input
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
          />

          <button
            onClick={createBrand}
            style={{ padding: "10px 16px", border: 0, borderRadius: "10px", background: "#0369a1", color: "#fff", fontWeight: 700 }}
          >
            Add Brand
          </button>
        </div>

        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand by name"
            style={{ width: "320px", maxWidth: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <button
            onClick={async () => {
              setSearch("");
              if (page === 1) await loadBrands(1);
              else setPage(1);
            }}
            style={{ padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
          >
            Reset
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Loading brands...</div>
        ) : brands.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>No brands found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Description</th>
                  <th style={{ textAlign: "left" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {brands.map((b) => {
                  const isEditing = editingId === b.id;

                  return (
                    <tr key={b.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td>{b.id}</td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                          />
                        ) : (
                          b.name
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                          />
                        ) : (
                          b.description || "-"
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => saveEdit(b.id)}
                              style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#0369a1", color: "#fff", fontWeight: 700 }}
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => startEdit(b)}
                              style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#0f172a", color: "#fff", fontWeight: 700 }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteBrand(b.id)}
                              style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#ef4444", color: "#fff", fontWeight: 700 }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
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
              Total: {pagination.total} brands | Page {pagination.current_page} / {pagination.last_page}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: hasPrev ? "#fff" : "#f1f5f9",
                  color: "#0f172a",
                  fontWeight: 700,
                  cursor: hasPrev ? "pointer" : "not-allowed",
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
                disabled={!hasNext}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #0f172a",
                  background: hasNext ? "#0f172a" : "#cbd5e1",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: hasNext ? "pointer" : "not-allowed",
                }}
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
