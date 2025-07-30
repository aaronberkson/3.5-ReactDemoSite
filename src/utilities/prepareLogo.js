// src/utilities/prepareLogo.js
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { ExtrudeGeometry, ShapeGeometry } from "three";

// ───────────── DEBUG ─────────────
const DEBUG_CONSOLE = true;
const log = (...args) => { if (DEBUG_CONSOLE) console.log("[IO][logoBuilder]", ...args); };

export const logoCache = new Map();

export async function prepareLogo(url, depth = 50) {
  if (logoCache.has(url)) {
    log("cache hit", url);
    return logoCache.get(url);
  }

  log("fetching SVG text from", url);
  const raw = await fetch(url).then((r) => r.text());
  log("fetched SVG length", raw.length);

  const clean = raw.replace(/url\([^)]*\)/g, "");
  log("cleaned SVG length", clean.length);

  log("parsing SVG text");
  const loader = new SVGLoader();
  const { paths } = loader.parse(clean);
  log("parsed SVG → number of paths:", paths.length);

  // build extrudes/flats
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const extrudes = [], flats = [];

  for (const path of paths) {
    path.toShapes(false).forEach((shape) => {
      shape.getPoints().forEach(({ x, y }) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });

      extrudes.push(
        new ExtrudeGeometry(shape, {
          depth,
          bevelEnabled:   true,
          bevelThickness: depth * 0.08,
          bevelSize:      depth * 0.03,
          bevelSegments:  6,
        })
      );
      flats.push(new ShapeGeometry(shape));
    });
  }

  const result = {
    extrudes,
    flats,
    bounds: { minX, minY, maxX, maxY }
  };

  log("built geometries", {
    extrudes: extrudes.length,
    flats:    flats.length,
    bounds:   result.bounds
  });

  logoCache.set(url, result);
  log("cached result for", url);

  return result;
}
