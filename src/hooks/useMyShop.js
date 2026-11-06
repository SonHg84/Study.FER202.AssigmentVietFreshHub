import { useAuth } from "../contexts/AuthContext";
import useFetch from "./useFetch";

// Cửa hàng của người bán đang đăng nhập (mỗi người bán sở hữu một cửa hàng).
export default function useMyShop() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch(`/shops?ownerId=${user.id}`, []);
  return { shop: data[0] || null, loading, error };
}
