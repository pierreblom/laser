function position(field) {
  if (!field) return null;
  const values = field.split(',').map(Number);
  return values.length >= 2 && values.every(Number.isFinite) ? { x: values[0], y: values[1] } : null;
}

export function parseGrblStatus(line, previousWco = null) {
  const match = /^<([^>]+)>$/.exec(line);
  if (!match) throw new Error('Invalid GRBL status report.');
  const fields = match[1].split('|');
  const parts = Object.fromEntries(fields.slice(1).map((field) => field.split(':', 2)).filter((entry) => entry.length === 2));
  const wco = position(parts.WCO) || previousWco;
  const machine = position(parts.MPos);
  const work = position(parts.WPos) || (machine && wco ? { x: machine.x - wco.x, y: machine.y - wco.y } : null);
  const overrides = parts.Ov?.split(',').map(Number);
  const spindleOverride = overrides?.length === 3 && overrides.every(Number.isFinite) ? overrides[2] : null;
  return { state: fields[0].split(':')[0], machine, work, wco, spindleOverride };
}

export function buildJogCommand({ dx, dy, distance, speed, position: current, travelX, travelY }) {
  if (![dx, dy].every((value) => [-1, 0, 1].includes(value)) || (!dx && !dy)) throw new Error('Invalid jog direction.');
  if (![1, 10, 50].includes(distance) || ![300, 800, 1500].includes(speed)) throw new Error('Invalid jog setting.');
  if (!current || ![current.x, current.y].every(Number.isFinite)) throw new Error('Work position is unknown. Refresh position first.');
  const maxX = Math.min(300, travelX || 300), maxY = Math.min(300, travelY || 300);
  const x = current.x + dx * distance, y = current.y + dy * distance;
  if (x < -0.001 || y < -0.001 || x > maxX + 0.001 || y > maxY + 0.001) {
    throw new Error(`Jog would leave the 0–${maxX} × 0–${maxY} mm work area.`);
  }
  return `$J=G21 G91${dx ? ` X${dx * distance}` : ''}${dy ? ` Y${dy * distance}` : ''} F${speed}`;
}

export function buildCenterJogCommand({ position: current, speed, travelX, travelY }) {
  if (![300, 800, 1500].includes(speed)) throw new Error('Invalid jog speed.');
  if (![travelX, travelY].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Work area limits are unavailable.');
  }
  if (!current || ![current.x, current.y].every(Number.isFinite)) {
    throw new Error('Work position is unknown. Refresh position first.');
  }
  const maxX = Math.min(300, travelX), maxY = Math.min(300, travelY);
  if (current.x < -0.001 || current.y < -0.001 || current.x > maxX + 0.001 || current.y > maxY + 0.001) {
    throw new Error('Work position is outside the reported work area. Check the origin before moving.');
  }
  const dx = Number((maxX / 2 - current.x).toFixed(3));
  const dy = Number((maxY / 2 - current.y).toFixed(3));
  if (dx === 0 && dy === 0) return null;
  return `$J=G21 G91${dx ? ` X${dx}` : ''}${dy ? ` Y${dy}` : ''} F${speed}`;
}

export function workZeroCommands() {
  return ['M5', 'G54', 'G92.1', 'G10 L20 P1 X0 Y0'];
}

export function hasStartupCommands(lines) {
  return lines.some((line) => /^\$N\d+=\S/.test(line));
}

export function spindleOverrideCommands(target) {
  if (!Number.isInteger(target) || target < 10 || target > 200 || target % 10 !== 0) {
    throw new Error('Enter 10–200 in steps of 10.');
  }
  const step = target >= 100 ? 0x9A : 0x9B;
  return [0x99, ...Array(Math.abs(target - 100) / 10).fill(step)];
}
