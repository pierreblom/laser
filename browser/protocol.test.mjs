import test from 'node:test';
import assert from 'node:assert/strict';
import { GrblTransport, parseGcode } from './protocol.mjs';

test('parses exported G-code and rejects unsupported characters', () => {
  assert.deepEqual(parseGcode('; header\r\nG0 X1 Y2\r\n\r\nM3 S100\r\n'), ['G0 X1 Y2', 'M3 S100']);
  assert.throws(() => parseGcode('G1 X1\u0000'), /line 1/);
  assert.throws(() => parseGcode('; comments only'), /no G-code commands/);
});

test('sends a command in BLE-safe chunks and waits for GRBL acknowledgement', async () => {
  const writes = [];
  let transport;
  transport = new GrblTransport(async (bytes) => {
    writes.push(bytes.length);
    if (bytes.includes(10)) queueMicrotask(() => transport.feed(new TextEncoder().encode('ok\r\n')));
  }, async () => {});
  await transport.sendCommand(`G1 X${'1'.repeat(55)}`);
  assert.ok(writes.length > 1);
  assert.ok(writes.every((length) => length <= 20));
});

test('reads a fragmented status and reports controller errors', async () => {
  let transport;
  transport = new GrblTransport(async () => {
    queueMicrotask(() => {
      transport.feed(new TextEncoder().encode('<Id'));
      transport.feed(new TextEncoder().encode('le|MPos:0,0,0>\r\n'));
    });
  }, async () => {});
  assert.equal(await transport.queryStatus(), '<Idle|MPos:0,0,0>');
  const failed = transport.sendCommand('G1 X1');
  queueMicrotask(() => transport.feed(new TextEncoder().encode('error:2\r\n')));
  await assert.rejects(failed, /error:2/);
});

test('returns Alarm as a readable status after a soft reset', async () => {
  let transport;
  transport = new GrblTransport(async () => {
    queueMicrotask(() => transport.feed(new TextEncoder().encode('<Alarm|MPos:0,0,0>\r\n')));
  }, async () => {});
  assert.equal(await transport.queryStatus(), '<Alarm|MPos:0,0,0>');
});

test('feed hold uses confirmed BLE writes and status can be queried during a pending command', async () => {
  const writes = [];
  let transport;
  transport = new GrblTransport(async (bytes) => {
    const text = new TextDecoder().decode(bytes);
    writes.push(text);
    if (text === '?') queueMicrotask(() => transport.feed(new TextEncoder().encode('<Hold:0|MPos:1,0,0>\r\n')));
  }, async () => { throw new Error('unconfirmed BLE write used'); });
  const command = transport.sendCommand('G1 X1 F100');
  await transport.sendRealtime('!'.charCodeAt(0), { confirmed: true });
  assert.equal(await transport.queryStatus(), '<Hold:0|MPos:1,0,0>');
  transport.feed(new TextEncoder().encode('ok\r\n'));
  await command;
  assert.ok(writes.includes('!'));
});

test('feed hold does not split a long G-code line into two writes', async () => {
  const writes = [];
  let releaseFirstChunk;
  let firstChunkSeen;
  const firstChunk = new Promise((resolve) => { firstChunkSeen = resolve; });
  const gate = new Promise((resolve) => { releaseFirstChunk = resolve; });
  const transport = new GrblTransport(async (bytes) => {
    writes.push(new TextDecoder().decode(bytes));
    if (writes.length === 1) { firstChunkSeen(); await gate; }
  }, async () => {});
  const command = transport.sendCommand(`G1 X${'1'.repeat(55)}`);
  await firstChunk;
  const hold = transport.sendRealtime('!'.charCodeAt(0), { confirmed: true });
  releaseFirstChunk();
  await hold;
  transport.feed(new TextEncoder().encode('ok\r\n'));
  await command;
  assert.equal(writes.at(-1), '!');
  assert.equal(writes.slice(0, -1).join(''), `G1 X${'1'.repeat(55)}\n`);
});

test('disconnect cancellation rejects pending command and status state', async () => {
  const transport = new GrblTransport(async () => {}, async () => {});
  const command = transport.sendCommand('G1 X1');
  const status = transport.queryStatus();
  transport.cancel(new Error('mock disconnect'));
  await assert.rejects(command, /mock disconnect/);
  await assert.rejects(status, /mock disconnect/);
});
