import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { fetchOrders, updateOrderStatus } from "../../store/ordersSlice";
import { PAYMENT_METHODS } from "../../utils/constants";
import { formatCurrency, formatDateTime } from "../../utils/format";

function DeliveryMine() {
  useDocumentTitle("Đơn đang giao");
  const dispatch = useDispatch();
  const showToast = useToast();
  const { user } = useAuth();
  const { items, loading, error, updatingId } = useSelector((state) => state.orders);
  const [completing, setCompleting] = useState(null);
  const [failing, setFailing] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders({ status: "OUT_FOR_DELIVERY", deliveryStaffId: user.id }));
  }, [dispatch, user.id]);

  const mine = useMemo(() => items.filter((o) => o.status === "OUT_FOR_DELIVERY" && o.deliveryStaffId === user.id), [items, user.id]);

  const handleComplete = async () => {
    const order = completing;
    setCompleting(null);
    const ok = await dispatch(updateOrderStatus(order, "COMPLETED"));
    showToast(ok ? `Đã giao xong đơn ${order.code}.` : "Không cập nhật được đơn hàng.", ok ? "success" : "danger");
  };

  const handleFail = async (reason) => {
    const order = failing;
    setFailing(null);
    const ok = await dispatch(updateOrderStatus(order, "CANCELLED", { cancelReason: `Giao thất bại: ${reason}`, cancelledBy: "DELIVERY" }));
    showToast(ok ? `Đã báo giao thất bại đơn ${order.code}.` : "Không cập nhật được đơn hàng.", ok ? "warning" : "danger");
  };

  return (
    <>
      <PageHeader title="Đơn đang giao" subtitle={`${mine.length} đơn bạn đang phụ trách`} />
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && mine.length === 0 ? (
        <Loading />
      ) : mine.length === 0 ? (
        <EmptyState title="Bạn chưa nhận đơn nào." />
      ) : (
        <Row xs={1} lg={2} className="g-3">
          {mine.map((o) => {
            const cod = o.paymentMethod === "COD" && o.paymentStatus !== "PAID";
            return (
              <Col key={o.id}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <strong>{o.code}</strong>
                      <small className="text-muted">{formatDateTime(o.createdAt)}</small>
                    </div>
                    <div className="mt-2">
                      <div className="fw-semibold">
                        {o.address.receiverName} · <a href={`tel:${o.address.phone}`}>{o.address.phone}</a>
                      </div>
                      <div className="text-muted">
                        {o.address.addressLine}, {o.address.ward}, {o.address.province}
                      </div>
                      {o.note && <div className="small mt-1">Ghi chú: {o.note}</div>}
                      <ul className="small mt-2 mb-2 ps-3">
                        {o.items.map((i) => (
                          <li key={i.variantId}>
                            {i.productName} – {i.variantName} × {i.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`fw-bold ${cod ? "text-danger" : ""}`}>
                      {cod ? `Thu tiền khi giao: ${formatCurrency(o.total)}` : `Đã thanh toán (${PAYMENT_METHODS[o.paymentMethod]})`}
                    </div>
                  </Card.Body>
                  <Card.Footer className="d-flex gap-2">
                    <Button variant="success" disabled={updatingId === o.id} onClick={() => setCompleting(o)}>
                      Đã giao xong
                    </Button>
                    <Button variant="outline-danger" disabled={updatingId === o.id} onClick={() => setFailing(o)}>
                      Giao thất bại
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <ConfirmModal
        show={Boolean(completing)}
        title="Xác nhận giao thành công"
        message={
          completing && completing.paymentMethod === "COD" && completing.paymentStatus !== "PAID"
            ? `Bạn đã thu ${formatCurrency(completing.total)} từ khách của đơn ${completing.code}?`
            : `Xác nhận đã giao đơn ${completing?.code} cho khách?`
        }
        confirmText="Đã giao"
        variant="success"
        onConfirm={handleComplete}
        onHide={() => setCompleting(null)}
      />
      <ConfirmModal
        show={Boolean(failing)}
        title="Báo giao thất bại"
        message={`Đơn ${failing?.code} sẽ bị huỷ và hàng được trả lại kho.`}
        confirmText="Huỷ đơn"
        variant="danger"
        requireReason
        reasonLabel="Lý do (khách không nghe máy, sai địa chỉ...)"
        onConfirm={handleFail}
        onHide={() => setFailing(null)}
      />
    </>
  );
}

export default DeliveryMine;
