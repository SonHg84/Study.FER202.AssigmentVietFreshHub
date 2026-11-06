import { useMemo, useState } from "react";
import { Alert, Button, Nav, Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Paginator from "../../components/common/Paginator";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmModal from "../../components/common/ConfirmModal";
import { notify, productApi } from "../../api/services";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { invalidateCatalog } from "../../store/catalogSlice";
import { APPROVAL_STATUS, PAGE_SIZE } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/format";

const TABS = [{ key: "PENDING", label: "Chờ duyệt" }, { key: "APPROVED", label: "Đã duyệt" }, { key: "REJECTED", label: "Bị từ chối" }, { key: "ALL", label: "Tất cả" }];

function AdminProducts() {
  useDocumentTitle("Duyệt sản phẩm");
  const dispatch = useDispatch();
  const showToast = useToast();
  const { data: products, setData, loading, error } = useFetch("/products?_expand=shop&_embed=variants&_sort=createdAt&_order=desc", []);
  const { data: categories } = useFetch("/categories", []);
  const [tab, setTab] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [rejecting, setRejecting] = useState(null);

  const filtered = useMemo(() => (tab === "ALL" ? products : products.filter((p) => p.approval === tab)), [products, tab]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const review = async (product, approval, rejectNote = "") => {
    try {
      await productApi.patch(product.id, { approval, rejectNote });
      setData((prev) => prev.map((p) => (p.id === product.id ? { ...p, approval, rejectNote } : p)));
      dispatch(invalidateCatalog());
      if (product.shop) {
        await notify(
          product.shop.ownerId,
          approval === "APPROVED" ? `Sản phẩm "${product.name}" đã được duyệt` : `Sản phẩm "${product.name}" bị từ chối`,
          approval === "APPROVED" ? "Sản phẩm đã hiển thị trên cửa hàng." : `Lý do: ${rejectNote}`,
          `/seller/products/${product.id}/edit`
        );
      }
      showToast(approval === "APPROVED" ? `Đã duyệt "${product.name}".` : `Đã từ chối "${product.name}".`);
    } catch {
      showToast("Không cập nhật được sản phẩm.", "danger");
    }
  };

  const handleReject = (reason) => {
    const product = rejecting;
    setRejecting(null);
    review(product, "REJECTED", reason);
  };

  const count = (key) => (key === "ALL" ? products.length : products.filter((p) => p.approval === key).length);

  return (
    <>
      <PageHeader title="Duyệt sản phẩm" subtitle="Sản phẩm phải được duyệt mới hiển thị với khách hàng" />
      <Nav variant="pills" className="mb-3 gap-1" activeKey={tab} onSelect={(k) => { setTab(k); setPage(1); }}>
        {TABS.map((t) => (
          <Nav.Item key={t.key}>
            <Nav.Link eventKey={t.key}>
              {t.label} ({count(t.key)})
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState title="Không có sản phẩm nào ở mục này." />
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Cửa hàng</th>
                <th>Danh mục</th>
                <th>Giá từ</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td style={{ maxWidth: 320 }}>
                    <div className="d-flex gap-2">
                      <img src={p.image} alt="" width={48} height={48} className="rounded object-fit-cover flex-shrink-0" />
                      <div>
                        <div className="fw-semibold">{p.name}</div>
                        <small className="text-muted">{formatDate(p.createdAt)} · {p.variants.length} quy cách</small>
                        <div className="small text-truncate" style={{ maxWidth: 240 }} title={p.description}>
                          {p.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{p.shop ? p.shop.name : "—"}</td>
                  <td>{categories.find((c) => c.id === p.categoryId)?.name || "—"}</td>
                  <td>{p.variants.length ? formatCurrency(Math.min(...p.variants.map((v) => v.price))) : "—"}</td>
                  <td>
                    <StatusBadge status={p.approval} map={APPROVAL_STATUS} />
                    {p.approval === "REJECTED" && p.rejectNote && <div className="small text-danger">{p.rejectNote}</div>}
                  </td>
                  <td className="text-end text-nowrap">
                    {p.approval !== "APPROVED" && (
                      <Button size="sm" variant="success" className="me-1" onClick={() => review(p, "APPROVED")}>
                        Duyệt
                      </Button>
                    )}
                    {p.approval !== "REJECTED" && (
                      <Button size="sm" variant="outline-danger" onClick={() => setRejecting(p)}>
                        Từ chối
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginator page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmModal
        show={Boolean(rejecting)}
        title="Từ chối sản phẩm"
        message={`Từ chối "${rejecting?.name}"? Người bán sẽ nhận được lý do để chỉnh sửa.`}
        confirmText="Từ chối"
        variant="danger"
        requireReason
        reasonLabel="Lý do từ chối"
        onConfirm={handleReject}
        onHide={() => setRejecting(null)}
      />
    </>
  );
}

export default AdminProducts;
