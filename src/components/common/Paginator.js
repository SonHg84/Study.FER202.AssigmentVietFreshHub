import PropTypes from "prop-types";
import { Pagination } from "react-bootstrap";

function Paginator({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <Pagination className="justify-content-center mt-4 mb-0">
      <Pagination.Prev disabled={page === 1} onClick={() => onChange(page - 1)} />
      {pages.map((p) => (
        <Pagination.Item key={p} active={p === page} onClick={() => onChange(p)}>
          {p}
        </Pagination.Item>
      ))}
      <Pagination.Next disabled={page === totalPages} onClick={() => onChange(page + 1)} />
    </Pagination>
  );
}

Paginator.propTypes = {
  // Custom validator: trang hiện tại phải là số nguyên trong [1, totalPages].
  page: (props, propName, componentName) => {
    const value = props[propName];
    return Number.isInteger(value) && value >= 1 && value <= Math.max(1, props.totalPages)
      ? null
      : new Error(`${componentName}.${propName}: cần số nguyên từ 1 đến ${props.totalPages}, nhận được ${value}`);
  },
  totalPages: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Paginator;
