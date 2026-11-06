import { createSlice } from "@reduxjs/toolkit";
import { categoryApi, productApi } from "../api/services";

// Action creators thường (giống ví dụ fetchJobDetail trong slide Redux Thunk).
const fetchCatalogStart = () => ({ type: "catalog/FETCH_START" });
const fetchCatalogSuccess = (payload) => ({ type: "catalog/FETCH_SUCCESS", payload });
const fetchCatalogFailure = (error) => ({ type: "catalog/FETCH_FAILURE", payload: error });

const CACHE_MS = 60 * 1000;

// Thunk: action creator trả về một HÀM (dispatch, getState) thay vì một object.
// Có cache: dữ liệu mới tải trong 60 giây thì không gọi lại API (trừ khi force = true).
export const fetchCatalog = (force = false) => {
  return async (dispatch, getState) => {
    const { lastFetched, loading } = getState().catalog;
    if (loading) return;
    if (!force && lastFetched && Date.now() - lastFetched < CACHE_MS) return;
    dispatch(fetchCatalogStart());
    try {
      const [products, categories] = await Promise.all([productApi.listStorefront(), categoryApi.list()]);
      // Ẩn sản phẩm của cửa hàng bị khoá và biến thể không còn bán.
      const visible = products
        .filter((p) => p.shop && p.shop.status === "ACTIVE")
        .map((p) => ({ ...p, variants: p.variants.filter((v) => v.status === "ACTIVE") }))
        .filter((p) => p.variants.length > 0);
      dispatch(fetchCatalogSuccess({ products: visible, categories }));
    } catch (error) {
      dispatch(fetchCatalogFailure(error.message));
    }
  };
};

const catalogSlice = createSlice({
  name: "catalog",
  initialState: {
    products: [],
    categories: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    invalidateCatalog: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogStart().type, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogSuccess().type, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.categories = action.payload.categories;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCatalogFailure().type, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { invalidateCatalog } = catalogSlice.actions;
export default catalogSlice.reducer;
