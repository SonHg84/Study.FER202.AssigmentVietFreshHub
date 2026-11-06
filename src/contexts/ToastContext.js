import { createContext, useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastContext = createContext(() => {});

// Một thông báo nổi tự đóng sau 3.5 giây; dọn timer trong cleanup của useEffect.
function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <Toast bg={toast.variant} onClose={() => onClose(toast.id)}>
      <Toast.Header>
        <strong className="me-auto">VietFresh Hub</strong>
      </Toast.Header>
      <Toast.Body className={toast.variant === "light" ? "" : "text-white"}>{toast.message}</Toast.Body>
    </Toast>
  );
}

ToastItem.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(["success", "danger", "warning", "info", "light"]).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = "success") => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, variant }]);
  }, []);

  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <ToastContainer position="top-end" className="p-3 position-fixed" style={{ zIndex: 2000 }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useToast = () => useContext(ToastContext);
