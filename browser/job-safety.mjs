const NUMBER_SOURCE = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
const WORD_PATTERN = new RegExp(`([A-Z])(${NUMBER_SOURCE})`, 'g');
const EPSILON = 0.001;

function commandError(index, message) {
  return new Error(`Unsafe or unsupported G-code at command ${index + 1}: ${message}`);
}

function stripComments(raw, lineNumber) {
  if (raw.length > 254 || !/^[\x20-\x7e]*$/.test(raw)) {
    throw new Error(`Unsupported G-code on line ${lineNumber}. Use printable ASCII, at most 254 characters per line.`);
  }
  let depth = 0;
  let result = '';
  for (const character of raw) {
    if (character === ';' && depth === 0) break;
    if (character === '(') {
      if (depth) throw new Error(`Unsupported nested comment on line ${lineNumber}.`);
      depth = 1;
      continue;
    }
    if (character === ')') {
      if (!depth) throw new Error(`Unmatched comment delimiter on line ${lineNumber}.`);
      depth = 0;
      continue;
    }
    if (!depth) result += character;
  }
  if (depth) throw new Error(`Unclosed comment on line ${lineNumber}.`);
  return result.trim();
}

function parseWords(code, index) {
  if (code === '$G') return { system: '$G', words: [] };
  if (code.startsWith('$')) throw commandError(index, 'controller settings and system commands are blocked.');
  const compact = code.replace(/\s+/g, '').toUpperCase();
  const words = [];
  let cursor = 0;
  WORD_PATTERN.lastIndex = 0;
  for (let match; (match = WORD_PATTERN.exec(compact));) {
    if (match.index !== cursor) throw commandError(index, `could not parse “${compact.slice(cursor)}”.`);
    const value = Number(match[2]);
    if (!Number.isFinite(value)) throw commandError(index, `${match[1]} has an invalid value.`);
    words.push({ letter: match[1], value, raw: `${match[1]}${match[2]}` });
    cursor = WORD_PATTERN.lastIndex;
  }
  if (!words.length || cursor !== compact.length) throw commandError(index, `could not parse “${compact.slice(cursor)}”.`);
  return { words };
}

export function parseGcode(text) {
  const lines = [];
  for (const [index, raw] of text.split(/\r\n|\n|\r/).entries()) {
    const code = stripComments(raw, index + 1);
    if (!code || code === '%') continue;
    const parsed = parseWords(code.toUpperCase(), lines.length);
    lines.push(parsed.system || parsed.words.map((word) => word.raw.toUpperCase()).join(' '));
  }
  if (!lines.length) throw new Error('This file has no G-code commands.');
  return lines;
}

function normalizeAngle(value) {
  const full = Math.PI * 2;
  return ((value % full) + full) % full;
}

function arcSweep(start, end, clockwise) {
  const full = Math.PI * 2;
  const distance = clockwise ? normalizeAngle(start - end) : normalizeAngle(end - start);
  return distance < 1e-9 ? full : distance;
}

function angleOnArc(angle, start, end, clockwise) {
  const sweep = arcSweep(start, end, clockwise);
  const distance = clockwise ? normalizeAngle(start - angle) : normalizeAngle(angle - start);
  return distance <= sweep + 1e-9;
}

function centerFromRadius(start, end, signedRadius, clockwise, index) {
  const radius = Math.abs(signedRadius);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const chord = Math.hypot(dx, dy);
  if (!radius || chord < EPSILON || chord > radius * 2 + 0.01) {
    throw commandError(index, 'the R arc has invalid geometry.');
  }
  const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const height = Math.sqrt(Math.max(0, radius * radius - chord * chord / 4));
  const normal = { x: -dy / chord, y: dx / chord };
  const candidates = [1, -1].map((sign) => ({
    x: midpoint.x + normal.x * height * sign,
    y: midpoint.y + normal.y * height * sign,
  }));
  const wantedLong = signedRadius < 0;
  return candidates.find((center) => {
    const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
    const endAngle = Math.atan2(end.y - center.y, end.x - center.x);
    const sweep = arcSweep(startAngle, endAngle, clockwise);
    return wantedLong ? sweep >= Math.PI - 1e-8 : sweep <= Math.PI + 1e-8;
  }) || candidates[0];
}

