import { useMemo, useState } from "react";
import { Button, Card, Col, ListGroup, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import QuantityInput from "../../components/common/QuantityInput";
import ConfirmModal from "../../components/common/ConfirmModal";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useToast } from "../../contexts/ToastContext";
import { clearCart, clearShop, removeFromCart, selectCartItems, selectCartTotal, updateQuantity } from "../../store/cartSlice";
import { groupByShop } from "../../utils/cart";
import { formatCurrency } from "../../utils/format";

function CartPage() {
  useDocumentTitle("Giỏ hàng");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const groups = useMemo(() => groupByShop(items), [items]);
  // Hộp xác nhận xoá: { shopId } xoá một cửa hàng, { all: true } xoá cả giỏ.
  const [pending, setPending] = useState(null);

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Giỏ hàng" />
        <EmptyState
          title="Giỏ hàng của bạn đang trống."
          action={
            <Button as={Link} to="/products">
              Tiếp tục mua sắm
            </Button>
          }
        >
          Hãy chọn vài loại nông sản tươi từ các gian hàng nhé.
        </EmptyState>
      </>
    );
  }

  const handleConfirm = () => {
    if (pending?.all) dispatch(clearCart());
    else if (pending) dispatch(clearShop(pending.shopId));
    showToast("Đã xoá sản phẩm khỏi giỏ hàng.");
    setPending(null);
  };

  return (
    <>
      <PageHeader title="Giỏ hàng" subtitle={`${items.length} sản phẩm từ ${groups.length} cửa hàng`}>
        <Button variant="outline-danger" size="sm" onClick={() => setPending({ all: true })}>
          Xoá toàn bộ giỏ
        </Button>
      </PageHeader>

      <Row className="g-4">
        <Col lg={8}>
          {groups.map((group) => (
            <Card key={group.shopId} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Link to={`/shops/${group.shopId}`} className="fw-semibold text-decoration-none">
                  🏪 {group.shopName || `Cửa hàng #${group.shopId}`}
                </Link>
                <Button variant="link" size="sm" className="text-danger" onClick={() => setPending({ shopId: group.shopId })}>
                  Xoá cửa hàng này
                </Button>
              </Card.Header>
              <ListGroup variant="flush">
                {group.items.map((line) => (
                  <ListGroup.Item key={line.variantId}>
                    <Row className="align-items-center g-3">
                      <Col xs={12} md={5} className="d-flex gap-3 align-items-center">
                        <img src={line.image} alt={line.productName} width={64} height={64} className="rounded object-fit-cover" />
                        <div>
                          <Link to={`/products/${line.productId}`} className="fw-semibold text-decoration-none">
                            {line.productName}
                          </Link>
                          <div className="small text-muted">{line.variantName}</div>
                          <div className="small">{formatCurrency(line.price)}</div>
                        </div>
                      </Col>
                      <Col xs={7} md={4}>
                        <QuantityInput
                          value={line.quantity}
                          max={line.stock}
                          onChange={(quantity) => dispatch(updateQuantity({ variantId: line.variantId, quantity }))}
                        />
                        <div className="small text-muted mt-1">Còn {line.stock} sản phẩm</div>
                      </Col>
                      <Col xs={5} md={3} className="text-end">
                        <div className="fw-bold">{formatCurrency(line.price * line.quantity)}</div>
                        <Button variant="link" size="sm" className="text-danger p-0" onClick={() => dispatch(removeFromCart(line.variantId))}>
                          Xoá
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Card.Footer className="text-end">
                Tạm tính cửa hàng: <strong>{formatCurrency(group.subtotal)}</strong>
              </Card.Footer>
            </Card>
          ))}
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: 90 }}>
            <Card.Body>
              <h2 className="h5">Tóm tắt giỏ hàng</h2>
              <div className="d-flex justify-content-between my-2">
                <span>Tạm tính</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <p className="small text-muted">
                Phí giao hàng và mã giảm giá được tính ở bước thanh toán. Mỗi cửa hàng sẽ tạo một đơn riêng.
              </p>
              <div className="d-grid gap-2">
                <Button size="lg" onClick={() => navigate("/checkout")}>
                  Tiến hành thanh toán
                </Button>
                <Button as={Link} to="/products" variant="outline-secondary">
                  Tiếp tục mua sắm
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        show={Boolean(pending)}
        title="Xoá khỏi giỏ hàng"
        message={pending?.all ? "Bạn muốn xoá toàn bộ sản phẩm trong giỏ hàng?" : "Bạn muốn xoá mọi sản phẩm của cửa hàng này khỏi giỏ?"}
        confirmText="Xoá"
        variant="danger"
        onConfirm={handleConfirm}
        onHide={() => setPending(null)}
      />
    </>
  );
}

export default CartPage;
