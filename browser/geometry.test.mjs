import test from 'node:test';
import assert from 'node:assert/strict';
import { hitResizeCorner, pointInRotatedRect, resizeFromCorner, rotatedCorner } from './geometry.mjs';

test('hit testing follows a rotated image instead of its old horizontal box', () => {
  const image = { x: 60, y: 50, w: 180, h: 100, rotation: 90 };
  assert.equal(pointInRotatedRect({ x: 150, y: 10 }, image), true);
  assert.equal(pointInRotatedRect({ x: 70, y: 100 }, image), false);
  assert.equal(pointInRotatedRect({ x: 150, y: 100 }, image), true);
});

test('corner drag resizes proportionally around its opposite corner', () => {
  const image = { x: 100, y: 100, w: 40, h: 20, rotation: 0 };
  assert.equal(hitResizeCorner({ x: 140, y: 120 }, image, 3), 'topRight');
  const resized = resizeFromCorner(image, 'topRight', { x: 180, y: 140 });
  assert.deepEqual(resized, { x: 100, y: 100, w: 80, h: 40 });
  assert.deepEqual(image, { x: 100, y: 100, w: 40, h: 20, rotation: 0 });
  const bounded = resizeFromCorner(image, 'topRight', { x: 500, y: 300 });
  assert.equal(bounded.x + bounded.w, 300);
  assert.equal(bounded.w / bounded.h, 2);
});

test('rotated resize keeps the opposite physical corner fixed and in bounds', () => {
  const image = { x: 120, y: 120, w: 40, h: 20, rotation: 30 };
  const anchor = rotatedCorner(image, 'bottomLeft');
  const resized = resizeFromCorner(image, 'topRight', { x: 190, y: 200 });
  const newAnchor = rotatedCorner({ ...resized, rotation: image.rotation }, 'bottomLeft');
  assert.ok(Math.abs(newAnchor.x - anchor.x) < 1e-9);
  assert.ok(Math.abs(newAnchor.y - anchor.y) < 1e-9);
  assert.ok(Math.abs(resized.w / resized.h - 2) < 1e-9);
  for (const corner of ['topLeft', 'topRight', 'bottomRight', 'bottomLeft']) {
    const point = rotatedCorner({ ...resized, rotation: image.rotation }, corner);
    assert.ok(point.x >= 0 && point.x <= 300 && point.y >= 0 && point.y <= 300);
  }
});
