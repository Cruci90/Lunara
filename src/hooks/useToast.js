import { useState, useCallback, useRef } from "react";

/**
 * Returns `{ toast, showToast }`.
 * `showToast(message, type?)` — type: "success" | "error" | "info" | "warning"
 */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(timerRef.current);
    setToast({ message, type, id: Date.now() });
    timerRef.current = setTimeout(() => setToast(null), 2600);
  }, []);

  return { toast, showToast };
}
