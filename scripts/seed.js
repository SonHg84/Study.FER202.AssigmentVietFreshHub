/*
 * Sinh file db.json cho json-server từ dữ liệu mẫu của VietFreshHub (database/data.sql).
 * Chạy: npm run seed   (ghi đè db.json — dùng khi muốn đưa dữ liệu về ban đầu)
 */
const fs = require("fs");
const path = require("path");

const now = Date.now();
const minutesAgo = (m) => new Date(now - m * 60000).toISOString();
const daysAgo = (d) => minutesAgo(d * 24 * 60);

// Bộ sinh số giả ngẫu nhiên cố định để mỗi lần seed ra cùng dữ liệu.
let seed = 20261106;
const rand = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const PASSWORD = "123456";

const users = [
  [1, "admin@vietfreshhub.vn", "admin", "Nguyễn Hoàng Minh", "ADMIN", "0906784312"],
  [2, "hoangvanson@gmail.com", "vuonnhason", "Hoàng Văn Sơn", "SELLER", "0918372645"],
  [3, "khonghung@gmail.com", "traicaykhonghung", "Khổng Hưng", "SELLER", "0935481762"],
  [4, "phamphuoc@gmail.com", "nongsanphamphuoc", "Phạm Phước", "SELLER", "0986714352"],
  [5, "quochuy.pham.ship@gmail.com", "delivery.000001", "Phạm Quốc Huy", "DELIVERY", "0932851467"],
  [6, "ngochavo.ship@gmail.com", "delivery.000002", "Võ Ngọc Hà", "DELIVERY", "0905361874"],
  [7, "thanhdat.dang.ship@gmail.com", "delivery.000003", "Đặng Thành Đạt", "DELIVERY", "0984672351"],
  [8, "thumai.nguyen91@gmail.com", "customer.000001", "Nguyễn Thu Mai", "CUSTOMER", "0903247816"],
  [9, "quocbao.tran88@gmail.com", "customer.000002", "Trần Quốc Bảo", "CUSTOMER", "0987253641"],
  [10, "minhtuan.le93@gmail.com", "customer.000003", "Lê Minh Tuấn", "CUSTOMER", "0936185724"],
  [11, "ngocanh.pham95@gmail.com", "customer.000004", "Phạm Ngọc Anh", "CUSTOMER", "0917534862"],
  [12, "thuyduong.vo90@gmail.com", "customer.000005", "Võ Thùy Dương", "CUSTOMER", "0974826135"],
  [13, "giahan.dang97@gmail.com", "customer.000006", "Đặng Gia Hân", "CUSTOMER", "0869351742"],
  [14, "nhatminh.hoang89@gmail.com", "customer.000007", "Hoàng Nhật Minh", "CUSTOMER", "0908126437"],
  [15, "thanhtruc.bui92@gmail.com", "customer.000008", "Bùi Thanh Trúc", "CUSTOMER", "0937642815"],
  [16, "quanghuy.do94@gmail.com", "customer.000009", "Đỗ Quang Huy", "CUSTOMER", "0914268357"],
  [17, "phuongthao.ngo96@gmail.com", "customer.000010", "Ngô Phương Thảo", "CUSTOMER", "0981635724"],
  [18, "duclong.phan87@gmail.com", "customer.000011", "Phan Đức Long", "CUSTOMER", "0876452139"],
  [19, "khanhvy.huynh98@gmail.com", "customer.000012", "Huỳnh Khánh Vy", "CUSTOMER", "0963527481"],
].map(([id, email, username, fullName, role, phone]) => ({
  id, email, username, password: PASSWORD, fullName, role, phone,
  status: "ACTIVE", createdAt: daysAgo(45),
}));

