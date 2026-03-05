import { http } from "./http";
const user_id = 1;

export const OrdersAPI = {
  list: () => http.get("/orders", { params: { user_id } }).then(r => r.data),
  checkout: (shipping_address) =>
    http.post("/orders/checkout", { shipping_address, user_id }).then(r => r.data),
};