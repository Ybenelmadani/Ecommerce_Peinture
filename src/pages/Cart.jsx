import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Price from "../components/ui/Price";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const nav = useNavigate();
  const { items, total, updateQty, remove, clear } = useCart();

  return (
    <Container className="py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black">Cart</h1>
          <p className="text-sm text-slate-600 mt-1">Review your items.</p>
        </div>
        <Button variant="soft" onClick={clear}>Clear</Button>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="text-slate-600">Your cart is empty.</div>
          <Link to="/products"><Button className="mt-4">Shop products</Button></Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            {items.map(it => (
              <div key={it.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-4">
                <div className="min-w-[90px] h-[70px] rounded-xl bg-slate-100 overflow-hidden">
                  {/* image depuis product */}
                  {it.variant?.product?.images?.[0]?.image_path ? (
                    <img src={it.variant.product.images[0].image_path} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>

                <div className="flex-1">
                  <div className="font-bold">{it.variant?.product?.name || "Product"}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Variant: {[it.variant?.color, it.variant?.finish, it.variant?.capacity].filter(Boolean).join(" • ")}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e)=>updateQty(it.id, Math.max(1, Number(e.target.value || 1)))}
                      className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                    <Button variant="ghost" onClick={() => remove(it.id)}>Remove</Button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Unit</div>
                  <Price value={it.unit_price} />
                  <div className="mt-2 text-xs text-slate-500">Subtotal</div>
                  <div className="font-semibold">
                    {(Number(it.unit_price) * it.quantity).toFixed(2)} USD
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="font-semibold">Summary</div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-600">Total</span>
                <span className="text-lg font-black">{total.toFixed(2)} USD</span>
              </div>

              <Button className="mt-5 w-full" onClick={() => nav("/checkout")}>
                Go to checkout
              </Button>

              <Link to="/products" className="block mt-3">
                <Button variant="soft" className="w-full">Continue shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}