import PropTypes from "prop-types";
import { Button, Form, InputGroup } from "react-bootstrap";

// Ô chọn số lượng có nút -/+ (controlled component: giá trị do cha giữ).
function QuantityInput({ value, max, onChange, size = "sm" }) {
  const clamp = (n) => Math.max(1, Math.min(max, Number.isNaN(n) ? 1 : n));
  return (
    <InputGroup size={size} className="quantity-input">
      <Button variant="outline-secondary" disabled={value <= 1} onClick={() => onChange(clamp(value - 1))} aria-label="Giảm">
        −
      </Button>
      <Form.Control
        type="number"
        min={1}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10)))}
        className="text-center"
        aria-label="Số lượng"
      />
      <Button variant="outline-secondary" disabled={value >= max} onClick={() => onChange(clamp(value + 1))} aria-label="Tăng">
        +
      </Button>
    </InputGroup>
  );
}

QuantityInput.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.oneOf(["sm", "lg"]),
};

export default QuantityInput;
