import { createSlice } from "@reduxjs/toolkit";

// Giỏ hàng nhiều cửa hàng. Mỗi dòng là một biến thể (variant).
const initialState = { items: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // payload: { variantId, productId, shopId, shopName, productName, variantName, image, price, stock, quantity }
    addToCart: (state, action) => {
      const { quantity = 1, ...line } = action.payload;
      const existing = state.items.find((i) => i.variantId === line.variantId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, line.stock);
        existing.price = line.price;
        existing.stock = line.stock;
      } else {
        state.items.push({ ...line, quantity: Math.min(quantity, line.stock) });
      }
    },
    updateQuantity: (state, action) => {
      const { variantId, quantity } = action.payload;
      const line = state.items.find((i) => i.variantId === variantId);
      if (line) line.quantity = Math.max(1, Math.min(quantity, line.stock));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.variantId !== action.payload);
    },
    clearShop: (state, action) => {
      state.items = state.items.filter((i) => i.shopId !== action.payload);
    },
    clearCart: () => initialState,
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearShop, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state) => state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export default cartSlice.reducer;
