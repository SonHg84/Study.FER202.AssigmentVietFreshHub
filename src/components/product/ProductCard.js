import PropTypes from "prop-types";
import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import Price from "../common/Price";
import { pickDisplayVariant } from "../../utils/product";
import { discountPercent } from "../../utils/format";

// Thẻ sản phẩm (presentational component) — dữ liệu và hành vi đến từ props.
function ProductCard({ product, onAddToCart }) {
  const variant = pickDisplayVariant(product.variants);
  const soldOut = !variant || variant.stock <= 0;
  const percent = variant ? discountPercent(variant.price, variant.comparePrice) : 0;

  const handleAdd = (event) => {
    // Nút nằm trong thẻ <Link>: chặn điều hướng và chặn sự kiện nổi bọt lên thẻ cha.
    event.preventDefault();
    event.stopPropagation();
    onAddToCart(product, variant);
  };

  return (
    <Card as={Link} to={`/products/${product.id}`} className="product-card h-100 text-decoration-none">
      <div className="product-thumb">
        <Card.Img variant="top" src={product.image} alt={product.name} loading="lazy" />
        {percent > 0 && <span className="thumb-badge">-{percent}%</span>}
        {soldOut && <span className="thumb-soldout">Hết hàng</span>}
      </div>
      <Card.Body className="d-flex flex-column">
        <small className="text-muted text-truncate">{product.shop?.name}</small>
        <Card.Title as="h3" className="product-name">
          {product.name}
        </Card.Title>
        <small className="text-muted mb-2">
          {variant?.name} · {product.origin}
        </small>
        <div className="mt-auto d-flex justify-content-between align-items-end gap-2">
          {variant && <Price price={variant.price} comparePrice={variant.comparePrice} size="sm" />}
          <small className="text-muted text-nowrap">Đã bán {product.sold || 0}</small>
        </div>
        {onAddToCart && (
          <Button variant="success" size="sm" className="mt-2" disabled={soldOut} onClick={handleAdd}>
            {soldOut ? "Tạm hết hàng" : "Thêm vào giỏ"}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export const productShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  name: PropTypes.string.isRequired,
  image: PropTypes.string,
  origin: PropTypes.string,
  sold: PropTypes.number,
  shop: PropTypes.shape({ name: PropTypes.string }),
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      comparePrice: PropTypes.number,
      stock: PropTypes.number.isRequired,
    })
  ).isRequired,
});

ProductCard.propTypes = {
  product: productShape.isRequired,
  onAddToCart: PropTypes.func,
};

export default ProductCard;
