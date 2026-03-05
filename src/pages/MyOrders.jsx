import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { useAuth } from "../context/AuthContext";

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatAmount = (value) => Number(value || 0).toFixed(2);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const statusClass = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized.includes("delivered") || normalized.includes("paid")) {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }
    if (normalized.includes("pending")) {
      return "bg-amber-50 text-amber-700 ring-amber-200";
    }
    if (normalized.includes("cancel")) {
      return "bg-rose-50 text-rose-700 ring-rose-200";
    }
    return "bg-slate-100 text-slate-700 ring-slate-200";
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/orders");
        setOrders(res.data?.data || res.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
          Please login.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8 text-white shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">My Orders</h1>
        <p className="mt-2 text-sm text-slate-200">
          Track your purchases, status, and order details in one place.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          Loading...
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          No orders yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-black text-slate-900">Order #{o.id}</div>
                    {o.status ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(
                          o.status
                        )}`}
                      >
                        {o.status}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Placed on {formatDate(o.created_at)}
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {formatAmount(o.total_amount || o.total)} USD
                  </div>
                </div>
              </div>

              {o.items?.length ? (
                <div className="px-5 py-4">
                  <div className="mb-3 text-sm font-semibold text-slate-900">Items</div>
                  <ul className="space-y-2">
                    {o.items.map((it) => (
                      <li
                        key={it.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm"
                      >
                        <span className="text-slate-700">
                          {it.product_name || it.product?.name || "Product"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          Qty: {it.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
