import { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Alert, Button, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCatalog } from "../../store/catalogSlice";
import ProductGrid from "../../components/product/ProductGrid";
import ShopCard from "../../components/product/ShopCard";
import Loading from "../../components/common/Loading";
import useAddToCart from "../../hooks/useAddToCart";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useFetch from "../../hooks/useFetch";

function Section({ title, link, linkText = "Xem tất cả", children }) {
  return (
    <section className="section">
      <div className="section-top">
        <h2>{title}</h2>
        {link && <Link to={link}>{linkText}</Link>}
      </div>
      {children}
    </section>
  );
}

Section.propTypes = {
  title: PropTypes.string.isRequired,
  link: PropTypes.string,
  linkText: PropTypes.string,
  children: PropTypes.node.isRequired,
};

function HomePage() {
  useDocumentTitle("Trang chủ");
  const dispatch = useDispatch();
  const { products, categories, loading, error } = useSelector((state) => state.catalog);
  const { data: shops } = useFetch("/shops?status=ACTIVE", []);
  const addToCart = useAddToCart();

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  // useMemo: chỉ tính lại khi danh sách sản phẩm đổi.
  const topProducts = useMemo(() => [...products].sort((a, b) => b.sold - a.sold).slice(0, 8), [products]);
  const newest = useMemo(
    () => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    [products]
  );

  return (
    <>
      <section className="hero-grid">
        {/* Ảnh nền nằm trong public/: dùng biến CSS để không bị webpack xử lý như một module */}
        <div className="hero" style={{ "--hero-image": `url(${process.env.PUBLIC_URL}/images/products/mango-photo.png)` }}>
          <h1>Trái cây tươi mỗi ngày</h1>
          <p>Khám phá các loại trái cây nội địa và nhập khẩu từ nhiều gian hàng trên VietFresh Hub.</p>
          <Button as={Link} to="/products" variant="warning" size="lg">
            Xem tất cả sản phẩm
          </Button>
        </div>
        <div className="side-banners">
          <div className="side-banner">
            <h3>Sản phẩm bán chạy</h3>
            <p className="text-muted">Khám phá các loại trái cây được mua nhiều.</p>
            <Button as={Link} to="/products?sort=sales" variant="success" size="sm">
              Xem ngay
            </Button>
          </div>
          <div className="side-banner">
            <h3>Khám phá gian hàng</h3>
            <p className="text-muted">Truy cập các shop trái cây để xem sản phẩm riêng.</p>
            <Button as={Link} to="/shops" variant="success" size="sm">
              Danh sách shop
            </Button>
          </div>
        </div>
      </section>

      {error && <Alert variant="danger">{error}</Alert>}

      <Section title="DANH MỤC TRÁI CÂY" link="/products">
        <Row xs={3} md={6} className="g-3">
          {categories.map((c) => (
            <Col key={c.id}>
              <Link to={`/products?category=${c.id}`} className="category-tile">
                <img src={c.imageUrl} alt="" loading="lazy" />
                <span>{c.name}</span>
              </Link>
            </Col>
          ))}
        </Row>
      </Section>

      {loading && !products.length ? (
        <Loading />
      ) : (
        <>
          <Section title="TRÁI CÂY BÁN CHẠY" link="/products?sort=sales">
            <ProductGrid products={topProducts} onAddToCart={addToCart} />
          </Section>

          <Section title="GIAN HÀNG NỔI BẬT" link="/shops">
            <Row xs={1} sm={2} lg={4} className="g-3">
              {shops.slice(0, 4).map((shop) => (
                <Col key={shop.id}>
                  <ShopCard shop={shop} productCount={products.filter((p) => p.shopId === shop.id).length} />
                </Col>
              ))}
            </Row>
          </Section>

          <Section title="GỢI Ý HÔM NAY" link="/products?sort=newest" linkText="Xem tất cả sản phẩm">
            <ProductGrid products={newest} onAddToCart={addToCart} />
          </Section>
        </>
      )}
    </>
  );
}

export default HomePage;
