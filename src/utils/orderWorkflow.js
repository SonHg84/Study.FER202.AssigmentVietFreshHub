import { orderApi, productApi, variantApi, shopApi, notify } from "../api/services";
import { ORDER_STATUS } from "./constants";
import { nowIso } from "./format";

// Trả lại tồn kho cho các dòng của một đơn bị huỷ.
export const restoreStock = async (order) => {
  for (const line of order.items) {
    try {
      const variant = await variantApi.get(line.variantId);
      await variantApi.patch(variant.id, { stock: variant.stock + line.quantity });
    } catch {
      // biến thể có thể đã bị xoá — bỏ qua
    }
  }
};

// Cộng số lượng đã bán khi đơn giao thành công.
const addSold = async (order) => {
  for (const line of order.items) {
    try {
      const product = await productApi.get(line.productId);
      await productApi.patch(product.id, { sold: (product.sold || 0) + line.quantity });
    } catch {
      // sản phẩm có thể đã bị xoá — bỏ qua
    }
  }
};

/**
 * Chuyển trạng thái một đơn: ghi lịch sử, xử lý tồn kho/doanh số, gửi thông báo.
 * extra: các trường cập nhật thêm (vd. cancelReason, deliveryStaffId).
 */
export const changeOrderStatus = async (order, status, extra = {}) => {
  const patch = {
    ...extra,
    status,
    history: [...order.history, { status, at: nowIso() }],
  };
  if (status === "COMPLETED") patch.paymentStatus = "PAID";
  if (status === "CANCELLED" && order.paymentStatus === "PAID") patch.paymentStatus = "REFUNDED";

  const updated = await orderApi.patch(order.id, patch);

  if (status === "CANCELLED") await restoreStock(order);
  if (status === "COMPLETED") await addSold(order);

  const label = ORDER_STATUS[status].label.toLowerCase();
  await notify(order.customerId, `Đơn ${order.code}: ${label}`, extra.cancelReason ? `Lý do: ${extra.cancelReason}` : `Đơn hàng của bạn đã chuyển sang trạng thái "${label}".`, `/account/orders/${order.id}`);
  if (status === "CANCELLED" && extra.cancelledBy === "CUSTOMER") {
    const shop = await shopApi.get(order.shopId);
    await notify(shop.ownerId, `Khách đã huỷ đơn ${order.code}`, extra.cancelReason || "", `/seller/orders/${order.id}`);
  }
  return updated;
};
