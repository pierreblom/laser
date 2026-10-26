// Browser SVGGeometryElement supplies path length and curve sampling. The
// caller validates active/external SVG content before invoking this function.
export function extractSvgContours(svg, width, height) {
  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-100000px;top:0;opacity:0;pointer-events:none';
  const attached = document.importNode(svg, true);
  attached.setAttribute('width', String(width));
  attached.setAttribute('height', String(height));
  holder.append(attached);
  document.body.append(holder);
  const contours = [];
  let skipped = 0, total = 0;
  try {
    skipped += attached.querySelectorAll('text,image,use,foreignObject').length;
    for (const shape of attached.querySelectorAll('path,line,polyline,polygon,rect,circle,ellipse')) {
      if (getComputedStyle(shape).display === 'none' || getComputedStyle(shape).visibility === 'hidden') continue;
      // Multiple subpaths in one d attribute cannot be joined without
      // accidentally drawing a powered line between separate components.
      if (shape.localName === 'path' && (shape.getAttribute('d')?.match(/[Mm]/g)?.length || 0) > 1) {
        skipped++; continue;
      }
      let length;
      try { length = shape.getTotalLength(); } catch { skipped++; continue; }
      const matrix = shape.getCTM();
      if (!matrix || !Number.isFinite(length) || length < 0.01) { skipped++; continue; }
      const steps = Math.min(2000, Math.max(2, Math.ceil(length / 2)));
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const point = shape.getPointAtLength(length * i / steps);
        const x = (point.x * matrix.a + point.y * matrix.c + matrix.e) / width;
        const y = (point.x * matrix.b + point.y * matrix.d + matrix.f) / height;
        if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Invalid SVG contour coordinates.');
        points.push([x, y]);
      }
      total += points.length;
      if (total > 12000) throw new Error('SVG has too many contour nodes. Simplify the paths first.');
      contours.push(points);
    }
  } finally { holder.remove(); }
  return { contours, skipped };
}

const CUT_LAYER_IDS = ['engrave', 'score', 'cut-inner', 'cut-outer', 'labels-do-not-cut'];
const DRAWABLE_SELECTOR = 'path,line,polyline,polygon,rect,circle,ellipse';

export function hasLayeredCutGroups(svg) {
  if (!svg?.querySelector) return false;
  return ['score', 'cut-inner', 'cut-outer'].some((id) => svg.querySelector(`[id="${id}"]`));
}

function sampleShape(shape, width, height, maxSegmentMm = 0.4) {
  if (shape.localName === 'path' && (shape.getAttribute('d')?.match(/[Mm]/g)?.length || 0) > 1) {
    throw new Error('A score or cut path contains multiple disconnected subpaths. Split it into separate paths before cutting.');
  }
  let length;
  try { length = shape.getTotalLength(); } catch { return null; }
  const matrix = shape.getCTM();
  if (!matrix || !Number.isFinite(length) || length < 0.01) return null;
  const steps = Math.max(1, Math.ceil(length / maxSegmentMm));
  if (steps > 50000) throw new Error('A single SVG path is too complex to cut safely.');
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const point = shape.getPointAtLength(length * i / steps);
    const x = (point.x * matrix.a + point.y * matrix.c + matrix.e) / width;
    const y = (point.x * matrix.b + point.y * matrix.d + matrix.f) / height;
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Invalid SVG cut coordinates.');
    const previous = points.at(-1);
    if (!previous || Math.hypot(x - previous[0], y - previous[1]) * Math.max(width, height) > 0.001) {
      points.push([x, y]);
    }
  }
  return points.length >= 2 ? points : null;
}

export function extractLayeredCutSvg(svg, width, height) {
  if (!hasLayeredCutGroups(svg)) return null;
  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-100000px;top:0;opacity:0;pointer-events:none';
  const attached = document.importNode(svg, true);
  attached.setAttribute('width', String(width));
  attached.setAttribute('height', String(height));
  holder.append(attached);
  document.body.append(holder);
  const result = { score: [], cutInner: [], cutOuter: [], counts: {}, skipped: 0 };
  let total = 0;
  try {
    const mapping = [['score', 'score'], ['cut-inner', 'cutInner'], ['cut-outer', 'cutOuter']];
    result.counts.engrave = attached.querySelectorAll('#engrave path, #engrave line, #engrave polyline, #engrave polygon, #engrave rect, #engrave circle, #engrave ellipse').length;
    result.counts.labels = attached.querySelectorAll('#labels-do-not-cut path, #labels-do-not-cut text').length;
    for (const [id, operation] of mapping) {
      const group = attached.querySelector(`[id="${id}"]`);
      if (!group) { result.counts[operation] = 0; continue; }
      if (group.querySelector('text,image,use,foreignObject')) {
        throw new Error(`The ${id} layer contains unsupported text, image, or referenced content. Convert it to plain vector paths first.`);
      }
      for (const shape of group.querySelectorAll(DRAWABLE_SELECTOR)) {
        if (getComputedStyle(shape).display === 'none' || getComputedStyle(shape).visibility === 'hidden') continue;
        const points = sampleShape(shape, width, height);
        if (!points) throw new Error(`The ${id} layer contains a vector path that could not be extracted.`);
        total += points.length;
        if (total > 250000) throw new Error('SVG has too many cut nodes. Split or simplify the sheet first.');
        result[operation].push(points);
      }
      result.counts[operation] = result[operation].length;
    }
  } finally { holder.remove(); }
  if (!result.cutInner.length && !result.cutOuter.length && !result.score.length) {
    throw new Error('Layered SVG groups were found, but they contain no supported vector paths.');
  }
  return result;
}

export function svgLayerMarkup(svg, layerId) {
  if (!CUT_LAYER_IDS.includes(layerId)) throw new Error('Unknown SVG operation layer.');
  const clone = svg.cloneNode(true);
  for (const shape of clone.querySelectorAll(`${DRAWABLE_SELECTOR},text,image,use`)) {
    if (!shape.closest(`[id="${layerId}"]`)) shape.remove();
  }
  return new XMLSerializer().serializeToString(clone);
}
