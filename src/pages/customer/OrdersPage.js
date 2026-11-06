import { useMemo, useState } from "react";
import { Alert, Button, Nav, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Paginator from "../../components/common/Paginator";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ORDER_STATUS, PAGE_SIZE } from "../../utils/constants";
import { formatCurrency, formatDateTime } from "../../utils/format";

const TABS = [{ key: "ALL", label: "Tất cả" }, ...Object.entries(ORDER_STATUS).map(([key, v]) => ({ key, label: v.label }))];

function OrdersPage() {
  useDocumentTitle("Đơn hàng của tôi");
  const { user } = useAuth();
  const { data: orders, loading, error } = useFetch(`/orders?customerId=${user.id}&_sort=createdAt&_order=desc`, []);
  const [tab, setTab] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => (tab === "ALL" ? orders : orders.filter((o) => o.status === tab)), [orders, tab]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeTab = (key) => {
    setTab(key);
    setPage(1);
  };

  return (
    <>
      <PageHeader title="Đơn hàng của tôi" subtitle={`${orders.length} đơn hàng`} />
      <Nav variant="pills" className="mb-3 flex-wrap gap-1" activeKey={tab} onSelect={changeTab}>
        {TABS.map((t) => (
          <Nav.Item key={t.key}>
            <Nav.Link eventKey={t.key}>{t.label}</Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Chưa có đơn hàng nào."
          action={
            <Button as={Link} to="/products">
              Mua sắm ngay
            </Button>
          }
        />
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Sản phẩm</th>
                <th className="text-end">Tổng tiền</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order.id}>
                  <td className="fw-semibold">{order.code}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>
                    {order.items[0].productName}
                    {order.items.length > 1 && <span className="text-muted"> +{order.items.length - 1} sản phẩm</span>}
                  </td>
                  <td className="text-end">{formatCurrency(order.total)}</td>
                  <td>
                    <StatusBadge status={order.status} map={ORDER_STATUS} />
                  </td>
                  <td className="text-end">
                    <Button as={Link} to={`/account/orders/${order.id}`} size="sm" variant="outline-primary">
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginator page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}

export default OrdersPage;
