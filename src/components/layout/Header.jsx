import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CatalogAPI } from "../../api/catalog";
import logoFinal from "../../assets/logo-adwart-final.svg";
import { formatEuro } from "../../utils/currency";
import { resolveMediaUrl } from "../../utils/media";

const MENU_ITEMS = ["Color", "Surface", "Brushes", "Studio", "Brands", "Gifts", "Offers"];
const SHIPPING_FEE = 7.9;

const MENU_KEYWORDS = {
  Color: ["color", "water", "aqua", "oil", "acry", "gouache", "pastel", "paint"],
  Surface: ["surface", "canvas", "paper", "block", "board", "sketch"],
  Brushes: ["brush"],
  Studio: ["studio", "easel", "palette", "tool", "medium", "solvent", "varnish"],
  Brands: [],
  Gifts: ["gift", "set", "kit", "box"],
  Offers: ["offer", "sale", "promo", "deal"],
};

function normalize(text = "") {
  return String(text).toLowerCase();
}

function byKeywords(name, keywords) {
  if (!keywords.length) return true;
  const normalizedName = normalize(name);
  return keywords.some((keyword) => normalizedName.includes(keyword));
}

function canShowCartPreview() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)").matches;
}

function getProductImage(item) {
  const product = item.variant?.product;
  const mainImage = product?.images?.find((image) => image.is_main)?.image_path;
  return resolveMediaUrl(mainImage || product?.images?.[0]?.image_path);
}

