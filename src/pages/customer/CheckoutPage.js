import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Col, Form, InputGroup, ListGroup, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { clearCart, clearShop, selectCartItems } from "../../store/cartSlice";
import { groupByShop } from "../../utils/cart";
import { placeShopOrder, validateCoupon } from "../../utils/checkout";
import { PAYMENT_METHODS, PROVINCES, shippingFeeFor } from "../../utils/constants";
import { formatCurrency } from "../../utils/format";

const EMPTY_ADDRESS = { receiverName: "", phone: "", addressLine: "", ward: "", province: PROVINCES[0] };

const validateAddress = (a) => {
  const errors = {};
  if (a.receiverName.trim().length < 2) errors.receiverName = "Vui lòng nhập tên người nhận.";
  if (!/^(0|\+84)\d{9}$/.test(a.phone.trim())) errors.phone = "Số điện thoại không hợp lệ.";
  if (!a.addressLine.trim()) errors.addressLine = "Vui lòng nhập số nhà, tên đường.";
  if (!a.ward.trim()) errors.ward = "Vui lòng nhập phường/xã.";
  if (!a.province) errors.province = "Vui lòng chọn tỉnh/thành.";
  return errors;
};

function CheckoutPage() {
  useDocumentTitle("Thanh toán");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const { user } = useAuth();
  const items = useSelector(selectCartItems);
  const groups = useMemo(() => groupByShop(items), [items]);

  const { data: shops, loading: loadingShops, error: shopsError } = useFetch("/shops", []);
  const { data: addresses, loading: loadingAddresses } = useFetch(`/addresses?userId=${user.id}`, []);

  const [address, setAddress] = useState({ ...EMPTY_ADDRESS, receiverName: user.fullName || "", phone: user.phone || "" });
  const [errors, setErrors] = useState({});
  const [savedId, setSavedId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [note, setNote] = useState("");
  const [couponInputs, setCouponInputs] = useState({}); // shopId -> chữ đang gõ
  const [coupons, setCoupons] = useState({}); // shopId -> { code, discount } đã áp dụng
  const [couponErrors, setCouponErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Giỏ rỗng sau khi đặt thành công không được đẩy về /cart (đã chuyển sang trang đơn hàng).
  const placedRef = useRef(false);
  const prefilledRef = useRef(false);

  // Điền sẵn địa chỉ mặc định một lần khi danh sách địa chỉ tải xong.
  useEffect(() => {
    if (prefilledRef.current || addresses.length === 0) return;
    prefilledRef.current = true;
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    setSavedId(String(def.id));
    setAddress({
      receiverName: def.receiverName,
      phone: def.phone,
      addressLine: def.addressLine,
      ward: def.ward,
      province: def.province,
    });
  }, [addresses]);

  const shopById = useMemo(() => Object.fromEntries(shops.map((s) => [s.id, s])), [shops]);

  // Tính tiền từng cửa hàng: phí giao phụ thuộc tỉnh của cửa hàng và tỉnh người nhận.
  const summaries = useMemo(
    () =>
      groups.map((group) => {
        const discount = coupons[group.shopId]?.discount || 0;
        const shippingFee = shippingFeeFor(shopById[group.shopId]?.province, address.province, group.subtotal);
        return { ...group, discount, shippingFee, total: group.subtotal + shippingFee - discount };
      }),
    [groups, coupons, shopById, address.province]
  );
  const grandTotal = summaries.reduce((sum, s) => sum + s.total, 0);

  if (items.length === 0 && !placedRef.current) return <Navigate to="/cart" replace />;
  if (loadingShops || loadingAddresses) return <Loading />;

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setSavedId("");
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectSaved = (e) => {
    const id = e.target.value;
    setSavedId(id);
    const found = addresses.find((a) => String(a.id) === id);
    if (found) {
      setAddress({
        receiverName: found.receiverName,
        phone: found.phone,
        addressLine: found.addressLine,
        ward: found.ward,
        province: found.province,
      });
      setErrors({});
    }
  };

  const applyCoupon = async (group) => {
    const code = (couponInputs[group.shopId] || "").trim();
    if (!code) return;
    try {
      const { coupon, discount } = await validateCoupon(code, group.shopId, group.subtotal);
      setCoupons((prev) => ({ ...prev, [group.shopId]: { code: coupon.code, discount } }));
      setCouponErrors((prev) => ({ ...prev, [group.shopId]: "" }));
      showToast(`Đã áp dụng mã ${coupon.code}: giảm ${formatCurrency(discount)}.`);
    } catch (err) {
      setCouponErrors((prev) => ({ ...prev, [group.shopId]: err.message }));
    }
  };

  const removeCoupon = (shopId) => {
    setCoupons((prev) => {
      const { [shopId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateAddress(address);
    setErrors(found);
    if (Object.keys(found).length) {
      showToast("Vui lòng kiểm tra lại địa chỉ giao hàng.", "warning");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    const created = [];
    const failed = [];
    const cleanAddress = Object.fromEntries(Object.entries(address).map(([k, v]) => [k, v.trim()]));

    // Đặt tuần tự từng cửa hàng; cửa hàng lỗi không làm hỏng các đơn đã tạo.
    for (const group of groups) {
      try {
        const order = await placeShopOrder({
          user,
          group,
          address: cleanAddress,
          paymentMethod,
          note: note.trim(),
          couponCode: coupons[group.shopId]?.code || "",
        });
        created.push({ shopId: group.shopId, order });
      } catch (err) {
        failed.push(`${group.shopName || `Cửa hàng #${group.shopId}`}: ${err.message}`);
      }
    }

    if (failed.length === 0) {
      placedRef.current = true;
      dispatch(clearCart());
      showToast(created.length > 1 ? `Đặt hàng thành công ${created.length} đơn!` : `Đặt hàng thành công đơn ${created[0].order.code}!`);
      navigate(created.length === 1 ? `/account/orders/${created[0].order.id}` : "/account/orders", { replace: true });
      return;
    }

    // Có lỗi: chỉ xoá khỏi giỏ các cửa hàng đã đặt xong, giữ lại phần còn lại để thử lại.
    created.forEach(({ shopId }) => dispatch(clearShop(shopId)));
    if (created.length) showToast(`Đã tạo ${created.length} đơn. Còn ${failed.length} cửa hàng chưa đặt được.`, "warning");
    setSubmitError(failed.join("\n"));
    setSubmitting(false);
  };

  const field = (name, label, props = {}) => (
    <Form.Group className="mb-3" controlId={`checkout-${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control name={name} value={address[name]} onChange={handleAddressChange} isInvalid={!!errors[name]} {...props} />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <>
      <PageHeader title="Thanh toán" subtitle="Kiểm tra địa chỉ, mã giảm giá và phương thức thanh toán" />
      {shopsError && <Alert variant="danger">{shopsError}</Alert>}
      {submitError && (
        <Alert variant="danger" style={{ whiteSpace: "pre-line" }}>
          {submitError}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        <Row className="g-4">
          <Col lg={7}>
            <Card className="mb-3">
              <Card.Body>
                <h2 className="h5">Địa chỉ giao hàng</h2>
                {addresses.length > 0 && (
                  <Form.Group className="mb-3" controlId="checkout-saved">
                    <Form.Label>Địa chỉ đã lưu</Form.Label>
                    <Form.Select value={savedId} onChange={handleSelectSaved}>
                      <option value="">Nhập địa chỉ khác</option>
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.receiverName} – {a.addressLine}, {a.ward}, {a.province}
                          {a.isDefault ? " (mặc định)" : ""}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text>
                      Quản lý địa chỉ tại <Link to="/account/addresses">Sổ địa chỉ</Link>.
                    </Form.Text>
                  </Form.Group>
                )}
                <Row>
                  <Col md={6}>{field("receiverName", "Người nhận", { autoComplete: "name" })}</Col>
                  <Col md={6}>{field("phone", "Số điện thoại", { type: "tel", autoComplete: "tel" })}</Col>
                </Row>
                {field("addressLine", "Số nhà, tên đường")}
                <Row>
                  <Col md={6}>{field("ward", "Phường/Xã")}</Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="checkout-province">
                      <Form.Label>Tỉnh/Thành phố</Form.Label>
                      <Form.Select name="province" value={address.province} onChange={handleAddressChange} isInvalid={!!errors.province}>
                        {PROVINCES.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                        {!PROVINCES.includes(address.province) && <option>{address.province}</option>}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group controlId="checkout-note">
                  <Form.Label>Ghi chú cho người bán (tuỳ chọn)</Form.Label>
                  <Form.Control as="textarea" rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <h2 className="h5">Phương thức thanh toán</h2>
                {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                  <Form.Check
                    key={key}
                    type="radio"
                    id={`pay-${key}`}
                    name="paymentMethod"
                    label={label}
                    checked={paymentMethod === key}
                    onChange={() => setPaymentMethod(key)}
                  />
                ))}
                {paymentMethod === "BANK_TRANSFER" && (
                  <Alert variant="info" className="mt-3 mb-0">
                    Người bán sẽ gửi thông tin tài khoản qua số điện thoại của bạn sau khi xác nhận đơn.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="sticky-top" style={{ top: 90 }}>
              <Card.Body>
                <h2 className="h5">Đơn hàng ({groups.length} cửa hàng)</h2>
                {summaries.map((s) => (
                  <div key={s.shopId} className="border rounded p-3 mb-3">
                    <div className="fw-semibold mb-2">🏪 {s.shopName || `Cửa hàng #${s.shopId}`}</div>
                    <ListGroup variant="flush" className="mb-2">
                      {s.items.map((line) => (
                        <ListGroup.Item key={line.variantId} className="px-0 d-flex justify-content-between gap-2">
                          <span className="small">
                            {line.productName} – {line.variantName} × {line.quantity}
                          </span>
                          <span className="small text-nowrap">{formatCurrency(line.price * line.quantity)}</span>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    {coupons[s.shopId] ? (
                      <div className="d-flex justify-content-between align-items-center small mb-2">
                        <span>
                          Mã <strong>{coupons[s.shopId].code}</strong> đã áp dụng
                        </span>
                        <Button variant="link" size="sm" className="text-danger p-0" onClick={() => removeCoupon(s.shopId)}>
                          Bỏ mã
                        </Button>
                      </div>
                    ) : (
                      <>
                        <InputGroup size="sm" className="mb-1">
                          <Form.Control
                            placeholder="Mã giảm giá của cửa hàng"
                            aria-label={`Mã giảm giá ${s.shopName}`}
                            value={couponInputs[s.shopId] || ""}
                            onChange={(e) => setCouponInputs((prev) => ({ ...prev, [s.shopId]: e.target.value }))}
                          />
                          <Button variant="outline-primary" onClick={() => applyCoupon(s)}>
                            Áp dụng
                          </Button>
                        </InputGroup>
                        {couponErrors[s.shopId] && <div className="small text-danger mb-1">{couponErrors[s.shopId]}</div>}
                      </>
                    )}

                    <div className="d-flex justify-content-between small">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(s.subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <span>Phí giao hàng</span>
                      <span>{s.shippingFee === 0 ? "Miễn phí" : formatCurrency(s.shippingFee)}</span>
                    </div>
                    {s.discount > 0 && (
                      <div className="d-flex justify-content-between small text-success">
                        <span>Giảm giá</span>
                        <span>-{formatCurrency(s.discount)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between fw-semibold mt-1">
                      <span>Thành tiền</span>
                      <span>{formatCurrency(s.total)}</span>
                    </div>
                  </div>
                ))}

                <div className="d-flex justify-content-between fs-5 fw-bold mb-3">
                  <span>Tổng thanh toán</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="d-grid gap-2">
                  <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
                  </Button>
                  <Button as={Link} to="/cart" variant="outline-secondary" disabled={submitting}>
                    Quay lại giỏ hàng
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default CheckoutPage;
