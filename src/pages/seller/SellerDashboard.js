import { Alert, Button, Card, Col, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import useFetch from "../../hooks/useFetch";
import useMyShop from "../../hooks/useMyShop";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ORDER_STATUS } from "../../utils/constants";
import { formatCurrency, formatDateTime } from "../../utils/format";

function StatCard({ label, value, hint, to }) {
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

function SellerDashboard() {
  useDocumentTitle("Bảng điều khiển người bán");
  const { shop, loading: loadingShop, error: shopError } = useMyShop();
  const { data: orders, loading: loadingOrders } = useFetch(shop ? `/orders?shopId=${shop.id}&_sort=createdAt&_order=desc` : null, []);
  const { data: products, loading: loadingProducts } = useFetch(shop ? `/products?shopId=${shop.id}&_embed=variants` : null, []);

  if (loadingShop || loadingOrders || loadingProducts) return <Loading />;
  if (shopError) return <Alert variant="danger">{shopError}</Alert>;
  if (!shop) return <EmptyState title="Tài khoản của bạn chưa có cửa hàng." />;

  const count = (status) => orders.filter((o) => o.status === status).length;
  const revenue = orders.filter((o) => o.status === "COMPLETED").reduce((sum, o) => sum + o.total - o.shippingFee, 0);
  const pendingApproval = products.filter((p) => p.approval === "PENDING").length;
  const lowStock = products.flatMap((p) =>
    p.variants.filter((v) => v.status === "ACTIVE" && v.stock <= v.lowStock).map((v) => ({ ...v, productName: p.name, productId: p.id }))
  );

  return (
    <>
      <PageHeader title={shop.name} subtitle="Tổng quan hoạt động cửa hàng">
        <Button as={Link} to="/seller/products/new">
          + Thêm sản phẩm
        </Button>
      </PageHeader>
      {shop.status === "SUSPENDED" && <Alert variant="danger">Cửa hàng đang bị tạm khoá, sản phẩm không hiển thị với khách hàng. Vui lòng liên hệ quản trị viên.</Alert>}

      <Row xs={2} lg={4} className="g-3 mb-4">
        <Col>
          <StatCard label="Đơn chờ xác nhận" value={count("PENDING")} hint="Xử lý ngay" to="/seller/orders/status/PENDING" />
        </Col>
        <Col>
          <StatCard label="Đang chuẩn bị" value={count("CONFIRMED") + count("PREPARING")} hint="Xem đơn" to="/seller/orders" />
        </Col>
        <Col>
          <StatCard label="Doanh thu hàng hoá" value={formatCurrency(revenue)} hint="Đơn đã giao (chưa gồm phí giao)" />
        </Col>
        <Col>
          <StatCard label="Sản phẩm" value={products.length} hint={pendingApproval ? `${pendingApproval} chờ duyệt` : "Tất cả đã xử lý"} to="/seller/products" />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card>
            <Card.Header className="fw-semibold">Đơn hàng gần đây</Card.Header>
            {orders.length === 0 ? (
              <Card.Body className="text-muted">Chưa có đơn hàng nào.</Card.Body>
            ) : (
              <Table responsive hover className="mb-0 align-middle">
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link to={`/seller/orders/${o.id}`}>{o.code}</Link>
                        <div className="small text-muted">{formatDateTime(o.createdAt)}</div>
                      </td>
                      <td>{o.address.receiverName}</td>
                      <td className="text-end">{formatCurrency(o.total)}</td>
                      <td>
                        <StatusBadge status={o.status} map={ORDER_STATUS} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
        <Col lg={5}>
          <Card>
            <Card.Header className="fw-semibold">Sắp hết hàng</Card.Header>
            {lowStock.length === 0 ? (
              <Card.Body className="text-muted">Tồn kho đang ổn định.</Card.Body>
            ) : (
              <Table responsive className="mb-0 align-middle">
                <tbody>
                  {lowStock.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <Link to={`/seller/products/${v.productId}/edit`}>{v.productName}</Link>
                        <div className="small text-muted">{v.name}</div>
                      </td>
                      <td className="text-end text-danger fw-semibold">Còn {v.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default SellerDashboard;
