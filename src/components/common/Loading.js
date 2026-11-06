import PropTypes from "prop-types";
import { FadeLoader } from "react-spinners";

// Fallback dùng cho <Suspense> và khi đang tải dữ liệu.
// Giá trị mặc định của props cho function component: dùng default parameter (ES6).
function Loading({ text = "Đang tải...", fullPage = false }) {
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center gap-2 ${fullPage ? "vh-75" : "py-5"}`}>
      <FadeLoader color="#30634e" />
      <span className="text-muted small">{text}</span>
    </div>
  );
}

Loading.propTypes = {
  text: PropTypes.string,
  fullPage: PropTypes.bool,
};

export default Loading;
