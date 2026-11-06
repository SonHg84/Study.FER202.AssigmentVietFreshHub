import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Nav, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Paginator from "../../components/common/Paginator";
import StatusBadge from "../../components/common/StatusBadge";
import { useToast } from "../../contexts/ToastContext";
import useMyShop from "../../hooks/useMyShop";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { fetchOrders, updateOrderStatus } from "../../store/ordersSlice";
import { ORDER_STATUS, PAGE_SIZE } from "../../utils/constants";
import { SELLER_NEXT } from "../../utils/orderActions";
import { formatCurrency, formatDateTime } from "../../utils/format";

function SellerOrders() {
  useDocumentTitle("Đơn hàng");
  const { status } = useParams(); // có khi vào /seller/orders/status/:status
  const dispatch = useDispatch();
  const showToast = useToast();
  const { shop, loading: loadingShop } = useMyShop();
  const { items, loading, error, updatingId } = useSelector((state) => state.orders);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (shop) dispatch(fetchOrders({ shopId: shop.id }));
  }, [dispatch, shop]);

  // Redux có thể còn đơn của khu khác từ lần tải trước: luôn lọc lại theo cửa hàng.
  const mine = useMemo(() => (shop ? items.filter((o) => o.shopId === shop.id) : []), [items, shop]);
  const validStatus = status && ORDER_STATUS[status] ? status : null;
  const filtered = validStatus ? mine.filter((o) => o.status === validStatus) : mine;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const advance = async (order) => {
    const next = SELLER_NEXT[order.status];
    const ok = await dispatch(updateOrderStatus(order, next.status));
    showToast(ok ? `Đơn ${order.code}: ${ORDER_STATUS[next.status].label.toLowerCase()}.` : "Không cập nhật được đơn hàng.", ok ? "success" : "danger");
  };

  const count = (key) => mine.filter((o) => o.status === key).length;

  return (
    <>
      <PageHeader title="Đơn hàng" subtitle={`${mine.length} đơn của cửa hàng`} />
      <Nav variant="pills" className="mb-3 flex-wrap gap-1">
        <Nav.Item>
          <Nav.Link as={Link} to="/seller/orders" active={!validStatus} onClick={() => setPage(1)}>
            Tất cả ({mine.length})
          </Nav.Link>
        </Nav.Item>
        {Object.entries(ORDER_STATUS).map(([key, info]) => (
          <Nav.Item key={key}>
            <Nav.Link as={Link} to={`/seller/orders/status/${key}`} active={validStatus === key} onClick={() => setPage(1)}>
              {info.label} ({count(key)})
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {error && <Alert variant="danger">{error}</Alert>}
      {loadingShop || loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState title="Không có đơn hàng phù hợp." />
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th className="text-end">Tổng tiền</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const next = SELLER_NEXT[o.status];
                return (
                  <tr key={o.id}>
                    <td className="fw-semibold">{o.code}</td>
                    <td>
                      {o.address.receiverName}
                      <div className="small text-muted">{o.address.phone}</div>
                    </td>
                    <td>{formatDateTime(o.createdAt)}</td>
                    <td className="text-end">{formatCurrency(o.total)}</td>
                    <td>
                      <StatusBadge status={o.status} map={ORDER_STATUS} />
                    </td>
                    <td className="text-end text-nowrap">
                      {next && (
                        <Button size="sm" className="me-1" disabled={updatingId === o.id} onClick={() => advance(o)}>
                          {next.label}
                        </Button>
                      )}
                      <Button as={Link} to={`/seller/orders/${o.id}`} size="sm" variant="outline-primary">
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Paginator page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}

export default SellerOrders;
