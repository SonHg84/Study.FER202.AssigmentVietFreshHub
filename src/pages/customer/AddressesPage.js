import { useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import ConfirmModal from "../../components/common/ConfirmModal";
import { addressApi } from "../../api/services";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { PROVINCES } from "../../utils/constants";

const EMPTY = { receiverName: "", phone: "", addressLine: "", ward: "", province: PROVINCES[0], isDefault: false };

function AddressesPage() {
  useDocumentTitle("Sổ địa chỉ");
  const { user } = useAuth();
  const showToast = useToast();
  const { data: addresses, loading, error, reload } = useFetch(`/addresses?userId=${user.id}`, []);

  const [editing, setEditing] = useState(null); // null: đóng; {} + id: sửa; không id: thêm mới
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const openForm = (address) => {
    setForm(address ? { ...address } : { ...EMPTY, receiverName: user.fullName || "", phone: user.phone || "", isDefault: addresses.length === 0 });
    setErrors({});
    setEditing(address || {});
  };

  const validate = () => {
    const e = {};
    if (form.receiverName.trim().length < 2) e.receiverName = "Vui lòng nhập tên người nhận.";
    if (!/^(0|\+84)\d{9}$/.test(form.phone.trim())) e.phone = "Số điện thoại không hợp lệ.";
    if (!form.addressLine.trim()) e.addressLine = "Vui lòng nhập số nhà, tên đường.";
    if (!form.ward.trim()) e.ward = "Vui lòng nhập phường/xã.";
    return e;
  };

  // Chỉ một địa chỉ mặc định: khi đặt địa chỉ này làm mặc định thì bỏ cờ ở các địa chỉ khác.
  const clearOtherDefaults = (keepId) =>
    Promise.all(addresses.filter((a) => a.isDefault && a.id !== keepId).map((a) => addressApi.patch(a.id, { isDefault: false })));

  const handleSave = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const body = {
        receiverName: form.receiverName.trim(),
        phone: form.phone.trim(),
        addressLine: form.addressLine.trim(),
        ward: form.ward.trim(),
        province: form.province,
        isDefault: form.isDefault,
      };
      let savedId = editing.id;
      if (editing.id) await addressApi.patch(editing.id, body);
      else savedId = (await addressApi.create({ ...body, userId: user.id })).id;
      if (body.isDefault) await clearOtherDefaults(savedId);
      setEditing(null);
      showToast(editing.id ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ mới.");
      reload();
    } catch {
      showToast("Không lưu được địa chỉ.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (address) => {
    try {
      await addressApi.patch(address.id, { isDefault: true });
      await clearOtherDefaults(address.id);
      reload();
    } catch {
      showToast("Không đặt được địa chỉ mặc định.", "danger");
    }
  };

  const handleDelete = async () => {
    const target = deleting;
    setDeleting(null);
    try {
      await addressApi.remove(target.id);
      // Xoá địa chỉ mặc định thì chuyển mặc định sang địa chỉ còn lại đầu tiên.
      const rest = addresses.filter((a) => a.id !== target.id);
      if (target.isDefault && rest.length) await addressApi.patch(rest[0].id, { isDefault: true });
      showToast("Đã xoá địa chỉ.");
      reload();
    } catch {
      showToast("Không xoá được địa chỉ.", "danger");
    }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const field = (name, label, props = {}) => (
    <Form.Group className="mb-3" controlId={`addr-${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control name={name} value={form[name]} onChange={onChange} isInvalid={!!errors[name]} {...props} />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <>
      <PageHeader title="Sổ địa chỉ" subtitle="Địa chỉ nhận hàng của bạn">
        <Button onClick={() => openForm(null)}>+ Thêm địa chỉ</Button>
      </PageHeader>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Loading />
      ) : addresses.length === 0 ? (
        <EmptyState title="Bạn chưa lưu địa chỉ nào." />
      ) : (
        <Row xs={1} md={2} className="g-3">
          {addresses.map((a) => (
            <Col key={a.id}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <strong>{a.receiverName}</strong>
                    {a.isDefault && <Badge bg="success">Mặc định</Badge>}
                  </div>
                  <div>{a.phone}</div>
                  <div className="text-muted">
                    {a.addressLine}, {a.ward}, {a.province}
                  </div>
                </Card.Body>
                <Card.Footer className="d-flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline-primary" onClick={() => openForm(a)}>
                    Sửa
                  </Button>
                  {!a.isDefault && (
                    <Button size="sm" variant="outline-success" onClick={() => setDefault(a)}>
                      Đặt mặc định
                    </Button>
                  )}
                  <Button size="sm" variant="outline-danger" onClick={() => setDeleting(a)}>
                    Xoá
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={editing !== null} onHide={() => setEditing(null)} centered>
        <Form onSubmit={handleSave} noValidate>
          <Modal.Header closeButton>
            <Modal.Title className="h5">{editing?.id ? "Sửa địa chỉ" : "Thêm địa chỉ"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {field("receiverName", "Người nhận")}
            {field("phone", "Số điện thoại", { type: "tel" })}
            {field("addressLine", "Số nhà, tên đường")}
            {field("ward", "Phường/Xã")}
            <Form.Group className="mb-3" controlId="addr-province">
              <Form.Label>Tỉnh/Thành phố</Form.Label>
              <Form.Select name="province" value={form.province} onChange={onChange}>
                {PROVINCES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Check id="addr-default" name="isDefault" label="Đặt làm địa chỉ mặc định" checked={form.isDefault} onChange={onChange} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setEditing(null)}>
              Đóng
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={Boolean(deleting)}
        title="Xoá địa chỉ"
        message="Bạn chắc chắn muốn xoá địa chỉ này?"
        confirmText="Xoá"
        variant="danger"
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  );
}

export default AddressesPage;
