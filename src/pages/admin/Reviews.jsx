import { useEffect, useState } from "react";
import { http } from "../../api/http";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await http.get("/admin/reviews");
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    await http.delete(`/admin/reviews/${id}`);
    load();
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 14 }}>Reviews</h2>
      {error ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", marginBottom: "12px" }}>
          {error}
        </div>
      ) : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Loading reviews...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th style={{ textAlign: "left" }}>User</th>
                  <th style={{ textAlign: "left" }}>Product</th>
                  <th style={{ textAlign: "left" }}>Rating</th>
                  <th style={{ textAlign: "left" }}>Comment</th>
                  <th style={{ textAlign: "left" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td>{r.id}</td>
                    <td>
                      {r.user?.name || "-"} <br />
                      <small>{r.user?.email || ""}</small>
                    </td>
                    <td>{r.product?.name || "-"}</td>
                    <td><span style={{ padding: "4px 10px", borderRadius: "999px", background: "#e2e8f0", fontWeight: 700, fontSize: "12px" }}>{r.rating}</span></td>
                    <td style={{ maxWidth: 420 }}>{r.comment}</td>
                    <td>
                      <button style={{ padding: "6px 12px", border: 0, borderRadius: "8px", background: "#ef4444", color: "#fff", fontWeight: 700 }} onClick={() => remove(r.id)}>Delete</button>
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
