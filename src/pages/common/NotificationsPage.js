import { useMemo, useState } from "react";
import { Alert, Badge, Button, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import { notificationApi } from "../../api/services";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatDateTime } from "../../utils/format";

// Trang thông báo dùng chung cho mọi vai trò (route nằm trong MemberArea).
function NotificationsPage() {
  useDocumentTitle("Thông báo");
  const { user } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const { data, setData, loading, error } = useFetch(`/notifications?userId=${user.id}`, []);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [busy, setBusy] = useState(false);

  // Mới nhất lên đầu.
  const items = useMemo(() => [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [data]);
  const unreadCount = items.filter((n) => !n.read).length;
  const visible = onlyUnread ? items.filter((n) => !n.read) : items;

  const markRead = async (notification) => {
    if (notification.read) return;
    await notificationApi.patch(notification.id, { read: true });
    setData((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
  };

  const handleOpen = async (notification) => {
    try {
      await markRead(notification);
    } catch {
      showToast("Không cập nhật được trạng thái thông báo.", "danger");
    }
    if (notification.link) navigate(notification.link);
  };

  const markAllRead = async () => {
    const unread = items.filter((n) => !n.read);
    if (!unread.length) return;
    setBusy(true);
    try {
      await Promise.all(unread.map((n) => notificationApi.patch(n.id, { read: true })));
      setData((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast("Đã đánh dấu tất cả là đã đọc.");
    } catch {
      showToast("Không thể đánh dấu đã đọc. Vui lòng thử lại.", "danger");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Thông báo" subtitle={unreadCount ? `${unreadCount} thông báo chưa đọc` : "Bạn đã đọc hết thông báo"}>
        <Button
          variant={onlyUnread ? "primary" : "outline-primary"}
          size="sm"
          onClick={() => setOnlyUnread((v) => !v)}
          aria-pressed={onlyUnread}
        >
          Chỉ chưa đọc
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={markAllRead} disabled={busy || unreadCount === 0}>
          Đánh dấu đã đọc tất cả
        </Button>
      </PageHeader>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Loading />
      ) : visible.length === 0 ? (
        <EmptyState title={onlyUnread ? "Không có thông báo chưa đọc." : "Chưa có thông báo nào."} />
      ) : (
        <ListGroup>
          {visible.map((n) => (
            <ListGroup.Item
              key={n.id}
              action
              onClick={() => handleOpen(n)}
              className={n.read ? "" : "bg-light fw-semibold"}
            >
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  {!n.read && (
                    <Badge bg="danger" className="me-2">
                      Mới
                    </Badge>
                  )}
                  {n.title}
                  {n.content && <div className="small text-muted fw-normal mt-1">{n.content}</div>}
                </div>
                <small className="text-muted text-nowrap fw-normal">{formatDateTime(n.createdAt)}</small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </>
  );
}

export default NotificationsPage;
