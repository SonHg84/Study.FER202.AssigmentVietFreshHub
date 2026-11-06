import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCatalog } from "../../store/catalogSlice";
import ProductGrid from "../../components/product/ProductGrid";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import useFetch from "../../hooks/useFetch";
import useAddToCart from "../../hooks/useAddToCart";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatDate } from "../../utils/format";

function ShopDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const addToCart = useAddToCart();
  const products = useSelector((state) => state.catalog.products);
  const { data: shop, loading, error } = useFetch(`/shops/${id}`);
  const { data: coupons } = useFetch(`/coupons?shopId=${id}&status=ACTIVE`, []);
  const [categoryId, setCategoryId] = useState("");
  useDocumentTitle(shop?.name || "Cửa hàng");

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  const shopProducts = useMemo(() => products.filter((p) => String(p.shopId) === id), [products, id]);
  const categories = useMemo(() => {
    const map = new Map();
    shopProducts.forEach((p) => map.set(p.categoryId, p.categoryId));
    return [...map.keys()];
  }, [shopProducts]);
  const allCategories = useSelector((state) => state.catalog.categories);
  const shown = categoryId ? shopProducts.filter((p) => String(p.categoryId) === categoryId) : shopProducts;

  if (loading) return <Loading />;
  if (error || !shop || shop.status !== "ACTIVE") {
    return <EmptyState title="Cửa hàng không tồn tại hoặc đang tạm khoá." action={<Button as={Link} to="/shops" variant="success">Xem cửa hàng khác</Button>} />;
  }

  const validCoupons = coupons.filter((c) => new Date(c.endAt) > new Date() && c.used < c.usageLimit);

  return (
    <>
      <div className="shop-hero">
        <div className="shop-hero-banner" style={{ backgroundImage: `url(${shop.banner})` }} />
        <div className="p-4 d-flex flex-wrap gap-4 align-items-end">
          <img src={shop.logo} alt="" className="shop-logo" />
          <div className="flex-grow-1">
            <h1 className="page-title mb-1">{shop.name}</h1>
            <div className="text-muted small">
              {shop.address}, {shop.province} · ĐT {shop.phone} · Tham gia {formatDate(shop.createdAt)}
            </div>
          </div>
          <div className="text-end">
            <div className="stat-value text-success fw-bold fs-4">{shopProducts.length}</div>
            <small className="text-muted">sản phẩm đang bán</small>
          </div>
        </div>
        <p className="px-4 pb-4 mb-0">{shop.description}</p>
      </div>

      {validCoupons.length > 0 && (
        <Alert variant="success">
          <strong>Mã giảm giá của shop: </strong>
          {validCoupons.map((c) => (
            <span key={c.id} className="me-3">
              <code>{c.code}</code> – giảm {c.discount.toLocaleString("vi-VN")}đ cho đơn từ {c.minOrder.toLocaleString("vi-VN")}đ
            </span>
          ))}
        </Alert>
      )}

      <Row className="mb-3 align-items-center">
        <Col>
          <h2 className="h5 mb-0">Sản phẩm của shop</h2>
        </Col>
        <Col xs="auto">
          <Form.Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Lọc danh mục">
            <option value="">Tất cả danh mục</option>
            {categories.map((cid) => (
              <option key={cid} value={cid}>
                {allCategories.find((c) => c.id === cid)?.name}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <ProductGrid products={shown} onAddToCart={addToCart} emptyText="Cửa hàng chưa có sản phẩm đang bán." />
    </>
  );
}

export default ShopDetailPage;
