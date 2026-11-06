import { useEffect, useMemo } from "react";
import { Alert, Button, Card, Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { fetchOrders, updateOrderStatus } from "../../store/ordersSlice";
import { PAYMENT_METHODS } from "../../utils/constants";
import { formatCurrency, formatDateTime } from "../../utils/format";

function DeliveryAvailable() {
  useDocumentTitle("Đơn chờ nhận");
  const dispatch = useDispatch();
  const showToast = useToast();
  const { user } = useAuth();
  const { items, loading, error, updatingId } = useSelector((state) => state.orders);
  const { data: shops } = useFetch("/shops", []);

  useEffect(() => {
    dispatch(fetchOrders({ status: "READY_FOR_DELIVERY" }));
  }, [dispatch]);

  // Chỉ những đơn đã sẵn sàng và chưa có shipper nhận.
  const available = useMemo(() => items.filter((o) => o.status === "READY_FOR_DELIVERY" && !o.deliveryStaffId), [items]);

  const accept = async (order) => {
    const ok = await dispatch(updateOrderStatus(order, "OUT_FOR_DELIVERY", { deliveryStaffId: user.id }));
    showToast(ok ? `Đã nhận đơn ${order.code}. Xem tại "Đơn đang giao".` : "Không nhận được đơn (có thể đã có người nhận).", ok ? "success" : "danger");
    if (!ok) dispatch(fetchOrders({ status: "READY_FOR_DELIVERY" }));
  };

  return (
    <>
      <PageHeader title="Đơn chờ nhận" subtitle={`${available.length} đơn đã sẵn sàng giao`}>
        <Button variant="outline-secondary" size="sm" onClick={() => dispatch(fetchOrders({ status: "READY_FOR_DELIVERY" }))}>
          Làm mới
        </Button>
      </PageHeader>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && available.length === 0 ? (
        <Loading />
      ) : available.length === 0 ? (
        <EmptyState title="Hiện chưa có đơn nào chờ nhận." />
      ) : (
        <Row xs={1} lg={2} className="g-3">
          {available.map((o) => {
            const shop = shops.find((s) => s.id === o.shopId);
            return (
              <Col key={o.id}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <strong>{o.code}</strong>
                      <small className="text-muted">{formatDateTime(o.createdAt)}</small>
                    </div>
                    <div className="small mt-2">
                      <div>
                        <span className="text-muted">Lấy hàng:</span> {shop ? `${shop.name} – ${shop.address}, ${shop.province}` : `Cửa hàng #${o.shopId}`}
                      </div>
                      <div>
                        <span className="text-muted">Giao tới:</span> {o.address.receiverName} ({o.address.phone}) – {o.address.addressLine}, {o.address.ward},{" "}
                        {o.address.province}
                      </div>
                      <div>
                        <span className="text-muted">Số món:</span> {o.items.reduce((sum, i) => sum + i.quantity, 0)} · {PAYMENT_METHODS[o.paymentMethod]}
                      </div>
                    </div>
                    <div className="fw-bold mt-2">
                      {o.paymentMethod === "COD" && o.paymentStatus !== "PAID" ? `Thu hộ: ${formatCurrency(o.total)}` : `Đơn ${formatCurrency(o.total)} (đã thanh toán)`}
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <Button disabled={updatingId === o.id} onClick={() => accept(o)}>
                      Nhận đơn
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );
}

export default DeliveryAvailable;
