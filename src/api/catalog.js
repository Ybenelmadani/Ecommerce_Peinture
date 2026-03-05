import { http } from "./http";

export const CatalogAPI = {
  categories: () => http.get("/categories").then(r => r.data),
  brands: () => http.get("/brands").then(r => r.data),

  products: (params = {}) => http.get("/products", { params }).then(r => r.data),
  product: (id) => http.get(`/products/${id}`).then(r => r.data),

  variants: (params = {}) => http.get("/variants", { params }).then(r => r.data),
  reviews: (params = {}) => http.get("/reviews", { params }).then(r => r.data),
};