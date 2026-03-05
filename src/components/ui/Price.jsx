import React from "react";

export default function Price({ value }) {
  const n = Number(value || 0);
  return <span className="font-semibold">{n.toFixed(2)} USD</span>;
}