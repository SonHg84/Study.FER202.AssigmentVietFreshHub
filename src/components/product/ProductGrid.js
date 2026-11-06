import PropTypes from "prop-types";
import { Col, Row } from "react-bootstrap";
import ProductCard, { productShape } from "./ProductCard";
import EmptyState from "../common/EmptyState";

// Lưới sản phẩm responsive (Grid: Row/Col theo breakpoint xs/sm/md/lg).
function ProductGrid({ products, onAddToCart, emptyText = "Không tìm thấy sản phẩm phù hợp." }) {
  if (!products.length) return <EmptyState title={emptyText} />;
  return (
    <Row xs={2} md={3} lg={4} className="g-3">
      {products.map((product) => (
        <Col key={product.id}>
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </Col>
      ))}
    </Row>
  );
}

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(productShape).isRequired,
  onAddToCart: PropTypes.func,
  emptyText: PropTypes.string,
};

export default ProductGrid;