function arcExtents(start, end, { i, j, r }, clockwise, index) {
  if (r !== undefined && (i !== undefined || j !== undefined)) {
    throw commandError(index, 'an arc cannot combine R with I or J.');
  }
  let center;
  if (r !== undefined) center = centerFromRadius(start, end, r, clockwise, index);
  else {
    if (i === undefined && j === undefined) throw commandError(index, 'G2/G3 needs I/J or R arc geometry.');
    center = { x: start.x + (i || 0), y: start.y + (j || 0) };
  }
  const radius = Math.hypot(start.x - center.x, start.y - center.y);
  const endRadius = Math.hypot(end.x - center.x, end.y - center.y);
  if (radius < EPSILON || Math.abs(radius - endRadius) > Math.max(0.1, radius * 0.01)) {
    throw commandError(index, 'the arc endpoint does not match its radius.');
  }
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
  const endAngle = Math.atan2(end.y - center.y, end.x - center.x);
  const points = [start, end];
  for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    if (angleOnArc(angle, startAngle, endAngle, clockwise)) {
      points.push({ x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) });
    }
  }
  return points;
}

function wordsByLetter(words) {
  const values = new Map();
  for (const word of words) {
    if (!values.has(word.letter)) values.set(word.letter, []);
    values.get(word.letter).push(word.value);
  }
  return values;
}

function oneValue(values, letter, index) {
  const entries = values.get(letter) || [];
  if (entries.length > 1) throw commandError(index, `${letter} appears more than once.`);
  return entries[0];
}

export function analyzeImportedGcode(lines, {
  travelX = 300,
  travelY = 300,
  sMax = 100000,
  maxFeed = 12000,
  startPosition = { x: 0, y: 0 },
} = {}) {
  if (!Array.isArray(lines) || !lines.length) throw new Error('This file has no G-code commands.');
  if (![travelX, travelY, sMax, maxFeed].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Verified machine travel, power, and feed limits are required.');
  }
  if (!startPosition || ![startPosition.x, startPosition.y].every(Number.isFinite)) {
    throw new Error('A verified starting work position is required.');
  }

  let absolute = true;
  let motionMode = null;
  let position = { x: startPosition.x, y: startPosition.y };
  let currentS = 0;
  let currentFeed = null;
  let motionCount = 0;
  let maxS = 0;
  let maxObservedFeed = 0;
  let usesM3 = false;
  let usesM4 = false;
  const bounds = { minX: position.x, minY: position.y, maxX: position.x, maxY: position.y };

  const include = (point, index) => {
    if (![point.x, point.y].every(Number.isFinite)) throw commandError(index, 'motion contains a non-finite coordinate.');
    if (point.x < -EPSILON || point.y < -EPSILON || point.x > travelX + EPSILON || point.y > travelY + EPSILON) {
      throw commandError(index, `motion reaches X${Number(point.x.toFixed(3))} Y${Number(point.y.toFixed(3))}, outside 0–${travelX} × 0–${travelY} mm.`);
    }
    bounds.minX = Math.min(bounds.minX, point.x);
    bounds.minY = Math.min(bounds.minY, point.y);
    bounds.maxX = Math.max(bounds.maxX, point.x);
    bounds.maxY = Math.max(bounds.maxY, point.y);
  };
  include(position, 0);

  for (const [index, line] of lines.entries()) {
    const parsed = parseWords(line.toUpperCase(), index);
    if (parsed.system) continue; // $G is the sole allowed, read-only system command.
    const values = wordsByLetter(parsed.words);
    for (const letter of values.keys()) {
      if (!'GMXYIJRFS'.includes(letter)) throw commandError(index, `${letter} words are not allowed.`);
    }
    const gCodes = values.get('G') || [];
    const mCodes = values.get('M') || [];
    let blockMotion = null;
    let distanceMode = null;
    for (const code of gCodes) {
      if ([0, 1, 2, 3].includes(code)) {
        if (blockMotion !== null) throw commandError(index, 'more than one motion command appears in one block.');
        blockMotion = code;
      } else if (code === 90 || code === 91) {
        if (distanceMode !== null) throw commandError(index, 'both absolute and relative distance modes appear together.');
        distanceMode = code;
      } else if (code === 80) {
        motionMode = null;
      } else if (![17, 21, 40, 54, 94, 91.1].includes(code)) {
        throw commandError(index, `G${code} is blocked. Use millimetres, the XY plane, G54, and G0–G3 motion only.`);
      }
    }
    if (distanceMode === 90) absolute = true;
    if (distanceMode === 91) absolute = false;
    if (blockMotion !== null) motionMode = blockMotion;

    const sValue = oneValue(values, 'S', index);
    if (sValue !== undefined) {
      if (sValue < 0 || sValue > sMax) throw commandError(index, `S${sValue} exceeds the verified 0–${sMax} range.`);
      currentS = sValue;
      maxS = Math.max(maxS, sValue);
    }
    const feed = oneValue(values, 'F', index);
    if (feed !== undefined) {
      if (feed <= 0 || feed > maxFeed) throw commandError(index, `F${feed} exceeds the verified 1–${maxFeed} mm/min range.`);
      currentFeed = feed;
      maxObservedFeed = Math.max(maxObservedFeed, feed);
    }
    for (const code of mCodes) {
      if (![2, 3, 4, 5, 7, 8, 9, 30].includes(code)) throw commandError(index, `M${code} is blocked.`);
      if (code === 3) throw commandError(index, 'M3 constant-power mode is blocked. Re-export the job with M4 dynamic laser power.');
      if (code === 4) usesM4 = true;
      if ([2, 30].includes(code) && index !== lines.length - 1) {
        throw commandError(index, `M${code} program end must be the final command.`);
      }
    }

    const x = oneValue(values, 'X', index);
    const y = oneValue(values, 'Y', index);
    const i = oneValue(values, 'I', index);
    const j = oneValue(values, 'J', index);
    const r = oneValue(values, 'R', index);
    const hasGeometry = [x, y, i, j, r].some((value) => value !== undefined);
    if (!hasGeometry) continue;
    const mode = blockMotion ?? motionMode;
    if (mode === null) throw commandError(index, 'coordinates appear before a G0–G3 motion mode.');
    if ([1, 2, 3].includes(mode) && currentFeed === null) {
      throw commandError(index, 'cutting motion requires an explicit F feed rate in this file.');
    }
    if (![2, 3].includes(mode) && [i, j, r].some((value) => value !== undefined)) {
      throw commandError(index, 'I, J, and R are allowed only with G2/G3 arcs.');
    }
    const end = {
      x: x === undefined ? position.x : absolute ? x : position.x + x,
      y: y === undefined ? position.y : absolute ? y : position.y + y,
    };
    const points = [2, 3].includes(mode)
      ? arcExtents(position, end, { i, j, r }, mode === 2, index)
      : [position, end];
    for (const point of points) include(point, index);
    position = end;
    motionCount++;
  }

  return {
    bounds: Object.fromEntries(Object.entries(bounds).map(([key, value]) => [key, Number(value.toFixed(3))])),
    motionCount,
    maxS,
    maxFeed: maxObservedFeed,
    usesM3,
    usesM4,
  };
}

