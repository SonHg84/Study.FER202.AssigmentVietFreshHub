import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import { productApi, variantApi } from "../../api/services";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useMyShop from "../../hooks/useMyShop";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { invalidateCatalog } from "../../store/catalogSlice";
import { nowIso } from "../../utils/format";

const EMPTY_PRODUCT = { name: "", categoryId: "", image: "", description: "", origin: "", status: "ACTIVE" };
const EMPTY_VARIANT = { name: "", unit: "kg", weight: "1", price: "", comparePrice: "", stock: "0", lowStock: "5", status: "ACTIVE" };

const toNumber = (value) => (value === "" ? NaN : Number(value));

function SellerProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showToast = useToast();
  const { shop, loading: loadingShop } = useMyShop();
  const { data: categories, loading: loadingCategories } = useFetch("/categories", []);
  const { data: existing, loading: loadingProduct, error: productError } = useFetch(isEdit ? `/products/${id}?_embed=variants` : null);

  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const [variants, setVariants] = useState([{ ...EMPTY_VARIANT }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const loadedRef = useRef(false);

  // Đổ dữ liệu sản phẩm cần sửa vào form (một lần).
  useEffect(() => {
    if (!existing || loadedRef.current) return;
    loadedRef.current = true;
    setProduct({
      name: existing.name,
      categoryId: String(existing.categoryId),
      image: existing.image || "",
      description: existing.description || "",
      origin: existing.origin || "",
      status: existing.status,
    });
    setVariants(
      existing.variants.map((v) => ({
        id: v.id,
        name: v.name,
        unit: v.unit,
        weight: String(v.weight),
        price: String(v.price),
        comparePrice: v.comparePrice ? String(v.comparePrice) : "",
        stock: String(v.stock),
        lowStock: String(v.lowStock),
        status: v.status,
      }))
    );
  }, [existing]);

  if (loadingShop || loadingCategories || loadingProduct) return <Loading />;
  if (!shop) return <EmptyState title="Tài khoản của bạn chưa có cửa hàng." />;
  // Chỉ được sửa sản phẩm của chính cửa hàng mình.
  if (isEdit && (productError || !existing || existing.shopId !== shop.id)) {
    return (
      <EmptyState
        title="Không tìm thấy sản phẩm."
        action={
          <Button as={Link} to="/seller/products">
            Về danh sách
          </Button>
        }
      />
    );
  }

  const setP = (e) => {
    setProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };
  const setV = (index, name, value) => setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [name]: value } : v)));
  const addVariant = () => setVariants((prev) => [...prev, { ...EMPTY_VARIANT }]);
  // Quy cách đã lưu không xoá hẳn (đơn cũ còn tham chiếu) mà chuyển sang "Ngừng bán".
  const removeVariant = (index) => setVariants((prev) => prev.filter((_, i) => i !== index));

  const validate = () => {
    const e = {};
    if (product.name.trim().length < 3) e.name = "Tên sản phẩm tối thiểu 3 ký tự.";
    if (!product.categoryId) e.categoryId = "Vui lòng chọn danh mục.";
    if (!product.image.trim()) e.image = "Vui lòng nhập đường dẫn ảnh.";
    if (product.description.trim().length < 10) e.description = "Mô tả tối thiểu 10 ký tự.";
    const rowErrors = variants.map((v) => {
      const r = {};
      const price = toNumber(v.price);
      const compare = toNumber(v.comparePrice);
      if (!v.name.trim()) r.name = "Nhập tên quy cách.";
      if (!(price > 0)) r.price = "Giá phải lớn hơn 0.";
      if (v.comparePrice !== "" && !(compare > price)) r.comparePrice = "Giá gốc phải lớn hơn giá bán.";
      if (!Number.isInteger(toNumber(v.stock)) || toNumber(v.stock) < 0) r.stock = "Tồn kho là số nguyên ≥ 0.";
      if (!(toNumber(v.weight) > 0)) r.weight = "Khối lượng > 0.";
      return r;
    });
    if (rowErrors.some((r) => Object.keys(r).length)) e.variants = rowErrors;
    if (!variants.some((v) => v.status === "ACTIVE")) e.variantsGeneral = "Cần ít nhất một quy cách đang bán.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      showToast("Vui lòng kiểm tra lại thông tin sản phẩm.", "warning");
      return;
    }

    setSaving(true);
    try {
      const fields = {
        name: product.name.trim(),
        categoryId: Number(product.categoryId),
        image: product.image.trim(),
        description: product.description.trim(),
        origin: product.origin.trim(),
        status: product.status,
      };
      let productId = id;
      if (isEdit) {
        // Sản phẩm bị từ chối được gửi duyệt lại sau khi sửa.
        const resubmit = existing.approval === "REJECTED";
        await productApi.patch(id, { ...fields, ...(resubmit ? { approval: "PENDING", rejectNote: "" } : {}) });
      } else {
        const created = await productApi.create({ ...fields, shopId: shop.id, approval: "PENDING", rejectNote: "", sold: 0, createdAt: nowIso() });
        productId = created.id;
      }
      for (const v of variants) {
        const body = {
          name: v.name.trim(),
          unit: v.unit.trim() || "kg",
          weight: Number(v.weight),
          price: Number(v.price),
          comparePrice: v.comparePrice === "" ? 0 : Number(v.comparePrice),
          stock: Number(v.stock),
          lowStock: Number(v.lowStock) || 0,
          status: v.status,
        };
        if (v.id) await variantApi.patch(v.id, body);
        else await variantApi.create({ ...body, productId: Number(productId) });
      }
      dispatch(invalidateCatalog());
      showToast(isEdit ? "Đã lưu sản phẩm." : "Đã tạo sản phẩm, chờ quản trị viên duyệt.");
      navigate("/seller/products");
    } catch {
      showToast("Không lưu được sản phẩm. Vui lòng thử lại.", "danger");
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"} subtitle="Sản phẩm mới cần được quản trị viên duyệt trước khi hiển thị">
        <Button as={Link} to="/seller/products" variant="outline-secondary">
          ← Danh sách
        </Button>
      </PageHeader>
      {existing?.approval === "REJECTED" && (
        <Alert variant="danger">
          Sản phẩm bị từ chối{existing.rejectNote ? `: ${existing.rejectNote}` : ""}. Sửa và lưu để gửi duyệt lại.
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        <Card className="mb-3">
          <Card.Body>
            <h2 className="h5">Thông tin chung</h2>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="p-name">
                  <Form.Label>Tên sản phẩm</Form.Label>
                  <Form.Control name="name" value={product.name} onChange={setP} isInvalid={!!errors.name} />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="p-category">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select name="categoryId" value={product.categoryId} onChange={setP} isInvalid={!!errors.categoryId}>
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.categoryId}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="p-image">
                  <Form.Label>Đường dẫn ảnh</Form.Label>
                  <Form.Control name="image" value={product.image} onChange={setP} isInvalid={!!errors.image} placeholder="https://..." />
                  <Form.Control.Feedback type="invalid">{errors.image}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="p-origin">
                  <Form.Label>Xuất xứ</Form.Label>
                  <Form.Control name="origin" value={product.origin} onChange={setP} />
                </Form.Group>
              </Col>
            </Row>
            {product.image && <img src={product.image} alt="Xem trước" height={90} className="rounded mb-3" />}
            <Form.Group className="mb-3" controlId="p-description">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={product.description} onChange={setP} isInvalid={!!errors.description} />
              <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="p-status">
              <Form.Label>Hiển thị</Form.Label>
              <Form.Select name="status" value={product.status} onChange={setP} style={{ maxWidth: 220 }}>
                <option value="ACTIVE">Đang bán</option>
                <option value="INACTIVE">Đã ẩn</option>
              </Form.Select>
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h5 mb-0">Quy cách &amp; giá</h2>
              <Button size="sm" variant="outline-primary" onClick={addVariant}>
                + Thêm quy cách
              </Button>
            </div>
            {errors.variantsGeneral && <Alert variant="danger">{errors.variantsGeneral}</Alert>}
            {variants.map((v, i) => {
              const err = errors.variants?.[i] || {};
              const cell = (name, label, props = {}) => (
                <Form.Group controlId={`v-${i}-${name}`}>
                  <Form.Label className="small mb-1">{label}</Form.Label>
                  <Form.Control size="sm" value={v[name]} onChange={(e) => setV(i, name, e.target.value)} isInvalid={!!err[name]} {...props} />
                  <Form.Control.Feedback type="invalid">{err[name]}</Form.Control.Feedback>
                </Form.Group>
              );
              return (
                <div key={v.id || `new-${i}`} className="border rounded p-3 mb-2">
                  <Row className="g-2 align-items-start">
                    <Col md={3}>{cell("name", "Tên quy cách", { placeholder: "Túi 1 kg" })}</Col>
                    <Col xs={4} md={1}>
                      {cell("unit", "Đơn vị")}
                    </Col>
                    <Col xs={4} md={1}>
                      {cell("weight", "KL", { type: "number", min: 0, step: "any" })}
                    </Col>
                    <Col xs={4} md={2}>
                      {cell("price", "Giá bán (đ)", { type: "number", min: 0 })}
                    </Col>
                    <Col xs={4} md={2}>
                      {cell("comparePrice", "Giá gốc (đ)", { type: "number", min: 0 })}
                    </Col>
                    <Col xs={4} md={1}>
                      {cell("stock", "Tồn kho", { type: "number", min: 0 })}
                    </Col>
                    <Col xs={4} md={1}>
                      {cell("lowStock", "Báo hết", { type: "number", min: 0 })}
                    </Col>
                    <Col xs={12} md={1} className="d-flex align-items-end h-100 pt-md-4">
                      {v.id ? (
                        <Form.Check
                          type="switch"
                          id={`v-${i}-status`}
                          label="Bán"
                          checked={v.status === "ACTIVE"}
                          onChange={(e) => setV(i, "status", e.target.checked ? "ACTIVE" : "INACTIVE")}
                        />
                      ) : (
                        <Button size="sm" variant="outline-danger" onClick={() => removeVariant(i)} disabled={variants.length === 1}>
                          Xoá
                        </Button>
                      )}
                    </Col>
                  </Row>
                </div>
              );
            })}
          </Card.Body>
        </Card>

        <div className="d-flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu sản phẩm"}
          </Button>
          <Button as={Link} to="/seller/products" variant="outline-secondary">
            Huỷ
          </Button>
        </div>
      </Form>
    </>
  );
}

export default SellerProductForm;
