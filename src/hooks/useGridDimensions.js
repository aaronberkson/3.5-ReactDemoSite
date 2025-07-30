// src/hooks/useGridDimensions.js
import { useState, useLayoutEffect, useRef } from "react";

export function useGridDimensions(
  visibleCount,
  rowFactor,
  gutter,
  topOffset = 50
) {
  const ref = useRef(null);
  const [dims, setDims] = useState({
    width:     0,
    cols:      3,
    cellW:     0,
    cellH:     0,
    gridH:     0,
    topOffset: topOffset,
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const calc = () => {
      const rect = el.getBoundingClientRect();
      const w    = rect.width;
      if (w <= 0) return;

      // ≤768 → 1col, 769–1024 → 2col, ≥1025 → 3col
      const cols =
        w <= 768   ? 1 :
        w <= 1024  ? 2 :
                     3;

      const cellW = w / cols;
      const cellH = Math.round(cellW * rowFactor + gutter);
      const rows  = Math.ceil(visibleCount / cols);
      const gridH = rows * cellH;

      setDims({ width: w, cols, cellW, cellH, gridH, topOffset });

      // console.log("[useGridDimensions]", {
      //   width: w,
      //   cols,
      //   cellW,
      //   cellH,
      //   gridH,
      //   topOffset,
      // });
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visibleCount, rowFactor, gutter, topOffset]);

  return [ref, dims];
}
