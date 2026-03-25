import React from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { resolveMediaUrl } from "../utils/media";
import { formatMoney } from "../utils/currency";
import { useI18n } from "../context/I18nContext";

function getProductPrice(product) {
  const variant = product?.variants?.find((entry) => Number(entry?.stock) > 0) || product?.variants?.[0];
  return Number(variant?.price || 0);
}

function getProductVariantId(product) {
  const variant = product?.variants?.find((entry) => Number(entry?.stock) > 0) || product?.variants?.[0];
  return variant?.id || null;
}

export default function MyWishlist() {
  const { items, loading, remove } = useWishlist();
  const { add } = useCart();
  const { pick } = useI18n();
  const ui = pick({
    fr: {
      title: "Ma liste d'envies",
      subtitle: "Retrouvez vos produits preferes et ajoutez-les rapidement au panier.",
      empty: "Votre liste d'envies est vide pour le moment.",
      browse: "Decouvrir les produits",
      loading: "Chargement...",
      addToCart: "Ajouter au panier",
      remove: "Retirer",
      noImage: "Aucune image",
    },
    en: {
      title: "My Wishlist",
      subtitle: "Keep your favorite products close and add them to cart quickly.",
      empty: "Your wishlist is empty for now.",
      browse: "Browse products",
      loading: "Loading...",
      addToCart: "Add to cart",
      remove: "Remove",
      noImage: "No image",
    },
    ar: {
      title: "مفضلتي",
      subtitle: "احتفظ بمنتجاتك المفضلة وأضفها إلى السلة بسرعة.",
      empty: "قائمة المفضلة فارغة حاليا.",
      browse: "تصفح المنتجات",
      loading: "جارٍ التحميل...",
      addToCart: "أضف إلى السلة",
      remove: "إزالة",
      noImage: "لا توجد صورة",
    },
  });

  if (loading) {
    return <div className="mx-auto max-w-6xl p-6 text-sm text-slate-600">{ui.loading}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-rose-50 to-white px-6 py-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <Heart size={22} />
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{ui.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{ui.subtitle}</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">{ui.empty}</p>
          <Link
            to="/products"
            className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {ui.browse}
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((item) => {
            const product = item.product;
            const price = getProductPrice(product);
            const variantId = getProductVariantId(product);
            const image = resolveMediaUrl(
              product?.images?.find((entry) => entry.is_main)?.image_path || product?.images?.[0]?.image_path
            );

            return (
              <div
                key={item.id}
                className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[120px_1fr_auto]"
              >
                <Link to={`/products/${product?.id}`} className="overflow-hidden rounded-2xl bg-slate-100">
                  {image ? (
                    <img src={image} alt={product?.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-[120px] items-center justify-center text-sm text-slate-400">{ui.noImage}</div>
                  )}
                </Link>

                <div className="min-w-0">
                  <div className="text-xs text-slate-500">
                    {product?.brand?.name} | {product?.category?.name}
                  </div>
                  <Link to={`/products/${product?.id}`} className="mt-1 block text-lg font-bold text-slate-900 hover:underline">
                    {product?.name}
                  </Link>
                  <div className="mt-2 text-base font-extrabold text-slate-900">{formatMoney(price)}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    className="gap-2"
                    onClick={() => {
                      if (variantId) add(variantId, 1);
                    }}
                    disabled={!variantId}
                  >
                    <ShoppingCart size={16} />
                    {ui.addToCart}
                  </Button>
                  <Button variant="soft" onClick={() => remove(product?.id)}>
                    {ui.remove}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