const addresses = [
  [8, "41 Nguyễn Trãi", "Phường Bến Thành", "TP Hồ Chí Minh"],
  [9, "18 Trần Hưng Đạo", "Phường Cửa Nam", "Hà Nội"],
  [10, "96 Điện Biên Phủ", "Phường Gia Định", "TP Hồ Chí Minh"],
  [11, "86 Bà Triệu", "Phường Hai Bà Trưng", "Hà Nội"],
  [12, "62 Hoàng Hoa Thám", "Phường Bình Thạnh", "TP Hồ Chí Minh"],
  [13, "25 Láng Hạ", "Phường Giảng Võ", "Hà Nội"],
  [14, "29 Trần Hưng Đạo", "Phường Cầu Ông Lãnh", "TP Hồ Chí Minh"],
  [15, "12 Nguyễn Thái Học", "Phường Ba Đình", "Hà Nội"],
  [16, "55 Nguyễn Văn Trỗi", "Phường Phú Nhuận", "TP Hồ Chí Minh"],
  [17, "45 Kim Mã", "Phường Giảng Võ", "Hà Nội"],
  [18, "37 Nguyễn Thị Minh Khai", "Phường Sài Gòn", "TP Hồ Chí Minh"],
  [19, "72 Nguyễn Chí Thanh", "Phường Láng", "Hà Nội"],
].map(([userId, addressLine, ward, province], i) => {
  const u = users.find((x) => x.id === userId);
  return { id: i + 1, userId, receiverName: u.fullName, phone: u.phone, addressLine, ward, province, isDefault: true };
});

const categories = [
  [1, "Trái cây Việt Nam", "trai-cay-viet-nam", "/images/products/mango-photo.png"],
  [2, "Trái cây nhập khẩu", "trai-cay-nhap-khau", "/images/products/apple-photo.png"],
  [3, "Trái cây hữu cơ", "trai-cay-huu-co", "/images/products/avocado-photo.png"],
  [4, "Trái cây sơ chế", "trai-cay-so-che", "/images/storefront/fruit-cut.png"],
  [5, "Combo trái cây", "combo-trai-cay", "/images/products/grapes-photo.png"],
  [6, "Quà tặng trái cây", "qua-tang-trai-cay", "/images/storefront/fruit-gift.png"],
].map(([id, name, slug, imageUrl]) => ({ id, name, slug, imageUrl }));

const shops = [
  { id: 1, ownerId: 2, name: "Vườn Nhà Sơn", description: "Trái cây miền Tây theo mùa, nhận hàng mỗi sáng tại kho Tân Phú. Chọn từng đợt chín, đóng túi thoáng và giao theo lịch khách đặt.", phone: "0918372645", email: "hoangvanson@gmail.com", address: "126 Lũy Bán Bích, Phường Tân Phú", province: "TP Hồ Chí Minh", logo: "/images/shops/son-logo.svg", banner: "/images/shops/son-banner.svg", status: "ACTIVE", createdAt: daysAgo(40) },
  { id: 2, ownerId: 3, name: "Trái Cây Khổng Hưng", description: "Trái cây tuyển chọn, quy cách hộp nhỏ và thùng quà. Giữ lạnh theo từng nhóm hàng, hỗ trợ chọn độ chín và gói quà khi đặt trước.", phone: "0935481762", email: "khonghung@gmail.com", address: "38 Phố Huế, Phường Hai Bà Trưng", province: "Hà Nội", logo: "/images/shops/hung-logo.svg", banner: "/images/shops/hung-banner.svg", status: "ACTIVE", createdAt: daysAgo(38) },
  { id: 3, ownerId: 4, name: "Nông Sản Phạm Phước", description: "Cửa hàng nông sản gia đình đang chuẩn bị danh mục hàng đầu tiên. Hồ sơ người bán đã được duyệt.", phone: "0986714352", email: "phamphuoc@gmail.com", address: "74 Phạm Văn Bạch, Phường Tân Sơn", province: "TP Hồ Chí Minh", logo: "/images/shops/phuoc-logo.svg", banner: "/images/shops/phuoc-banner.svg", status: "ACTIVE", createdAt: daysAgo(10) },
];

