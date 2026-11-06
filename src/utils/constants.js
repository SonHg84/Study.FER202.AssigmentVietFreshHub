export const ROLES = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
  DELIVERY: "DELIVERY",
};

export const ROLE_LABELS = {
  CUSTOMER: "Khách hàng",
  SELLER: "Người bán",
  ADMIN: "Quản trị viên",
  DELIVERY: "Nhân viên giao hàng",
};

// Trang chủ của từng vai trò sau khi đăng nhập.
export const ROLE_HOME = {
  CUSTOMER: "/",
  SELLER: "/seller",
  ADMIN: "/admin",
  DELIVERY: "/delivery",
};

// Luồng trạng thái đơn hàng giống VietFreshHub.
export const ORDER_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

export const ORDER_STATUS = {
  PENDING: { label: "Chờ xác nhận", variant: "warning" },
  CONFIRMED: { label: "Đã xác nhận", variant: "info" },
  PREPARING: { label: "Đang chuẩn bị", variant: "primary" },
  READY_FOR_DELIVERY: { label: "Chờ giao hàng", variant: "secondary" },
  OUT_FOR_DELIVERY: { label: "Đang giao", variant: "dark" },
  COMPLETED: { label: "Đã giao", variant: "success" },
  CANCELLED: { label: "Đã hủy", variant: "danger" },
};

export const APPROVAL_STATUS = {
  PENDING: { label: "Chờ duyệt", variant: "warning" },
  APPROVED: { label: "Đã duyệt", variant: "success" },
  REJECTED: { label: "Bị từ chối", variant: "danger" },
};

export const PRODUCT_STATUS = {
  ACTIVE: { label: "Đang bán", variant: "success" },
  INACTIVE: { label: "Đã ẩn", variant: "secondary" },
};

export const ACCOUNT_STATUS = {
  ACTIVE: { label: "Hoạt động", variant: "success" },
  LOCKED: { label: "Đã khóa", variant: "danger" },
};

export const SHOP_STATUS = {
  ACTIVE: { label: "Đang mở", variant: "success" },
  SUSPENDED: { label: "Tạm khóa", variant: "danger" },
};

export const REVIEW_STATUS = {
  PENDING: { label: "Chờ duyệt", variant: "warning" },
  APPROVED: { label: "Hiển thị", variant: "success" },
  HIDDEN: { label: "Đã ẩn", variant: "secondary" },
};

export const PAYMENT_METHODS = {
  COD: "Thanh toán khi nhận hàng (COD)",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

export const PAYMENT_STATUS = {
  UNPAID: { label: "Chưa thanh toán", variant: "secondary" },
  PAID: { label: "Đã thanh toán", variant: "success" },
  REFUNDED: { label: "Đã hoàn tiền", variant: "info" },
};

// Phí giao: cùng tỉnh/thành với cửa hàng 15.000đ, khác tỉnh 30.000đ, đơn từ 500.000đ miễn phí.
export const shippingFeeFor = (shopProvince, customerProvince, subtotal) => {
  if (subtotal >= 500000) return 0;
  return shopProvince === customerProvince ? 15000 : 30000;
};

export const PROVINCES = ["TP Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];

export const PAGE_SIZE = 8;
