export { parseGcode } from './job-safety.mjs';

export const TARGET_NAME = 'Laser-22504';
export const SERVICE_UUID = 0xfff0;
export const NOTIFY_UUID = 0xfff1;
export const WRITE_UUID = 0xfff2;

const encoder = new TextEncoder();
const decoder = new TextDecoder('ascii');

export class GrblTransport {
  constructor(writeWithResponse, writeRealtime, onLine = () => {}) {
    this.writeWithResponse = writeWithResponse;
    this.writeRealtime = writeRealtime;
    this.onLine = onLine;
    this.buffer = '';
    this.waiter = null;
    this.statusWaiter = null;
    this.writeQueue = Promise.resolve();
  }

  feed(value) {
    const bytes = value instanceof DataView
      ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
      : value;
    this.buffer += decoder.decode(bytes);
    if (this.buffer.length > 4096) {
      this.buffer = '';
      this.cancel(new Error('Controller reply exceeded 4 KB.'));
      return;
    }
    let newline;
    while ((newline = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, newline).trim();
      this.buffer = this.buffer.slice(newline + 1);
      if (line) this.handleLine(line);
    }
  }

  handleLine(line) {
    this.onLine(line);
    if (/^(error:|ALARM:)/i.test(line)) {
      if (this.waiter) this.finishWaiter('ack', new Error(`Controller: ${line}`));
      else this.finishWaiter('status', new Error(`Controller: ${line}`));
    } else if (line.toLowerCase() === 'ok') {
      this.finishWaiter('ack', null, line);
    } else if (/^<[^>]+>$/.test(line)) {
      this.finishWaiter('status', null, line);
      if (/^<Alarm(?:\||>)/i.test(line)) this.finishWaiter('ack', new Error(`Controller: ${line}`));
    }
  }

  beginWait(type, timeoutMs) {
    const field = type === 'status' ? 'statusWaiter' : 'waiter';
    if (this[field]) throw new Error('The controller is already handling a command.');
    const response = new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.finishWaiter(type, new Error('The controller did not reply in time.')), timeoutMs);
      this[field] = { timer, resolve, reject };
    });
    this[field].response = response;
    // The notification may arrive before the BLE write promise settles.
    response.catch(() => {});
    return response;
  }

  finishWaiter(type, error, result) {
    const field = type === 'status' ? 'statusWaiter' : 'waiter';
    const waiter = this[field];
    if (!waiter) return;
    this[field] = null;
    clearTimeout(waiter.timer);
    if (error) waiter.reject(error);
    else waiter.resolve(result);
  }

  cancel(error = new Error('Bluetooth disconnected.')) {
    this.finishWaiter('ack', error);
    this.finishWaiter('status', error);
  }

  queueWrite(operation) {
    const write = this.writeQueue.then(operation);
    this.writeQueue = write.catch(() => {});
    return write;
  }

  async queryStatus() {
    if (this.statusWaiter) return this.statusWaiter.response;
    const response = this.beginWait('status', 10000);
    try {
      await this.queueWrite(() => this.writeWithResponse(encoder.encode('?')));
    } catch (error) {
      this.finishWaiter('status', error);
      throw error;
    }
    return response;
  }

  async sendCommand(command, timeoutMs = 60000) {
    const response = this.beginWait('ack', timeoutMs);
    const bytes = encoder.encode(`${command}\n`);
    try {
      // 20 bytes fits the minimum BLE ATT payload. The browser does not expose the negotiated MTU.
      // Keep every chunk of a line together. A pause may arrive while a
      // command is being written, but it must never split the command bytes.
      await this.queueWrite(async () => {
        for (let offset = 0; offset < bytes.length; offset += 20) {
          await this.writeWithResponse(bytes.subarray(offset, offset + 20));
        }
      });
    } catch (error) {
      this.finishWaiter('ack', error);
      throw error;
    }
    return response;
  }

  async sendRealtime(byte, { confirmed = false } = {}) {
    // Feed hold and resume use the verified write-with-response path. Keep
    // emergency reset and jog cancel on the immediate write path.
    if (confirmed) await this.queueWrite(() => this.writeWithResponse(Uint8Array.of(byte)));
    else await this.writeRealtime(Uint8Array.of(byte));
  }
}
