import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ShoppingCart } from "lucide-react";
import Button from "../ui/Button";
import { useCart } from "../../context/CartContext";
import { CatalogAPI } from "../../api/catalog";
import { resolveMediaUrl } from "../../utils/media";

export default function ProductCard({ p }) {
  const { add } = useCart();
  const [adding, setAdding] = useState(false);

  const mainImg = resolveMediaUrl(
    p.images?.find((i) => i.is_main)?.image_path || p.images?.[0]?.image_path
  );
  const firstAvailableVariant = p.variants?.find((v) => Number(v.stock) > 0) || p.variants?.[0] || null;

  const resolveVariantId = async () => {
    if (firstAvailableVariant?.id) return firstAvailableVariant.id;

    const fullProduct = await CatalogAPI.product(p.id);
    const fallbackVariant =
      fullProduct?.variants?.find((v) => Number(v.stock) > 0) || fullProduct?.variants?.[0] || null;

    return fallbackVariant?.id || null;
  };

  const handleAddToCart = async () => {
    if (adding) return;

    setAdding(true);
    try {
      const variantId = await resolveVariantId();
      if (!variantId) {
        alert("No variant available for this product.");
        return;
      }
      await add(variantId, 1);
    } catch (error) {
      console.error("Add to cart failed:", error);
      alert("Unable to add to cart right now.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        <Link to={`/products/${p.id}`} className="block">
          <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
            {mainImg ? (
              <img
                src={mainImg}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">No image</div>
            )}
          </div>
        </Link>

        <Link
          to={`/products/${p.id}`}
          aria-label={`View ${p.name}`}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition-colors hover:bg-slate-900 hover:text-white"
        >
          <Eye size={17} />
        </Link>
      </div>

      <div className="p-4">
        <div className="text-xs text-slate-500">
          {p.brand?.name} | {p.category?.name}
        </div>
        <div className="mt-1 font-bold">{p.name}</div>

        <div className="mt-2 text-slate-700">
          <span className="text-sm">See variants</span>
        </div>

        <div className="mt-4">
          <Button className="w-full gap-2" onClick={handleAddToCart} disabled={adding}>
            <ShoppingCart size={16} />
            {adding ? "Adding..." : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
