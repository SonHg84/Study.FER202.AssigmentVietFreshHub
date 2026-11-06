import { useState } from "react";
import PropTypes from "prop-types";
import { Button, Form, Modal } from "react-bootstrap";

/**
 * Hộp xác nhận dùng lại nhiều nơi. Nếu requireReason = true sẽ có ô nhập lý do
 * (controlled input) và onConfirm(reason) chỉ được gọi khi đã nhập.
 */
function ConfirmModal({
  show,
  title,
  message,
  confirmText = "Xác nhận",
  variant = "primary",
  requireReason = false,
  reasonLabel = "Lý do",
  onConfirm,
  onHide,
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const handleConfirm = () => {
    setTouched(true);
    if (requireReason && !reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
    setTouched(false);
  };

  const handleHide = () => {
    setReason("");
    setTouched(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-2">{message}</p>
        {requireReason && (
          <Form.Group controlId="confirm-reason">
            <Form.Label>{reasonLabel}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              autoFocus
              onChange={(e) => setReason(e.target.value)}
              isInvalid={touched && !reason.trim()}
            />
            <Form.Control.Feedback type="invalid">Vui lòng nhập lý do.</Form.Control.Feedback>
          </Form.Group>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleHide}>
          Đóng
        </Button>
        <Button variant={variant} onClick={handleConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

ConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.node.isRequired,
  confirmText: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "success", "danger", "warning"]),
  requireReason: PropTypes.bool,
  reasonLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
};

export default ConfirmModal;
