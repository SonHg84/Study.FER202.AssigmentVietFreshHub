import { useState } from "react";
import { Alert, Button, Form, Modal, Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import ConfirmModal from "../../components/common/ConfirmModal";
import { categoryApi, productApi } from "../../api/services";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { invalidateCatalog } from "../../store/catalogSlice";
import { toSlug } from "../../utils/format";

const EMPTY = { name: "", imageUrl: "" };

function AdminCategories() {
  useDocumentTitle("Quản lý danh mục");
  const dispatch = useDispatch();
  const showToast = useToast();
  const { data: categories, loading, error, reload } = useFetch("/categories", []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const openForm = (category) => {
    setForm(category ? { name: category.name, imageUrl: category.imageUrl || "" } : EMPTY);
    setFormError("");
    setEditing(category || {});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (name.length < 2) return setFormError("Tên danh mục tối thiểu 2 ký tự.");
    const slug = toSlug(name);
    if (categories.some((c) => c.id !== editing.id && c.slug === slug)) return setFormError("Danh mục này đã tồn tại.");

    setSaving(true);
    try {
      const body = { name, slug, imageUrl: form.imageUrl.trim() };
      if (editing.id) await categoryApi.patch(editing.id, body);
      else await categoryApi.create(body);
      dispatch(invalidateCatalog());
      showToast(editing.id ? "Đã cập nhật danh mục." : "Đã thêm danh mục.");
      setEditing(null);
      reload();
    } catch {
      setFormError("Không lưu được danh mục.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const category = deleting;
    setDeleting(null);
    try {
      // Không xoá danh mục đang có sản phẩm (sẽ làm mồ côi dữ liệu).
      const used = await productApi.list({ categoryId: category.id });
      if (used.length) {
        showToast(`Không xoá được: còn ${used.length} sản phẩm thuộc danh mục này.`, "warning");
        return;
      }
      await categoryApi.remove(category.id);
      dispatch(invalidateCatalog());
      showToast("Đã xoá danh mục.");
      reload();
    } catch {
      showToast("Không xoá được danh mục.", "danger");
    }
  };

  return (
    <>
      <PageHeader title="Danh mục" subtitle={`${categories.length} danh mục sản phẩm`}>
        <Button onClick={() => openForm(null)}>+ Thêm danh mục</Button>
      </PageHeader>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <EmptyState title="Chưa có danh mục nào." />
      ) : (
        <Table responsive hover className="align-middle bg-white">
          <thead>
            <tr>
              <th>Danh mục</th>
              <th>Slug</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    {c.imageUrl && <img src={c.imageUrl} alt="" width={40} height={40} className="rounded object-fit-cover" />}
                    <span className="fw-semibold">{c.name}</span>
                  </div>
                </td>
                <td className="text-muted">{c.slug}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openForm(c)}>
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setDeleting(c)}>
                    Xoá
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={editing !== null} onHide={() => setEditing(null)} centered>
        <Form onSubmit={handleSave} noValidate>
          <Modal.Header closeButton>
            <Modal.Title className="h5">{editing?.id ? "Sửa danh mục" : "Thêm danh mục"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3" controlId="cat-name">
              <Form.Label>Tên danh mục</Form.Label>
              <Form.Control value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
              {form.name && <Form.Text>Slug: {toSlug(form.name)}</Form.Text>}
            </Form.Group>
            <Form.Group controlId="cat-image">
              <Form.Label>Đường dẫn ảnh (tuỳ chọn)</Form.Label>
              <Form.Control value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
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

      <ConfirmModal
        show={Boolean(deleting)}
        title="Xoá danh mục"
        message={`Xoá danh mục "${deleting?.name}"? Chỉ xoá được khi không còn sản phẩm nào thuộc danh mục.`}
        confirmText="Xoá"
        variant="danger"
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  );
}

export default AdminCategories;
