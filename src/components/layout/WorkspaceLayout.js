import { Suspense, useState } from "react";
import PropTypes from "prop-types";
import { Button, Nav, Offcanvas } from "react-bootstrap";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../common/Loading";
import { ROLE_LABELS } from "../../utils/constants";

// Layout khu làm việc (người bán / quản trị / giao hàng): thanh bên + nội dung route con.
function WorkspaceLayout({ title, menu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = (
    <Nav className="flex-column workspace-nav" onSelect={() => setShowMenu(false)}>
      {menu.map((group) => (
        <div key={group.heading} className="mb-3">
          <div className="nav-heading">{group.heading}</div>
          {group.items.map((item) => (
            <Nav.Link key={item.to} as={NavLink} to={item.to} end={item.end} eventKey={item.to}>
              <span className="me-2" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Nav.Link>
          ))}
        </div>
      ))}
    </Nav>
  );

  return (
    <div className="workspace d-flex">
      <aside className="workspace-sidebar d-none d-lg-flex flex-column">
        <Link to="/" className="brand text-decoration-none mb-1">
          🍃 VietFresh Hub
        </Link>
        <small className="text-white-50 mb-4">{title}</small>
        {navigation}
      </aside>
      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} className="workspace-sidebar">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="brand">🍃 {title}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{navigation}</Offcanvas.Body>
      </Offcanvas>
      <div className="flex-grow-1 min-w-0">
        <div className="workspace-topbar d-flex align-items-center justify-content-between">
          <Button variant="outline-success" size="sm" className="d-lg-none" onClick={() => setShowMenu(true)}>
            ☰ Menu
          </Button>
          <span className="d-none d-lg-inline text-muted">{title}</span>
          <div className="d-flex align-items-center gap-3">
            <Link to="/notifications" className="text-decoration-none">
              🔔
            </Link>
            <span className="small">
              <strong>{user.fullName}</strong> · {ROLE_LABELS[user.role]}
            </span>
            <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
        <main className="workspace-content">
          <Suspense fallback={<Loading text="Đang tải trang..." />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

WorkspaceLayout.propTypes = {
  title: PropTypes.string.isRequired,
  menu: PropTypes.arrayOf(
    PropTypes.shape({
      heading: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          to: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          icon: PropTypes.string,
          end: PropTypes.bool,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default WorkspaceLayout;
