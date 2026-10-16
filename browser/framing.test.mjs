import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBoxFrame, buildContourFrame } from './framing.mjs';

const options = { origin: { x: 20, y: 30 }, wco: { x: 0, y: 0 },
  limits: { x: 299, y: 299 }, pocket: { origin_x: 20, origin_y: 30, max_width: 80, max_height: 50 },
  sValue: 5, sMax: 1000, feed: 3000, maxFeed: 5000 };

test('box frame translates into jig work coordinates and ends laser-off', () => {
  const lines = buildBoxFrame({ ...options, bounds: { minX: 0, minY: 0, maxX: 40, maxY: 20 } });
  assert.equal(lines[4], 'G0 X20 Y30');
  assert.equal(lines[5], 'M4 S5');
  assert.equal(lines.at(-1), 'M5');
  assert.ok(lines.includes('G1 X60 Y30 F3000'));
});

test('contour frame turns laser off between disconnected paths and rejects excessive power or travel', () => {
  const paths = [[{ x: 0, y: 0 }, { x: 10, y: 10 }], [{ x: 20, y: 20 }, { x: 30, y: 20 }]];
  const lines = buildContourFrame({ ...options, paths });
  assert.ok(lines.includes('G0 X40 Y50'));
  assert.equal(lines.filter((line) => line === 'M5').length, 3);
  assert.throws(() => buildContourFrame({ ...options, paths, sValue: 11 }), /PWM/);
  assert.throws(() => buildContourFrame({ ...options, paths, feed: 6000 }), /speed/);
  assert.throws(() => buildContourFrame({ ...options,
    paths: [[{ x: 0, y: 0 }, { x: 200, y: 0 }]] }), /outside/);
});

test('slow physical frames are rejected before streaming', () => {
  assert.throws(() => buildBoxFrame({ ...options, feed: 100,
    pocket: { origin_x: 20, origin_y: 30, max_width: 200, max_height: 200 },
    bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 } }), /three minutes/);
});
