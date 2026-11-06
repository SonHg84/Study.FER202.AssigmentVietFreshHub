import { useMemo, useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Paginator from "../../components/common/Paginator";
import StatusBadge from "../../components/common/StatusBadge";
import { productApi } from "../../api/services";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useMyShop from "../../hooks/useMyShop";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { invalidateCatalog } from "../../store/catalogSlice";
import { APPROVAL_STATUS, PAGE_SIZE, PRODUCT_STATUS } from "../../utils/constants";
import { formatCurrency } from "../../utils/format";

function SellerProducts() {
  useDocumentTitle("Sản phẩm của tôi");
  const dispatch = useDispatch();
  const showToast = useToast();
  const { shop, loading: loadingShop } = useMyShop();
  const { data: products, setData, loading, error } = useFetch(shop ? `/products?shopId=${shop.id}&_embed=variants&_sort=createdAt&_order=desc` : null, []);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(keyword.trim().toLowerCase())), [products, keyword]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleStatus = async (product) => {
    const status = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await productApi.patch(product.id, { status });
      setData((prev) => prev.map((p) => (p.id === product.id ? { ...p, status } : p)));
      dispatch(invalidateCatalog());
      showToast(status === "ACTIVE" ? "Đã hiển thị sản phẩm." : "Đã ẩn sản phẩm.");
    } catch {
      showToast("Không cập nhật được sản phẩm.", "danger");
    }
  };

  const priceRange = (variants) => {
    const prices = variants.filter((v) => v.status === "ACTIVE").map((v) => v.price);
    if (!prices.length) return "—";
    const [lo, hi] = [Math.min(...prices), Math.max(...prices)];
    return lo === hi ? formatCurrency(lo) : `${formatCurrency(lo)} – ${formatCurrency(hi)}`;
  };

  return (
    <>
      <PageHeader title="Sản phẩm" subtitle={`${products.length} sản phẩm`}>
        <Form.Control
          placeholder="Tìm tên sản phẩm"
          aria-label="Tìm sản phẩm"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
        <Button as={Link} to="/seller/products/new">
          + Thêm sản phẩm
        </Button>
      </PageHeader>
      {error && <Alert variant="danger">{error}</Alert>}
      {loadingShop || loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState title="Chưa có sản phẩm nào." />
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th className="text-center">Tồn kho</th>
                <th>Duyệt</th>
                <th>Hiển thị</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                      <img src={p.image} alt="" width={48} height={48} className="rounded object-fit-cover" />
                      <div>
                        <div className="fw-semibold">{p.name}</div>
                        <small className="text-muted">{p.variants.length} quy cách · đã bán {p.sold || 0}</small>
                      </div>
                    </div>
                  </td>
                  <td>{priceRange(p.variants)}</td>
                  <td className="text-center">{p.variants.reduce((sum, v) => sum + (v.status === "ACTIVE" ? v.stock : 0), 0)}</td>
                  <td>
                    <StatusBadge status={p.approval} map={APPROVAL_STATUS} />
                    {p.approval === "REJECTED" && p.rejectNote && <div className="small text-danger">{p.rejectNote}</div>}
                  </td>
                  <td>
                    <StatusBadge status={p.status} map={PRODUCT_STATUS} />
                  </td>
                  <td className="text-end text-nowrap">
                    <Button as={Link} to={`/seller/products/${p.id}/edit`} size="sm" variant="outline-primary" className="me-1">
                      Sửa
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => toggleStatus(p)}>
                      {p.status === "ACTIVE" ? "Ẩn" : "Hiện"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginator page={Math.min(page, totalPages)} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}

export default SellerProducts;
