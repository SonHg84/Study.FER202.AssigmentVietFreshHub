// Biến thể đại diện của sản phẩm: rẻ nhất trong số còn hàng (nếu hết hàng thì rẻ nhất).
export const pickDisplayVariant = (variants = []) => {
  const active = variants.filter((v) => v.status === "ACTIVE");
  const inStock = active.filter((v) => v.stock > 0);
  const pool = inStock.length ? inStock : active;
  return [...pool].sort((a, b) => a.price - b.price)[0] || null;
};

export const minPrice = (product) => pickDisplayVariant(product.variants)?.price ?? 0;

export const totalStock = (variants = []) => variants.reduce((sum, v) => sum + (v.status === "ACTIVE" ? v.stock : 0), 0);

export const averageRating = (reviews = []) => {
  const approved = reviews.filter((r) => r.status === "APPROVED");
  if (!approved.length) return { avg: 0, count: 0 };
  const avg = approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
  return { avg: Math.round(avg * 10) / 10, count: approved.length };
};

// Chuyển (product, variant) thành một dòng giỏ hàng.
export const toCartLine = (product, variant, quantity = 1) => ({
  variantId: variant.id,
  productId: product.id,
  shopId: product.shopId,
  shopName: product.shop?.name || "",
  productName: product.name,
  variantName: variant.name,
  image: product.image,
  price: variant.price,
  stock: variant.stock,
  quantity,
});
