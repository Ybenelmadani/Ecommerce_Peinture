import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CatalogAPI } from "../../api/catalog";
import logoFinal from "../../assets/logo-adwart-final.svg";

const MENU_ITEMS = ["Color", "Surface", "Brushes", "Studio", "Brands", "Gifts", "Offers"];

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
  const n = normalize(name);
  return keywords.some((k) => n.includes(k));
}

export default function Header() {
  const headerRef = useRef(null);
  const nav = useNavigate();
  const { items, setOpen } = useCart();
  const { user, logout } = useAuth();

  const [q, setQ] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [panelLeft, setPanelLeft] = useState(16);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    CatalogAPI.categories().then((data) => setCategories(Array.isArray(data) ? data : [])).catch(() => {});
    CatalogAPI.brands().then((data) => setBrands(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const topCategories = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const subCategories = useMemo(() => categories.filter((c) => Boolean(c.parent_id)), [categories]);

  const dynamicData = useMemo(() => {
    const menu = activeMenu || "Color";
    const keywords = MENU_KEYWORDS[menu] || [];

    const leftRaw = menu === "Brands" ? [] : topCategories.filter((c) => byKeywords(c.name, keywords));
    const midRaw = menu === "Brands" ? [] : subCategories.filter((c) => byKeywords(c.name, keywords));
    const rightRaw = brands;

    const left = (leftRaw.length ? leftRaw : topCategories).slice(0, 6);
    const mid = (midRaw.length ? midRaw : subCategories.length ? subCategories : topCategories).slice(0, 6);
    const right = rightRaw.slice(0, 6);

    return { left, mid, right, menu };
  }, [activeMenu, topCategories, subCategories, brands]);

  const goSearch = () => {
    nav(`/products?q=${encodeURIComponent(q.trim())}`);
    setActiveMenu(null);
  };

  const goByCategory = (categoryId) => {
    nav(`/products?category_id=${categoryId}`);
    setActiveMenu(null);
  };

  const goByBrand = (brandId) => {
    nav(`/products?brand_id=${brandId}`);
    setActiveMenu(null);
  };

  const openMenuAtHoveredItem = (item, targetEl) => {
    setActiveMenu(item);

    if (!headerRef.current || !targetEl) return;

    const headerRect = headerRef.current.getBoundingClientRect();
    const btnRect = targetEl.getBoundingClientRect();
    const panelWidth = Math.min(window.innerWidth * 0.94, 980);

    const desiredLeft = btnRect.left - headerRect.left - 42;
    const minLeft = 12;
    const maxLeft = Math.max(minLeft, headerRect.width - panelWidth - 12);
    const safeLeft = Math.min(maxLeft, Math.max(minLeft, desiredLeft));

    setPanelLeft(safeLeft);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-slate-200 bg-white"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="mx-auto flex h-[66px] w-full max-w-[1380px] min-w-0 items-center gap-3 overflow-hidden px-3 md:px-5">
        <Link to="/" className="shrink-0 min-w-[120px] md:min-w-[150px] rounded-xl border border-slate-200 bg-slate-50 px-2 py-1">
          <img
            src={logoFinal}
            alt="Adwart"
            className="h-9 w-auto md:h-10"
            style={{ filter: "saturate(1.25) contrast(1.15)" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.style.display = "inline-block";
            }}
          />
          <span className="hidden text-2xl md:text-3xl font-black italic tracking-tight text-slate-900">Adwart</span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-3 lg:gap-4 xl:gap-6 md:flex">
          {MENU_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              onMouseEnter={(e) => openMenuAtHoveredItem(item, e.currentTarget)}
              onFocus={(e) => openMenuAtHoveredItem(item, e.currentTarget)}
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
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goSearch()}
              className="h-11 w-full rounded-full border border-slate-300 bg-white pl-4 pr-11 text-sm placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={goSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 hover:bg-slate-100"
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

          <button
            onClick={() => setOpen(true)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-100"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                {items.length}
              </span>
            )}
          </button>
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
