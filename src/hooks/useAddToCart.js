import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { addToCart } from "../store/cartSlice";
import { toCartLine } from "../utils/product";

// Custom hook gom logic "thêm vào giỏ": kiểm tra đăng nhập/vai trò, tồn kho, rồi dispatch.
export default function useAddToCart() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (product, variant, quantity = 1) => {
      if (!user) {
        showToast("Vui lòng đăng nhập để mua hàng.", "warning");
        navigate("/login", { state: { from: location } });
        return false;
      }
      if (user.role !== "CUSTOMER") {
        showToast("Chỉ tài khoản khách hàng mới mua hàng được.", "warning");
        return false;
      }
      if (!variant || variant.stock <= 0) {
        showToast("Quy cách này đã hết hàng.", "danger");
        return false;
      }
      dispatch(addToCart(toCartLine(product, variant, quantity)));
      showToast(`Đã thêm "${product.name} – ${variant.name}" vào giỏ.`);
      return true;
    },
    [dispatch, user, showToast, navigate, location]
  );
}
