import { useEffect, useState } from "react";

// Trả về giá trị sau khi người dùng ngừng gõ `delay` ms (cleanup huỷ timer cũ).
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
