import { Suspense } from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Loading from "../common/Loading";

// Layout khu mua sắm: Header + nội dung route con (<Outlet/>) + Footer.
// Suspense đặt quanh Outlet để chỉ phần nội dung hiện spinner khi trang lazy đang tải.
function StoreLayout() {
  return (
    <div className="store-shell d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <Container>
          <Suspense fallback={<Loading text="Đang tải trang..." />}>
            <Outlet />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default StoreLayout;
