const fmt = (value) => Number(value.toFixed(3)).toString();

export function rasterToGcode({ pixels, width, height, stepMm, bedMm = 300, powerPercent,
  speedMmMin, passes, sMax, airAssist = false, originX = 0, originY = 0 }) {
  if (!(pixels instanceof Uint8Array) || pixels.length !== width * height) throw new Error('Invalid raster data.');
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) throw new Error('Invalid raster size.');
  if (!(stepMm >= 0.1 && stepMm <= 1)) throw new Error('Resolution must be 0.1–1 mm per pixel.');
  if (width * stepMm > bedMm + 0.001 || height * stepMm > bedMm + 0.001) throw new Error('Design exceeds the bed.');
  if (!(powerPercent > 0 && powerPercent <= 100)) throw new Error('Power must be between 1% and 100%.');
  if (!(speedMmMin >= 100 && speedMmMin <= 12000)) throw new Error('Speed must be 100–12000 mm/min.');
  if (!Number.isInteger(passes) || passes < 1 || passes > 10) throw new Error('Passes must be 1–10.');
  if (!(sMax > 0 && sMax <= 100000)) throw new Error('Enter the controller’s verified $30 maximum S value.');
  if (![originX, originY].every(Number.isFinite)) throw new Error('Jig origin is unavailable.');

  const sValue = Math.max(1, Math.round(sMax * powerPercent / 100));
  const lines = [
    '; Laser Link raster job',
    `; ${fmt(width * stepMm)} x ${fmt(height * stepMm)} mm, ${fmt(stepMm)} mm/pixel`,
    `; Power ${fmt(powerPercent)}%, feed ${fmt(speedMmMin)} mm/min, ${passes} pass(es)`,
    'G21', 'G90', 'G54', 'M5',
  ];
  let segments = 0;
  let blackPixels = 0;
  let minCol = width, maxCol = -1, minRow = height, maxRow = -1;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (!pixels[row * width + col]) continue;
      blackPixels++;
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
    }
  }
  if (!blackPixels) throw new Error('The workspace contains no dark pixels to engrave.');

  for (let pass = 0; pass < passes; pass++) {
    if (airAssist) lines.push('M8');
    lines.push('M4', `G1 F${fmt(speedMmMin)}`);
    for (let row = 0; row < height; row++) {
      const runs = [];
      let col = 0;
      while (col < width) {
        while (col < width && !pixels[row * width + col]) col++;
        if (col >= width) break;
        const start = col;
        while (col < width && pixels[row * width + col]) col++;
        runs.push([start, col]);
      }
      const y = fmt(originY + (height - row - 0.5) * stepMm);
      const reverse = row % 2 === 1;
      if (reverse) runs.reverse();
      for (const [start, end] of runs) {
        const x0 = fmt(originX + (reverse ? end : start) * stepMm);
        const x1 = fmt(originX + (reverse ? start : end) * stepMm);
        lines.push(`G0 X${x0} Y${y}`);
        lines.push(`G1 X${x1} Y${y} S${sValue}`);
        segments++;
      }
    }
    lines.push('M5');
    if (airAssist) lines.push('M9');
  }
  return { lines, segments, blackPixels, sValue, bounds: {
    minX: originX + minCol * stepMm,
    maxX: originX + (maxCol + 1) * stepMm,
    minY: originY + (height - maxRow - 1) * stepMm,
    maxY: originY + (height - minRow) * stepMm,
  } };
}
