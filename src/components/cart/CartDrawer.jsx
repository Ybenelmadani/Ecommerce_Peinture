import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Button from "../ui/Button";
import Price from "../ui/Price";
import { useCart } from "../../context/CartContext";

export default function CartDrawer() {
  const nav = useNavigate();
  const { open, setOpen, items, total, updateQty, remove, loading } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-200 bg-white shadow-2xl flex flex-col">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900">Your cart</div>
              <div className="mt-0.5 text-xs font-medium text-slate-500">Fast checkout with secure order flow</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-slate-50/40">
          {loading ? (
            <div className="text-slate-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
              Cart is empty.
              <div className="mt-4">
                <Button onClick={() => setOpen(false)}>Continue shopping</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((it) => {
                const p = it.variant?.product;
                const img = p?.images?.find((i) => i.is_main)?.image_path || p?.images?.[0]?.image_path;
                const subtitle = [it.variant?.color, it.variant?.finish, it.variant?.capacity].filter(Boolean).join(" | ");

                return (
                  <div
                    key={it.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex gap-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
                        {img ? (
                          <img src={img} alt={p?.name || "product"} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-500">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pr-2">
                        <div className="truncate text-3 font-bold text-slate-900">{p?.name || "Product"}</div>
                        <div className="mt-1 text-sm text-slate-500">{subtitle || "Standard variant"}</div>

                        <div className="mt-4 flex items-center gap-3">
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => updateQty(it.id, Math.max(1, Number(e.target.value || 1)))}
                            className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                          />
                          <Button
                            variant="ghost"
                            className="px-3 py-2 text-rose-600 hover:bg-rose-50"
                            onClick={() => remove(it.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="text-right pl-3">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Unit</div>
                        <div className="font-semibold text-slate-900">
                          <Price value={it.unit_price} />
                        </div>
                        <div className="mt-2 text-xs uppercase tracking-wide text-slate-400">Sub</div>
                        <div className="text-lg font-black text-slate-900">
                          {(Number(it.unit_price) * it.quantity).toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="rounded-2xl bg-slate-900 px-4 py-2.5 text-white">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Total</span>
              <span className="text-2xl font-black">{total.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link to="/cart" onClick={() => setOpen(false)}>
              <Button variant="soft" className="w-full border-slate-300">
                View cart
              </Button>
            </Link>
            <Button
              className="w-full"
              onClick={() => {
                setOpen(false);
                nav("/checkout");
              }}
              disabled={items.length === 0}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
