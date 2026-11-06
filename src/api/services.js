import api from "./axiosClient";

// Mỗi tài nguyên REST của json-server: GET (đọc) / POST (tạo) / PUT, PATCH (sửa) / DELETE (xoá).
const data = (promise) => promise.then((res) => res.data);

const crud = (resource) => ({
  list: (params) => data(api.get(`/${resource}`, { params })),
  get: (id, params) => data(api.get(`/${resource}/${id}`, { params })),
  create: (body) => data(api.post(`/${resource}`, body)),
  update: (id, body) => data(api.put(`/${resource}/${id}`, body)),
  patch: (id, body) => data(api.patch(`/${resource}/${id}`, body)),
  remove: (id) => data(api.delete(`/${resource}/${id}`)),
});

export const userApi = crud("users");
export const addressApi = crud("addresses");
export const categoryApi = crud("categories");
export const shopApi = crud("shops");
export const variantApi = crud("variants");
export const couponApi = crud("coupons");
export const orderApi = crud("orders");
export const reviewApi = crud("reviews");
export const notificationApi = crud("notifications");

export const productApi = {
  ...crud("products"),
  // Sản phẩm hiển thị trên cửa hàng: đã duyệt + đang bán, kèm biến thể và cửa hàng.
  listStorefront: () =>
    data(
      api.get("/products", {
        params: { approval: "APPROVED", status: "ACTIVE", _embed: "variants", _expand: "shop" },
      })
    ),
  getDetail: (id) =>
    data(api.get(`/products/${id}`, { params: { _embed: ["variants", "reviews"], _expand: ["shop", "category"] } })),
  listByShop: (shopId) => data(api.get("/products", { params: { shopId, _embed: "variants" } })),
};

// Gửi thông báo trong ứng dụng cho một người dùng.
export const notify = (userId, title, content, link = "") =>
  notificationApi.create({ userId, title, content, link, read: false, createdAt: new Date().toISOString() });
