import React from "react";

export default function Button({ className="", variant="primary", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99]";
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    soft: "bg-white text-slate-900 hover:bg-slate-100 border border-slate-200",
    ghost: "text-slate-700 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}