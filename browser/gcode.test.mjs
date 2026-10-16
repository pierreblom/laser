import test from 'node:test';
import assert from 'node:assert/strict';
import { rasterToGcode } from './gcode.mjs';

test('turns a black raster run into bounded M4 engraving moves', () => {
  const job = rasterToGcode({ pixels: Uint8Array.of(0, 1, 1, 0), width: 4, height: 1,
    stepMm: 0.2, powerPercent: 5, speedMmMin: 1000, passes: 1, sMax: 1000 });
  assert.equal(job.sValue, 50);
  assert.deepEqual(job.lines.slice(-3), ['G0 X0.2 Y0.1', 'G1 X0.6 Y0.1 S50', 'M5']);
  assert.ok(job.lines.includes('M4'));
  assert.ok(!job.lines.includes('M8'));
});

test('adds air assist and multiple passes only when selected', () => {
  const job = rasterToGcode({ pixels: Uint8Array.of(1), width: 1, height: 1,
    stepMm: 0.3, powerPercent: 5, speedMmMin: 1000, passes: 2, sMax: 1000, airAssist: true });
  assert.equal(job.lines.filter((line) => line === 'M8').length, 2);
  assert.equal(job.lines.filter((line) => line === 'M9').length, 2);
  assert.equal(job.segments, 2);
});

test('rejects empty output and out-of-bed dimensions', () => {
  const base = { pixels: Uint8Array.of(0), width: 1, height: 1, stepMm: 0.2,
    powerPercent: 5, speedMmMin: 1000, passes: 1, sMax: 1000 };
  assert.throws(() => rasterToGcode(base), /no dark pixels/);
  assert.throws(() => rasterToGcode({ ...base, pixels: new Uint8Array(2000).fill(1), width: 2000 }), /exceeds the bed/);
});

test('jig origin shifts raster motion and reported bounds together', () => {
  const job = rasterToGcode({ pixels: Uint8Array.of(1), width: 1, height: 1,
    stepMm: 0.3, powerPercent: 5, speedMmMin: 1000, passes: 1, sMax: 1000,
    originX: 20, originY: 30 });
  assert.ok(job.lines.includes('G0 X20 Y30.15'));
  assert.ok(job.lines.includes('G1 X20.3 Y30.15 S50'));
  assert.equal(job.bounds.minX, 20);
  assert.equal(job.bounds.maxY, 30.3);
});
