import PropTypes from "prop-types";

// Tiêu đề trang + mô tả + vùng nút hành động (component composition qua props.children).
function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header d-flex flex-wrap justify-content-between align-items-end gap-3">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {children && <div className="d-flex gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.node,
  children: PropTypes.node,
};

export default PageHeader;