const W = "https://thumb.wikimedia.org/wikipedia/commons/thumb/";
const CAT = { LOCAL: 1, IMPORTED: 2, CUT: 4 };
// [id, shopId, name, image, description, origin, category, scenario]
const productRows = [
  [1, 1, "Xoài cát Hòa Lộc", W + "7/74/Mangos_-_single_and_halved.jpg/960px-Mangos_-_single_and_halved.jpg", "Xoài chín vừa, vỏ vàng nhạt và thịt ít xơ. Chọn quả còn cuống, đóng túi lưới; để nơi thoáng, khi chín chuyển ngăn mát.", "Tiền Giang, Việt Nam", "LOCAL", "healthy"],
  [2, 1, "Chôm chôm nhãn", W + "b/bb/Rambutans_with_seed.jpg/960px-Rambutans_with_seed.jpg", "Chôm chôm nguyên chùm, cùi giòn và vị ngọt nhẹ. Đóng túi có lỗ thoáng, bảo quản ngăn mát và rửa trước khi ăn.", "Bến Tre, Việt Nam", "LOCAL", "near"],
  [3, 1, "Bưởi Năm Roi Vĩnh Long", W + "f/f3/Pomelo_fruit.jpg/960px-Pomelo_fruit.jpg", "Bưởi nguyên quả, chọn cỡ khoảng 1,2–1,5 kg. Giao quả chưa bóc để giữ tép mọng; giá theo quy cách đã chọn.", "Vĩnh Long, Việt Nam", "LOCAL", "healthy"],
  [4, 1, "Cam sành Vĩnh Long", W + "e/e3/Oranges_-_whole-halved-segment.jpg/960px-Oranges_-_whole-halved-segment.jpg", "Cam vỏ xanh, nhiều nước, phù hợp ép hoặc ăn múi. Phân cỡ trước khi đóng túi; giữ ngăn mát, không ngâm nước trước khi cất.", "Vĩnh Long, Việt Nam", "LOCAL", "healthy"],
  [5, 1, "Ổi nữ hoàng", W + "8/84/Goiaba_vermelha.jpg/960px-Goiaba_vermelha.jpg", "Ổi nguyên quả, ruột chắc, độ chín vừa để ăn giòn. Đóng túi giấy có lót, rửa sạch và cắt bỏ cuống trước khi dùng.", "Việt Nam", "LOCAL", "low"],
  [6, 1, "Dừa xiêm Bến Tre", W + "f/f1/Coconuts_-_single_and_cracked_open.jpg/960px-Coconuts_-_single_and_cracked_open.jpg", "Dừa xiêm nguyên quả, nước ngọt thanh. Đơn đặt gọt vỏ được xử lý khi chuẩn bị giao; phần đã mở nên dùng trong ngày.", "Bến Tre, Việt Nam", "LOCAL", "healthy"],
  [7, 1, "Nhãn xuồng cơm vàng", W + "2/2d/Dimocarpus_longan_fruits.jpg/960px-Dimocarpus_longan_fruits.jpg", "Nhãn nguyên chùm được lựa bỏ quả dập trước khi đóng túi. Cùi dày, thích hợp ăn tươi; bảo quản mát và dùng sớm.", "Việt Nam", "LOCAL", "hidden"],
  [8, 1, "Dưa hấu Long An", "https://upload.wikimedia.org/wikipedia/commons/4/4c/Vampire_watermelon.jpg", "Dưa hấu nguyên trái, chọn vỏ lành và cuống khô. Quy cách theo khoảng trọng lượng, phần đã cắt cần giữ lạnh và dùng sớm.", "Long An, Việt Nam", "LOCAL", "soldout"],
  [9, 1, "Sầu riêng Ri6 tách múi", W + "0/02/Durian.jpg/960px-Durian.jpg", "Múi sầu riêng được tách và đóng hộp khi chuẩn bị đơn. Không thêm đường; giữ lạnh 2–5°C và dùng trong ngày sau khi nhận.", "Việt Nam", "CUT", "violation"],
  [10, 1, "Chuối Laba Đà Lạt", W + "4/40/Bananas_on_countertop.JPG/960px-Bananas_on_countertop.JPG", "Chuối bán theo nải, chọn độ chín theo nhu cầu ăn ngay hoặc để chín tiếp. Để nơi khô thoáng, tránh đè lên quả.", "Đà Lạt, Việt Nam", "LOCAL", "pending"],
  [11, 1, "Mít Thái tách múi", W + "5/54/Jackfruit_NS-1_01_Asit.jpg/960px-Jackfruit_NS-1_01_Asit.jpg", "Mít tách múi, bỏ xơ và đóng hộp kín. Múi có độ chín vừa, giữ ngăn mát; mở hộp nên dùng ngay trong ngày.", "Việt Nam", "CUT", "hidden"],
  [12, 1, "Thanh long ruột trắng Bình Thuận", W + "3/35/Dragon_fruit_.jpg/960px-Dragon_fruit_.jpg", "Thanh long nguyên quả, tai xanh và vỏ không dập. Phân loại quả trước khi đóng túi, phù hợp ăn tươi hoặc làm nước ép.", "Bình Thuận, Việt Nam", "LOCAL", "healthy"],
  [13, 2, "Táo Gala New Zealand", W + "1/15/Red_Apple.jpg/960px-Red_Apple.jpg", "Táo Gala cỡ vừa, thịt giòn, vị ngọt dịu. Đóng khay có đệm từng quả, bảo quản 2–5°C; rửa dưới vòi nước trước khi ăn.", "New Zealand", "IMPORTED", "healthy"],
  [14, 2, "Kiwi xanh New Zealand", W + "b/b8/Kiwi_%28Actinidia_chinensis%29_1_Luc_Viatour.jpg/960px-Kiwi_%28Actinidia_chinensis%29_1_Luc_Viatour.jpg", "Kiwi xanh vỏ nâu, vị chua ngọt. Quả còn chắc có thể để chín tự nhiên; khi mềm chuyển ngăn mát và dùng sớm.", "New Zealand", "IMPORTED", "near"],
  [15, 2, "Việt quất Peru", W + "7/7d/Dish_of_blueberries.jpg/960px-Dish_of_blueberries.jpg", "Việt quất nguyên hộp 125 g, giữ lớp phấn tự nhiên trên vỏ. Bảo quản lạnh, chỉ rửa lượng dùng ngay và không ngâm lâu.", "Peru", "IMPORTED", "low"],
  [16, 2, "Cherry đỏ Úc", W + "4/40/Bing_Cherries_%28USDA_ARS%29.jpg/960px-Bing_Cherries_%28USDA_ARS%29.jpg", "Cherry đỏ nguyên cuống, thịt chắc, đóng hộp có lót giấy. Bảo quản 2–5°C, rửa trước khi dùng và bỏ hạt khi cho trẻ nhỏ.", "Úc", "IMPORTED", "healthy"],
  [17, 2, "Nho xanh Ninh Thuận", W + "d/d9/Grapes%2C_Dry_Creek_Valley-7705.jpg/960px-Grapes%2C_Dry_Creek_Valley-7705.jpg", "Nho nguyên chùm được chọn quả lành, đóng khay hạn chế xô lệch. Giữ lạnh và chỉ tách, rửa trước khi ăn.", "Ninh Thuận, Việt Nam", "LOCAL", "healthy"],
  [18, 2, "Lê Hàn Quốc", "https://upload.wikimedia.org/wikipedia/commons/9/92/Blake%27s_Pride_pears.jpg", "Lê vỏ vàng, nhiều nước, đóng lưới xốp từng quả. Cỡ quả khoảng 400–500 g; giữ ngăn mát và tránh chèn vật nặng lên hộp.", "Hàn Quốc", "IMPORTED", "pending"],
  [19, 2, "Lựu đỏ Peru", W + "f/fa/Pomegranate_fruit_-_whole_and_piece_with_arils.jpg/960px-Pomegranate_fruit_-_whole_and_piece_with_arils.jpg", "Lựu nguyên quả, vỏ đỏ lành, phù hợp tách hạt ăn tươi hoặc ép nước. Để mát, phần đã tách giữ trong hộp kín và dùng sớm.", "Peru", "IMPORTED", "healthy"],
  [20, 2, "Đào tiên", W + "9/9e/Autumn_Red_peaches.jpg/960px-Autumn_Red_peaches.jpg", "Đào nguyên quả, hương thơm nhẹ, đóng khay có đệm. Chọn quả mềm vừa để dùng; phần còn chắc có thể để chín tiếp ở nơi thoáng.", "Trung Quốc", "IMPORTED", "hidden"],
];

