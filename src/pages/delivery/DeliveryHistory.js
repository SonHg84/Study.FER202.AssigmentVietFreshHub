import { useEffect, useMemo, useState } from "react";
import { Alert, Card, Col, Row, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Paginator from "../../components/common/Paginator";
import { useAuth } from "../../contexts/AuthContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { fetchOrders } from "../../store/ordersSlice";
import { PAGE_SIZE, PAYMENT_METHODS } from "../../utils/constants";
import { formatCurrency, formatDateTime } from "../../utils/format";

function DeliveryHistory() {
  useDocumentTitle("Lịch sử giao hàng");
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items, loading, error } = useSelector((state) => state.orders);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchOrders({ status: "COMPLETED", deliveryStaffId: user.id }));
  }, [dispatch, user.id]);

  const done = useMemo(() => items.filter((o) => o.status === "COMPLETED" && o.deliveryStaffId === user.id), [items, user.id]);
  // Tiền COD shipper đã thu hộ (đơn chuyển khoản không tính).
  const codTotal = done.filter((o) => o.paymentMethod === "COD").reduce((sum, o) => sum + o.total, 0);
  const shippingTotal = done.reduce((sum, o) => sum + o.shippingFee, 0);

  const totalPages = Math.max(1, Math.ceil(done.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = done.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <PageHeader title="Lịch sử & COD" subtitle="Các đơn bạn đã giao thành công" />
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && done.length === 0 ? (
        <Loading />
      ) : (
        <>
          <Row xs={1} md={3} className="g-3 mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <div className="text-muted small">Đơn đã giao</div>
                  <div className="fs-3 fw-bold">{done.length}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Body>
                  <div className="text-muted small">Tiền COD đã thu hộ</div>
                  <div className="fs-3 fw-bold">{formatCurrency(codTotal)}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Body>
                  <div className="text-muted small">Tổng phí giao hàng</div>
                  <div className="fs-3 fw-bold">{formatCurrency(shippingTotal)}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {done.length === 0 ? (
            <EmptyState title="Chưa có đơn giao thành công nào." />
          ) : (
            <>
              <Table responsive hover className="align-middle bg-white">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Hoàn tất lúc</th>
                    <th>Người nhận</th>
                    <th>Thanh toán</th>
                    <th className="text-end">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td className="fw-semibold">{o.code}</td>
                      <td>{formatDateTime(o.history[o.history.length - 1]?.at || o.createdAt)}</td>
                      <td>
                        {o.address.receiverName}
                        <div className="small text-muted">
                          {o.address.ward}, {o.address.province}
                        </div>
                      </td>
                      <td>{PAYMENT_METHODS[o.paymentMethod]}</td>
                      <td className="text-end">{formatCurrency(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Paginator page={currentPage} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </>
      )}
    </>
  );
}

export default DeliveryHistory;
