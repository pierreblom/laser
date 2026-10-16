// Trace the boundary of dark bitmap cells. Coordinates are normalized 0–1,
// with Y increasing downward, like an image. Collinear grid edges are merged.
export function traceBinaryContours(pixels, width, height, maxPoints = 12000) {
  if (!(pixels instanceof Uint8Array) || pixels.length !== width * height ||
      !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error('Invalid text raster for contour tracing.');
  }
  const dark = (x, y) => x >= 0 && x < width && y >= 0 && y < height && pixels[y * width + x] !== 0;
  const edges = new Map();
  const key = (x, y) => `${x},${y}`;
  const edge = (x0, y0, x1, y1) => {
    const start = key(x0, y0);
    if (!edges.has(start)) edges.set(start, []);
    edges.get(start).push([x1, y1]);
  };
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!dark(x, y)) continue;
    if (!dark(x, y - 1)) edge(x, y, x + 1, y);
    if (!dark(x + 1, y)) edge(x + 1, y, x + 1, y + 1);
    if (!dark(x, y + 1)) edge(x + 1, y + 1, x, y + 1);
    if (!dark(x - 1, y)) edge(x, y + 1, x, y);
  }
  const paths = [];
  let pointsTotal = 0;
  while (edges.size) {
    const first = edges.keys().next().value;
    const [sx, sy] = first.split(',').map(Number);
    const path = [[sx, sy]];
    let x = sx, y = sy;
    do {
      const at = key(x, y), choices = edges.get(at);
      if (!choices?.length) throw new Error('Text outline could not be closed.');
      const [nextX, nextY] = choices.pop();
      if (!choices.length) edges.delete(at);
      x = nextX; y = nextY;
      path.push([x, y]);
    } while (x !== sx || y !== sy);
    const simplified = [];
    for (let i = 0; i < path.length - 1; i++) {
      const prev = path[(i - 1 + path.length - 1) % (path.length - 1)];
      const now = path[i], next = path[i + 1];
      if ((now[0] - prev[0]) * (next[1] - now[1]) !==
          (now[1] - prev[1]) * (next[0] - now[0])) simplified.push(now);
    }
    if (simplified.length < 3) continue;
    simplified.push(simplified[0]);
    pointsTotal += simplified.length;
    if (pointsTotal > maxPoints) throw new Error('Text outline is too detailed. Use larger text or simplify the design.');
    paths.push(simplified.map(([px, py]) => [px / width, py / height]));
  }
  return paths;
}
