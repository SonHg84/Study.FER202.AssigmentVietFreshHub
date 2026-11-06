import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ROLE_HOME } from "../../utils/constants";

// Chọn nơi chuyển tới sau đăng nhập: quay lại trang đang muốn vào nếu hợp vai trò, không thì về trang chủ của vai trò.
const destinationFor = (user, from) => {
  const home = ROLE_HOME[user.role] || "/";
  if (!from) return home;
  const isWorkspace = /^\/(seller|admin|delivery)(\/|$)/.test(from);
  if (user.role === "CUSTOMER") return isWorkspace ? home : from;
  return from.startsWith(home) ? from : home;
};

function LoginPage() {
  useDocumentTitle("Đăng nhập");
  const { user, login } = useAuth();
  const showToast = useToast();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Đã đăng nhập (kể cả ngay sau khi login thành công) thì chuyển đi.
  if (user) {
    return <Navigate to={destinationFor(user, location.state?.from?.pathname)} replace />;
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier.trim() || !form.password) {
      setError("Vui lòng nhập email/tên đăng nhập và mật khẩu.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const account = await login(form.identifier, form.password);
      showToast(`Xin chào ${account.fullName || account.username}!`);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center py-4">
      <Card style={{ width: "100%", maxWidth: 420 }} className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h4 mb-1">Đăng nhập</h1>
          <p className="text-muted">Chào mừng bạn quay lại VietFresh Hub.</p>
          {location.state?.from && !error && <Alert variant="info">Bạn cần đăng nhập để tiếp tục.</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="login-identifier">
              <Form.Label>Email hoặc tên đăng nhập</Form.Label>
              <Form.Control
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="login-password">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={submitting}>
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginPage;
