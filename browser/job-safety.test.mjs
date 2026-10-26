import test from 'node:test';
import assert from 'node:assert/strict';
import { GrblTransport } from './protocol.mjs';
import {
  analyzeImportedGcode,
  executeVerifiedMovement,
  importedJobReadiness,
  parseGcode,
  sendSafeJobPreamble,
  stopUncertainMotion,
} from './job-safety.mjs';

test('normalizes comments and compact G-code into parsed command blocks', () => {
  assert.deepEqual(parseGcode('%\nG21 (millimetres)\nG0X1Y2 ; travel\nM4S50\n%'),
    ['G21', 'G0 X1 Y2', 'M4 S50']);
  assert.throws(() => parseGcode('G1 X1 (broken'), /Unclosed comment/);
  assert.throws(() => parseGcode('$30=1000'), /system commands are blocked/);
});

test('bounds absolute and relative linear motion inside verified travel', () => {
  const lines = parseGcode('G21\nG90\nG0 X10 Y20\nG91\nG1 X5 Y-2 F800 S50 M4\nM5');
  assert.deepEqual(analyzeImportedGcode(lines, { travelX: 100, travelY: 100, sMax: 1000, maxFeed: 1000 }), {
    bounds: { minX: 0, minY: 0, maxX: 15, maxY: 20 },
    motionCount: 2,
    maxS: 50,
    maxFeed: 800,
    usesM3: false,
    usesM4: true,
  });
  assert.throws(() => analyzeImportedGcode(parseGcode('G90 G0 X101 Y0'),
    { travelX: 100, travelY: 100, sMax: 1000, maxFeed: 1000 }), /outside/);
});

test('includes an arc bulge when checking machine bounds', () => {
  const safe = analyzeImportedGcode(parseGcode('G90 G0 X10 Y10\nG2 X30 Y10 I10 J0 F500'),
    { travelX: 40, travelY: 25, sMax: 1000, maxFeed: 1000 });
  assert.deepEqual(safe.bounds, { minX: 0, minY: 0, maxX: 30, maxY: 20 });
  assert.throws(() => analyzeImportedGcode(parseGcode('G90 G0 X10 Y10\nG2 X30 Y10 I10 J0 F500'),
    { travelX: 40, travelY: 19, sMax: 1000, maxFeed: 1000 }), /outside/);
});

test('bounds relative motion from the freshly reported starting position', () => {
  const lines = parseGcode('G91 G1 X10 Y-5 F500');
  const analysis = analyzeImportedGcode(lines, { travelX: 100, travelY: 100, sMax: 1000,
    maxFeed: 1000, startPosition: { x: 30, y: 40 } });
  assert.deepEqual(analysis.bounds, { minX: 30, minY: 35, maxX: 40, maxY: 40 });
});

test('rejects commands that can bypass the verified coordinate and controller envelope', () => {
  const options = { travelX: 300, travelY: 300, sMax: 1000, maxFeed: 3000 };
  for (const [source, message] of [
    ['G53 G0 X1', /G53 is blocked/],
    ['G92 X0', /G92 is blocked/],
    ['G20 G0 X1', /G20 is blocked/],
    ['G0 Z1', /Z words are not allowed/],
    ['M4 S1001', /exceeds the verified/],
    ['G1 X1 F3001', /exceeds the verified/],
    ['M3 S100 G1 X1 F500', /M3 constant-power mode is blocked/],
    ['G1 X1', /explicit F feed rate/],
    ['M2\nG0 X1', /final command/],
    ['$X', /system commands are blocked/],
  ]) {
    assert.throws(() => analyzeImportedGcode(parseGcode(source), options), message);
  }
});

test('requires a connected idle laser with switch homing and verified limits for imported jobs', () => {
  const ready = { connected: true, verified: true, originEstablished: true, originMethod: 'homed',
    positionState: { state: 'Idle' },
    machineSettings: { travelX: 300, travelY: 300, sMax: 1000, laserMode: 1, maxRateX: 6000, maxRateY: 6000 } };
  assert.equal(importedJobReadiness(ready).ready, true);
  assert.match(importedJobReadiness({ ...ready, originMethod: 'manual' }).reason, /Home with switches/);
  assert.match(importedJobReadiness({ ...ready, machineSettings: { ...ready.machineSettings, laserMode: 0 } }).reason, /\$32/);
});

test('sends a laser-off deterministic preamble before any imported commands', async () => {
  const commands = [];
  await sendSafeJobPreamble({ sendCommand: async (command) => commands.push(command) });
  assert.deepEqual(commands, ['M5', 'S0', 'G21', 'G90', 'G54', 'G92.1']);
});

test('runs the safety preamble through mocked Bluetooth acknowledgements in order', async () => {
  const commands = [];
  let transport;
  transport = new GrblTransport(async (bytes) => {
    const command = new TextDecoder().decode(bytes).trim();
    commands.push(command);
    queueMicrotask(() => transport.feed(new TextEncoder().encode('ok\r\n')));
  }, async () => {});
  await sendSafeJobPreamble(transport);
  assert.deepEqual(commands, ['M5', 'S0', 'G21', 'G90', 'G54', 'G92.1']);
});

test('stops the mocked preamble state machine on the first controller error', async () => {
  const commands = [];
  let transport;
  transport = new GrblTransport(async (bytes) => {
    const command = new TextDecoder().decode(bytes).trim();
    commands.push(command);
    queueMicrotask(() => transport.feed(new TextEncoder().encode(command === 'S0' ? 'error:2\r\n' : 'ok\r\n')));
  }, async () => {});
  await assert.rejects(sendSafeJobPreamble(transport), /error:2/);
  assert.deepEqual(commands, ['M5', 'S0']);
});

test('uncertain motion attempts jog cancel and reset even when the first Bluetooth write fails', async () => {
  const writes = [];
  let cancelled = false;
  const result = await stopUncertainMotion({
    sendRealtime: async (byte) => {
      writes.push(byte);
      if (byte === 0x85) throw new Error('link interrupted');
    },
    cancel: () => { cancelled = true; },
  });
  assert.deepEqual(writes, [0x85, 0x18]);
  assert.deepEqual(result, { jogCancelSent: false, resetSent: true });
  assert.equal(cancelled, true);
});

test('mocked jog state machine requires Idle, M5, motion, and two final Idle reports', async () => {
  const statuses = ['<Idle|WPos:0,0,0>', '<Run|WPos:1,0,0>', '<Idle|WPos:2,0,0>', '<Idle|WPos:2,0,0>'];
  const commands = [];
  const result = await executeVerifiedMovement({
    transport: {
      queryStatus: async () => statuses.shift(),
      sendCommand: async (command) => commands.push(command),
    },
    makeCommand: () => '$J=G21 G91 X2 F300',
    wait: async () => {},
    maxAttempts: 4,
  });
  assert.equal(result.moved, true);
  assert.deepEqual(commands, ['M5', '$J=G21 G91 X2 F300']);
  assert.equal(statuses.length, 0);
});

test('mocked jog state machine rejects a stale non-idle start before sending motion', async () => {
  const commands = [];
  await assert.rejects(executeVerifiedMovement({
    transport: {
      queryStatus: async () => '<Run|WPos:0,0,0>',
      sendCommand: async (command) => commands.push(command),
    },
    makeCommand: () => '$J=G21 G91 X1 F300',
    wait: async () => {},
    maxAttempts: 1,
  }), /not idle/);
  assert.deepEqual(commands, []);
});
