export default function AdminAlert({ type = "info", children }) {
  const styles = {
    error: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
    success: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
    info: { background: "#e0f2fe", color: "#0c4a6e", border: "1px solid #bae6fd" },
  };

  const style = styles[type] || styles.info;

  return (
    <div style={{ padding: "10px 12px", borderRadius: "10px", marginBottom: "12px", ...style }}>
      {children}
    </div>
  );
}
