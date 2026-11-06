import { couponApi, notify, orderApi, shopApi, variantApi } from "../api/services";
import { shippingFeeFor } from "./constants";
import { formatCurrency, nowIso } from "./format";

// Kiểm tra mã giảm giá của một cửa hàng. Hợp lệ → { coupon, discount }; không → ném Error có thông báo tiếng Việt.
export const validateCoupon = async (code, shopId, subtotal) => {
  const [coupon] = await couponApi.list({ code: code.trim().toUpperCase(), shopId });
  if (!coupon || coupon.status !== "ACTIVE") throw new Error("Mã giảm giá không tồn tại hoặc đã ngừng áp dụng.");
  const now = Date.now();
  if (now < new Date(coupon.startAt).getTime() || now > new Date(coupon.endAt).getTime()) {
    throw new Error("Mã giảm giá đã hết hạn hoặc chưa tới ngày áp dụng.");
  }
  if (coupon.used >= coupon.usageLimit) throw new Error("Mã giảm giá đã hết lượt sử dụng.");
  if (subtotal < coupon.minOrder) {
    throw new Error(`Đơn tối thiểu ${formatCurrency(coupon.minOrder)} mới dùng được mã này.`);
  }
  return { coupon, discount: Math.min(coupon.discount, subtotal) };
};

/**
 * Tạo MỘT đơn hàng cho MỘT cửa hàng từ nhóm dòng giỏ hàng.
 * Luôn đọc lại tồn kho/giá mới nhất từ server (giỏ hàng trong localStorage có thể đã cũ),
 * sau đó trừ kho, tăng lượt dùng mã và báo cho người bán.
 */
export const placeShopOrder = async ({ user, group, address, paymentMethod, note, couponCode }) => {
  const shop = await shopApi.get(group.shopId);
  if (shop.status !== "ACTIVE") throw new Error(`Cửa hàng "${shop.name}" đang tạm ngưng hoạt động.`);

  // 1. Kiểm tra từng dòng với dữ liệu mới nhất.
  const fresh = [];
  for (const line of group.items) {
    let variant;
    try {
      variant = await variantApi.get(line.variantId);
    } catch {
      throw new Error(`"${line.productName} – ${line.variantName}" không còn được bán.`);
    }
    if (variant.status !== "ACTIVE" || variant.stock < line.quantity) {
      throw new Error(`"${line.productName} – ${line.variantName}" chỉ còn ${Math.max(variant.stock, 0)} sản phẩm.`);
    }
    fresh.push({ line, variant });
  }

  const items = fresh.map(({ line, variant }) => ({
    variantId: variant.id,
    productId: line.productId,
    productName: line.productName,
    variantName: line.variantName,
    image: line.image,
    price: variant.price,
    quantity: line.quantity,
  }));
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // 2. Mã giảm giá + phí giao.
  let discount = 0;
  let coupon = null;
  if (couponCode) {
    ({ coupon, discount } = await validateCoupon(couponCode, group.shopId, subtotal));
  }
  const shippingFee = shippingFeeFor(shop.province, address.province, subtotal);

  // 3. Tạo đơn. Mã đơn dạng VF100001 = 100000 + id nên gán sau khi server cấp id.
  const createdAt = nowIso();
  const created = await orderApi.create({
    code: "",
    customerId: user.id,
    shopId: group.shopId,
    items,
    subtotal,
    shippingFee,
    discount,
    total: subtotal + shippingFee - discount,
    couponCode: coupon ? coupon.code : "",
    paymentMethod,
    paymentStatus: "UNPAID",
    status: "PENDING",
    cancelReason: "",
    address,
    note,
    deliveryStaffId: null,
    createdAt,
    history: [{ status: "PENDING", at: createdAt }],
  });
  const order = await orderApi.patch(created.id, { code: `VF${100000 + created.id}` });

  // 4. Trừ kho, ghi nhận lượt dùng mã, thông báo cho người bán.
  for (const { line, variant } of fresh) {
    await variantApi.patch(variant.id, { stock: variant.stock - line.quantity });
  }
  if (coupon) await couponApi.patch(coupon.id, { used: coupon.used + 1 });
  await notify(shop.ownerId, `Đơn hàng mới ${order.code}`, `${user.fullName} đặt ${items.length} sản phẩm – ${formatCurrency(order.total)}.`, `/seller/orders/${order.id}`);

  return order;
};
