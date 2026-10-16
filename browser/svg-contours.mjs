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
