// Cấu hình menu thanh bên cho từng khu làm việc (giống workspace-navigation của bản gốc).
export const sellerMenu = [
  {
    heading: "Tổng quan",
    items: [{ to: "/seller", label: "Bảng điều khiển", icon: "📊", end: true }],
  },
  {
    heading: "Bán hàng",
    items: [
      { to: "/seller/products", label: "Sản phẩm", icon: "🍊" },
      { to: "/seller/orders", label: "Đơn hàng", icon: "📦" },
      { to: "/seller/coupons", label: "Mã giảm giá", icon: "🏷️" },
    ],
  },
];

export const adminMenu = [
  {
    heading: "Tổng quan",
    items: [{ to: "/admin", label: "Bảng điều khiển", icon: "📊", end: true }],
  },
  {
    heading: "Người dùng & cửa hàng",
    items: [
      { to: "/admin/accounts", label: "Tài khoản", icon: "👤" },
      { to: "/admin/shops", label: "Cửa hàng", icon: "🏪" },
    ],
  },
  {
    heading: "Nội dung",
    items: [
      { to: "/admin/products", label: "Duyệt sản phẩm", icon: "✅" },
      { to: "/admin/categories", label: "Danh mục", icon: "🗂️" },
      { to: "/admin/reviews", label: "Đánh giá", icon: "⭐" },
    ],
  },
];

export const deliveryMenu = [
  {
    heading: "Giao hàng",
    items: [
      { to: "/delivery", label: "Đơn chờ nhận", icon: "📋", end: true },
      { to: "/delivery/mine", label: "Đơn đang giao", icon: "🛵" },
      { to: "/delivery/history", label: "Lịch sử & COD", icon: "💵" },
    ],
  },
];
