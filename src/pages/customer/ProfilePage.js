import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import PageHeader from "../../components/common/PageHeader";
import { userApi } from "../../api/services";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ROLE_LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/format";

const PHONE_RE = /^(0|\+84)\d{9}$/;

function ProfilePage() {
  useDocumentTitle("Hồ sơ cá nhân");
  const { user, updateProfile } = useAuth();
  const showToast = useToast();

  const [profile, setProfile] = useState({ fullName: user.fullName || "", phone: user.phone || "" });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    const errors = {};
    if (profile.fullName.trim().length < 2) errors.fullName = "Họ tên tối thiểu 2 ký tự.";
    if (!PHONE_RE.test(profile.phone.trim())) errors.phone = "Số điện thoại không hợp lệ.";
    setProfileErrors(errors);
    if (Object.keys(errors).length) return;

    setSavingProfile(true);
    try {
      const changes = { fullName: profile.fullName.trim(), phone: profile.phone.trim() };
      await userApi.patch(user.id, changes);
      updateProfile(changes);
      showToast("Đã cập nhật hồ sơ.");
    } catch {
      showToast("Không lưu được hồ sơ. Vui lòng thử lại.", "danger");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.next.length < 6) return setPwError("Mật khẩu mới tối thiểu 6 ký tự.");
    if (pw.next !== pw.confirm) return setPwError("Mật khẩu nhập lại không khớp.");
    if (pw.next === pw.current) return setPwError("Mật khẩu mới phải khác mật khẩu cũ.");

    setPwError("");
    setSavingPw(true);
    try {
      // Mật khẩu không nằm trong state nên phải đọc lại từ server để đối chiếu.
      const account = await userApi.get(user.id);
      if (account.password !== pw.current) {
        setPwError("Mật khẩu hiện tại không đúng.");
        return;
      }
      await userApi.patch(user.id, { password: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      showToast("Đã đổi mật khẩu.");
    } catch {
      setPwError("Không đổi được mật khẩu. Vui lòng thử lại.");
    } finally {
      setSavingPw(false);
    }
  };

  const onPw = (e) => setPw((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <>
      <PageHeader title="Hồ sơ cá nhân" subtitle={`${ROLE_LABELS[user.role]} · tham gia ${formatDate(user.createdAt)}`} />
      <Row className="g-4">
        <Col lg={6}>
          <Card>
            <Card.Body>
              <h2 className="h5">Thông tin tài khoản</h2>
              <Form onSubmit={saveProfile} noValidate>
                <Form.Group className="mb-3" controlId="profile-email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={user.email} disabled readOnly />
                </Form.Group>
                <Form.Group className="mb-3" controlId="profile-username">
                  <Form.Label>Tên đăng nhập</Form.Label>
                  <Form.Control value={user.username} disabled readOnly />
                </Form.Group>
                <Form.Group className="mb-3" controlId="profile-fullName">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    value={profile.fullName}
                    isInvalid={!!profileErrors.fullName}
                    onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                  />
                  <Form.Control.Feedback type="invalid">{profileErrors.fullName}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="profile-phone">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    value={profile.phone}
                    isInvalid={!!profileErrors.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  />
                  <Form.Control.Feedback type="invalid">{profileErrors.phone}</Form.Control.Feedback>
                </Form.Group>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <Card.Body>
              <h2 className="h5">Đổi mật khẩu</h2>
              {pwError && <Alert variant="danger">{pwError}</Alert>}
              <Form onSubmit={changePassword} noValidate>
                <Form.Group className="mb-3" controlId="pw-current">
                  <Form.Label>Mật khẩu hiện tại</Form.Label>
                  <Form.Control type="password" name="current" value={pw.current} onChange={onPw} autoComplete="current-password" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="pw-next">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control type="password" name="next" value={pw.next} onChange={onPw} autoComplete="new-password" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="pw-confirm">
                  <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                  <Form.Control type="password" name="confirm" value={pw.confirm} onChange={onPw} autoComplete="new-password" />
                </Form.Group>
                <Button type="submit" variant="outline-primary" disabled={savingPw || !pw.current}>
                  {savingPw ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default ProfilePage;
