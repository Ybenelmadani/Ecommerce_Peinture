import { useEffect, useState } from "react";
import { http } from "../../api/http";

export default function Dashboard(){

    const [stats, setStats] = useState({ orders: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await http.get("/admin/orders");

            setStats({
                orders: Array.isArray(res.data) ? res.data.length : 0
            });
        } catch {
            setError("Failed to load dashboard stats.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div
                style={{
                    marginBottom: 22
                }}
            >
                    <h1
                        style={{
                            margin: 0,
                            fontSize: 34,
                            fontWeight: 900,
                            letterSpacing: "-0.02em",
                            color: "#0f172a"
                        }}
                    >
                        Admin Dashboard
                    </h1>
                    <p
                        style={{
                            margin: "8px 0 0",
                            color: "#475569",
                            fontSize: 15
                        }}
                    >
                        Quick overview of your store activity.
                    </p>
            </div>

            {error ? (
                <div
                    style={{
                        marginBottom: 16,
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "#fee2e2",
                        color: "#991b1b",
                        border: "1px solid #fecaca"
                    }}
                >
                    {error}
                </div>
            ) : null}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 18
                }}
            >
                <div
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: 20,
                        padding: 22,
                        background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
                        color: "#fff",
                        boxShadow: "0 16px 34px rgba(2, 132, 199, 0.3)"
                    }}
                >
                    <div
                        style={{
                            fontSize: 14,
                            opacity: 0.95,
                            marginBottom: 8
                        }}
                    >
                        Total Orders
                    </div>
                    <div
                        style={{
                            fontSize: 44,
                            fontWeight: 900,
                            lineHeight: 1
                        }}
                    >
                        {loading ? "..." : stats.orders}
                    </div>
                    <div
                        style={{
                            marginTop: 10,
                            fontSize: 13,
                            opacity: 0.9
                        }}
                    >
                        Up to date with the latest data
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            width: 150,
                            height: 150,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.17)",
                            top: -35,
                            right: -30
                        }}
                    />
                </div>

                <div
                    style={{
                        borderRadius: 20,
                        padding: 22,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)"
                    }}
                >
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#0f172a",
                            marginBottom: 10
                        }}
                    >
                        Status
                    </div>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "7px 11px",
                            borderRadius: 999,
                            background: loading ? "#fff7ed" : "#dcfce7",
                            color: loading ? "#9a3412" : "#166534",
                            fontWeight: 700,
                            fontSize: 13
                        }}
                    >
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: loading ? "#f97316" : "#22c55e"
                            }}
                        />
                        {loading ? "Updating stats..." : "Dashboard ready"}
                    </div>
                </div>
            </div>
        </div>
    );
}
