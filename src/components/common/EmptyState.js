import PropTypes from "prop-types";

function EmptyState({ title, children, action }) {
  return (
    <div className="empty-state text-center">
      <div className="empty-icon" aria-hidden="true">
        🍃
      </div>
      <h3 className="h6">{title}</h3>
      {children && <p className="text-muted mb-3">{children}</p>}
      {action}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  action: PropTypes.element,
};

export default EmptyState;
