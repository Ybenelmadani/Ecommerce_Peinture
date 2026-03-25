import { http } from "./http";

export const WishlistAPI = {
  list: () => http.get("/wishlist").then((r) => r.data),
  add: (product_id) => http.post("/wishlist/items", { product_id }).then((r) => r.data),
  remove: (productId) => http.delete(`/wishlist/items/${productId}`).then((r) => r.data),
};
