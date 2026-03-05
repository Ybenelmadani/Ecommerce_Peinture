import { useEffect, useState } from "react";
import { http } from "../../api/http";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await http.get("/admin/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    await http.patch(`/admin/users/${id}/role`, { role });
    load();
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 14 }}>Users</h2>
      {error ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", marginBottom: "12px" }}>
          {error}
        </div>
      ) : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Loading users...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Email</th>
                  <th style={{ textAlign: "left" }}>Role</th>
                  <th style={{ textAlign: "left" }}>Phone</th>
                  <th style={{ textAlign: "left" }}>Address</th>
                  <th style={{ textAlign: "left" }}>Change role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span style={{ padding: "4px 10px", borderRadius: "999px", background: "#e2e8f0", fontWeight: 700, fontSize: "12px" }}>{u.role}</span></td>
                    <td>{u.phone || "-"}</td>
                    <td>{u.address || "-"}</td>
                    <td>
                      <button
                        style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#f59e0b", color: "#fff", fontWeight: 700, marginRight: "8px" }}
                        onClick={() => changeRole(u.id, "user")}
                        disabled={u.role === "user"}
                      >
                        User
                      </button>{" "}
                      <button
                        style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#0284c7", color: "#fff", fontWeight: 700 }}
                        onClick={() => changeRole(u.id, "admin")}
                        disabled={u.role === "admin"}
                      >
                        Admin
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
