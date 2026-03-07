import { useRef } from "react";

/**
 * Returns touch event handlers that call `onClose` when the user
 * swipes down more than `threshold` pixels on the sheet handle.
 */
export function useSwipeToClose(onClose, threshold = 72) {
  const startY = useRef(null);

  return {
    onTouchStart(e) {
      startY.current = e.touches[0].clientY;
    },
    onTouchEnd(e) {
      if (startY.current === null) return;
      const delta = e.changedTouches[0].clientY - startY.current;
      if (delta > threshold) onClose();
      startY.current = null;
    },
  };
}
