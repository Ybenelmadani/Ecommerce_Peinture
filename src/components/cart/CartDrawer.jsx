import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatEuro } from "../../utils/currency";
import { resolveMediaUrl } from "../../utils/media";

const SHIPPING_FEE = 7.9;

export default function CartDrawer() {
  const nav = useNavigate();
  const { open, setOpen, items, total, updateQty, remove, loading } = useCart();

  const articleCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  if (!open) return null;

  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const grandTotal = total + shipping;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" onClick={() => setOpen(false)} />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col border-l border-black/5 bg-[#f7f5f2] shadow-[0_20px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between px-5 py-4 sm:px-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-500">Mini panier</p>
            <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.16em] text-slate-900">Votre panier</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-slate-600 transition hover:bg-white hover:text-slate-900"
            aria-label="Fermer le panier"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 pb-5 sm:px-7">
          {loading ? (
            <div className="rounded-[24px] bg-white px-5 py-8 text-center text-slate-500">Chargement...</div>
          ) : items.length === 0 ? (
            <div className="rounded-[24px] bg-white px-5 py-8 text-center text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <p>Votre panier est vide.</p>
              <Link
                to="/products"
                onClick={() => setOpen(false)}
                className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-[14px] bg-[#2f2d31] px-6 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#232126]"
              >
                Continuer vos achats
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = item.variant?.product;
                const image = resolveMediaUrl(
                  product?.images?.find((entry) => entry.is_main)?.image_path || product?.images?.[0]?.image_path
                );
                const lineTotal = Number(item.unit_price || 0) * Number(item.quantity || 0);
                const variantLabel = [item.variant?.color, item.variant?.finish, item.variant?.capacity].filter(Boolean).join(" | ");

                return (
                  <div key={item.id} className="rounded-[26px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                    <div className="flex gap-4">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#f2efea]">
                        {image ? (
                          <img src={image} alt={product?.name || "Produit"} className="h-full w-full object-contain p-2" />
                        ) : (
                          <div className="text-xs font-medium text-slate-400">No image</div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold uppercase leading-6 text-slate-900">
                          {product?.name || "Produit"}
                        </p>
                        {variantLabel ? <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{variantLabel}</p> : null}
                        <p className="mt-3 text-xl font-semibold text-slate-900">{formatEuro(item.unit_price)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex h-12 items-center rounded-full bg-[#f1efed] px-2">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
                          aria-label="Diminuer la quantite"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-[34px] text-center text-lg font-semibold text-slate-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
                          aria-label="Augmenter la quantite"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-lg font-semibold text-slate-900">{formatEuro(lineTotal)}</p>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Supprimer cet article"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-black/10 bg-white/70 px-5 py-5 backdrop-blur sm:px-7">
          <div className="rounded-[28px] bg-[#efedeb] p-5">
            <div className="flex items-center justify-between text-base text-slate-700">
              <span>{articleCount} {articleCount > 1 ? "articles" : "article"}</span>
              <span className="font-semibold">{formatEuro(total)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-base text-slate-700">
              <span>Livraison</span>
              <span className="font-semibold">{formatEuro(shipping)}</span>
            </div>
            <div className="my-5 h-px bg-black/10" />
            <div className="flex items-center justify-between">
              <span className="text-xl text-slate-900">Total</span>
              <span className="text-[2rem] font-semibold leading-none text-slate-900">{formatEuro(grandTotal)}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[62px] w-full items-center justify-center rounded-[8px] bg-[#d8d5d2] px-6 text-lg font-semibold uppercase tracking-wide text-white transition hover:bg-[#c9c6c2]"
            >
              Voir le panier
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                nav("/checkout");
              }}
              disabled={items.length === 0}
              className="inline-flex min-h-[62px] w-full items-center justify-center rounded-[8px] bg-[#2f2d31] px-6 text-lg font-semibold uppercase tracking-wide text-white transition hover:bg-[#232126] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check-out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