const products = productRows.map(([id, shopId, name, image, description, origin, category, scenario]) => ({
  id, shopId, categoryId: CAT[category], name, image, description, origin,
  status: scenario === "hidden" ? "INACTIVE" : "ACTIVE",
  approval: scenario === "pending" ? "PENDING" : scenario === "violation" ? "REJECTED" : "APPROVED",
  rejectNote: scenario === "violation" ? "Thiếu chứng từ nguồn gốc sau hậu kiểm" : "",
  sold: 0,
  createdAt: daysAgo(30 - (id % 10)),
}));

// [id, productId, name, unit, weight, price, comparePrice, status]
const variantRows = [
  [1, 1, "Túi 1 kg", "kg", 1, 59000, 67000, "ACTIVE"], [2, 1, "Thùng gia đình 3 kg", "thùng", 3, 168000, 189000, "ACTIVE"],
  [3, 2, "Túi 500 g", "túi", 0.5, 29000, 33000, "ACTIVE"], [4, 3, "Quả cỡ 1,2 kg", "quả", 1.2, 52000, null, "ACTIVE"],
  [5, 3, "Cặp hai quả", "cặp", 2.4, 99000, null, "ACTIVE"], [6, 4, "Túi 1 kg", "kg", 1, 32000, 36000, "ACTIVE"],
  [7, 4, "Túi ép nước 2 kg", "túi", 2, 58000, 65000, "ACTIVE"], [8, 5, "Túi 1 kg", "kg", 1, 35000, 40000, "ACTIVE"],
  [9, 6, "Một quả gọt vỏ", "quả", 0.9, 24000, null, "ACTIVE"], [10, 7, "Túi 500 g", "túi", 0.5, 46000, 52000, "ACTIVE"],
  [11, 8, "Trái cỡ 2 kg", "trái", 2, 48000, 54000, "OUT_OF_STOCK"], [12, 8, "Trái cỡ 3 kg", "trái", 3, 69000, 78000, "OUT_OF_STOCK"],
  [13, 9, "Hộp múi 400 g", "hộp", 0.4, 149000, null, "ACTIVE"], [14, 10, "Nải cỡ 700 g", "nải", 0.7, 23000, 26000, "ACTIVE"],
  [15, 10, "Nải cỡ 1 kg", "nải", 1, 31000, 35000, "ACTIVE"], [16, 10, "Túi chuối chín 1,5 kg", "túi", 1.5, 42000, 48000, "ACTIVE"],
  [17, 11, "Hộp múi 500 g", "hộp", 0.5, 49000, 55000, "INACTIVE"], [18, 12, "Túi 1 kg", "kg", 1, 28000, null, "ACTIVE"],
  [19, 12, "Thùng 5 kg", "thùng", 5, 125000, null, "ACTIVE"], [20, 13, "Khay 4 quả", "khay", 0.7, 89000, 100000, "ACTIVE"],
  [21, 13, "Hộp 1 kg", "hộp", 1, 119000, 134000, "ACTIVE"], [22, 13, "Thùng 3 kg", "thùng", 3, 339000, 380000, "ACTIVE"],
  [23, 14, "Hộp 500 g", "hộp", 0.5, 79000, 89000, "ACTIVE"], [24, 14, "Hộp tuyển chọn 1 kg", "hộp", 1, 149000, 167000, "ACTIVE"],
  [25, 15, "Hộp 125 g", "hộp", 0.125, 85000, null, "ACTIVE"], [26, 16, "Hộp 500 g", "hộp", 0.5, 219000, 246000, "ACTIVE"],
  [27, 16, "Hộp quà 1 kg", "hộp", 1, 429000, 481000, "INACTIVE"], [28, 17, "Khay 500 g", "khay", 0.5, 59000, 67000, "ACTIVE"],
  [29, 17, "Hộp 1 kg", "hộp", 1, 109000, 123000, "ACTIVE"], [30, 18, "Hộp hai quả", "hộp", 0.9, 129000, null, "ACTIVE"],
  [31, 19, "Túi hai quả", "túi", 0.8, 139000, 156000, "ACTIVE"], [32, 19, "Hộp quà bốn quả", "hộp", 1.6, 269000, 302000, "ACTIVE"],
  [33, 20, "Khay 500 g", "khay", 0.5, 89000, 100000, "ACTIVE"],
];
const scenarioOf = (productId) => productRows.find((p) => p[0] === productId)[7];
const variants = variantRows.map(([id, productId, name, unit, weight, price, comparePrice, status]) => {
  const sc = scenarioOf(productId);
  const stock = status === "OUT_OF_STOCK" || sc === "soldout" ? 0 : sc === "low" ? 3 : sc === "near" ? 8 : 20 + Math.floor(rand() * 40);
  return { id, productId, name, unit, weight, price, comparePrice, stock, lowStock: 5, status: status === "OUT_OF_STOCK" ? "ACTIVE" : status };
});

