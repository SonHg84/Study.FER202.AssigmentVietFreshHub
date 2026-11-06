import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Breadcrumb, Button, Col, Row, Tab, Tabs, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { productApi } from "../../api/services";
import api from "../../api/axiosClient";
import { fetchCatalog } from "../../store/catalogSlice";
import Loading from "../../components/common/Loading";
import Price from "../../components/common/Price";
import QuantityInput from "../../components/common/QuantityInput";
import RatingStars from "../../components/common/RatingStars";
import EmptyState from "../../components/common/EmptyState";
import ProductGrid from "../../components/product/ProductGrid";
import useAddToCart from "../../hooks/useAddToCart";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { averageRating, pickDisplayVariant } from "../../utils/product";
import { formatDate } from "../../utils/format";

function ProductDetailPage() {
  const { id } = useParams(); // tham số động trong URL /products/:id
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const addToCart = useAddToCart();
  const catalog = useSelector((state) => state.catalog.products);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variantId, setVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useDocumentTitle(product?.name || "Chi tiết sản phẩm");

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  // Tải lại khi id đổi; cờ `ignore` tránh cập nhật state của request cũ (race condition).
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detail, reviewList] = await Promise.all([
          productApi.getDetail(id),
          api.get("/reviews", { params: { productId: id, status: "APPROVED", _expand: "user", _sort: "createdAt", _order: "desc" } }).then((r) => r.data),
        ]);
        if (ignore) return;
        const visible = detail.status === "ACTIVE" && detail.approval === "APPROVED" && detail.shop?.status === "ACTIVE";
        if (!visible) {
          setProduct(null);
          setError("Sản phẩm không tồn tại hoặc đã ngừng bán.");
          return;
        }
        const variants = detail.variants.filter((v) => v.status === "ACTIVE");
        setProduct({ ...detail, variants });
        setReviews(reviewList.map((r) => ({ ...r, userName: r.user?.fullName || "Khách hàng" })));
        setVariantId(pickDisplayVariant(variants)?.id ?? null);
        setQuantity(1);
      } catch (err) {
        if (!ignore) setError(err.message.includes("404") ? "Sản phẩm không tồn tại hoặc đã ngừng bán." : err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const related = useMemo(
    () => (product ? catalog.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4) : []),
    [catalog, product]
  );

  if (loading) return <Loading />;
  if (error || !product) {
    return (
      <EmptyState title={error || "Không tìm thấy sản phẩm"} action={<Button as={Link} to="/products" variant="success">Xem sản phẩm khác</Button>} />
    );
  }

  const variant = product.variants.find((v) => v.id === variantId);
  const rating = averageRating(reviews);
  const outOfStock = !variant || variant.stock <= 0;

  const handleSelectVariant = (value) => {
    setVariantId(value);
    setQuantity(1);
  };

  const handleAdd = () => addToCart(product, variant, quantity);
  const handleBuyNow = () => {
    if (addToCart(product, variant, quantity)) navigate("/cart");
  };

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Trang chủ
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/products?category=${product.categoryId}` }}>
          {product.category?.name}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="panel mb-4">
        <Row className="g-4">
          <Col md={5}>
            <img src={product.image} alt={product.name} className="detail-image" />
          </Col>
          <Col md={7}>
            <h1 className="page-title">{product.name}</h1>
            <div className="d-flex flex-wrap gap-3 align-items-center mb-3 text-muted small">
              <span>
                <RatingStars value={rating.avg} /> {rating.count ? `${rating.avg}/5 (${rating.count} đánh giá)` : "Chưa có đánh giá"}
              </span>
              <span>Đã bán {product.sold}</span>
              <span>Xuất xứ: {product.origin}</span>
            </div>

            {variant && <Price price={variant.price} comparePrice={variant.comparePrice} size="lg" />}

            <div className="mt-4 mb-2 fw-semibold">Chọn quy cách</div>
            {/* ToggleButtonGroup dạng radio, controlled bằng state variantId */}
            <ToggleButtonGroup type="radio" name="variant" value={variantId} onChange={handleSelectVariant} className="variant-toggle d-flex flex-wrap">
              {product.variants.map((v) => (
                <ToggleButton key={v.id} id={`variant-${v.id}`} value={v.id} variant="outline-success" disabled={v.stock <= 0}>
                  {v.name}
                  {v.stock <= 0 && " (hết)"}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <div className="d-flex align-items-center gap-3 mt-3">
              {!outOfStock && <QuantityInput value={quantity} max={variant.stock} onChange={setQuantity} />}
              <span className="text-muted small">
                {outOfStock ? <Badge bg="secondary">Tạm hết hàng</Badge> : `Còn ${variant.stock} ${variant.unit}`}
              </span>
            </div>

            <div className="d-flex gap-2 mt-4">
              <Button variant="outline-success" size="lg" disabled={outOfStock} onClick={handleAdd}>
                Thêm vào giỏ
              </Button>
              <Button variant="success" size="lg" disabled={outOfStock} onClick={handleBuyNow}>
                Mua ngay
              </Button>
            </div>

            <div className="d-flex align-items-center gap-3 mt-4 pt-3 border-top">
              <img src={product.shop.logo} alt="" className="shop-logo m-0" />
              <div className="flex-grow-1">
                <div className="fw-semibold">{product.shop.name}</div>
                <small className="text-muted">{product.shop.province}</small>
              </div>
              <Button as={Link} to={`/shops/${product.shop.id}`} variant="outline-success" size="sm">
                Xem shop
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <div className="panel mb-4">
        <Tabs defaultActiveKey="description" className="mb-3">
          <Tab eventKey="description" title="Mô tả sản phẩm">
            <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
              {product.description}
            </p>
          </Tab>
          <Tab eventKey="reviews" title={`Đánh giá (${reviews.length})`}>
            {reviews.length === 0 ? (
              <Alert variant="light" className="mb-0">
                Chưa có đánh giá nào cho sản phẩm này.
              </Alert>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border-bottom py-3">
                  <div className="d-flex justify-content-between">
                    <strong>{r.userName}</strong>
                    <small className="text-muted">{formatDate(r.createdAt)}</small>
                  </div>
                  <RatingStars value={r.rating} />
                  <p className="mb-0">{r.content}</p>
                </div>
              ))
            )}
          </Tab>
        </Tabs>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="section-top">
            <h2>SẢN PHẨM LIÊN QUAN</h2>
          </div>
          <ProductGrid products={related} onAddToCart={addToCart} />
        </section>
      )}
    </>
  );
}

export default ProductDetailPage;
