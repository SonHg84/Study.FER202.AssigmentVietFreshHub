import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// Route "*" của mọi khu (cửa hàng, người bán, quản trị, giao hàng).
function NotFoundPage() {
  useDocumentTitle("Không tìm thấy trang");

  return (
    <EmptyState
      title="404 – Không tìm thấy trang bạn cần."
      action={
        <Button as={Link} to="/">
          Về trang chủ
        </Button>
      }
    >
      Đường dẫn có thể đã bị đổi hoặc không còn tồn tại.
    </EmptyState>
  );
}

export default NotFoundPage;
