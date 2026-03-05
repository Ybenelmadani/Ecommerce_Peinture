import { http } from "./http";
const user_id = 1;

export const ReviewsAPI = {
  create: ({ product_id, rating, comment }) =>
    http.post("/reviews", { product_id, rating, comment, user_id }).then(r => r.data),
};