import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Form, Row, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCatalog } from "../../store/catalogSlice";
import ProductGrid from "../../components/product/ProductGrid";
import Paginator from "../../components/common/Paginator";
import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";
import useAddToCart from "../../hooks/useAddToCart";
import useDebounce from "../../hooks/useDebounce";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { minPrice, pickDisplayVariant } from "../../utils/product";
import { PAGE_SIZE } from "../../utils/constants";

const SORTS = {
  newest: "Mới nhất",
  sales: "Bán chạy",
  priceAsc: "Giá tăng dần",
  priceDesc: "Giá giảm dần",
  name: "Tên A → Z",
};

/**
 * Container component: đọc bộ lọc từ query string (?category=&q=&sort=&page=...),
 * lấy dữ liệu từ Redux, lọc/sắp xếp/phân trang rồi chuyển cho ProductGrid hiển thị.
 */
function CatalogPage() {
  useDocumentTitle("Sản phẩm");
  const dispatch = useDispatch();
  const { products, categories, loading, error } = useSelector((state) => state.catalog);
  const [searchParams, setSearchParams] = useSearchParams();
  const addToCart = useAddToCart();

  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;
  const min = searchParams.get("min") || "";
  const max = searchParams.get("max") || "";
  const flagsKey = searchParams.getAll("flag").join(","); // "sale", "instock"
  const flags = useMemo(() => (flagsKey ? flagsKey.split(",") : []), [flagsKey]);

  const [keyword, setKeyword] = useState(q);
  const [priceRange, setPriceRange] = useState({ min, max });
  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  // Cập nhật một/nhiều tham số trên URL; mọi thay đổi bộ lọc đều quay về trang 1.
  const updateParams = useCallback(
    (changes) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => {
          next.delete(key);
          (Array.isArray(value) ? value : [value]).forEach((v) => v !== "" && v != null && next.append(key, v));
        });
        if (!("page" in changes)) next.delete("page");
        return next;
      });
    },
    [setSearchParams]
  );

  // Ô tìm kiếm trong trang: chỉ đẩy lên URL khi người dùng ngừng gõ.
  useEffect(() => {
    if (debouncedKeyword.trim() !== q) updateParams({ q: debouncedKeyword.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  // Header đổi ?q= thì đồng bộ lại ô tìm kiếm.
  useEffect(() => setKeyword(q), [q]);

  const filtered = useMemo(() => {
    const text = q.toLowerCase();
    let list = products.filter((p) => {
      const price = minPrice(p);
      const variant = pickDisplayVariant(p.variants);
      if (category && String(p.categoryId) !== category) return false;
      if (text && !`${p.name} ${p.origin} ${p.shop.name}`.toLowerCase().includes(text)) return false;
      if (min && price < Number(min)) return false;
      if (max && price > Number(max)) return false;
      if (flags.includes("sale") && !(variant?.comparePrice > variant?.price)) return false;
      if (flags.includes("instock") && !p.variants.some((v) => v.stock > 0)) return false;
      return true;
    });
    const sorters = {
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      sales: (a, b) => b.sold - a.sold,
      priceAsc: (a, b) => minPrice(a) - minPrice(b),
      priceDesc: (a, b) => minPrice(b) - minPrice(a),
      name: (a, b) => a.name.localeCompare(b.name, "vi"),
    };
    list = [...list].sort(sorters[sort] || sorters.newest);
    return list;
  }, [products, category, q, min, max, sort, flags]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const categoryName = categories.find((c) => String(c.id) === category)?.name;

  const handlePriceSubmit = (event) => {
    event.preventDefault();
    updateParams({ min: priceRange.min, max: priceRange.max });
  };

  // Higher-order handler: tạo hàm xử lý cho từng ô giá.
  const handlePriceChange = (field) => (event) => setPriceRange((prev) => ({ ...prev, [field]: event.target.value }));

  const handleReset = () => {
    setKeyword("");
    setPriceRange({ min: "", max: "" });
    setSearchParams({});
  };

  const handlePageChange = (p) => {
    updateParams({ page: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <PageHeader
        title={categoryName || "Tất cả sản phẩm"}
        subtitle={loading ? "Đang tải..." : `${filtered.length} sản phẩm${q ? ` cho "${q}"` : ""}`}
      >
        <Form.Select
          aria-label="Sắp xếp"
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          style={{ minWidth: 180 }}
        >
          {Object.entries(SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Form.Select>
      </PageHeader>

      <Row className="g-4">
        <Col lg={3}>
          <div className="panel">
            <Form.Group className="mb-3" controlId="catalog-keyword">
              <Form.Label className="fw-semibold">Tìm trong danh sách</Form.Label>
              <Form.Control value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tên, xuất xứ, shop..." />
            </Form.Group>

            <div className="fw-semibold mb-2">Danh mục</div>
            <Form.Check
              type="radio"
              id="cat-all"
              name="category"
              label="Tất cả"
              checked={!category}
              onChange={() => updateParams({ category: "" })}
            />
            {categories.map((c) => (
              <Form.Check
                key={c.id}
                type="radio"
                id={`cat-${c.id}`}
                name="category"
                label={c.name}
                checked={category === String(c.id)}
                onChange={() => updateParams({ category: c.id })}
              />
            ))}

            <Form onSubmit={handlePriceSubmit} className="mt-3">
              <div className="fw-semibold mb-2">Khoảng giá (đ)</div>
              <div className="d-flex gap-2 mb-2">
                <Form.Control type="number" min={0} placeholder="Từ" value={priceRange.min} onChange={handlePriceChange("min")} />
                <Form.Control type="number" min={0} placeholder="Đến" value={priceRange.max} onChange={handlePriceChange("max")} />
              </div>
              <Button type="submit" size="sm" variant="outline-success" className="w-100">
                Áp dụng
              </Button>
            </Form>

            <div className="fw-semibold mt-3 mb-2">Lọc nhanh</div>
            {/* ToggleButtonGroup dạng controlled: giá trị lấy từ URL, đổi qua onChange */}
            <ToggleButtonGroup type="checkbox" value={flags} onChange={(value) => updateParams({ flag: value })} className="d-flex">
              <ToggleButton id="flag-sale" value="sale" variant="outline-success" size="sm">
                Đang giảm giá
              </ToggleButton>
              <ToggleButton id="flag-instock" value="instock" variant="outline-success" size="sm">
                Còn hàng
              </ToggleButton>
            </ToggleButtonGroup>

            <Button variant="link" size="sm" className="mt-3 px-0" onClick={handleReset}>
              Xoá bộ lọc
            </Button>
          </div>
        </Col>
        <Col lg={9}>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && !products.length ? (
            <Loading />
          ) : (
            <>
              <ProductGrid products={pageItems} onAddToCart={addToCart} />
              <Paginator page={currentPage} totalPages={totalPages} onChange={handlePageChange} />
            </>
          )}
        </Col>
      </Row>
    </>
  );
}

export default CatalogPage;
