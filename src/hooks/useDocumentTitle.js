import { useEffect } from "react";

// Đặt tiêu đề tab trình duyệt theo trang đang xem.
export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | VietFresh Hub` : "VietFresh Hub";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
