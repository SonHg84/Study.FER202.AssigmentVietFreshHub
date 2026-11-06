import { useMemo, useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Paginator from "../../components/common/Paginator";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmModal from "../../components/common/ConfirmModal";
import { userApi } from "../../api/services";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ACCOUNT_STATUS, PAGE_SIZE, ROLE_LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/format";

function AdminAccounts() {
  useDocumentTitle("Quản lý tài khoản");
  const { user: me } = useAuth();
  const showToast = useToast();
  const { data: users, setData, loading, error } = useFetch("/users", []);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return users.filter(
      (u) => (!role || u.role === role) && (!q || [u.fullName, u.email, u.username].some((s) => s.toLowerCase().includes(q)))
    );
  }, [users, keyword, role]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleConfirm = async () => {
    const account = target;
    setTarget(null);
    const status = account.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    try {
      await userApi.patch(account.id, { status });
      setData((prev) => prev.map((u) => (u.id === account.id ? { ...u, status } : u)));
      showToast(status === "LOCKED" ? `Đã khoá tài khoản ${account.username}.` : `Đã mở khoá ${account.username}.`);
    } catch {
      showToast("Không cập nhật được tài khoản.", "danger");
    }
  };

  return (
    <>
      <PageHeader title="Tài khoản" subtitle={`${filtered.length}/${users.length} tài khoản`}>
        <Form.Control
          placeholder="Tìm tên, email, tên đăng nhập"
          aria-label="Tìm tài khoản"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
        <Form.Select
          aria-label="Lọc vai trò"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Mọi vai trò</option>
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Form.Select>
      </PageHeader>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState title="Không có tài khoản phù hợp." />
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="fw-semibold">{u.fullName}</div>
                    <small className="text-muted">@{u.username}</small>
                  </td>
                  <td>{u.email}</td>
                  <td>{ROLE_LABELS[u.role]}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <StatusBadge status={u.status} map={ACCOUNT_STATUS} />
                  </td>
                  <td className="text-end">
                    {u.id === me.id ? (
                      <small className="text-muted">Tài khoản của bạn</small>
                    ) : (
                      <Button size="sm" variant={u.status === "ACTIVE" ? "outline-danger" : "outline-success"} onClick={() => setTarget(u)}>
                        {u.status === "ACTIVE" ? "Khoá" : "Mở khoá"}
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
        show={Boolean(target)}
        title={target?.status === "ACTIVE" ? "Khoá tài khoản" : "Mở khoá tài khoản"}
        message={
          target?.status === "ACTIVE"
            ? `Tài khoản "${target?.fullName}" sẽ không đăng nhập được nữa. Tiếp tục?`
            : `Cho phép "${target?.fullName}" đăng nhập trở lại?`
        }
        confirmText={target?.status === "ACTIVE" ? "Khoá" : "Mở khoá"}
        variant={target?.status === "ACTIVE" ? "danger" : "success"}
        onConfirm={handleConfirm}
        onHide={() => setTarget(null)}
      />
    </>
  );
}

export default AdminAccounts;
