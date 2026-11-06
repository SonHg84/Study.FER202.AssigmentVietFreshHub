import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import OrderTimeline from "../../components/common/OrderTimeline";
import ConfirmModal from "../../components/common/ConfirmModal";
import RatingStars from "../../components/common/RatingStars";
import OrderSummary from "../../components/order/OrderSummary";
import { reviewApi } from "../../api/services";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ORDER_STATUS } from "../../utils/constants";
import { CUSTOMER_CANCELLABLE } from "../../utils/orderActions";
import { changeOrderStatus } from "../../utils/orderWorkflow";
import { formatDateTime, nowIso } from "../../utils/format";

// Form đánh giá một sản phẩm của đơn đã giao (đánh giá chờ quản trị duyệt mới hiển thị).
function ReviewForm({ item, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(item, rating, content.trim());
    setSaving(false);
  };

  return (
    <Form onSubmit={handleSubmit} className="border rounded p-3 mb-2">
      <div className="fw-semibold mb-1">
        {item.productName} – {item.variantName}
      </div>
      <RatingStars value={rating} onChange={setRating} />
      <Form.Control
        as="textarea"
        rows={2}
        className="my-2"
        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm"
        aria-label={`Nhận xét ${item.productName}`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button type="submit" size="sm" disabled={saving || content.length < 5}>
        Gửi đánh giá
      </Button>
    </Form>
  );
}

function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const showToast = useToast();
  const { data: order, setData: setOrder, loading, error } = useFetch(`/orders/${id}`);
  const { data: reviews, setData: setReviews } = useFetch(`/reviews?orderId=${id}`, []);
  const { data: shop } = useFetch(order ? `/shops/${order.shopId}` : null);
  const [cancelling, setCancelling] = useState(false);
  useDocumentTitle(order ? `Đơn ${order.code}` : "Chi tiết đơn hàng");

  if (loading) return <Loading />;
  // Không cho xem đơn của người khác (cũng tránh lộ thông tin qua đường dẫn).
  if (error || !order || order.customerId !== user.id) {
    return (
      <EmptyState
        title="Không tìm thấy đơn hàng."
        action={
          <Button as={Link} to="/account/orders">
            Về danh sách đơn
          </Button>
        }
      />
    );
  }

  const handleCancel = async (reason) => {
    setCancelling(false);
    try {
      const updated = await changeOrderStatus(order, "CANCELLED", { cancelReason: reason, cancelledBy: "CUSTOMER" });
      setOrder(updated);
      showToast("Đã huỷ đơn hàng.");
    } catch {
      showToast("Không huỷ được đơn hàng. Vui lòng thử lại.", "danger");
    }
  };

  const handleReview = async (item, rating, content) => {
    try {
      const created = await reviewApi.create({
        userId: user.id,
        productId: item.productId,
        orderId: order.id,
        rating,
        content,
        status: "PENDING",
        createdAt: nowIso(),
      });
      setReviews((prev) => [...prev, created]);
      showToast("Cảm ơn bạn! Đánh giá sẽ hiển thị sau khi được duyệt.");
    } catch {
      showToast("Không gửi được đánh giá.", "danger");
    }
  };

  const reviewedIds = new Set(reviews.map((r) => r.productId));
  const toReview = order.status === "COMPLETED" ? order.items.filter((i) => !reviewedIds.has(i.productId)) : [];

  return (
    <>
      <PageHeader title={`Đơn ${order.code}`} subtitle={`Đặt lúc ${formatDateTime(order.createdAt)}${shop ? ` · ${shop.name}` : ""}`}>
        <StatusBadge status={order.status} map={ORDER_STATUS} />
        {CUSTOMER_CANCELLABLE.includes(order.status) && (
          <Button variant="outline-danger" size="sm" onClick={() => setCancelling(true)}>
            Huỷ đơn
          </Button>
        )}
        <Button as={Link} to="/account/orders" variant="outline-secondary" size="sm">
          ← Danh sách đơn
        </Button>
      </PageHeader>

      {order.status === "CANCELLED" && order.cancelReason && <Alert variant="danger">Lý do huỷ: {order.cancelReason}</Alert>}

      <Row className="g-4">
        <Col lg={8}>
          <OrderSummary order={order} />
          {order.status === "COMPLETED" && (
            <Card>
              <Card.Body>
                <h2 className="h6">Đánh giá sản phẩm</h2>
                {toReview.map((item) => (
                  <ReviewForm key={item.variantId} item={item} onSubmit={handleReview} />
                ))}
                {reviews.map((r) => {
                  const item = order.items.find((i) => i.productId === r.productId);
                  return (
                    <div key={r.id} className="border rounded p-3 mb-2">
                      <div className="fw-semibold">{item ? item.productName : `Sản phẩm #${r.productId}`}</div>
                      <RatingStars value={r.rating} />
                      <p className="mb-0">{r.content}</p>
                      {r.status === "PENDING" && <small className="text-muted">Đang chờ duyệt</small>}
                    </div>
                  );
                })}
                {toReview.length === 0 && reviews.length === 0 && <p className="text-muted mb-0">Chưa có sản phẩm để đánh giá.</p>}
              </Card.Body>
            </Card>
          )}
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Body>
              <h2 className="h6 mb-3">Theo dõi đơn hàng</h2>
              <OrderTimeline history={order.history} status={order.status} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        show={cancelling}
        title="Huỷ đơn hàng"
        message="Đơn sẽ được huỷ và hàng được trả lại kho. Bạn chắc chắn chứ?"
        confirmText="Huỷ đơn"
        variant="danger"
        requireReason
        reasonLabel="Lý do huỷ"
        onConfirm={handleCancel}
        onHide={() => setCancelling(false)}
      />
    </>
  );
}

export default OrderDetailPage;
