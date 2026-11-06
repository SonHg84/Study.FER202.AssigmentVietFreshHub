import PropTypes from "prop-types";
import { Card, Col, Row, Table } from "react-bootstrap";
import StatusBadge from "../common/StatusBadge";
import { PAYMENT_METHODS, PAYMENT_STATUS } from "../../utils/constants";
import { formatCurrency } from "../../utils/format";

// Chi tiết sản phẩm, tiền, thanh toán và địa chỉ của một đơn (dùng cho khách, người bán, shipper).
function OrderSummary({ order }) {
  return (
    <>
      <Card className="mb-3">
        <Card.Header className="fw-semibold">Sản phẩm</Card.Header>
        <Table responsive className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th className="text-end">Đơn giá</th>
              <th className="text-center">SL</th>
              <th className="text-end">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.variantId}>
                <td>
                  <div className="d-flex gap-2 align-items-center">
                    <img src={item.image} alt="" width={48} height={48} className="rounded object-fit-cover" />
                    <div>
                      <div className="fw-semibold">{item.productName}</div>
                      <small className="text-muted">{item.variantName}</small>
                    </div>
                  </div>
                </td>
                <td className="text-end">{formatCurrency(item.price)}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Row className="g-3 mb-3">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <h2 className="h6">Giao tới</h2>
              <div className="fw-semibold">{order.address.receiverName}</div>
              <div>{order.address.phone}</div>
              <div className="text-muted">
                {order.address.addressLine}, {order.address.ward}, {order.address.province}
              </div>
              {order.note && <div className="mt-2 small">Ghi chú: {order.note}</div>}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <h2 className="h6">Thanh toán</h2>
              <div className="d-flex justify-content-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Phí giao hàng</span>
                <span>{order.shippingFee === 0 ? "Miễn phí" : formatCurrency(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Giảm giá{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between fw-bold fs-5 border-top mt-2 pt-2">
                <span>Tổng cộng</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="small mt-2">
                {PAYMENT_METHODS[order.paymentMethod]} · <StatusBadge status={order.paymentStatus} map={PAYMENT_STATUS} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

OrderSummary.propTypes = {
  order: PropTypes.shape({
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    address: PropTypes.object.isRequired,
    note: PropTypes.string,
    subtotal: PropTypes.number.isRequired,
    shippingFee: PropTypes.number.isRequired,
    discount: PropTypes.number,
    couponCode: PropTypes.string,
    total: PropTypes.number.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    paymentStatus: PropTypes.string.isRequired,
  }).isRequired,
};

export default OrderSummary;
