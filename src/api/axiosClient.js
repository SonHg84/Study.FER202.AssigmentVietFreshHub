import axios from "axios";

// Địa chỉ json-server (npm run server). Đổi bằng biến môi trường REACT_APP_API_URL nếu cần.
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9999";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  // json-server cần ?_expand=shop&_expand=category (không phải _expand[]=...)
  paramsSerializer: { indexes: null },
});

// Chuẩn hoá thông báo lỗi để giao diện hiển thị.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response
      ? `Máy chủ trả lỗi ${error.response.status}`
      : "Không kết nối được máy chủ dữ liệu. Hãy chạy: npm run server";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
