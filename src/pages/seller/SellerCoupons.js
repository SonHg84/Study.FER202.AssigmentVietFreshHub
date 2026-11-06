import { useState } from "react";
import { Alert, Badge, Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import { couponApi } from "../../api/services";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useMyShop from "../../hooks/useMyShop";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatCurrency, formatDate } from "../../utils/format";

const pad = (n) => String(n).padStart(2, "0");
// Ô <input type="date"> dùng định dạng yyyy-mm-dd theo giờ địa phương.
const toInputDate = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const emptyForm = () => {
  const today = new Date();
  const end = new Date(today.getTime() + 14 * 24 * 3600 * 1000);
  return { code: "", name: "", discount: "", minOrder: "0", usageLimit: "100", startAt: toInputDate(today), endAt: toInputDate(end), status: "ACTIVE" };
};

function SellerCoupons() {
  useDocumentTitle("Mã giảm giá");
  const showToast = useToast();
  const { shop, loading: loadingShop } = useMyShop();
  const { data: coupons, loading, error, reload } = useFetch(shop ? `/coupons?shopId=${shop.id}` : null, []);

  const [editing, setEditing] = useState(null); // null: đóng; {} thêm; {id,...} sửa
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const openForm = (coupon) => {
    setErrors({});
    setForm(
      coupon
        ? {
            code: coupon.code,
            name: coupon.name,
            discount: String(coupon.discount),
            minOrder: String(coupon.minOrder),
            usageLimit: String(coupon.usageLimit),
            startAt: toInputDate(coupon.startAt),
            endAt: toInputDate(coupon.endAt),
            status: coupon.status,
          }
        : emptyForm()
    );
    setEditing(coupon || {});
  };

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = async () => {
    const e = {};
    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,20}$/.test(code)) e.code = "Mã gồm 4–20 chữ in hoa hoặc số, không dấu.";
    if (!form.name.trim()) e.name = "Vui lòng nhập tên chương trình.";
    if (!(Number(form.discount) > 0)) e.discount = "Số tiền giảm phải lớn hơn 0.";
    if (!(Number(form.minOrder) >= 0) || form.minOrder === "") e.minOrder = "Đơn tối thiểu không hợp lệ.";
    else if (Number(form.discount) > Number(form.minOrder) && Number(form.minOrder) > 0) e.discount = "Số tiền giảm không được vượt đơn tối thiểu.";
    if (!(Number(form.usageLimit) >= 1)) e.usageLimit = "Giới hạn lượt dùng tối thiểu là 1.";
    if (!form.startAt || !form.endAt || form.endAt < form.startAt) e.endAt = "Ngày kết thúc phải sau ngày bắt đầu.";
    if (!e.code) {
      const same = await couponApi.list({ code });
      if (same.some((c) => c.id !== editing.id)) e.code = "Mã này đã tồn tại.";
    }
    return e;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      const found = await validate();
      setErrors(found);
      if (Object.keys(found).length) return;
      const body = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        discount: Number(form.discount),
        minOrder: Number(form.minOrder),
        usageLimit: Number(form.usageLimit),
        startAt: new Date(`${form.startAt}T00:00:00`).toISOString(),
        endAt: new Date(`${form.endAt}T23:59:59`).toISOString(),
        status: form.status,
      };
      if (editing.id) await couponApi.patch(editing.id, body);
      else await couponApi.create({ ...body, shopId: shop.id, used: 0 });
      showToast(editing.id ? "Đã cập nhật mã giảm giá." : "Đã tạo mã giảm giá.");
      setEditing(null);
      reload();
    } catch {
      showToast("Không lưu được mã giảm giá.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (coupon) => {
    try {
      await couponApi.patch(coupon.id, { status: coupon.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
      reload();
    } catch {
      showToast("Không cập nhật được mã.", "danger");
    }
  };

  const state = (c) => {
    const now = Date.now();
    if (c.status !== "ACTIVE") return { label: "Đã tắt", bg: "secondary" };
    if (now > new Date(c.endAt).getTime()) return { label: "Hết hạn", bg: "dark" };
    if (now < new Date(c.startAt).getTime()) return { label: "Chưa bắt đầu", bg: "info" };
    if (c.used >= c.usageLimit) return { label: "Hết lượt", bg: "warning" };
    return { label: "Đang chạy", bg: "success" };
  };

  const field = (name, label, props = {}) => (
    <Form.Group className="mb-3" controlId={`cp-${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control name={name} value={form[name]} onChange={onChange} isInvalid={!!errors[name]} {...props} />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <>
      <PageHeader title="Mã giảm giá" subtitle="Mã áp dụng cho đơn hàng của cửa hàng bạn">
        <Button onClick={() => openForm(null)} disabled={!shop}>
          + Tạo mã
        </Button>
      </PageHeader>
      {error && <Alert variant="danger">{error}</Alert>}
      {loadingShop || loading ? (
        <Loading />
      ) : coupons.length === 0 ? (
        <EmptyState title="Chưa có mã giảm giá nào." />
      ) : (
        <Table responsive className="align-middle bg-white">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Giảm</th>
              <th>Đơn tối thiểu</th>
              <th>Hiệu lực</th>
              <th>Đã dùng</th>
              <th>Trạng thái</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const s = state(c);
              return (
                <tr key={c.id}>
                  <td>
                    <div className="fw-semibold">{c.code}</div>
                    <small className="text-muted">{c.name}</small>
                  </td>
                  <td>{formatCurrency(c.discount)}</td>
                  <td>{formatCurrency(c.minOrder)}</td>
                  <td>
                    {formatDate(c.startAt)} – {formatDate(c.endAt)}
                  </td>
                  <td>
                    {c.used}/{c.usageLimit}
                  </td>
                  <td>
                    <Badge bg={s.bg}>{s.label}</Badge>
                  </td>
                  <td className="text-end text-nowrap">
                    <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openForm(c)}>
                      Sửa
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => toggle(c)}>
                      {c.status === "ACTIVE" ? "Tắt" : "Bật"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <Modal show={editing !== null} onHide={() => setEditing(null)} centered>
        <Form onSubmit={handleSave} noValidate>
          <Modal.Header closeButton>
            <Modal.Title className="h5">{editing?.id ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {field("code", "Mã", { style: { textTransform: "uppercase" }, disabled: Boolean(editing?.id) })}
            {field("name", "Tên chương trình")}
            <Row>
              <Col>{field("discount", "Giảm (đ)", { type: "number", min: 0 })}</Col>
              <Col>{field("minOrder", "Đơn tối thiểu (đ)", { type: "number", min: 0 })}</Col>
            </Row>
            {field("usageLimit", "Giới hạn lượt dùng", { type: "number", min: 1 })}
            <Row>
              <Col>{field("startAt", "Bắt đầu", { type: "date" })}</Col>
              <Col>{field("endAt", "Kết thúc", { type: "date" })}</Col>
            </Row>
            <Form.Group controlId="cp-status">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select name="status" value={form.status} onChange={onChange}>
                <option value="ACTIVE">Bật</option>
                <option value="INACTIVE">Tắt</option>
              </Form.Select>
            </Form.Group>
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
    </>
  );
}

export default SellerCoupons;