export default function Header() {
  const headerRef = useRef(null);
  const cartHoverTimeoutRef = useRef(null);
  const nav = useNavigate();
  const { items, total, setOpen } = useCart();
  const { user, logout } = useAuth();

  const [q, setQ] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [panelLeft, setPanelLeft] = useState(16);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    CatalogAPI.categories().then((data) => setCategories(Array.isArray(data) ? data : [])).catch(() => {});
    CatalogAPI.brands().then((data) => setBrands(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (cartHoverTimeoutRef.current) {
        clearTimeout(cartHoverTimeoutRef.current);
      }
    };
  }, []);

  const topCategories = useMemo(() => categories.filter((category) => !category.parent_id), [categories]);
  const subCategories = useMemo(() => categories.filter((category) => Boolean(category.parent_id)), [categories]);
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );
  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const grandTotal = total + shipping;
  const previewItems = useMemo(() => items.slice(0, 2), [items]);

  const dynamicData = useMemo(() => {
    const menu = activeMenu || "Color";
    const keywords = MENU_KEYWORDS[menu] || [];

    const leftRaw = menu === "Brands" ? [] : topCategories.filter((category) => byKeywords(category.name, keywords));
    const midRaw = menu === "Brands" ? [] : subCategories.filter((category) => byKeywords(category.name, keywords));
    const rightRaw = brands;

    const left = (leftRaw.length ? leftRaw : topCategories).slice(0, 6);
    const mid = (midRaw.length ? midRaw : subCategories.length ? subCategories : topCategories).slice(0, 6);
    const right = rightRaw.slice(0, 6);

    return { left, mid, right, menu };
  }, [activeMenu, topCategories, subCategories, brands]);

  const closeCartPreview = () => {
    if (cartHoverTimeoutRef.current) {
      clearTimeout(cartHoverTimeoutRef.current);
      cartHoverTimeoutRef.current = null;
    }
    setCartPreviewOpen(false);
  };

  const goSearch = () => {
    nav(`/products?q=${encodeURIComponent(q.trim())}`);
    setActiveMenu(null);
    closeCartPreview();
  };

  const goByCategory = (categoryId) => {
    nav(`/products?category_id=${categoryId}`);
    setActiveMenu(null);
    closeCartPreview();
  };

  const goByBrand = (brandId) => {
    nav(`/products?brand_id=${brandId}`);
    setActiveMenu(null);
    closeCartPreview();
  };

  const openMenuAtHoveredItem = (item, targetEl) => {
    closeCartPreview();
    setActiveMenu(item);

    if (!headerRef.current || !targetEl) return;

    const headerRect = headerRef.current.getBoundingClientRect();
    const buttonRect = targetEl.getBoundingClientRect();
    const panelWidth = Math.min(window.innerWidth * 0.94, 980);

    const desiredLeft = buttonRect.left - headerRect.left - 42;
    const minLeft = 12;
    const maxLeft = Math.max(minLeft, headerRect.width - panelWidth - 12);
    const safeLeft = Math.min(maxLeft, Math.max(minLeft, desiredLeft));

    setPanelLeft(safeLeft);
  };

  const openCartPreview = () => {
    if (!canShowCartPreview()) return;
    if (cartHoverTimeoutRef.current) {
      clearTimeout(cartHoverTimeoutRef.current);
      cartHoverTimeoutRef.current = null;
    }
    setActiveMenu(null);
    setCartPreviewOpen(true);
  };

  const scheduleCartPreviewClose = () => {
    if (!canShowCartPreview()) return;
    if (cartHoverTimeoutRef.current) {
      clearTimeout(cartHoverTimeoutRef.current);
    }
    cartHoverTimeoutRef.current = setTimeout(() => {
      setCartPreviewOpen(false);
    }, 120);
  };

  const handleCartButtonClick = () => {
    if (canShowCartPreview()) {
      closeCartPreview();
      nav("/cart");
      return;
    }
    setOpen(true);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-slate-200 bg-white"
      onMouseLeave={() => {
        setActiveMenu(null);
        closeCartPreview();
      }}
    >
      <div className="mx-auto flex h-[66px] w-full max-w-[1380px] min-w-0 items-center gap-3 overflow-visible px-3 md:px-5">
        <Link to="/" className="shrink-0 min-w-[120px] rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 md:min-w-[150px]">
          <img
            src={logoFinal}
            alt="Adwart"
            className="h-9 w-auto md:h-10"
            style={{ filter: "saturate(1.25) contrast(1.15)" }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
              const fallback = event.currentTarget.nextElementSibling;
              if (fallback) fallback.style.display = "inline-block";
            }}
          />
          <span className="hidden text-2xl font-black italic tracking-tight text-slate-900 md:text-3xl">Adwart</span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-3 md:flex lg:gap-4 xl:gap-6">
          {MENU_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              onMouseEnter={(event) => openMenuAtHoveredItem(item, event.currentTarget)}
              onFocus={(event) => openMenuAtHoveredItem(item, event.currentTarget)}
              className={`text-[15px] font-semibold uppercase tracking-wide transition ${
                activeMenu === item ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden w-[240px] lg:block xl:w-[320px]">
            <input
              type="text"
              placeholder="Search art materials"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && goSearch()}
              className="h-11 w-full rounded-full border border-slate-300 bg-white pl-4 pr-11 text-sm placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={goSearch}
              className="absolute right-2 top-1/2 rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              style={{ transform: "translateY(-50%)" }}
            >
              <Search size={18} />
            </button>
          </div>

          {user ? (
            <>
              {String(user?.role || "").toLowerCase() === "admin" && (
                <Link
                  to="/admin"
                  className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 lg:inline-flex"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 lg:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 lg:inline-flex"
            >
              Login
            </Link>
          )}

          <div className="relative" onMouseEnter={openCartPreview} onMouseLeave={scheduleCartPreviewClose}>
            <button
              onClick={handleCartButtonClick}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 transition hover:bg-slate-100"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {cartPreviewOpen && canShowCartPreview() && (
              <div className="absolute right-2 top-[calc(100%+12px)] w-[276px] max-w-[calc(100vw-40px)] rounded-[15px] border border-black/5 bg-[#f7f5f2] p-3 shadow-[0_16px_42px_rgba(15,23,42,0.15)]">
                {items.length === 0 ? (
                  <div className="rounded-[13px] bg-white px-4 py-5 text-center shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                    <p className="text-sm text-slate-600">Votre panier est vide.</p>
                    <Link
                      to="/products"
                      onClick={closeCartPreview}
                      className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-[8px] bg-[#2f2d31] px-4 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#232126]"
                    >
                      Continuer vos achats
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {previewItems.map((item) => {
                        const image = getProductImage(item);

                        return (
                          <div key={item.id} className="flex gap-2.5 rounded-[13px] bg-white p-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                            <div className="ml-1 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#f2efea]">
                              {image ? (
                                <img src={image} alt={item.variant?.product?.name || "Produit"} className="h-full w-full object-contain p-1" />
                              ) : (
                                <div className="text-xs font-medium text-slate-400">No image</div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1 pr-1">
                              <p className="text-[11px] font-semibold uppercase leading-5 text-slate-800">
                                {item.variant?.product?.name || "Produit"}
                              </p>
                              <p className="mt-1 text-[12px] font-semibold text-slate-900">{formatEuro(item.unit_price)}</p>
                            </div>
                          </div>
                        );
                      })}

                      {items.length > previewItems.length ? (
                        <p className="px-1 text-xs text-slate-500">+ {items.length - previewItems.length} autre(s) article(s)</p>
                      ) : null}
                    </div>

                    <div className="my-3.5 h-px bg-black/10" />

                    <div className="space-y-2 text-[14px] text-slate-500">
                      <div className="flex items-center justify-between gap-3">
                        <span>Sous-Total</span>
                        <span className="font-semibold text-slate-900">{formatEuro(total)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Livraison</span>
                        <span className="font-semibold text-slate-900">{formatEuro(shipping)}</span>
                      </div>
                    </div>

                    <div className="my-3.5 h-px bg-black/10" />

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[16px] text-slate-700">Total</span>
                      <span className="text-[1.55rem] font-semibold leading-none text-slate-900">{formatEuro(grandTotal)}</span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Link
                        to="/cart"
                        onClick={closeCartPreview}
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[8px] bg-[#d8d5d2] px-4 text-[12px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#c9c6c2]"
                      >
                        Voir le panier
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          closeCartPreview();
                          nav("/checkout");
                        }}
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[8px] bg-[#2f2d31] px-4 text-[12px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#232126]"
                      >
                        Check-out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeMenu && (
        <div
          className="absolute top-[66px] z-50 w-[94vw] max-w-[980px] border border-slate-300 bg-white shadow-xl"
          style={{ left: `${panelLeft}px` }}
        >
          <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-3 md:gap-10 md:p-7">
            <div>
              <div className="border-b border-slate-200 pb-2 text-xs font-bold uppercase text-slate-800">
                {dynamicData.menu.toUpperCase()} Categories
              </div>
              <ul className="mt-4 space-y-2 text-[17px] text-slate-600">
                {dynamicData.left.map((item) => (
                  <li key={`left-${item.id}`}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between text-left hover:text-slate-900"
                      onClick={() => goByCategory(item.id)}
                    >
                      <span>{item.name}</span>
                      <ChevronRight size={16} className="text-slate-500" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="border-b border-slate-200 pb-2 text-xs font-bold uppercase text-slate-800">Subcategories</div>
              <ul className="mt-4 space-y-2 text-[17px] text-slate-600">
                {dynamicData.mid.map((item) => (
                  <li key={`mid-${item.id}`}>
                    <button type="button" className="w-full text-left hover:text-slate-900" onClick={() => goByCategory(item.id)}>
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="border-b border-slate-200 pb-2 text-xs font-bold uppercase text-slate-800">Popular brands</div>
              <ul className="mt-4 space-y-2 text-[17px] text-slate-600">
                {dynamicData.right.map((item) => (
                  <li key={`right-${item.id}`}>
                    <button type="button" className="w-full text-left hover:text-slate-900" onClick={() => goByBrand(item.id)}>
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
