import test from 'node:test';
import assert from 'node:assert/strict';
import { describeSdStatus, listMountedCard, parseSdListing, uploadMountedJob } from './sd-card.mjs';

test('parses the makerbase SD listing without treating status text as files', () => {
  assert.deepEqual(parseSdListing(['[FILE:/design.nc|SIZE:2104]', '[SD Free:1 GB Used:2 MB Total:1 GB]', 'ok']),
    [{ name: '/design.nc', bytes: 2104 }]);
  assert.equal(describeSdStatus(['SD card detected', 'ok']), 'SD card detected');
  assert.equal(describeSdStatus(['SD_OK', 'ok']), 'SD card detected');
});

test('browses a selected card and copies a new G-code file without overwriting', async () => {
  const content = new Map([['older.nc', 'G21\n']]);
  const directory = {
    name: 'LASER-CARD',
    async *entries() {
      for (const [name] of content) yield [name, {
        kind: 'file', getFile: async () => ({ size: new TextEncoder().encode(content.get(name)).length }),
      }];
    },
    async getFileHandle(name, { create }) {
      assert.equal(create, true);
      return {
        createWritable: async () => ({
          write: async (bytes) => { content.set(name, new TextDecoder().decode(bytes)); },
          close: async () => {},
          abort: async () => {},
        }),
        getFile: async () => ({ size: new TextEncoder().encode(content.get(name)).length }),
      };
    },
  };
  assert.deepEqual(await listMountedCard(directory), [{ name: 'older.nc', bytes: 4 }]);
  assert.equal(await uploadMountedJob(directory, 'new.nc', 'G21\nM5\n'), 7);
  assert.deepEqual((await listMountedCard(directory)).map((file) => file.name), ['new.nc', 'older.nc']);
  await assert.rejects(uploadMountedJob(directory, 'NEW.NC', 'G21\n'), /already exists/);
});
