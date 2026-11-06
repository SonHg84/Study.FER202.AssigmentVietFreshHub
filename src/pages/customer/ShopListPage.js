import { useEffect, useMemo, useState } from "react";
import { Alert, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ShopCard from "../../components/product/ShopCard";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { fetchCatalog } from "../../store/catalogSlice";

function ShopListPage() {
  useDocumentTitle("Cửa hàng");
  const dispatch = useDispatch();
  const products = useSelector((state) => state.catalog.products);
  const { data: shops, loading, error } = useFetch("/shops?status=ACTIVE", []);
  const [keyword, setKeyword] = useState("");
  const [province, setProvince] = useState("");

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  const provinces = useMemo(() => [...new Set(shops.map((s) => s.province))], [shops]);
  const visible = shops.filter(
    (s) => s.name.toLowerCase().includes(keyword.toLowerCase()) && (!province || s.province === province)
  );

  return (
    <>
      <PageHeader title="Gian hàng trên VietFresh Hub" subtitle={`${visible.length} cửa hàng đang mở`}>
        <Form.Control placeholder="Tìm tên cửa hàng" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <Form.Select value={province} onChange={(e) => setProvince(e.target.value)} aria-label="Tỉnh/thành">
          <option value="">Mọi tỉnh/thành</option>
          {provinces.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </Form.Select>
      </PageHeader>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Loading />
      ) : visible.length === 0 ? (
        <EmptyState title="Không tìm thấy cửa hàng phù hợp." />
      ) : (
        <Row xs={1} sm={2} lg={3} className="g-3">
          {visible.map((shop) => (
            <Col key={shop.id}>
              <ShopCard shop={shop} productCount={products.filter((p) => p.shopId === shop.id).length} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}

export default ShopListPage;
