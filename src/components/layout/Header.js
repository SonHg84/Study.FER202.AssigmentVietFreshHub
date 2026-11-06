import { useRef } from "react";
import { Badge, Button, Container, Form, InputGroup, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext";
import useFetch from "../../hooks/useFetch";
import { selectCartCount } from "../../store/cartSlice";
import { ROLE_HOME, ROLE_LABELS } from "../../utils/constants";

function Header() {
  const { user, logout } = useAuth();
  const cartCount = useSelector(selectCartCount);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchRef = useRef(null); // useRef: tham chiếu trực tiếp tới ô tìm kiếm (uncontrolled input)

  // Danh mục cho menu thả xuống — lấy bằng window.fetch qua custom hook.
  const { data: categories } = useFetch("/categories", []);
  // Số thông báo chưa đọc; path đổi theo trang để tự làm mới khi điều hướng.
  const { data: unread } = useFetch(
    user ? `/notifications?userId=${user.id}&read=false&_=${encodeURIComponent(location.pathname)}` : null,
    []
  );

  const handleSearch = (event) => {
    event.preventDefault();
    const q = searchRef.current.value.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-header sticky-top">
      <div className="topbar d-none d-md-block">
        <Container className="d-flex justify-content-between">
          <span>Chợ trái cây tươi đa gian hàng – giao trong ngày tại Hà Nội &amp; TP Hồ Chí Minh</span>
          <span>Hotline: 1900 6868</span>
        </Container>
      </div>
      <Navbar expand="lg" className="main-nav">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand">
            <span className="brand-mark">🍃</span> VietFresh <span className="brand-accent">Hub</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Form className="header-search mx-lg-4 my-2 my-lg-0" onSubmit={handleSearch} role="search">
              <InputGroup>
                <Form.Control
                  key={location.search}
                  ref={searchRef}
                  defaultValue={searchParams.get("q") || ""}
                  placeholder="Tìm xoài, bưởi, táo..."
                  aria-label="Tìm sản phẩm"
                />
                <Button type="submit" variant="success">
                  Tìm
                </Button>
              </InputGroup>
            </Form>
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/" end>
                Trang chủ
              </Nav.Link>
              <NavDropdown title="Sản phẩm" id="category-dropdown">
                <NavDropdown.Item as={Link} to="/products">
                  Tất cả sản phẩm
                </NavDropdown.Item>
                <NavDropdown.Divider />
                {categories.map((c) => (
                  <NavDropdown.Item key={c.id} as={Link} to={`/products?category=${c.id}`}>
                    {c.name}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
              <Nav.Link as={NavLink} to="/shops">
                Cửa hàng
              </Nav.Link>
            </Nav>
            <Nav className="align-items-lg-center gap-lg-1">
              {(!user || user.role === "CUSTOMER") && (
                <Nav.Link as={NavLink} to="/cart" className="cart-link">
                  🛒 Giỏ hàng{" "}
                  <Badge bg="warning" text="dark" pill>
                    {cartCount}
                  </Badge>
                </Nav.Link>
              )}
              {user ? (
                <>
                  <Nav.Link as={NavLink} to="/notifications">
                    🔔{" "}
                    {unread.length > 0 && (
                      <Badge bg="danger" pill>
                        {unread.length}
                      </Badge>
                    )}
                  </Nav.Link>
                  <NavDropdown align="end" title={user.fullName} id="account-dropdown">
                    <NavDropdown.Header>{ROLE_LABELS[user.role]}</NavDropdown.Header>
                    {user.role === "CUSTOMER" ? (
                      <>
                        <NavDropdown.Item as={Link} to="/account/profile">
                          Thông tin tài khoản
                        </NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/account/addresses">
                          Địa chỉ nhận hàng
                        </NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/account/orders">
                          Đơn hàng của tôi
                        </NavDropdown.Item>
                      </>
                    ) : (
                      <NavDropdown.Item as={Link} to={ROLE_HOME[user.role]}>
                        Vào khu làm việc
                      </NavDropdown.Item>
                    )}
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <Nav.Link as={NavLink} to="/login">
                    Đăng nhập
                  </Nav.Link>
                  <Button as={Link} to="/register" variant="outline-success" size="sm">
                    Đăng ký
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
