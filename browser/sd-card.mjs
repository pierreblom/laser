export function parseSdListing(lines) {
  const files = [];
  for (const line of lines) {
    const match = /^\[FILE:(.+)\|SIZE:(\d+)\]$/i.exec(line);
    if (match) files.push({ name: match[1], bytes: Number(match[2]) });
  }
  return files;
}

export function describeSdStatus(lines) {
  // L1 Pro firmware reports SD_OK for a mounted card instead of the
  // "SD card detected" text used by upstream Makerbase firmware.
  if (lines.some((line) => /^SD_OK$/i.test(line))) return 'SD card detected';
  const message = lines.find((line) => /SD card detected|No SD card|SD card not enabled|Busy/i.test(line));
  return message || 'Card status was not reported.';
}

const JOB_NAME = /^[a-z0-9][a-z0-9_-]{0,31}\.(nc|gc|gcode)$/i;
const MAX_JOB_BYTES = 20 * 1024 * 1024;

export async function listMountedCard(directory, path = '', depth = 0) {
  const files = [];
  for await (const [name, handle] of directory.entries()) {
    if (handle.kind === 'directory' && depth < 2) {
      files.push(...await listMountedCard(handle, `${path}${name}/`, depth + 1));
    } else if (handle.kind === 'file' && /\.(nc|gc|gcode)$/i.test(name)) {
      const file = await handle.getFile();
      files.push({ name: `${path}${name}`, bytes: file.size });
    }
    if (files.length > 1000) throw new Error('This card has too many job files to show safely.');
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

export async function uploadMountedJob(directory, name, content) {
  if (!JOB_NAME.test(name)) throw new Error('Use a short .nc, .gc, or .gcode filename.');
  const bytes = new TextEncoder().encode(content);
  if (!bytes.length || bytes.length > MAX_JOB_BYTES || /[^\x0a\x0d\x20-\x7e]/.test(content)) {
    throw new Error('The job must be printable ASCII and no larger than 20 MB.');
  }
  for await (const [existing] of directory.entries()) {
    if (existing.toLowerCase() === name.toLowerCase()) {
      throw new Error(`${name} already exists on the card. Choose a new filename to avoid overwriting it.`);
    }
  }
  const handle = await directory.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  try {
    await writable.write(bytes);
    await writable.close();
  } catch (error) {
    await writable.abort().catch(() => {});
    throw error;
  }
  const saved = await handle.getFile();
  if (saved.size !== bytes.length) throw new Error('The copied file size did not match. Check the card before using it.');
  return saved.size;
}
