const fmt = (value) => Number(value.toFixed(3)).toString();

const OPERATIONS = ['score', 'cutInner', 'cutOuter'];

function validateSetting(name, setting) {
  if (!setting || typeof setting !== 'object') throw new Error(`${name} settings are missing.`);
  if (!(setting.powerPercent > 0 && setting.powerPercent <= 100)) {
    throw new Error(`${name} power must be between 1% and 100%.`);
  }
  if (!(setting.speedMmMin >= 100 && setting.speedMmMin <= 12000)) {
    throw new Error(`${name} speed must be 100–12000 mm/min.`);
  }
  if (!Number.isInteger(setting.passes) || setting.passes < 1 || setting.passes > 10) {
    throw new Error(`${name} passes must be 1–10.`);
  }
}

function validatePath(path) {
  if (!Array.isArray(path) || path.length < 2 || path.length > 100000) {
    throw new Error('Every vector path must contain 2–100000 points.');
  }
  for (const point of path) {
    if (!point || ![point.x, point.y].every(Number.isFinite)) {
      throw new Error('Vector path contains an invalid point.');
    }
  }
}

function pathBounds(paths) {
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const path of paths) for (const point of path) {
    bounds.minX = Math.min(bounds.minX, point.x);
    bounds.minY = Math.min(bounds.minY, point.y);
    bounds.maxX = Math.max(bounds.maxX, point.x);
    bounds.maxY = Math.max(bounds.maxY, point.y);
  }
  return Number.isFinite(bounds.minX) ? bounds : null;
}

export function vectorLayersToGcode({ layers, settings, sMax, originX = 0, originY = 0,
  includePreamble = true }) {
  if (!layers || typeof layers !== 'object') throw new Error('Vector layers are missing.');
  if (!(sMax > 0 && sMax <= 100000)) throw new Error('Enter the controller’s verified $30 maximum S value.');
  if (![originX, originY].every(Number.isFinite)) throw new Error('Job origin is unavailable.');

  const present = OPERATIONS.filter((operation) => Array.isArray(layers[operation]) && layers[operation].length);
  if (!present.length) throw new Error('This layered SVG contains no score or cut paths.');
  for (const operation of present) {
    validateSetting(operation === 'score' ? 'Score' : 'Cut', settings[operation === 'score' ? 'score' : 'cut']);
    for (const path of layers[operation]) validatePath(path);
  }

  const lines = includePreamble
    ? ['; Laser Link layered SVG vector job', 'G21', 'G90', 'G54', 'M5']
    : ['; Laser Link layered SVG vector operations', 'M5'];
  let segments = 0;
  let maxSValue = 0;
  const allPaths = [];
  const operationCounts = {};

  for (const operation of OPERATIONS) {
    const paths = layers[operation] || [];
    if (!paths.length) continue;
    const setting = settings[operation === 'score' ? 'score' : 'cut'];
    const sValue = Math.max(1, Math.round(sMax * setting.powerPercent / 100));
    maxSValue = Math.max(maxSValue, sValue);
    operationCounts[operation] = paths.length;
    lines.push(`; ${operation}: ${fmt(setting.powerPercent)}% at ${fmt(setting.speedMmMin)} mm/min, ${setting.passes} pass(es)`);
    for (let pass = 0; pass < setting.passes; pass++) {
      if (setting.airAssist) lines.push('M8');
      for (const path of paths) {
        const shifted = path.map((point) => ({ x: point.x + originX, y: point.y + originY }));
        allPaths.push(shifted);
        const [start, ...rest] = shifted;
        lines.push('M5');
        lines.push(`G0 X${fmt(start.x)} Y${fmt(start.y)}`);
        lines.push(`M4 S${sValue}`);
        lines.push(`G1 F${fmt(setting.speedMmMin)}`);
        for (const point of rest) {
          lines.push(`G1 X${fmt(point.x)} Y${fmt(point.y)}`);
          segments++;
        }
      }
      lines.push('M5');
      if (setting.airAssist) lines.push('M9');
    }
  }
  lines.push('M5');
  const bounds = pathBounds(allPaths);
  return { lines, segments, sValue: maxSValue, bounds, operationCounts };
}

export function mergeLayeredJobs({ raster = null, vector = null }) {
  if (!raster && !vector) throw new Error('The layered SVG produced no engraving, score, or cut output.');
  const lines = [];
  if (raster) lines.push(...raster.lines);
  if (vector) lines.push(...vector.lines);
  const availableBounds = [raster?.bounds, vector?.bounds].filter(Boolean);
  const bounds = {
    minX: Math.min(...availableBounds.map((item) => item.minX)),
    minY: Math.min(...availableBounds.map((item) => item.minY)),
    maxX: Math.max(...availableBounds.map((item) => item.maxX)),
    maxY: Math.max(...availableBounds.map((item) => item.maxY)),
  };
  return {
    lines,
    bounds,
    segments: (raster?.segments || 0) + (vector?.segments || 0),
    sValue: Math.max(raster?.sValue || 0, vector?.sValue || 0),
    operationCounts: vector?.operationCounts || {},
  };
}
