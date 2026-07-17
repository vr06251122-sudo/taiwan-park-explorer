import { useEffect, useState } from "react";

/** 延遲回傳變動中的值,避免每敲一個字就打一次 API */
export function useDebounce<T>(value: T, delayMs = 600): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
