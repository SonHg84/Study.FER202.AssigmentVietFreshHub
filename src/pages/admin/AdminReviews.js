import { useMemo, useState } from "react";
import { Alert, Button, Nav, Table } from "react-bootstrap";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Paginator from "../../components/common/Paginator";
import RatingStars from "../../components/common/RatingStars";
import StatusBadge from "../../components/common/StatusBadge";
import { reviewApi } from "../../api/services";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { PAGE_SIZE, REVIEW_STATUS } from "../../utils/constants";
import { formatDateTime } from "../../utils/format";

const TABS = [{ key: "PENDING", label: "Chờ duyệt" }, { key: "APPROVED", label: "Đang hiển thị" }, { key: "HIDDEN", label: "Đã ẩn" }, { key: "ALL", label: "Tất cả" }];

function AdminReviews() {
  useDocumentTitle("Kiểm duyệt đánh giá");
  const showToast = useToast();
  const { data: reviews, setData, loading, error } = useFetch("/reviews?_sort=createdAt&_order=desc", []);
  const { data: users } = useFetch("/users", []);
  const { data: products } = useFetch("/products", []);
  const [tab, setTab] = useState("PENDING");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => (tab === "ALL" ? reviews : reviews.filter((r) => r.status === tab)), [reviews, tab]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setStatus = async (review, status) => {
    try {
      await reviewApi.patch(review.id, { status });
      setData((prev) => prev.map((r) => (r.id === review.id ? { ...r, status } : r)));
      showToast(status === "APPROVED" ? "Đánh giá đã hiển thị." : "Đã ẩn đánh giá.");
    } catch {
      showToast("Không cập nhật được đánh giá.", "danger");
    }
  };

  const count = (key) => (key === "ALL" ? reviews.length : reviews.filter((r) => r.status === key).length);

  return (
    <>
      <PageHeader title="Đánh giá" subtitle="Chỉ đánh giá đã duyệt mới hiển thị trên trang sản phẩm" />
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
        <EmptyState title="Không có đánh giá nào ở mục này." />
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white">
            <thead>
              <tr>
                <th>Người đánh giá</th>
                <th>Sản phẩm</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="fw-semibold">{users.find((u) => u.id === r.userId)?.fullName || `#${r.userId}`}</div>
                    <small className="text-muted">{formatDateTime(r.createdAt)}</small>
                  </td>
                  <td>{products.find((p) => p.id === r.productId)?.name || `#${r.productId}`}</td>
                  <td style={{ maxWidth: 320 }}>
                    <RatingStars value={r.rating} />
                    <div>{r.content}</div>
                  </td>
                  <td>
                    <StatusBadge status={r.status} map={REVIEW_STATUS} />
                  </td>
                  <td className="text-end text-nowrap">
                    {r.status !== "APPROVED" && (
                      <Button size="sm" variant="success" className="me-1" onClick={() => setStatus(r, "APPROVED")}>
                        Duyệt
                      </Button>
                    )}
                    {r.status !== "HIDDEN" && (
                      <Button size="sm" variant="outline-secondary" onClick={() => setStatus(r, "HIDDEN")}>
                        Ẩn
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
    </>
  );
}

export default AdminReviews;
