const finite = (value) => Number.isFinite(value);
const round = (value) => Number(value.toFixed(3));

export function validateJig(profile, limits = null) {
  if (!profile || typeof profile.jig_name !== 'string' || !profile.jig_name.trim() ||
      profile.jig_name.length > 80) throw new Error('Give the jig a name of at most 80 characters.');
  const { origin_x: x, origin_y: y, max_width: width, max_height: height } = profile;
  if (![x, y, width, height].every(finite) || x < 0 || y < 0 ||
      width <= 0 || height <= 0 || width > 300 || height > 300) {
    throw new Error('Jig origin and pocket dimensions must be positive millimetre values within the 300 mm bed.');
  }
  if (limits && (x + width > limits.x + 0.001 || y + height > limits.y + 0.001)) {
    throw new Error('The jig pocket extends beyond the controller travel limits.');
  }
  return { ...profile, jig_name: profile.jig_name.trim() };
}

export function measuredBox(a, b) {
  if (!a || !b || ![a.x, a.y, b.x, b.y].every(finite)) throw new Error('Capture both measured corners first.');
  const bounds = { minX: Math.min(a.x, b.x), minY: Math.min(a.y, b.y),
    maxX: Math.max(a.x, b.x), maxY: Math.max(a.y, b.y) };
  if (bounds.maxX - bounds.minX < 0.2 || bounds.maxY - bounds.minY < 0.2) {
    throw new Error('Measured width and height must each be at least 0.2 mm.');
  }
  return { ...bounds, width: round(bounds.maxX - bounds.minX), height: round(bounds.maxY - bounds.minY) };
}

export function workOriginForJig(jig, wco) {
  if (!jig) return { x: 0, y: 0 };
  if (!wco || ![wco.x, wco.y].every(finite)) throw new Error('Read the current work offset after homing before using a jig.');
  return { x: round(jig.origin_x - wco.x), y: round(jig.origin_y - wco.y) };
}

export function measurementToCanvas(bounds, jig, homedWco) {
  if (!bounds) return null;
  const base = jig ? { x: jig.origin_x, y: jig.origin_y } : homedWco;
  if (!base || ![base.x, base.y].every(finite)) throw new Error('Home before placing a measurement on the canvas.');
  return { minX: round(bounds.minX - base.x), minY: round(bounds.minY - base.y),
    maxX: round(bounds.maxX - base.x), maxY: round(bounds.maxY - base.y) };
}

export function outlineToCanvas(points, jig, homedWco) {
  if (!Array.isArray(points) || points.length > 100 ||
      points.some((point) => !point || ![point.x, point.y].every(finite))) {
    throw new Error('Outline points must be valid machine coordinates (100 maximum).');
  }
  const base = jig ? { x: jig.origin_x, y: jig.origin_y } : homedWco;
  if (!base || ![base.x, base.y].every(finite)) throw new Error('Home before placing an outline on the canvas.');
  return points.map((point) => ({ x: round(point.x - base.x), y: round(point.y - base.y) }));
}

export function validateOutlinePoint(point, jig, homedWco, limits) {
  if (!point || ![point.x, point.y].every(finite) || !limits ||
      ![limits.x, limits.y].every(finite)) throw new Error('Machine position or travel limits are unavailable.');
  const base = jig ? { x: jig.origin_x, y: jig.origin_y } : homedWco;
  if (!base || ![base.x, base.y].every(finite)) throw new Error('Home before capturing an outline.');
  const width = jig ? jig.max_width : 300;
  const height = jig ? jig.max_height : 300;
  if (point.x < base.x - 0.001 || point.y < base.y - 0.001 ||
      point.x > Math.min(base.x + width, limits.x) + 0.001 ||
      point.y > Math.min(base.y + height, limits.y) + 0.001) {
    throw new Error('Outline point is outside the active jig pocket or verified bed.');
  }
  return { x: round(point.x), y: round(point.y) };
}

export function transformContour(object, points) {
  if (!Array.isArray(points) || points.length < 2) throw new Error('A contour needs at least two points.');
  const angle = (object.rotation || 0) * Math.PI / 180;
  const c = Math.cos(angle), s = Math.sin(angle);
  const centerX = object.x + object.w / 2, centerY = object.y + object.h / 2;
  return points.map(([u, v]) => {
    if (![u, v].every(finite)) throw new Error('Contour contains an invalid point.');
    const x = (u - 0.5) * object.w * (object.flipX ? -1 : 1);
    const y = (0.5 - v) * object.h * (object.flipY ? -1 : 1);
    return { x: round(centerX + x * c - y * s), y: round(centerY + x * s + y * c) };
  });
}

export function collectContourPaths(objects) {
  const paths = [];
  for (const object of objects) {
    if (object.type === 'image' && (!Array.isArray(object.contours) || !object.contours.length)) {
      throw new Error(`${object.kind || 'An image'} has no contour. Use an SVG with supported geometry or a text object.`);
    }
    if (object.type === 'image' && object.kind !== 'Text' &&
        ((object.crop || []).some((value) => value !== 0) ||
         (object.mask && object.mask !== 'rectangle') ||
         (object.filter && object.filter !== 'original') ||
         (object.brightness && object.brightness !== 100) ||
         (object.contrast && object.contrast !== 100))) {
      throw new Error('An SVG has visual filters, cropping, or a mask. Reset them before exact contour tracing.');
    }
    const source = object.type === 'path'
      ? [object.points.map(([x, y]) => [x / object.sourceW, y / object.sourceH])]
      : object.contours || [];
    for (const points of source) paths.push(transformContour(object, points));
  }
  if (!paths.length) throw new Error('This design has no retained vector contours. Import an SVG or add a freehand drawing.');
  if (paths.reduce((count, path) => count + path.length, 0) > 12000) {
    throw new Error('Contour has too many points. Simplify the SVG before tracing.');
  }
  return paths;
}

export function translateBounds(bounds, offset) {
  if (!bounds || !offset || ![bounds.minX, bounds.minY, bounds.maxX, bounds.maxY, offset.x, offset.y].every(finite)) {
    throw new Error('Frame bounds are unavailable.');
  }
  return { minX: round(bounds.minX + offset.x), minY: round(bounds.minY + offset.y),
    maxX: round(bounds.maxX + offset.x), maxY: round(bounds.maxY + offset.y) };
}

export function assertMachineBounds(bounds, wco, limits, pocket = null) {
  if (!wco || !limits || ![wco.x, wco.y, limits.x, limits.y].every(finite) ||
      limits.x <= 0 || limits.y <= 0) throw new Error('Machine offset or travel limits are unavailable.');
  const machine = translateBounds(bounds, wco);
  if (machine.minX < -0.001 || machine.minY < -0.001 ||
      machine.maxX > limits.x + 0.001 || machine.maxY > limits.y + 0.001) {
    throw new Error('The path exceeds the verified machine travel limits.');
  }
  if (pocket && (machine.minX < pocket.origin_x - 0.001 || machine.minY < pocket.origin_y - 0.001 ||
      machine.maxX > pocket.origin_x + pocket.max_width + 0.001 ||
      machine.maxY > pocket.origin_y + pocket.max_height + 0.001)) {
    throw new Error('The path extends outside the active jig pocket.');
  }
  return machine;
}

export function boundsOfPaths(paths) {
  const points = paths.flat();
  if (!points.length) throw new Error('No contour points were supplied.');
  return { minX: Math.min(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxX: Math.max(...points.map((point) => point.x)),
    maxY: Math.max(...points.map((point) => point.y)) };
}
