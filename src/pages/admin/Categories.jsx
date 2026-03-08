import { useEffect, useState } from "react";
import { http } from "../../api/http";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editParentId, setEditParentId] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 25,
  });

  const loadCategories = async (targetPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const res = await http.get("/admin/categories", {
        params: {
          page: targetPage,
          per_page: pagination.per_page,
          q: search.trim() || undefined,
        },
      });

      const payload = res?.data ?? {};
      setCategories(Array.isArray(payload.data) ? payload.data : []);
      setPagination({
        current_page: Number(payload.current_page) || targetPage,
        last_page: Number(payload.last_page) || 1,
        total: Number(payload.total) || 0,
        per_page: Number(payload.per_page) || pagination.per_page,
      });
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const loadParentOptions = async () => {
    try {
      const res = await http.get("/admin/categories", {
        params: {
          page: 1,
          per_page: 100,
        },
      });
      const payload = res?.data ?? {};
      setParentOptions(Array.isArray(payload.data) ? payload.data : []);
    } catch {
      // Keep silent to avoid blocking page use.
    }
  };

  useEffect(() => {
    loadCategories(page);
  }, [page]);

  useEffect(() => {
    loadParentOptions();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) {
        loadCategories(1);
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  const createCategory = async () => {
    const cleanName = name.trim();
    if (!cleanName) return;

    setError("");
    setSuccess("");

    try {
      await http.post("/admin/categories", {
        name: cleanName,
        description: description.trim() || null,
        parent_id: parentId ? Number(parentId) : null,
      });

      setName("");
      setDescription("");
      setParentId("");
      setSuccess("Category created successfully.");

      await loadCategories(page === 1 ? 1 : page);
      await loadParentOptions();
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || "Failed to create category.");
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name || "");
    setEditDescription(cat.description || "");
    setEditParentId(cat.parent_id ? String(cat.parent_id) : "");
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditParentId("");
  };

  const saveEdit = async (id) => {
    const cleanName = editName.trim();
    if (!cleanName) return;

    setError("");
    setSuccess("");

    try {
      await http.put(`/admin/categories/${id}`, {
        name: cleanName,
        description: editDescription.trim() || null,
        parent_id: editParentId ? Number(editParentId) : null,
      });

      setSuccess("Category updated successfully.");
      cancelEdit();
      await loadCategories(page);
      await loadParentOptions();
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || "Failed to update category.");
    }
  };

  const deleteCategory = async (id) => {
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/categories/${id}`);
      setSuccess("Category deleted successfully.");

      if (categories.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadCategories(page);
      }
      await loadParentOptions();
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || "Failed to delete category.");
    }
  };

  const hasPrev = pagination.current_page > 1;
  const hasNext = pagination.current_page < pagination.last_page;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", marginBottom: "14px" }}>Categories</h2>

      {error ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", marginBottom: "12px" }}>{error}</div>
      ) : null}

      {success ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#dcfce7", color: "#166534", marginBottom: "12px" }}>{success}</div>
      ) : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "16px", display: "grid", gap: "10px", gridTemplateColumns: "2fr 2fr 1.2fr auto" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
          >
            <option value="">No parent</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={createCategory}
            style={{ padding: "10px 16px", border: 0, borderRadius: "10px", background: "#0369a1", color: "#fff", fontWeight: 700 }}
          >
            Add Category
          </button>
        </div>

        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category by name"
            style={{ width: "320px", maxWidth: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <button
            onClick={async () => {
              setSearch("");
              if (page === 1) await loadCategories(1);
              else setPage(1);
            }}
            style={{ padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
          >
            Reset
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>No categories found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Description</th>
                  <th style={{ textAlign: "left" }}>Parent</th>
                  <th style={{ textAlign: "left" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;

                  return (
                    <tr key={cat.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td>{cat.id}</td>

                      <td>
                        {isEditing ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                          />
                        ) : (
                          cat.name
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
                          cat.description || "-"
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <select
                            value={editParentId}
                            onChange={(e) => setEditParentId(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff" }}
                          >
                            <option value="">No parent</option>
                            {parentOptions
                              .filter((c) => c.id !== cat.id)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                          </select>
                        ) : (
                          cat.parent?.name || "-"
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => saveEdit(cat.id)}
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
                              onClick={() => startEdit(cat)}
                              style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#0f172a", color: "#fff", fontWeight: 700 }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCategory(cat.id)}
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
              Total: {pagination.total} categories | Page {pagination.current_page} / {pagination.last_page}
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
