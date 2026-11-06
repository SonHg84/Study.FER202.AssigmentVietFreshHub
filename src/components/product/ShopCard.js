import PropTypes from "prop-types";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function ShopCard({ shop, productCount }) {
  return (
    <Card as={Link} to={`/shops/${shop.id}`} className="shop-card h-100 text-decoration-none">
      <div className="shop-banner" style={{ backgroundImage: `url(${shop.banner})` }} />
      <Card.Body className="d-flex gap-3 align-items-center">
        <img src={shop.logo} alt="" className="shop-logo" />
        <div className="min-w-0">
          <Card.Title as="h3" className="h6 mb-1 text-truncate">
            {shop.name}
          </Card.Title>
          <small className="text-muted d-block text-truncate">{shop.province}</small>
          {productCount !== undefined && <small className="text-success">{productCount} sản phẩm đang bán</small>}
        </div>
      </Card.Body>
    </Card>
  );
}

ShopCard.propTypes = {
  shop: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    province: PropTypes.string,
    logo: PropTypes.string,
    banner: PropTypes.string,
  }).isRequired,
  productCount: PropTypes.number,
};

export default ShopCard;
