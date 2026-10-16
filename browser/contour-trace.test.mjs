import test from 'node:test';
import assert from 'node:assert/strict';
import { traceBinaryContours } from './contour-trace.mjs';

test('text raster outlines close around a glyph body and its hole', () => {
  const pixels = Uint8Array.from([
    1, 1, 1,
    1, 0, 1,
    1, 1, 1,
  ]);
  const paths = traceBinaryContours(pixels, 3, 3);
  assert.equal(paths.length, 2);
  assert.ok(paths.every((path) => path.length >= 5 &&
    JSON.stringify(path[0]) === JSON.stringify(path.at(-1))));
});
