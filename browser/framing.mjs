import { assertMachineBounds, boundsOfPaths, translateBounds } from './alignment.mjs';

const fmt = (value) => Number(value.toFixed(3)).toString();

export function frameSettings({ sValue, sMax, feed, maxFeed }) {
  const powerCap = Math.min(10, Math.floor(sMax * 0.01));
  if (!Number.isFinite(sMax) || sMax <= 0 || powerCap < 1 ||
      !Number.isInteger(sValue) || sValue < 1 || sValue > powerCap) {
    throw new Error(`Frame PWM must be 1–${Math.max(0, powerCap)} for this controller ($30=${sMax}).`);
  }
  if (!Number.isFinite(maxFeed) || maxFeed <= 0 || !Number.isFinite(feed) ||
      feed < 100 || feed > Math.min(4000, maxFeed)) {
    throw new Error(`Frame speed must be 100–${Math.min(4000, maxFeed)} mm/min for this controller.`);
  }
  return { sValue, feed };
}

export function buildBoxFrame({ bounds, origin, wco, limits, pocket, sValue, sMax, feed, maxFeed }) {
  frameSettings({ sValue, sMax, feed, maxFeed });
  const b = translateBounds(bounds, origin);
  if (b.minX >= b.maxX || b.minY >= b.maxY) throw new Error('Frame bounds must have positive width and height.');
  assertMachineBounds(b, wco, limits, pocket);
  const travelMm = 2 * ((b.maxX - b.minX) + (b.maxY - b.minY));
  if (travelMm / feed > 3) throw new Error('This box would take over three minutes at the selected feed. Increase the frame speed.');
  return ['G21', 'G90', 'G54', 'M5', `G0 X${fmt(b.minX)} Y${fmt(b.minY)}`,
    `M4 S${sValue}`, `G1 X${fmt(b.maxX)} Y${fmt(b.minY)} F${fmt(feed)}`,
    `G1 X${fmt(b.maxX)} Y${fmt(b.maxY)}`, `G1 X${fmt(b.minX)} Y${fmt(b.maxY)}`,
    `G1 X${fmt(b.minX)} Y${fmt(b.minY)}`, 'M5'];
}

export function buildLocateBox({ bounds, origin, wco, limits, pocket, feed, maxFeed }) {
  if (!Number.isFinite(maxFeed) || maxFeed < 100 || !Number.isFinite(feed) ||
      feed < 100 || feed > Math.min(4000, maxFeed)) {
    throw new Error(`Locate speed must be 100–${Math.min(4000, maxFeed)} mm/min for this controller.`);
  }
  const b = translateBounds(bounds, origin);
  if (b.minX >= b.maxX || b.minY >= b.maxY) throw new Error('Locate bounds must have positive width and height.');
  assertMachineBounds(b, wco, limits, pocket);
  const travelMm = 2 * ((b.maxX - b.minX) + (b.maxY - b.minY));
  if (travelMm / feed > 3) throw new Error('This locate path would take over three minutes.');
  // Keep the engraving laser disabled during the approach and every edge.
  return ['M5', 'S0', 'G21', 'G90', 'G54',
    `G1 X${fmt(b.minX)} Y${fmt(b.minY)} F${fmt(feed)}`,
    `G1 X${fmt(b.maxX)} Y${fmt(b.minY)}`,
    `G1 X${fmt(b.maxX)} Y${fmt(b.maxY)}`,
    `G1 X${fmt(b.minX)} Y${fmt(b.maxY)}`,
    `G1 X${fmt(b.minX)} Y${fmt(b.minY)}`, 'M5', 'S0'];
}

export function buildContourFrame({ paths, origin, wco, limits, pocket, sValue, sMax, feed, maxFeed }) {
  frameSettings({ sValue, sMax, feed, maxFeed });
  if (!Array.isArray(paths) || !paths.length || paths.length > 1000) throw new Error('No usable vector contours.');
  const shifted = paths.map((path) => {
    if (!Array.isArray(path) || path.length < 2) throw new Error('A contour needs at least two points.');
    return path.map((point) => ({ x: point.x + origin.x, y: point.y + origin.y }));
  });
  assertMachineBounds(boundsOfPaths(shifted), wco, limits, pocket);
  let travelMm = 0;
  for (const path of shifted) for (let i = 1; i < path.length; i++) {
    travelMm += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
  }
  if (travelMm / feed > 3) throw new Error('This contour would take over three minutes at the selected feed. Simplify it or increase the frame speed.');
  const lines = ['G21', 'G90', 'G54', 'M5'];
  for (const path of shifted) {
    lines.push(`G0 X${fmt(path[0].x)} Y${fmt(path[0].y)}`, `M4 S${sValue}`);
    for (let i = 1; i < path.length; i++) {
      lines.push(`G1 X${fmt(path[i].x)} Y${fmt(path[i].y)}${i === 1 ? ` F${fmt(feed)}` : ''}`);
    }
    lines.push('M5');
  }
  if (lines.length > 15000) throw new Error('Contour is too detailed to stream safely. Simplify the SVG.');
  return lines;
}
