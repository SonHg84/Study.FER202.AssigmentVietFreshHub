// Gom các dòng giỏ hàng theo cửa hàng: mỗi cửa hàng sẽ thành một đơn hàng riêng khi thanh toán.
export const groupByShop = (items = []) => {
  const groups = new Map();
  items.forEach((item) => {
    if (!groups.has(item.shopId)) {
      groups.set(item.shopId, { shopId: item.shopId, shopName: item.shopName, items: [], subtotal: 0 });
    }
    const group = groups.get(item.shopId);
    group.items.push(item);
    group.subtotal += item.price * item.quantity;
  });
  return [...groups.values()];
};
