// Các hàm định dạng dùng chung (ES6 module, arrow function, template literal).
const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value = 0) => currencyFormatter.format(Number(value) || 0);

export const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "");

export const discountPercent = (price, comparePrice) =>
  comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

export const nowIso = () => new Date().toISOString();

export const toSlug = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
