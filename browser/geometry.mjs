export function pointInRotatedRect(point, object) {
  const centerX = object.x + object.w / 2;
  const centerY = object.y + object.h / 2;
  const dx = point.x - centerX;
  const dy = point.y - centerY;
  const angle = (object.rotation || 0) * Math.PI / 180;
  const localX = dx * Math.cos(angle) + dy * Math.sin(angle);
  const localY = -dx * Math.sin(angle) + dy * Math.cos(angle);
  return Math.abs(localX) <= object.w / 2 && Math.abs(localY) <= object.h / 2;
}

const CORNER_SIGNS = {
  topLeft: [-1, 1], topRight: [1, 1], bottomRight: [1, -1], bottomLeft: [-1, -1],
};

export function rotatedCorner(object, corner) {
  const signs = CORNER_SIGNS[corner];
  if (!signs) throw new Error('Unknown resize corner.');
  const [sx, sy] = signs;
  const angle = (object.rotation || 0) * Math.PI / 180;
  const c = Math.cos(angle), s = Math.sin(angle);
  const centerX = object.x + object.w / 2, centerY = object.y + object.h / 2;
  return { x: centerX + sx * object.w / 2 * c - sy * object.h / 2 * s,
    y: centerY + sx * object.w / 2 * s + sy * object.h / 2 * c };
}

export function hitResizeCorner(point, object, radius) {
  if (!object || !Number.isFinite(radius) || radius <= 0) return null;
  return Object.keys(CORNER_SIGNS).find((corner) => {
    const handle = rotatedCorner(object, corner);
    return Math.hypot(point.x - handle.x, point.y - handle.y) <= radius;
  }) || null;
}

export function resizeFromCorner(object, corner, pointer, bed = 300) {
  const signs = CORNER_SIGNS[corner];
  if (!signs || !Number.isFinite(pointer?.x) || !Number.isFinite(pointer?.y) ||
      !Number.isFinite(bed) || bed <= 0 || object.w <= 0 || object.h <= 0) {
    throw new Error('Cannot resize this object.');
  }
  const [sx, sy] = signs;
  const opposite = Object.keys(CORNER_SIGNS).find((name) =>
    CORNER_SIGNS[name][0] === -sx && CORNER_SIGNS[name][1] === -sy);
  const anchor = rotatedCorner(object, opposite);
  const angle = (object.rotation || 0) * Math.PI / 180;
  const c = Math.cos(angle), s = Math.sin(angle);
  const dx = pointer.x - anchor.x, dy = pointer.y - anchor.y;
  const projectedW = sx * (dx * c + dy * s);
  const projectedH = sy * (-dx * s + dy * c);
  const desiredScale = (projectedW * object.w + projectedH * object.h) /
    (object.w ** 2 + object.h ** 2);
  const geometryAt = (scale) => {
    const w = object.w * scale, h = object.h * scale;
    const centerX = anchor.x + (sx * w * c - sy * h * s) / 2;
    const centerY = anchor.y + (sx * w * s + sy * h * c) / 2;
    return { x: centerX - w / 2, y: centerY - h / 2, w, h };
  };
  // Every corner moves on a ray from the fixed opposite corner. Bound both the
  // rotated footprint and the stored (unrotated) rectangle to the machine bed.
  const atOne = geometryAt(1);
  const candidates = [
    ...Object.keys(CORNER_SIGNS).map((name) => rotatedCorner({ ...atOne, rotation: object.rotation }, name)),
    { x: atOne.x, y: atOne.y }, { x: atOne.x + atOne.w, y: atOne.y },
    { x: atOne.x, y: atOne.y + atOne.h }, { x: atOne.x + atOne.w, y: atOne.y + atOne.h },
  ];
  let maxScale = Math.min(bed / object.w, bed / object.h);
  for (const candidate of candidates) {
    const vx = candidate.x - anchor.x, vy = candidate.y - anchor.y;
    if (vx > 0) maxScale = Math.min(maxScale, (bed - anchor.x) / vx);
    if (vx < 0) maxScale = Math.min(maxScale, -anchor.x / vx);
    if (vy > 0) maxScale = Math.min(maxScale, (bed - anchor.y) / vy);
    if (vy < 0) maxScale = Math.min(maxScale, -anchor.y / vy);
  }
  const minScale = Math.max(0.2 / object.w, 0.2 / object.h);
  const scale = Math.max(minScale, Math.min(desiredScale, maxScale));
  return geometryAt(scale);
}
