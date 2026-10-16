import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCenterJogCommand, buildJogCommand, hasStartupCommands, parseGrblStatus, spindleOverrideCommands, workZeroCommands } from './control.mjs';

test('parses work position and derives it from machine position plus WCO', () => {
  assert.deepEqual(parseGrblStatus('<Idle|WPos:12.500,3.000,0.000|FS:0,0>').work, { x: 12.5, y: 3 });
  assert.deepEqual(parseGrblStatus('<Idle|MPos:20.000,15.000,0.000|WCO:2.000,5.000,0.000>').work, { x: 18, y: 10 });
});

test('reads the reported spindle override without confusing it with feed override', () => {
  assert.equal(parseGrblStatus('<Hold:0|MPos:0,0,0|Ov:100,100,150>').spindleOverride, 150);
  assert.equal(parseGrblStatus('<Hold:0|MPos:0,0,0|FS:0,0>').spindleOverride, null);
});

test('builds GRBL realtime power override bytes within its supported range', () => {
  assert.deepEqual(spindleOverrideCommands(150), [0x99, 0x9A, 0x9A, 0x9A, 0x9A, 0x9A]);
  assert.deepEqual(spindleOverrideCommands(80), [0x99, 0x9B, 0x9B]);
  assert.deepEqual(spindleOverrideCommands(100), [0x99]);
  assert.throws(() => spindleOverrideCommands(250), /10–200/);
});

test('jog command is incremental millimetres and remains inside reported travel', () => {
  assert.equal(buildJogCommand({ dx: 1, dy: -1, distance: 10, speed: 800,
    position: { x: 100, y: 100 }, travelX: 300, travelY: 300 }), '$J=G21 G91 X10 Y-10 F800');
  assert.throws(() => buildJogCommand({ dx: -1, dy: 0, distance: 50, speed: 300,
    position: { x: 25, y: 100 }, travelX: 300, travelY: 300 }), /leave/);
  assert.throws(() => buildJogCommand({ dx: 1, dy: 0, distance: 1, speed: 300,
    position: null, travelX: 300, travelY: 300 }), /unknown/);
});

test('center command targets the referenced work-area center without changing modal coordinates', () => {
  assert.equal(buildCenterJogCommand({ position: { x: 1, y: 35 }, speed: 300,
    travelX: 300, travelY: 300 }), '$J=G21 G91 X149 Y115 F300');
  assert.equal(buildCenterJogCommand({ position: { x: 150, y: 150 }, speed: 300,
    travelX: 300, travelY: 300 }), null);
  assert.equal(buildCenterJogCommand({ position: { x: 20, y: 30 }, speed: 800,
    travelX: 200, travelY: 100 }), '$J=G21 G91 X80 Y20 F800');
  assert.throws(() => buildCenterJogCommand({ position: { x: -10, y: 20 }, speed: 300,
    travelX: 300, travelY: 300 }), /outside/);
});

test('setting work zero turns the laser off and changes coordinates without moving', () => {
  assert.deepEqual(workZeroCommands(), ['M5', 'G54', 'G92.1', 'G10 L20 P1 X0 Y0']);
  assert.ok(workZeroCommands().every((command) => !/^\$J|^G0 |^G1 /i.test(command)));
});

test('homing blocks nonempty GRBL startup scripts', () => {
  assert.equal(hasStartupCommands(['$N0=', '$N1=']), false);
  assert.equal(hasStartupCommands(['$N0=G0 X100', '$N1=']), true);
});
