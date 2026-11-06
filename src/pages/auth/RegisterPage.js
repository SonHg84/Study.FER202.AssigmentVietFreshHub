import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ROLE_HOME } from "../../utils/constants";

const EMPTY = { fullName: "", email: "", username: "", phone: "", password: "", confirm: "" };

// Trả về object lỗi theo từng ô; rỗng nghĩa là hợp lệ.
const validate = (v) => {
  const errors = {};
  if (v.fullName.trim().length < 2) errors.fullName = "Họ tên tối thiểu 2 ký tự.";
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = "Email không hợp lệ.";
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(v.username.trim()))
    errors.username = "Tên đăng nhập 3–20 ký tự: chữ, số, dấu _ hoặc .";
  if (!/^(0|\+84)\d{9}$/.test(v.phone.trim())) errors.phone = "Số điện thoại không hợp lệ (vd 0901234567).";
  if (v.password.length < 6) errors.password = "Mật khẩu tối thiểu 6 ký tự.";
  if (v.confirm !== v.password) errors.confirm = "Mật khẩu nhập lại không khớp.";
  return errors;
};

function RegisterPage() {
  useDocumentTitle("Đăng ký");
  const { user, register } = useAuth();
  const showToast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setServerError("");
    setSubmitting(true);
    try {
      // eslint-disable-next-line no-unused-vars
      const { confirm, ...payload } = form;
      await register({
        ...payload,
        fullName: payload.fullName.trim(),
        email: payload.email.trim(),
        username: payload.username.trim(),
        phone: payload.phone.trim(),
      });
      showToast("Đăng ký thành công! Chào mừng bạn đến VietFresh Hub.");
    } catch (err) {
      setServerError(err.message || "Đăng ký thất bại.");
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <Form.Group className="mb-3" controlId={`reg-${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control name={name} value={form[name]} onChange={handleChange} isInvalid={!!errors[name]} {...props} />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <div className="d-flex justify-content-center py-4">
      <Card style={{ width: "100%", maxWidth: 560 }} className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h4 mb-1">Tạo tài khoản</h1>
          <p className="text-muted">Đăng ký tài khoản khách hàng để đặt nông sản tươi.</p>
          {serverError && <Alert variant="danger">{serverError}</Alert>}
          <Form onSubmit={handleSubmit} noValidate>
            {field("fullName", "Họ và tên", { autoComplete: "name", autoFocus: true })}
            <Row>
              <Col md={6}>{field("email", "Email", { type: "email", autoComplete: "email" })}</Col>
              <Col md={6}>{field("username", "Tên đăng nhập", { autoComplete: "username" })}</Col>
            </Row>
            {field("phone", "Số điện thoại", { type: "tel", autoComplete: "tel" })}
            <Row>
              <Col md={6}>{field("password", "Mật khẩu", { type: "password", autoComplete: "new-password" })}</Col>
              <Col md={6}>
                {field("confirm", "Nhập lại mật khẩu", { type: "password", autoComplete: "new-password" })}
              </Col>
            </Row>
            <Button type="submit" className="w-100" disabled={submitting}>
              {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RegisterPage;
