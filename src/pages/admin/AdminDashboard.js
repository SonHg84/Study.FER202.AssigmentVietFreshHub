import { Alert, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ORDER_STATUS, ROLE_LABELS } from "../../utils/constants";
import { formatCurrency } from "../../utils/format";

function Stat({ label, value, hint, to }) {
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="text-muted small">{label}</div>
        <div className="fs-3 fw-bold">{value}</div>
        {hint && (to ? <Link to={to}>{hint}</Link> : <small className="text-muted">{hint}</small>)}
      </Card.Body>
    </Card>
  );
}

function AdminDashboard() {
  useDocumentTitle("Bảng điều khiển quản trị");
  const users = useFetch("/users", []);
  const shops = useFetch("/shops", []);
  const products = useFetch("/products", []);
  const orders = useFetch("/orders", []);
  const reviews = useFetch("/reviews", []);

  const loading = [users, shops, products, orders, reviews].some((r) => r.loading);
  const error = [users, shops, products, orders, reviews].find((r) => r.error)?.error;
  if (loading) return <Loading />;

  const pendingProducts = products.data.filter((p) => p.approval === "PENDING").length;
  const pendingReviews = reviews.data.filter((r) => r.status === "PENDING").length;
  const completed = orders.data.filter((o) => o.status === "COMPLETED");
  const gmv = completed.reduce((sum, o) => sum + o.total, 0);
  const byRole = Object.keys(ROLE_LABELS).map((role) => ({ role, count: users.data.filter((u) => u.role === role).length }));

  return (
    <>
      <PageHeader title="Tổng quan hệ thống" subtitle="Số liệu toàn nền tảng VietFresh Hub" />
      {error && <Alert variant="danger">{error}</Alert>}

      <Row xs={2} lg={4} className="g-3 mb-4">
        <Col>
          <Stat label="Tài khoản" value={users.data.length} hint="Quản lý tài khoản" to="/admin/accounts" />
        </Col>
        <Col>
          <Stat label="Cửa hàng" value={shops.data.length} hint={`${shops.data.filter((s) => s.status === "ACTIVE").length} đang mở`} to="/admin/shops" />
        </Col>
        <Col>
          <Stat label="Sản phẩm chờ duyệt" value={pendingProducts} hint="Duyệt ngay" to="/admin/products" />
        </Col>
        <Col>
          <Stat label="Đánh giá chờ duyệt" value={pendingReviews} hint="Kiểm duyệt" to="/admin/reviews" />
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <h2 className="h6">Doanh số</h2>
              <div className="fs-4 fw-bold">{formatCurrency(gmv)}</div>
              <small className="text-muted">Tổng giá trị {completed.length} đơn đã giao</small>
              <hr />
              <h2 className="h6">Tài khoản theo vai trò</h2>
              {byRole.map((r) => (
                <div key={r.role} className="d-flex justify-content-between">
                  <span>{ROLE_LABELS[r.role]}</span>
                  <strong>{r.count}</strong>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <h2 className="h6">Đơn hàng theo trạng thái ({orders.data.length})</h2>
              {Object.entries(ORDER_STATUS).map(([key, info]) => (
                <div key={key} className="d-flex justify-content-between">
                  <span>{info.label}</span>
                  <strong>{orders.data.filter((o) => o.status === key).length}</strong>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default AdminDashboard;