const coupons = [
  { id: 1, shopId: 1, code: "SONGIADINH", name: "Giỏ trái cây gia đình", discount: 15000, minOrder: 150000, usageLimit: 500, used: 0, startAt: daysAgo(14), endAt: daysAgo(-7), status: "ACTIVE" },
  { id: 2, shopId: 2, code: "HUNGCHONLOC", name: "Trái cây tuyển chọn cuối tuần", discount: 25000, minOrder: 300000, usageLimit: 500, used: 0, startAt: daysAgo(14), endAt: daysAgo(-7), status: "ACTIVE" },
];

// Đơn hàng: [shopId, customerId, status, minutesAgo, method, shippingFee]
const orderPlan = [
  [1, 16, "COMPLETED", 5760, "BANK_TRANSFER", 18000], [1, 18, "COMPLETED", 6350, "COD", 12000],
  [1, 12, "COMPLETED", 6940, "BANK_TRANSFER", 18000], [1, 14, "COMPLETED", 7530, "COD", 12000],
  [1, 8, "COMPLETED", 9300, "COD", 18000], [1, 13, "COMPLETED", 9890, "COD", 21000],
  [1, 10, "COMPLETED", 10480, "COD", 12000], [1, 8, "COMPLETED", 11070, "COD", 18000],
  [1, 10, "COMPLETED", 3600, "BANK_TRANSFER", 12000], [1, 14, "COMPLETED", 2520, "BANK_TRANSFER", 12000],
  [1, 14, "CANCELLED", 18720, "BANK_TRANSFER", 12000], [1, 18, "CANCELLED", 18900, "COD", 12000],
  [1, 14, "PENDING", 35, "BANK_TRANSFER", 12000], [1, 12, "PENDING", 78, "COD", 18000],
  [1, 8, "PENDING", 379, "COD", 18000], [1, 9, "PENDING", 422, "COD", 21000],
  [1, 13, "CONFIRMED", 2880, "COD", 21000], [1, 19, "CONFIRMED", 180, "COD", 15000],
  [1, 8, "CONFIRMED", 414, "COD", 18000], [1, 19, "PREPARING", 280, "COD", 15000],
  [1, 8, "PREPARING", 319, "COD", 18000], [1, 11, "READY_FOR_DELIVERY", 180, "COD", 15000],
  [1, 19, "READY_FOR_DELIVERY", 219, "COD", 15000], [1, 14, "OUT_FOR_DELIVERY", 280, "COD", 12000],
  [1, 8, "OUT_FOR_DELIVERY", 319, "COD", 18000],
  [2, 9, "COMPLETED", 5760, "BANK_TRANSFER", 30000], [2, 19, "COMPLETED", 6870, "BANK_TRANSFER", 22000],
  [2, 17, "COMPLETED", 7980, "COD", 30000], [2, 13, "COMPLETED", 9090, "BANK_TRANSFER", 30000],
  [2, 18, "COMPLETED", 3600, "BANK_TRANSFER", 18000], [2, 13, "CANCELLED", 18720, "COD", 30000],
  [2, 17, "PENDING", 35, "BANK_TRANSFER", 30000], [2, 11, "PENDING", 78, "BANK_TRANSFER", 22000],
  [2, 15, "CONFIRMED", 180, "COD", 22000], [2, 19, "PREPARING", 280, "BANK_TRANSFER", 22000],
  [2, 8, "READY_FOR_DELIVERY", 180, "BANK_TRANSFER", 26000], [2, 14, "READY_FOR_DELIVERY", 219, "BANK_TRANSFER", 18000],
  [2, 8, "OUT_FOR_DELIVERY", 280, "BANK_TRANSFER", 26000],
];
const FLOW = ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "COMPLETED"];
const sellable = (shopId) =>
  variants.filter((v) => {
    const p = products.find((x) => x.id === v.productId);
    return p.shopId === shopId && p.status === "ACTIVE" && p.approval === "APPROVED" && v.status === "ACTIVE";
  });