export function importedJobReadiness({ connected, verified, originEstablished, originMethod, positionState, machineSettings }) {
  if (!connected) return { ready: false, reason: 'Connect the laser before sending this imported job.' };
  if (!verified) return { ready: false, reason: 'Reconnect and verify the controller before sending this imported job.' };
  if (!originEstablished || originMethod !== 'homed') {
    return { ready: false, reason: 'Imported jobs require Home with switches; a manually set origin is not sufficient.' };
  }
  if (positionState?.state !== 'Idle') return { ready: false, reason: 'Wait for the controller to report Idle.' };
  if (!(machineSettings?.travelX > 0 && machineSettings?.travelY > 0 && machineSettings?.sMax > 0 &&
      machineSettings?.maxRateX > 0 && machineSettings?.maxRateY > 0)) {
    return { ready: false, reason: 'Reconnect so the app can verify travel, feed, and power limits.' };
  }
  if (machineSettings.laserMode !== 1) return { ready: false, reason: 'Controller $32 must be 1 (laser mode).' };
  return { ready: true, reason: '' };
}

export async function sendSafeJobPreamble(transport) {
  for (const command of ['M5', 'S0', 'G21', 'G90', 'G54', 'G92.1']) await transport.sendCommand(command);
}

export async function executeVerifiedMovement({
  transport,
  makeCommand,
  onStarted = () => {},
  wait = () => new Promise((resolve) => setTimeout(resolve, 250)),
  maxAttempts = 1200,
}) {
  const before = await transport.queryStatus();
  if (!before.startsWith('<Idle')) throw new Error(`Controller is not idle: ${before}`);
  const command = makeCommand();
  if (!command) return { moved: false, status: before };
  await transport.sendCommand('M5');
  await transport.sendCommand(command);
  onStarted(command);
  let idleReadings = 0;
  let status = before;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await wait();
    status = await transport.queryStatus();
    idleReadings = status.startsWith('<Idle') ? idleReadings + 1 : 0;
    if (idleReadings >= 2) return { moved: true, status };
  }
  throw new Error('Movement did not return to idle in five minutes. Check the machine.');
}

export async function stopUncertainMotion(transport) {
  if (!transport) return { jogCancelSent: false, resetSent: false };
  let jogCancelSent = false;
  let resetSent = false;
  try { await transport.sendRealtime(0x85); jogCancelSent = true; } catch { /* Continue to the reset attempt. */ }
  try { await transport.sendRealtime(0x18); resetSent = true; } catch { /* The connection may already be gone. */ }
  transport.cancel?.(new Error('Movement state became unverified.'));
  return { jogCancelSent, resetSent };
}
