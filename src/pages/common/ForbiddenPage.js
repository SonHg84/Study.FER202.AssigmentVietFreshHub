import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../contexts/AuthContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ROLE_HOME, ROLE_LABELS } from "../../utils/constants";

// Hiển thị khi người dùng đã đăng nhập nhưng sai vai trò (withRole chuyển về đây).
function ForbiddenPage() {
  useDocumentTitle("Không có quyền truy cập");
  const { user } = useAuth();
  const home = user ? ROLE_HOME[user.role] || "/" : "/login";

  return (
    <EmptyState
      title="403 – Bạn không có quyền truy cập trang này."
      action={
        <Button as={Link} to={home}>
          {user ? `Về trang ${ROLE_LABELS[user.role] || "chủ"}` : "Đăng nhập"}
        </Button>
      }
    >
      {user
        ? `Tài khoản của bạn (${ROLE_LABELS[user.role] || user.role}) không được phép vào khu vực này.`
        : "Vui lòng đăng nhập bằng tài khoản phù hợp."}
    </EmptyState>
  );
}

export default ForbiddenPage;
