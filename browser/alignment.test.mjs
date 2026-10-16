import test from 'node:test';
import assert from 'node:assert/strict';
import { assertMachineBounds, collectContourPaths, measuredBox, measurementToCanvas, outlineToCanvas,
  transformContour, validateJig, validateOutlinePoint, workOriginForJig } from './alignment.mjs';

test('validates a machine-coordinate jig and translates its origin to work coordinates', () => {
  const jig = validateJig({ jig_name: 'Club head', origin_x: 25, origin_y: 40,
    max_width: 80, max_height: 50 }, { x: 299, y: 299 });
  assert.deepEqual(workOriginForJig(jig, { x: 2, y: -3 }), { x: 23, y: 43 });
  assert.throws(() => validateJig({ ...jig, origin_x: 280 }, { x: 299, y: 299 }), /beyond/);
});

test('measures unordered corners and keeps a frame inside machine and jig limits', () => {
  const result = measuredBox({ x: 105, y: 90 }, { x: 25, y: 40 });
  assert.equal(result.width, 80);
  assert.equal(result.height, 50);
  assert.deepEqual(measurementToCanvas(result,
    { origin_x: 25, origin_y: 40 }, { x: 0, y: 0 }),
  { minX: 0, minY: 0, maxX: 80, maxY: 50 });
  assert.deepEqual(measurementToCanvas(result, null, { x: 5, y: 10 }),
    { minX: 20, minY: 30, maxX: 100, maxY: 80 });
  assert.deepEqual(assertMachineBounds({ minX: 25, minY: 40, maxX: 105, maxY: 90 },
    { x: 0, y: 0 }, { x: 299, y: 299 },
    { origin_x: 25, origin_y: 40, max_width: 80, max_height: 50 }),
  { minX: 25, minY: 40, maxX: 105, maxY: 90 });
  assert.throws(() => assertMachineBounds({ minX: 24, minY: 40, maxX: 105, maxY: 90 },
    { x: 0, y: 0 }, { x: 299, y: 299 },
    { origin_x: 25, origin_y: 40, max_width: 80, max_height: 50 }), /outside/);
});

test('contour transforms follow object scaling, flip, and rotation', () => {
  const object = { x: 10, y: 20, w: 4, h: 2, rotation: 90, flipX: false, flipY: false };
  assert.deepEqual(transformContour(object, [[0, 0], [1, 0]]),
    [{ x: 11, y: 19 }, { x: 11, y: 23 }]);
  const paths = collectContourPaths([{ ...object, type: 'image', kind: 'Text', contours: [[[0, 0], [1, 0]]] }]);
  assert.equal(paths.length, 1);
  assert.throws(() => collectContourPaths([{ ...object, type: 'image', kind: 'Picture' }]), /no contour/);
});

test('captured perimeter points align with the active jig and stay inside travel', () => {
  const jig = { origin_x: 25, origin_y: 40, max_width: 80, max_height: 50 };
  const limits = { x: 299, y: 299 };
  const points = [
    validateOutlinePoint({ x: 30, y: 45 }, jig, { x: 0, y: 0 }, limits),
    validateOutlinePoint({ x: 95, y: 45 }, jig, { x: 0, y: 0 }, limits),
    validateOutlinePoint({ x: 70, y: 80 }, jig, { x: 0, y: 0 }, limits),
  ];
  assert.deepEqual(outlineToCanvas(points, jig, { x: 0, y: 0 }),
    [{ x: 5, y: 5 }, { x: 70, y: 5 }, { x: 45, y: 40 }]);
  assert.deepEqual(outlineToCanvas([{ x: 30, y: 45 }], null, { x: 5, y: 10 }), [{ x: 25, y: 35 }]);
  assert.throws(() => validateOutlinePoint({ x: 106, y: 45 }, jig, { x: 0, y: 0 }, limits), /outside/);
  assert.throws(() => validateOutlinePoint({ x: 30, y: 45 }, jig, { x: 0, y: 0 }, { x: 29, y: 299 }), /outside/);
  assert.throws(() => outlineToCanvas([{ x: NaN, y: 0 }], jig, { x: 0, y: 0 }), /valid/);
});
