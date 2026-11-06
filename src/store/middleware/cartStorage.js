// Middleware lưu giỏ hàng vào localStorage sau mỗi action của slice "cart".
export const CART_KEY = "vfh_cart";

export const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

const cartStorage = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type.startsWith("cart/")) {
    localStorage.setItem(CART_KEY, JSON.stringify(store.getState().cart));
  }
  return result;
};

export default cartStorage;
