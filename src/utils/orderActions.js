// Bước chuyển trạng thái kế tiếp mà người bán được phép thực hiện.
export const SELLER_NEXT = {
  PENDING: { status: "CONFIRMED", label: "Xác nhận đơn" },
  CONFIRMED: { status: "PREPARING", label: "Bắt đầu chuẩn bị" },
  PREPARING: { status: "READY_FOR_DELIVERY", label: "Sẵn sàng giao" },
};

// Người bán chỉ huỷ được khi hàng chưa giao cho shipper; khách chỉ huỷ được khi đơn chưa được xác nhận.
export const SELLER_CANCELLABLE = ["PENDING", "CONFIRMED", "PREPARING"];
export const CUSTOMER_CANCELLABLE = ["PENDING"];
