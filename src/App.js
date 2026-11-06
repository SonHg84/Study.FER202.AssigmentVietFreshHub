import { Suspense } from "react";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Loading from "./components/common/Loading";
import AppRoutes from "./routes/AppRoutes";

// Component gốc: bắt lỗi giao diện + Suspense ngoài cùng cho các layout/trang lazy.
function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading text="Đang tải VietFresh Hub..." fullPage />}>
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
