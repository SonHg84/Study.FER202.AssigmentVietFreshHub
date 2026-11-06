import PropTypes from "prop-types";
import { Badge } from "react-bootstrap";

// Hiển thị trạng thái theo bảng tra (ORDER_STATUS, APPROVAL_STATUS...).
function StatusBadge({ status, map }) {
  const info = map[status] || { label: status, variant: "secondary" };
  return (
    <Badge bg={info.variant} className="status-badge">
      {info.label}
    </Badge>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  map: PropTypes.objectOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(["primary", "secondary", "success", "danger", "warning", "info", "dark", "light"]).isRequired,
    })
  ).isRequired,
};

export default StatusBadge;
