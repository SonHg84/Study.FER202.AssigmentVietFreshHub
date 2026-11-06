import { useState } from "react";
import { Alert, Button, Card, Col, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import OrderTimeline from "../../components/common/OrderTimeline";
import ConfirmModal from "../../components/common/ConfirmModal";
import OrderSummary from "../../components/order/OrderSummary";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useMyShop from "../../hooks/useMyShop";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ORDER_STATUS } from "../../utils/constants";
import { SELLER_CANCELLABLE, SELLER_NEXT } from "../../utils/orderActions";
import { changeOrderStatus } from "../../utils/orderWorkflow";
import { formatDateTime } from "../../utils/format";

function SellerOrderDetail() {
  const { id } = useParams();
  const showToast = useToast();
  const { shop, loading: loadingShop } = useMyShop();
  const { data: order, setData: setOrder, loading, error } = useFetch(`/orders/${id}`);
  const { data: staff } = useFetch(order?.deliveryStaffId ? `/users/${order.deliveryStaffId}` : null);
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  useDocumentTitle(order ? `Đơn ${order.code}` : "Chi tiết đơn hàng");

  if (loading || loadingShop) return <Loading />;
  if (error || !order || !shop || order.shopId !== shop.id) {
    return (
      <EmptyState
        title="Không tìm thấy đơn hàng."
        action={
          <Button as={Link} to="/seller/orders">
            Về danh sách đơn
          </Button>
        }
      />
    );
  }

  const next = SELLER_NEXT[order.status];

  const run = async (status, extra) => {
    setBusy(true);
    try {
      setOrder(await changeOrderStatus(order, status, extra));
      showToast(`Đơn ${order.code}: ${ORDER_STATUS[status].label.toLowerCase()}.`);
    } catch {
      showToast("Không cập nhật được đơn hàng.", "danger");
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = (reason) => {
    setCancelling(false);
    run("CANCELLED", { cancelReason: reason, cancelledBy: "SELLER" });
  };

  return (
    <>
      <PageHeader title={`Đơn ${order.code}`} subtitle={`Đặt lúc ${formatDateTime(order.createdAt)}`}>
        <StatusBadge status={order.status} map={ORDER_STATUS} />
        {next && (
          <Button disabled={busy} onClick={() => run(next.status)}>
            {next.label}
          </Button>
        )}
        {SELLER_CANCELLABLE.includes(order.status) && (
          <Button variant="outline-danger" disabled={busy} onClick={() => setCancelling(true)}>
            Huỷ đơn
          </Button>
        )}
        <Button as={Link} to="/seller/orders" variant="outline-secondary">
          ← Danh sách đơn
        </Button>
      </PageHeader>

      {order.status === "CANCELLED" && (
        <Alert variant="danger">
          Đơn đã huỷ{order.cancelledBy ? ` bởi ${order.cancelledBy === "CUSTOMER" ? "khách hàng" : order.cancelledBy === "SELLER" ? "người bán" : "nhân viên giao hàng"}` : ""}
          {order.cancelReason ? `. Lý do: ${order.cancelReason}` : "."}
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={8}>
          <OrderSummary order={order} />
        </Col>
        <Col lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <h2 className="h6 mb-3">Tiến trình đơn hàng</h2>
              <OrderTimeline history={order.history} status={order.status} />
            </Card.Body>
          </Card>
          {staff && (
            <Card>
              <Card.Body>
                <h2 className="h6">Nhân viên giao hàng</h2>
                <div className="fw-semibold">{staff.fullName}</div>
                <div className="text-muted">{staff.phone}</div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <ConfirmModal
        show={cancelling}
        title="Huỷ đơn hàng"
        message="Hàng sẽ được trả lại kho và khách hàng nhận thông báo. Bạn chắc chắn chứ?"
        confirmText="Huỷ đơn"
        variant="danger"
        requireReason
        reasonLabel="Lý do huỷ (gửi cho khách)"
        onConfirm={handleCancel}
        onHide={() => setCancelling(false)}
      />
    </>
  );
}

export default SellerOrderDetail;