const orders = orderPlan.map(([shopId, customerId, status, mAgo, method, shippingFee], i) => {
  const lineCount = 1 + Math.floor(rand() * 2);
  const chosen = [];
  while (chosen.length < lineCount) {
    const v = pick(sellable(shopId));
    if (!chosen.find((c) => c.variantId === v.id)) {
      const p = products.find((x) => x.id === v.productId);
      chosen.push({ variantId: v.id, productId: p.id, productName: p.name, variantName: v.name, image: p.image, price: v.price, quantity: 1 + Math.floor(rand() * 3) });
    }
  }
  const subtotal = chosen.reduce((s, l) => s + l.price * l.quantity, 0);
  const createdAt = minutesAgo(mAgo);
  const reached = status === "CANCELLED" ? ["PENDING", "CANCELLED"] : FLOW.slice(0, FLOW.indexOf(status) + 1);
  const history = reached.map((s, k) => ({ status: s, at: minutesAgo(mAgo - k * 30) }));
  const addr = addresses.find((a) => a.userId === customerId);
  const staff = ["OUT_FOR_DELIVERY", "COMPLETED"].includes(status) ? 5 + (i % 3) : null;
  if (status === "COMPLETED") chosen.forEach((l) => (products.find((p) => p.id === l.productId).sold += l.quantity));
  return {
    id: i + 1,
    code: "VF" + String(100000 + i + 1),
    customerId, shopId,
    items: chosen,
    subtotal, shippingFee, discount: 0, total: subtotal + shippingFee, couponCode: "",
    paymentMethod: method,
    paymentStatus: status === "COMPLETED" || (method === "BANK_TRANSFER" && status !== "CANCELLED") ? "PAID" : status === "CANCELLED" && method === "BANK_TRANSFER" ? "REFUNDED" : "UNPAID",
    status,
    cancelReason: status === "CANCELLED" ? "Khách hàng đổi ý" : "",
    address: { receiverName: addr.receiverName, phone: addr.phone, addressLine: addr.addressLine, ward: addr.ward, province: addr.province },
    note: "",
    deliveryStaffId: staff,
    createdAt,
    history,
  };
});

