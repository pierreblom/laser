import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeLayeredJobs, vectorLayersToGcode } from './vector-gcode.mjs';

const settings = {
  score: { powerPercent: 20, speedMmMin: 1500, passes: 1, airAssist: false },
  cut: { powerPercent: 100, speedMmMin: 180, passes: 2, airAssist: true },
};

test('writes score, inner cut, and outer cut in safe layer order', () => {
  const job = vectorLayersToGcode({
    layers: {
      score: [[{ x: 1, y: 2 }, { x: 3, y: 4 }]],
      cutInner: [[{ x: 5, y: 6 }, { x: 7, y: 8 }]],
      cutOuter: [[{ x: 9, y: 10 }, { x: 11, y: 12 }]],
    },
    settings, sMax: 1000,
  });
  const scoreAt = job.lines.indexOf('; score: 20% at 1500 mm/min, 1 pass(es)');
  const innerAt = job.lines.indexOf('; cutInner: 100% at 180 mm/min, 2 pass(es)');
  const outerAt = job.lines.indexOf('; cutOuter: 100% at 180 mm/min, 2 pass(es)');
  assert.ok(scoreAt > 0 && scoreAt < innerAt && innerAt < outerAt);
  assert.ok(job.lines.includes('M4 S200'));
  assert.ok(job.lines.includes('M4 S1000'));
  assert.equal(job.lines.filter((line) => line === 'M8').length, 4);
  assert.deepEqual(job.bounds, { minX: 1, minY: 2, maxX: 11, maxY: 12 });
});

test('applies the verified job origin to moves and bounds', () => {
  const job = vectorLayersToGcode({
    layers: { score: [], cutInner: [[{ x: 0, y: 0 }, { x: 2, y: 3 }]], cutOuter: [] },
    settings, sMax: 1000, originX: 20, originY: 30,
  });
  assert.ok(job.lines.includes('G0 X20 Y30'));
  assert.ok(job.lines.includes('G1 X22 Y33'));
  assert.deepEqual(job.bounds, { minX: 20, minY: 30, maxX: 22, maxY: 33 });
});

test('rejects missing vectors and unsafe settings', () => {
  assert.throws(() => vectorLayersToGcode({ layers: {}, settings, sMax: 1000 }), /no score or cut/);
  assert.throws(() => vectorLayersToGcode({
    layers: { cutInner: [[{ x: 0, y: 0 }, { x: 1, y: 1 }]] },
    settings: { ...settings, cut: { ...settings.cut, powerPercent: 101 } }, sMax: 1000,
  }), /Cut power/);
});

test('merges engraving before vector operations and combines bounds', () => {
  const result = mergeLayeredJobs({
    raster: { lines: ['raster'], segments: 2, sValue: 300,
      bounds: { minX: 4, minY: 5, maxX: 8, maxY: 9 } },
    vector: { lines: ['vector'], segments: 3, sValue: 1000,
      bounds: { minX: 1, minY: 2, maxX: 11, maxY: 12 }, operationCounts: { cutOuter: 1 } },
  });
  assert.deepEqual(result.lines, ['raster', 'vector']);
  assert.equal(result.segments, 5);
  assert.equal(result.sValue, 1000);
  assert.deepEqual(result.bounds, { minX: 1, minY: 2, maxX: 11, maxY: 12 });
});
