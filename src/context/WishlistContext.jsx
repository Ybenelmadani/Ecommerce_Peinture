import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { WishlistAPI } from "../api/wishlist";
import { useAuth } from "./AuthContext";
import { useI18n } from "./I18nContext";
import { useToast } from "./ToastContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { pick } = useI18n();
  const { success, error: notifyError } = useToast();
  const ui = pick({
    fr: {
      added: "Produit ajoute a votre liste d'envies.",
      removed: "Produit retire de votre liste d'envies.",
      loginRequired: "Veuillez vous connecter pour utiliser la liste d'envies.",
      loadError: "Impossible de charger votre liste d'envies.",
      updateError: "Impossible de mettre a jour votre liste d'envies.",
    },
    en: {
      added: "Product added to your wishlist.",
      removed: "Product removed from your wishlist.",
      loginRequired: "Please login to use the wishlist.",
      loadError: "Unable to load your wishlist.",
      updateError: "Unable to update your wishlist.",
    },
    ar: {
      added: "تمت إضافة المنتج إلى المفضلة.",
      removed: "تمت إزالة المنتج من المفضلة.",
      loginRequired: "يرجى تسجيل الدخول لاستخدام المفضلة.",
      loadError: "تعذر تحميل المفضلة.",
      updateError: "تعذر تحديث المفضلة.",
    },
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const syncItems = (payload) => {
    const nextItems = Array.isArray(payload) ? payload : [];
    setItems(nextItems);
    return nextItems;
  };

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!user) {
      setItems([]);
      return [];
    }

    setLoading(true);
    try {
      const data = await WishlistAPI.list();
      return syncItems(data);
    } catch (error) {
      if (!silent) notifyError(ui.loadError);
      return [];
    } finally {
      setLoading(false);
    }
  }, [notifyError, ui.loadError, user]);

  useEffect(() => {
    refresh({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const ids = useMemo(
    () => new Set(items.map((item) => Number(item.product_id ?? item.product?.id)).filter(Boolean)),
    [items]
  );

  const has = useCallback((productId) => ids.has(Number(productId)), [ids]);

  const add = useCallback(async (productId) => {
    if (!user) {
      notifyError(ui.loginRequired);
      return false;
    }

    try {
      const data = await WishlistAPI.add(productId);
      syncItems(data);
      success(ui.added);
      return true;
    } catch (error) {
      notifyError(error?.response?.data?.message || ui.updateError);
      return false;
    }
  }, [notifyError, success, ui.added, ui.loginRequired, ui.updateError, user]);

  const remove = useCallback(async (productId) => {
    if (!user) {
      notifyError(ui.loginRequired);
      return false;
    }

    try {
      const data = await WishlistAPI.remove(productId);
      syncItems(data);
      success(ui.removed);
      return true;
    } catch (error) {
      notifyError(error?.response?.data?.message || ui.updateError);
      return false;
    }
  }, [notifyError, success, ui.loginRequired, ui.removed, ui.updateError, user]);

  const toggle = useCallback(async (productId) => (has(productId) ? remove(productId) : add(productId)), [add, has, remove]);

  const value = useMemo(
    () => ({ items, ids, loading, has, refresh, add, remove, toggle }),
    [add, has, ids, items, loading, refresh, remove, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
