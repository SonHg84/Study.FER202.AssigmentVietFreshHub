import PropTypes from "prop-types";
import { discountPercent, formatCurrency } from "../../utils/format";

// Giá bán + giá gốc gạch ngang + % giảm.
function Price({ price, comparePrice = null, size = "md" }) {
  const percent = discountPercent(price, comparePrice);
  return (
    <span className={`price price-${size}`}>
      <strong className="price-current">{formatCurrency(price)}</strong>
      {percent > 0 && (
        <>
          <del className="price-compare">{formatCurrency(comparePrice)}</del>
          <span className="price-off">-{percent}%</span>
        </>
      )}
    </span>
  );
}

Price.propTypes = {
  price: PropTypes.number.isRequired,
  comparePrice: PropTypes.number,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};

export default Price;
