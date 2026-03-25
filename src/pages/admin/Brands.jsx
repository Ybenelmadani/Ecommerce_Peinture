import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../../api/http";
import { useI18n } from "../../context/I18nContext";
import { resolveMediaUrl } from "../../utils/media";

function getMainImage(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  const main = images.find((image) => image?.is_main);
  return resolveMediaUrl((main || images[0])?.image_path || "");
}

function getPrimaryVariant(product) {
  return Array.isArray(product?.variants) && product.variants.length > 0 ? product.variants[0] : null;
}

export default function Brands() {
  const navigate = useNavigate();
  const { pick, dir, resolveValue } = useI18n();
  const isRtl = dir === "rtl";
  const ui = pick({
    fr: {
      title: "Marques",
      loadError: "Impossible de charger les marques.",
      createSuccess: "Marque creee avec succes.",
      createError: "Impossible de creer la marque.",
      updateSuccess: "Marque mise a jour avec succes.",
      updateError: "Impossible de mettre a jour la marque.",
      deleteSuccess: "Marque supprimee avec succes.",
      deleteError: "Impossible de supprimer la marque.",
      productsLoadError: "Impossible de charger les produits de cette marque.",
      productsDeleteSuccess: "Produit supprime avec succes.",
      productsDeleteError: "Impossible de supprimer le produit.",
      namePlaceholder: "Nom de la marque",
      descriptionPlaceholder: "Description (optionnelle)",
      add: "Ajouter la marque",
      searchPlaceholder: "Rechercher une marque par nom",
      reset: "Reinitialiser",
      loading: "Chargement des marques...",
      loadingProducts: "Chargement des produits...",
      empty: "Aucune marque trouvee.",
      noProducts: "Aucun produit pour cette marque.",
      id: "ID",
      name: "Nom",
      description: "Description",
      action: "Action",
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier",
      delete: "Supprimer",
      total: "Total",
      page: "Page",
      previous: "Precedent",
      next: "Suivant",
      manageProducts: "Voir les produits",
      hideProducts: "Masquer les produits",
      addProductToBrand: "Ajouter un produit a cette marque",
      productsTitle: "Produits de la marque",
      product: "Produit",
      sku: "SKU",
      price: "Prix",
      stock: "Stock",
      image: "Image",
      editProduct: "Modifier le produit",
      deleteProduct: "Supprimer le produit",
      confirmDeleteProduct: "Supprimer ce produit ?",
      openProductManager: "Ouvrir la gestion produit",
      productCount: "{count} produits",
      noImage: "Aucune image",
    },
    en: {
      title: "Brands",
      loadError: "Failed to load brands.",
      createSuccess: "Brand created successfully.",
      createError: "Failed to create brand.",
      updateSuccess: "Brand updated successfully.",
      updateError: "Failed to update brand.",
      deleteSuccess: "Brand deleted successfully.",
      deleteError: "Failed to delete brand.",
      productsLoadError: "Failed to load this brand's products.",
      productsDeleteSuccess: "Product deleted successfully.",
      productsDeleteError: "Failed to delete product.",
      namePlaceholder: "Brand name",
      descriptionPlaceholder: "Description (optional)",
      add: "Add Brand",
      searchPlaceholder: "Search brand by name",
      reset: "Reset",
      loading: "Loading brands...",
      loadingProducts: "Loading products...",
      empty: "No brands found.",
      noProducts: "No products found for this brand.",
      id: "ID",
      name: "Name",
      description: "Description",
      action: "Action",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      total: "Total",
      page: "Page",
      previous: "Previous",
      next: "Next",
      manageProducts: "View products",
      hideProducts: "Hide products",
      addProductToBrand: "Add product to this brand",
      productsTitle: "Brand products",
      product: "Product",
      sku: "SKU",
      price: "Price",
      stock: "Stock",
      image: "Image",
      editProduct: "Edit product",
      deleteProduct: "Delete product",
      confirmDeleteProduct: "Delete this product?",
      openProductManager: "Open product manager",
      productCount: "{count} products",
      noImage: "No image",
    },
    ar: {
      title: "العلامات",
      loadError: "تعذر تحميل العلامات.",
      createSuccess: "تم إنشاء العلامة بنجاح.",
      createError: "تعذر إنشاء العلامة.",
      updateSuccess: "تم تحديث العلامة بنجاح.",
      updateError: "تعذر تحديث العلامة.",
      deleteSuccess: "تم حذف العلامة بنجاح.",
      deleteError: "تعذر حذف العلامة.",
      productsLoadError: "تعذر تحميل منتجات هذه العلامة.",
      productsDeleteSuccess: "تم حذف المنتج بنجاح.",
      productsDeleteError: "تعذر حذف المنتج.",
      namePlaceholder: "اسم العلامة",
      descriptionPlaceholder: "الوصف (اختياري)",
      add: "إضافة العلامة",
      searchPlaceholder: "ابحث عن علامة بالاسم",
      reset: "إعادة التعيين",
      loading: "جار تحميل العلامات...",
      loadingProducts: "جار تحميل المنتجات...",
      empty: "لم يتم العثور على علامات.",
      noProducts: "لا توجد منتجات لهذه العلامة.",
      id: "المعرف",
      name: "الاسم",
      description: "الوصف",
      action: "الإجراء",
      save: "حفظ",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      total: "الإجمالي",
      page: "الصفحة",
      previous: "السابق",
      next: "التالي",
      manageProducts: "عرض المنتجات",
      hideProducts: "إخفاء المنتجات",
      addProductToBrand: "إضافة منتج إلى هذه العلامة",
      productsTitle: "منتجات العلامة",
      product: "المنتج",
      sku: "SKU",
      price: "السعر",
      stock: "المخزون",
      image: "الصورة",
      editProduct: "تعديل المنتج",
      deleteProduct: "حذف المنتج",
      confirmDeleteProduct: "حذف هذا المنتج؟",
      openProductManager: "فتح إدارة المنتج",
      productCount: "{count} منتجات",
      noImage: "لا توجد صورة",
    },
  });

  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 25,
  });
  const [expandedBrandId, setExpandedBrandId] = useState(null);
  const [brandProducts, setBrandProducts] = useState({});
  const [loadingProductsFor, setLoadingProductsFor] = useState("");
  const [deletingProductId, setDeletingProductId] = useState("");
  const searchRef = useRef(search);
  const currentPath = `/admin/brands`;

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const loadBrands = useCallback(
    async (targetPage = 1, overrides = {}) => {
      const query = typeof overrides.search === "string" ? overrides.search : searchRef.current;
      setLoading(true);
      setError("");

      try {
        const res = await http.get("/admin/brands", {
          params: {
            page: targetPage,
            per_page: pagination.per_page,
            q: query.trim() || undefined,
          },
        });

        const payload = res?.data ?? {};
        setBrands(Array.isArray(payload.data) ? payload.data : []);
        setPagination({
          current_page: Number(payload.current_page) || targetPage,
          last_page: Number(payload.last_page) || 1,
          total: Number(payload.total) || 0,
          per_page: Number(payload.per_page) || pagination.per_page,
        });
      } catch {
        setError(ui.loadError);
      } finally {
        setLoading(false);
      }
    },
    [pagination.per_page, ui.loadError]
  );

  useEffect(() => {
    loadBrands(page);
  }, [loadBrands, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) {
        loadBrands(1);
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [loadBrands, page, search]);

  const loadBrandProducts = useCallback(
    async (brandId) => {
      setLoadingProductsFor(String(brandId));
      setError("");

      try {
        const res = await http.get("/admin/products", {
          params: {
            brand_id: brandId,
            per_page: 200,
            sort_by: "name",
            sort_dir: "asc",
          },
        });

        const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
        setBrandProducts((current) => ({
          ...current,
          [brandId]: rows,
        }));
      } catch {
        setError(ui.productsLoadError);
      } finally {
        setLoadingProductsFor("");
      }
    },
    [ui.productsLoadError]
  );

  const toggleBrandProducts = async (brandId) => {
    setSuccess("");

    if (expandedBrandId === brandId) {
      setExpandedBrandId(null);
      return;
    }

    setExpandedBrandId(brandId);
    if (!brandProducts[brandId]) {
      await loadBrandProducts(brandId);
    }
  };

  const createBrand = async () => {
    const cleanName = name.trim();
    if (!cleanName) return;

    setError("");
    setSuccess("");

    try {
      await http.post("/admin/brands", {
        name: cleanName,
        description: description.trim() || null,
      });

      setName("");
      setDescription("");
      setSuccess(ui.createSuccess);
      await loadBrands(page === 1 ? 1 : page);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || ui.createError);
    }
  };

  const startEdit = (brand) => {
    setEditingId(brand.id);
    setEditName(brand.name || "");
    setEditDescription(brand.description || "");
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const saveEdit = async (id) => {
    const cleanName = editName.trim();
    if (!cleanName) return;

    setError("");
    setSuccess("");

    try {
      await http.put(`/admin/brands/${id}`, {
        name: cleanName,
        description: editDescription.trim() || null,
      });

      setSuccess(ui.updateSuccess);
      cancelEdit();
      await loadBrands(page);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || ui.updateError);
    }
  };

  const deleteBrand = async (id) => {
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/brands/${id}`);
      setSuccess(ui.deleteSuccess);

      if (expandedBrandId === id) {
        setExpandedBrandId(null);
      }

      if (brands.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadBrands(page);
      }
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || ui.deleteError);
    }
  };

  const deleteProduct = async (brandId, productId) => {
    if (!window.confirm(ui.confirmDeleteProduct)) return;

    setDeletingProductId(String(productId));
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/products/${productId}`);
      setBrandProducts((current) => ({
        ...current,
        [brandId]: (current[brandId] || []).filter((product) => product.id !== productId),
      }));
      setSuccess(ui.productsDeleteSuccess);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || ui.productsDeleteError);
    } finally {
      setDeletingProductId("");
    }
  };

  const hasPrev = pagination.current_page > 1;
  const hasNext = pagination.current_page < pagination.last_page;
  const textAlign = isRtl ? "right" : "left";

  return (
    <div style={{ width: "100%", maxWidth: "1500px", margin: "0 auto", direction: dir }}>
      <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", marginBottom: "14px" }}>{ui.title}</h2>

      {error ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", marginBottom: "12px" }}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#dcfce7", color: "#166534", marginBottom: "12px" }}>
          {success}
        </div>
      ) : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "16px", display: "grid", gap: "10px", gridTemplateColumns: "2fr 2fr auto" }}>
          <input
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={ui.namePlaceholder}
          />

          <input
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={ui.descriptionPlaceholder}
          />

          <button
            onClick={createBrand}
            style={{ padding: "10px 16px", border: 0, borderRadius: "10px", background: "#0369a1", color: "#fff", fontWeight: 700 }}
          >
            {ui.add}
          </button>
        </div>

        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ui.searchPlaceholder}
            style={{ width: "320px", maxWidth: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <button
            onClick={async () => {
              setSearch("");
              if (page === 1) await loadBrands(1, { search: "" });
              else setPage(1);
            }}
            style={{ padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
          >
            {ui.reset}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>{ui.loading}</div>
        ) : brands.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>{ui.empty}</div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {brands.map((brand) => {
              const isEditing = editingId === brand.id;
              const isExpanded = expandedBrandId === brand.id;
              const products = brandProducts[brand.id] || [];
              const isLoadingProducts = loadingProductsFor === String(brand.id);

              return (
                <div key={brand.id} style={{ border: "1px solid #dbe4ee", borderRadius: "18px", overflow: "hidden", background: "#fff" }}>
                  <div style={{ padding: "18px", display: "grid", gap: "14px", gridTemplateColumns: "90px minmax(220px, 1fr) minmax(220px, 1.2fr) auto", alignItems: "center" }}>
                    <div style={{ fontWeight: 800, color: "#334155", textAlign }}>{brand.id}</div>

                    <div>
                      {isEditing ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                        />
                      ) : (
                        <>
                          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "16px" }}>{resolveValue(brand.name) || brand.name}</div>
                          <div style={{ marginTop: "4px", fontSize: "12px", color: "#64748b" }}>
                            {ui.productCount.replace("{count}", String(products.length))}
                          </div>
                        </>
                      )}
                    </div>

                    <div style={{ textAlign }}>
                      {isEditing ? (
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                        />
                      ) : (
                        <div style={{ color: "#475569" }}>{resolveValue(brand.description) || brand.description || "-"}</div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px", justifyContent: isRtl ? "flex-end" : "flex-start", flexWrap: "wrap" }}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(brand.id)}
                            style={{ padding: "8px 12px", border: 0, borderRadius: "8px", background: "#0369a1", color: "#fff", fontWeight: 700 }}
                          >
                            {ui.save}
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
                          >
                            {ui.cancel}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleBrandProducts(brand.id)}
                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", background: isExpanded ? "#0f172a" : "#fff", color: isExpanded ? "#fff" : "#0f172a", fontWeight: 700 }}
                          >
                            {isExpanded ? ui.hideProducts : ui.manageProducts}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/products/new?brand_id=${brand.id}&returnTo=${encodeURIComponent(currentPath)}`)}
                            style={{ padding: "8px 12px", border: 0, borderRadius: "8px", background: "#0f766e", color: "#fff", fontWeight: 700 }}
                          >
                            {ui.addProductToBrand}
                          </button>
                          <button
                            onClick={() => startEdit(brand)}
                            style={{ padding: "8px 12px", border: 0, borderRadius: "8px", background: "#0f172a", color: "#fff", fontWeight: 700 }}
                          >
                            {ui.edit}
                          </button>
                          <button
                            onClick={() => deleteBrand(brand.id)}
                            style={{ padding: "8px 12px", border: 0, borderRadius: "8px", background: "#ef4444", color: "#fff", fontWeight: 700 }}
                          >
                            {ui.delete}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isExpanded ? (
                    <div style={{ borderTop: "1px solid #e2e8f0", background: "#f8fbff", padding: "16px 18px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 800, color: "#0f172a" }}>{ui.productsTitle}</div>
                        <Link
                          to={`/admin/products?brand_id=${brand.id}`}
                          style={{ color: "#0369a1", textDecoration: "none", fontWeight: 700 }}
                        >
                          {ui.openProductManager}
                        </Link>
                      </div>

                      {isLoadingProducts ? (
                        <div style={{ color: "#64748b", fontWeight: 600 }}>{ui.loadingProducts}</div>
                      ) : products.length === 0 ? (
                        <div style={{ padding: "14px", borderRadius: "12px", background: "#fff", color: "#64748b", border: "1px solid #e2e8f0" }}>
                          {ui.noProducts}
                        </div>
                      ) : (
                        <div style={{ display: "grid", gap: "10px" }}>
                          {products.map((product) => {
                            const image = getMainImage(product);
                            const primaryVariant = getPrimaryVariant(product);
                            const isDeleting = deletingProductId === String(product.id);

                            return (
                              <div
                                key={product.id}
                                style={{
                                  display: "grid",
                                  gap: "12px",
                                  gridTemplateColumns: "82px minmax(220px, 1.6fr) minmax(130px, 0.8fr) minmax(100px, 0.7fr) minmax(100px, 0.7fr) auto",
                                  alignItems: "center",
                                  background: "#fff",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "14px",
                                  padding: "12px",
                                }}
                              >
                                <div style={{ width: "82px", height: "82px", borderRadius: "12px", overflow: "hidden", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {image ? (
                                    <img src={image} alt={resolveValue(product.name) || product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  ) : (
                                    <div style={{ padding: "8px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>{ui.noImage}</div>
                                  )}
                                </div>

                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 800, color: "#0f172a", overflowWrap: "anywhere" }}>{resolveValue(product.name) || product.name}</div>
                                  <div style={{ marginTop: "4px", fontSize: "12px", color: "#64748b" }}>
                                    #{product.id}
                                  </div>
                                </div>

                                <div style={{ color: "#334155", fontSize: "14px", overflowWrap: "anywhere" }}>
                                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>{ui.sku}</div>
                                  {primaryVariant?.sku || "-"}
                                </div>

                                <div style={{ color: "#334155", fontSize: "14px" }}>
                                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>{ui.price}</div>
                                  {primaryVariant?.price ?? "-"}
                                </div>

                                <div style={{ color: "#334155", fontSize: "14px" }}>
                                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>{ui.stock}</div>
                                  {primaryVariant?.stock ?? "-"}
                                </div>

                                <div style={{ display: "flex", gap: "8px", justifyContent: isRtl ? "flex-end" : "flex-start", flexWrap: "wrap" }}>
                                  <button
                                    onClick={() => navigate(`/admin/products/${product.id}/edit`, { state: { from: currentPath } })}
                                    style={{ padding: "8px 12px", border: 0, borderRadius: "8px", background: "#0f172a", color: "#fff", fontWeight: 700 }}
                                  >
                                    {ui.editProduct}
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(brand.id, product.id)}
                                    disabled={isDeleting}
                                    style={{ padding: "8px 12px", border: 0, borderRadius: "8px", background: "#ef4444", color: "#fff", fontWeight: 700 }}
                                  >
                                    {isDeleting ? ui.delete : ui.deleteProduct}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {!loading ? (
          <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ color: "#475569", fontSize: "14px" }}>
              {ui.total}: {pagination.total} {ui.title.toLowerCase()} | {ui.page} {pagination.current_page} / {pagination.last_page}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: hasPrev ? "#fff" : "#f1f5f9",
                  color: "#0f172a",
                  fontWeight: 700,
                  cursor: hasPrev ? "pointer" : "not-allowed",
                }}
              >
                {ui.previous}
              </button>
              <button
                onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
                disabled={!hasNext}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #0f172a",
                  background: hasNext ? "#0f172a" : "#cbd5e1",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: hasNext ? "pointer" : "not-allowed",
                }}
              >
                {ui.next}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