const CONTENTS = ["Hàng tươi, giao đúng hẹn. Sẽ đặt lại cho gia đình.", "Đóng gói cẩn thận, đúng quy cách đã chọn.", "Có vài quả mềm hơn dự kiến, cửa hàng đã hướng dẫn bảo quản."];
const reviews = orders
  .filter((o) => o.status === "COMPLETED")
  .map((o, i) => ({
    id: i + 1, userId: o.customerId, productId: o.items[0].productId, orderId: o.id,
    rating: o.id % 7 === 0 ? 3 : o.id % 3 === 0 ? 4 : 5,
    content: o.id % 7 === 0 ? CONTENTS[2] : o.id % 3 === 0 ? CONTENTS[1] : CONTENTS[0],
    status: o.id % 8 === 0 ? "PENDING" : "APPROVED",
    createdAt: o.history[o.history.length - 1].at,
  }));

let nid = 1;
const notifications = [];
orders.forEach((o) => {
  if (o.status === "PENDING") {
    const shop = shops.find((s) => s.id === o.shopId);
    notifications.push({ id: nid++, userId: shop.ownerId, title: "Có đơn hàng mới", content: `Đơn ${o.code} đang chờ cửa hàng xác nhận.`, link: `/seller/orders/${o.id}`, read: false, createdAt: o.createdAt });
  }
  if (o.status === "COMPLETED" || o.status === "CANCELLED") {
    notifications.push({ id: nid++, userId: o.customerId, title: o.status === "COMPLETED" ? "Đơn hàng đã giao thành công" : "Đơn hàng đã hủy", content: `Cập nhật trạng thái đơn ${o.code}. Bạn có thể xem chi tiết tại lịch sử đơn hàng.`, link: `/account/orders/${o.id}`, read: o.id % 4 !== 0, createdAt: o.history[o.history.length - 1].at });
  }
});

const db = { users, addresses, categories, shops, products, variants, coupons, orders, reviews, notifications };
const out = path.join(__dirname, "..", "db.json");
fs.writeFileSync(out, JSON.stringify(db, null, 2), "utf8");
console.log(`Đã ghi ${out}: ${products.length} sản phẩm, ${variants.length} biến thể, ${orders.length} đơn hàng.`);
