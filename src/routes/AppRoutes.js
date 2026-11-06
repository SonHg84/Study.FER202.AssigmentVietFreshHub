import { lazy } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import StoreLayout from "../components/layout/StoreLayout";
import WorkspaceLayout from "../components/layout/WorkspaceLayout";
import withRole from "../hoc/withRole";
import { adminMenu, deliveryMenu, sellerMenu } from "./menus";

// Code splitting: mỗi trang là một bundle riêng, chỉ tải khi route được kích hoạt lần đầu.
// (React.lazy chỉ nhận default export.)
const HomePage = lazy(() => import("../pages/customer/HomePage"));
const CatalogPage = lazy(() => import("../pages/customer/CatalogPage"));
const ProductDetailPage = lazy(() => import("../pages/customer/ProductDetailPage"));
const ShopListPage = lazy(() => import("../pages/customer/ShopListPage"));
const ShopDetailPage = lazy(() => import("../pages/customer/ShopDetailPage"));
const CartPage = lazy(() => import("../pages/customer/CartPage"));
const CheckoutPage = lazy(() => import("../pages/customer/CheckoutPage"));
const OrdersPage = lazy(() => import("../pages/customer/OrdersPage"));
const OrderDetailPage = lazy(() => import("../pages/customer/OrderDetailPage"));
const ProfilePage = lazy(() => import("../pages/customer/ProfilePage"));
const AddressesPage = lazy(() => import("../pages/customer/AddressesPage"));
const NotificationsPage = lazy(() => import("../pages/common/NotificationsPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ForbiddenPage = lazy(() => import("../pages/common/ForbiddenPage"));
const NotFoundPage = lazy(() => import("../pages/common/NotFoundPage"));

const SellerDashboard = lazy(() => import("../pages/seller/SellerDashboard"));
const SellerProducts = lazy(() => import("../pages/seller/SellerProducts"));
const SellerProductForm = lazy(() => import("../pages/seller/SellerProductForm"));
const SellerOrders = lazy(() => import("../pages/seller/SellerOrders"));
const SellerOrderDetail = lazy(() => import("../pages/seller/SellerOrderDetail"));
const SellerCoupons = lazy(() => import("../pages/seller/SellerCoupons"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminAccounts = lazy(() => import("../pages/admin/AdminAccounts"));
const AdminShops = lazy(() => import("../pages/admin/AdminShops"));
const AdminCategories = lazy(() => import("../pages/admin/AdminCategories"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const AdminReviews = lazy(() => import("../pages/admin/AdminReviews"));

const DeliveryAvailable = lazy(() => import("../pages/delivery/DeliveryAvailable"));
const DeliveryMine = lazy(() => import("../pages/delivery/DeliveryMine"));
const DeliveryHistory = lazy(() => import("../pages/delivery/DeliveryHistory"));

// Bảo vệ route bằng HOC withRole (tạo một lần ở cấp module, không tạo trong render).
const MemberArea = withRole(Outlet);
const CustomerArea = withRole(Outlet, ["CUSTOMER"]);
const SellerArea = withRole(WorkspaceLayout, ["SELLER"]);
const AdminArea = withRole(WorkspaceLayout, ["ADMIN"]);
const DeliveryArea = withRole(WorkspaceLayout, ["DELIVERY"]);

function AppRoutes() {
  return (
    <Routes>
      {/* Khu mua sắm */}
      <Route path="/" element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<CatalogPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="shops" element={<ShopListPage />} />
        <Route path="shops/:id" element={<ShopDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forbidden" element={<ForbiddenPage />} />

        <Route element={<CustomerArea />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="account">
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
          </Route>
        </Route>

        <Route element={<MemberArea />}>
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Khu người bán */}
      <Route path="/seller" element={<SellerArea title="Kênh người bán" menu={sellerMenu} />}>
        <Route index element={<SellerDashboard />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="products/new" element={<SellerProductForm />} />
        <Route path="products/:id/edit" element={<SellerProductForm />} />
        {/* Tham số tuỳ chọn: /seller/orders và /seller/orders/status/:status cùng dùng một trang */}
        <Route path="orders">
          <Route index element={<SellerOrders />} />
          <Route path="status/:status" element={<SellerOrders />} />
          <Route path=":id" element={<SellerOrderDetail />} />
        </Route>
        <Route path="coupons" element={<SellerCoupons />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Khu quản trị */}
      <Route path="/admin" element={<AdminArea title="Quản trị hệ thống" menu={adminMenu} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="accounts" element={<AdminAccounts />} />
        <Route path="shops" element={<AdminShops />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Khu giao hàng */}
      <Route path="/delivery" element={<DeliveryArea title="Nhân viên giao hàng" menu={deliveryMenu} />}>
        <Route index element={<DeliveryAvailable />} />
        <Route path="mine" element={<DeliveryMine />} />
        <Route path="history" element={<DeliveryHistory />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
