import React, { useMemo } from "react";
import Badge from "../ui/Badge";

export default function VariantPicker({ variants = [], value, onChange }) {
  const options = useMemo(() => variants.map(v => ({
    id: v.id,
    label: [v.color, v.finish, v.capacity].filter(Boolean).join(" • ") || `Variant #${v.id}`,
    price: v.price,
    stock: v.stock,
  })), [variants]);

  return (
    <div className="grid gap-2">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
            value === opt.id ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">{opt.label}</div>
            <Badge>{Number(opt.price).toFixed(2)} USD</Badge>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Stock: {opt.stock}
          </div>
        </button>
      ))}
    </div>
  );
}