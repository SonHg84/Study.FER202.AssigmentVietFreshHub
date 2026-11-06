import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import catalogReducer from "./catalogSlice";
import ordersReducer from "./ordersSlice";
import logger from "./middleware/logger";
import cartStorage, { loadCart } from "./middleware/cartStorage";

// Một store duy nhất (single source of truth), reducer được tách theo từng slice rồi kết hợp lại.
const store = configureStore({
  reducer: {
    cart: cartReducer,
    catalog: catalogReducer,
    orders: ordersReducer,
  },
  preloadedState: loadCart() ? { cart: loadCart() } : undefined,
  // configureStore đã có sẵn redux-thunk; thêm middleware lưu giỏ hàng và logger.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(cartStorage, logger),
});

export default store;
