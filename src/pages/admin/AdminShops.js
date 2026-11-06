import { useState } from "react";
import { Alert, Button, Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmModal from "../../components/common/ConfirmModal";
import { notify, shopApi } from "../../api/services";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { invalidateCatalog } from "../../store/catalogSlice";
import { SHOP_STATUS } from "../../utils/constants";
import { formatDate } from "../../utils/format";

function AdminShops() {
  useDocumentTitle("Quản lý cửa hàng");
  const dispatch = useDispatch();
  const showToast = useToast();
  const { data: shops, setData, loading, error } = useFetch("/shops", []);
  // Cửa hàng lưu ownerId (không phải userId) nên json-server _expand không dùng được: tải chủ shop riêng.
  const { data: owners } = useFetch("/users?role=SELLER", []);
  const [target, setTarget] = useState(null);

  const handleConfirm = async (reason) => {
    const shop = target;
    setTarget(null);
    const suspend = shop.status === "ACTIVE";
    const status = suspend ? "SUSPENDED" : "ACTIVE";
    try {
      await shopApi.patch(shop.id, { status });
      setData((prev) => prev.map((s) => (s.id === shop.id ? { ...s, status } : s)));
      dispatch(invalidateCatalog());
      await notify(
        shop.ownerId,
        suspend ? "Cửa hàng của bạn đã bị tạm khoá" : "Cửa hàng của bạn đã được mở lại",
        suspend ? `Lý do: ${reason}` : "Sản phẩm của bạn hiển thị trở lại với khách hàng.",
        "/seller"
      );
      showToast(suspend ? `Đã tạm khoá ${shop.name}.` : `Đã mở lại ${shop.name}.`);
    } catch {
      showToast("Không cập nhật được cửa hàng.", "danger");
    }
  };

  return (
    <>
      <PageHeader title="Cửa hàng" subtitle={`${shops.length} cửa hàng`} />
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Loading />
      ) : shops.length === 0 ? (
        <EmptyState title="Chưa có cửa hàng nào." />
      ) : (
        <Table responsive hover className="align-middle bg-white">
          <thead>
            <tr>
              <th>Cửa hàng</th>
              <th>Chủ shop</th>
              <th>Tỉnh/thành</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link to={`/shops/${s.id}`} className="fw-semibold text-decoration-none">
                    {s.name}
                  </Link>
                  <div className="small text-muted">{s.phone}</div>
                </td>
                <td>{owners.find((u) => u.id === s.ownerId)?.fullName || `#${s.ownerId}`}</td>
                <td>{s.province}</td>
                <td>{formatDate(s.createdAt)}</td>
                <td>
                  <StatusBadge status={s.status} map={SHOP_STATUS} />
                </td>
                <td className="text-end">
                  <Button size="sm" variant={s.status === "ACTIVE" ? "outline-danger" : "outline-success"} onClick={() => setTarget(s)}>
                    {s.status === "ACTIVE" ? "Tạm khoá" : "Mở lại"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmModal
        show={Boolean(target)}
        title={target?.status === "ACTIVE" ? "Tạm khoá cửa hàng" : "Mở lại cửa hàng"}
        message={
          target?.status === "ACTIVE"
            ? `Sản phẩm của "${target?.name}" sẽ ẩn khỏi cửa hàng và không thể đặt mua.`
            : `Cho phép "${target?.name}" bán hàng trở lại?`
        }
        confirmText={target?.status === "ACTIVE" ? "Tạm khoá" : "Mở lại"}
        variant={target?.status === "ACTIVE" ? "danger" : "success"}
        requireReason={target?.status === "ACTIVE"}
        reasonLabel="Lý do (gửi cho chủ shop)"
        onConfirm={handleConfirm}
        onHide={() => setTarget(null)}
      />
    </>
  );
}

export default AdminShops;
