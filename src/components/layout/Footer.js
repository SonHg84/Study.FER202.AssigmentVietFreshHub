import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <Row className="g-4">
          <Col md={5}>
            <div className="brand text-white mb-2">🍃 VietFresh Hub</div>
            <p className="mb-0 small">
              Fresh commerce, seamlessly connected. Kết nối khách hàng, nhà vườn và người giao hàng trên một nền tảng
              trái cây tươi.
            </p>
          </Col>
          <Col xs={6} md={3}>
            <h4 className="h6 text-white">Mua sắm</h4>
            <ul className="list-unstyled small">
              <li>
                <Link to="/products">Tất cả sản phẩm</Link>
              </li>
              <li>
                <Link to="/shops">Gian hàng</Link>
              </li>
              <li>
                <Link to="/cart">Giỏ hàng</Link>
              </li>
            </ul>
          </Col>
          <Col xs={6} md={4}>
            <h4 className="h6 text-white">Liên hệ</h4>
            <ul className="list-unstyled small mb-0">
              <li>Email: support@vietfreshhub.vn</li>
              <li>Hotline: 1900 6868</li>
              <li>Hà Nội · TP Hồ Chí Minh</li>
            </ul>
          </Col>
        </Row>
        <hr />
        <p className="small mb-0 text-center">© {new Date().getFullYear()} VietFresh Hub – Bài tập FER202 (React).</p>
      </Container>
    </footer>
  );
}

export default Footer;
