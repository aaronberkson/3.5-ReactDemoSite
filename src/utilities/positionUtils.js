/**
 * Given an array of items and grid dims, returns a map
 * from each item’s unique ID (svgPath) → [x,y,z] center position.
 */
export function computePositions(items, dims) {
  const { cellW, cellH, cols, gridH } = dims;
  return items.reduce((acc, item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellW + cellW / 2;
    const y = gridH - (row * cellH + cellH / 2);
    acc[item.svgPath] = [x, y, 0];
    return acc;
  }, {});
}
