import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../api/axiosClient";

/**
 * Custom hook lấy dữ liệu bằng window.fetch.
 * - Gọi lại khi `path` đổi (mảng phụ thuộc của useEffect).
 * - Huỷ request đang chờ khi component bị gỡ (cleanup + AbortController).
 * - reload() để tải lại thủ công.
 */
export default function useFetch(path, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!path) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`${API_URL}${path}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Máy chủ trả lỗi ${response.status}`);
        return response.json();
      })
      .then((json) => setData(json))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message === "Failed to fetch" ? "Không kết nối được máy chủ dữ liệu. Hãy chạy: npm run server" : err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [path, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data, setData, loading, error, reload };
}
