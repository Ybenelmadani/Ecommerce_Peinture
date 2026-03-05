import { useEffect, useState } from "react";
import { http } from "../../api/http";

export default function ProductsAdmin() {

  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await http.get("/admin/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async () => {
    if (!name.trim()) return;

    await http.post("/admin/products", {
      name: name.trim(),
      description: "",
      status: true,
      category_id: 1,
      brand_id: 1
    });

    setName("");
    loadProducts();
  };

  const deleteProduct = async (id) => {
    await http.delete(`/admin/products/${id}`);
    loadProducts();
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

      <h2 style={{
        fontSize: "28px",
        fontWeight: 900,
        color: "#0f172a",
        marginBottom: "14px"
      }}>
        Products
      </h2>

      {error ? (
        <div style={{
          padding: "10px 12px",
          borderRadius: "10px",
          background: "#fee2e2",
          color: "#991b1b",
          marginBottom: "12px"
        }}>
          {error}
        </div>
      ) : null}

      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e2e8f0"
      }}>

        <div style={{
          marginBottom: "16px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap"
        }}>

          <input
            style={{
              flex: "1 1 260px",
              minWidth: "220px",
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px"
            }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
          />

          <button
            onClick={createProduct}
            style={{
              padding: "10px 16px",
              border: 0,
              borderRadius: "10px",
              background: "#0369a1",
              color: "#fff",
              fontWeight: 700
            }}
          >
            Add Product
          </button>

        </div>

        {loading ? (
          <div style={{
            padding: "8px 4px",
            color: "#64748b",
            fontWeight: 600
          }}>
            Loading products...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>

              <thead>
                <tr style={{
                  background: "#f8fafc",
                  color: "#334155"
                }}>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{
                    borderTop: "1px solid #e2e8f0"
                  }}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        style={{
                          padding: "6px 12px",
                          border: 0,
                          borderRadius: "8px",
                          background: "#ef4444",
                          color: "#fff",
                          fontWeight: 700
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

    </div>
  );
}