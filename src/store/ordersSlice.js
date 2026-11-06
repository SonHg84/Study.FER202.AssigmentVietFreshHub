import { createSlice } from "@reduxjs/toolkit";
import { orderApi } from "../api/services";
import { changeOrderStatus } from "../utils/orderWorkflow";

// Danh sách đơn của khu làm việc (người bán / giao hàng) được quản lý bằng Redux + Thunk.
const ordersSlice = createSlice({
  name: "orders",
  initialState: { items: [], loading: false, error: null, updatingId: null },
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStart: (state, action) => {
      state.updatingId = action.payload;
    },
    updateSuccess: (state, action) => {
      state.updatingId = null;
      const index = state.items.findIndex((o) => o.id === action.payload.id);
      if (index >= 0) state.items[index] = action.payload;
    },
    updateFailure: (state, action) => {
      state.updatingId = null;
      state.error = action.payload;
    },
  },
});

export const { fetchStart, fetchSuccess, fetchFailure, updateStart, updateSuccess, updateFailure } = ordersSlice.actions;

// params: bộ lọc json-server, vd { shopId: 1 } hoặc { status: "READY_FOR_DELIVERY" }
export const fetchOrders = (params) => async (dispatch) => {
  dispatch(fetchStart());
  try {
    const orders = await orderApi.list({ ...params, _sort: "createdAt", _order: "desc" });
    dispatch(fetchSuccess(orders));
  } catch (error) {
    dispatch(fetchFailure(error.message));
  }
};

// Trả về true/false để component biết hiển thị thông báo thành công hay lỗi.
export const updateOrderStatus = (order, status, extra) => async (dispatch) => {
  dispatch(updateStart(order.id));
  try {
    const updated = await changeOrderStatus(order, status, extra);
    dispatch(updateSuccess(updated));
    return true;
  } catch (error) {
    dispatch(updateFailure(error.message));
    return false;
  }
};

export default ordersSlice.reducer;
