import { useEffect, useState } from "react";
import { http } from "../../api/http";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await http.get("/admin/orders");
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (id, statut) => {
    // IMPORTANT: route correcte => /status
    await http.patch(`/admin/orders/${id}/status`, { statut });
    loadOrders();
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h2>Orders</h2>

      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Change</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.user?.name ?? o.user_id}</td>
              <td>{o.total} USD</td>
              <td><b>{o.statut}</b></td>
              <td>
                <select
                  value={o.statut}
                  onChange={(e) => changeStatus(o.id, e.target.value)}
                >
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                  <option value="shipped">shipped</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}