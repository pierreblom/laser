import qrcode from 'qrcode-generator';
import JsBarcode from 'jsbarcode';
import { rasterToGcode } from './gcode.mjs';
import { hitResizeCorner, moveRotatedBounds, pointInRotatedRect, resizeFromCorner, rotatedBounds } from './geometry.mjs';
import { listLocalProjects, removeLocalProjects, saveLocalProject } from './project-store.mjs';
import { assertMachineBounds, collectContourPaths } from './alignment.mjs';
import { traceBinaryContours } from './contour-trace.mjs';
import { extractSvgContours } from './svg-contours.mjs';

const $ = (id) => document.getElementById(id);
const BED = 300;
const canvas = $('editorCanvas');
const rulerX = $('bedRulerX');
const rulerY = $('bedRulerY');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const imageCache = new Map();
const processedCache = new Map();
let project = { objects: [], selectedId: null, material: 'Unspecified', materialNote: '' };
let history = [];
let historyIndex = -1;
let drawMode = false;
let pointerAction = null;
let framePreview = false;
let machineSettings = null;
let renderQueued = false;
let rulerStep = 0;
let autosaveTimer = null;
let saveQueue = Promise.resolve();
let selectingProjects = false;
let preparedFingerprint = null;
let activeAlignment = { jig: null, origin: { x: 0, y: 0 }, measurement: null, outline: null };
const selectedProjectIds = new Set();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const selected = () => project.objects.find((object) => object.id === project.selectedId);
const hint = (message) => { $('editorHint').textContent = message; };

function snapshot() { return JSON.stringify(project); }
function jobFingerprint(parameters = project.parameters) {
  const current = parameters || {};
  return JSON.stringify({ objects: project.objects, jobName: current.jobName, power: current.power,
    speed: current.speed, passes: current.passes, airAssist: current.airAssist,
    sMax: current.sMax, resolution: current.resolution });
}
function invalidatePreparedJob(parameters = project.parameters) {
  if (!preparedFingerprint || preparedFingerprint === jobFingerprint(parameters)) return;
  preparedFingerprint = null;
  window.dispatchEvent(new CustomEvent('laserlink:job-invalidated'));
}
function commit() {
  invalidatePreparedJob();
  window.dispatchEvent(new Event('laserlink:design-changed'));
  history = history.slice(0, historyIndex + 1);
  history.push(snapshot());
  if (history.length > 30) history.shift();
  historyIndex = history.length - 1;
  $('undoEdit').disabled = historyIndex <= 0;
  $('redoEdit').disabled = historyIndex >= history.length - 1;
  scheduleAutosave();
}
function restore(index) {
  if (index < 0 || index >= history.length) return;
  historyIndex = index;
  project = JSON.parse(history[index]);
  invalidatePreparedJob();
  window.dispatchEvent(new Event('laserlink:design-changed'));
  processedCache.clear();
  $('materialSelect').value = project.material || 'Unspecified';
  $('materialNote').value = project.materialNote || '';
  syncSelection();
  render();
  $('undoEdit').disabled = historyIndex <= 0;
  $('redoEdit').disabled = historyIndex >= history.length - 1;
  scheduleAutosave();
}

async function ensureImage(object) {
  if (!object?.dataUrl) return null;
  if (imageCache.has(object.id)) return imageCache.get(object.id);
  return cacheImage(object);
}

function maskPath(context, shape, w, h) {
  context.beginPath();
  if (shape === 'circle') {
    context.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (shape === 'triangle') {
    context.moveTo(0, -h / 2); context.lineTo(w / 2, h / 2); context.lineTo(-w / 2, h / 2);
  } else if (shape === 'star') {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const radius = i % 2 ? 0.23 : 0.5;
      const x = Math.cos(a) * w * radius, y = Math.sin(a) * h * radius;
      if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
    }
  } else if (shape === 'heart') {
    context.moveTo(0, h * 0.43);
    context.bezierCurveTo(-w * 0.68, h * 0.05, -w * 0.47, -h * 0.48, 0, -h * 0.2);
    context.bezierCurveTo(w * 0.47, -h * 0.48, w * 0.68, h * 0.05, 0, h * 0.43);
  } else {
    context.rect(-w / 2, -h / 2, w, h);
  }
  context.closePath();
}

function processedImage(object, image) {
  const key = `${object.id}:${object.filter}:${object.brightness}:${object.contrast}:${JSON.stringify(object.crop)}`;
  if (processedCache.has(key)) return processedCache.get(key);
  const crop = object.crop || [0, 0, 0, 0];
  const sx = image.width * crop[0] / 100, sy = image.height * crop[1] / 100;
  const sw = Math.max(1, image.width * (100 - crop[0] - crop[2]) / 100);
  const sh = Math.max(1, image.height * (100 - crop[1] - crop[3]) / 100);
  const scale = Math.min(1, 1200 / Math.max(sw, sh));
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(sw * scale));
  out.height = Math.max(1, Math.round(sh * scale));
  const context = out.getContext('2d', { willReadFrequently: true });
  if (object.kind !== 'Text') { context.fillStyle = '#fff'; context.fillRect(0, 0, out.width, out.height); }
  context.drawImage(image, sx, sy, sw, sh, 0, 0, out.width, out.height);
  const imageData = context.getImageData(0, 0, out.width, out.height);
  const data = imageData.data;
  const gray = new Float32Array(out.width * out.height);
  const brightness = (object.brightness || 100) / 100;
  const contrast = (object.contrast || 100) / 100;
  for (let i = 0; i < gray.length; i++) {
    const offset = i * 4;
    const r = clamp((data[offset] - 128) * contrast + 128, 0, 255) * brightness;
    const g = clamp((data[offset + 1] - 128) * contrast + 128, 0, 255) * brightness;
    const b = clamp((data[offset + 2] - 128) * contrast + 128, 0, 255) * brightness;
    gray[i] = data[offset + 3] === 0 ? 255 : clamp(0.2126 * r + 0.7152 * g + 0.0722 * b, 0, 255);
    if (object.filter === 'original') {
      data[offset] = clamp(r, 0, 255); data[offset + 1] = clamp(g, 0, 255); data[offset + 2] = clamp(b, 0, 255);
    }
  }
  if (object.filter === 'dither') {
    for (let y = 0; y < out.height; y++) {
      for (let x = 0; x < out.width; x++) {
        const i = y * out.width + x;
        const old = gray[i], next = old < 128 ? 0 : 255, error = old - next;
        gray[i] = next;
        if (x + 1 < out.width) gray[i + 1] += error * 7 / 16;
        if (y + 1 < out.height) {
          if (x > 0) gray[i + out.width - 1] += error * 3 / 16;
          gray[i + out.width] += error * 5 / 16;
          if (x + 1 < out.width) gray[i + out.width + 1] += error / 16;
        }
      }
    }
  }
  if (object.filter !== 'original') {
    for (let i = 0; i < gray.length; i++) {
      let value = gray[i];
      if (object.filter === 'strong') value = value < 145 ? 0 : 255;
      if (object.filter === 'sketch') {
        const x = i % out.width, y = Math.floor(i / out.width);
        const edge = Math.abs(value - gray[y * out.width + Math.min(out.width - 1, x + 1)]) +
          Math.abs(value - gray[Math.min(out.height - 1, y + 1) * out.width + x]);
        value = edge > 35 ? 0 : 255;
      }
      const offset = i * 4;
      data[offset] = data[offset + 1] = data[offset + 2] = clamp(value, 0, 255);
      // Keep text's transparent background transparent after filtering.
    }
  }
  context.putImageData(imageData, 0, 0);
  processedCache.set(key, out);
  return out;
}

function drawScene(context, size, { grid = false, selection = false } = {}) {
  const scale = size / BED;
  context.clearRect(0, 0, size, size);
  context.fillStyle = '#fff'; context.fillRect(0, 0, size, size);
  if (grid) {
    const displaySize = canvas.getBoundingClientRect().width || size;
    const pixelRatio = size / displaySize;
    context.save();
    for (let mm = 0; mm <= BED; mm += 10) {
      const major = mm % 100 === 0;
      const middle = mm % 50 === 0;
      context.strokeStyle = major ? '#9ca9a4' : middle ? '#c9d3ce' : '#e7ece9';
      context.lineWidth = (major ? 1.1 : middle ? 0.8 : 0.5) * pixelRatio;
      const p = mm === 0 ? context.lineWidth / 2 : mm === BED ? size - context.lineWidth / 2 : mm * scale;
      context.beginPath(); context.moveTo(p, 0); context.lineTo(p, size); context.stroke();
      context.beginPath(); context.moveTo(0, p); context.lineTo(size, p); context.stroke();
    }
    context.restore();
  }
  const capturedOutline = grid ? activeAlignment.outline : null;
  if (capturedOutline?.closed && capturedOutline.points.length >= 3) {
    context.save();
    context.beginPath();
    capturedOutline.points.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x * scale, (BED - point.y) * scale);
      else context.lineTo(point.x * scale, (BED - point.y) * scale);
    });
    context.closePath();
    context.fillStyle = 'rgba(123, 65, 194, 0.13)';
    context.fill();
    context.restore();
  }
  for (const object of project.objects) {
    const centerX = (object.x + object.w / 2) * scale;
    const centerY = (BED - object.y - object.h / 2) * scale;
    context.save();
    context.translate(centerX, centerY);
    context.rotate(-(object.rotation || 0) * Math.PI / 180);
    context.scale(object.flipX ? -1 : 1, object.flipY ? -1 : 1);
    if (object.type === 'path') {
      context.beginPath();
      for (const [index, point] of object.points.entries()) {
        const x = (point[0] / object.sourceW - 0.5) * object.w * scale;
        const y = (point[1] / object.sourceH - 0.5) * object.h * scale;
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.strokeStyle = '#000'; context.lineWidth = Math.max(1, (object.stroke || 1) * scale);
      context.lineCap = 'round'; context.lineJoin = 'round'; context.stroke();
    } else {
      const imagePromise = imageCache.get(object.id);
      const image = imagePromise?.image;
      if (image?.complete && image.naturalWidth) {
        maskPath(context, object.mask || 'rectangle', object.w * scale, object.h * scale);
        context.clip();
        const processed = processedImage(object, image);
        context.drawImage(processed, -object.w * scale / 2, -object.h * scale / 2, object.w * scale, object.h * scale);
      } else if (object.dataUrl) ensureImage(object).catch((error) => hint(error.message));
    }
    context.restore();
  }
  if (grid) {
    const middle = size / 2;
    context.save();
    context.setLineDash([Math.max(7, scale * 3), Math.max(5, scale * 2)]);
    context.strokeStyle = 'rgba(16, 113, 83, 0.85)';
    context.lineWidth = Math.max(1.5, scale * 0.55);
    context.beginPath();
    context.moveTo(middle, 0); context.lineTo(middle, size);
    context.moveTo(0, middle); context.lineTo(size, middle);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = '#fff';
    context.beginPath(); context.arc(middle, middle, Math.max(6, scale * 2.5), 0, Math.PI * 2); context.fill();
    context.strokeStyle = '#107153'; context.lineWidth = 2;
    context.stroke();
    context.fillStyle = '#107153';
    context.beginPath(); context.arc(middle, middle, Math.max(2.5, scale), 0, Math.PI * 2); context.fill();
    context.restore();
  }
  if (selection) {
    if (capturedOutline?.points.length) {
      context.save();
      context.beginPath();
      capturedOutline.points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x * scale, (BED - point.y) * scale);
        else context.lineTo(point.x * scale, (BED - point.y) * scale);
      });
      if (capturedOutline.closed) context.closePath();
      context.setLineDash(capturedOutline.closed ? [] : [7, 4]);
      context.strokeStyle = '#7b41c2'; context.lineWidth = 3;
      context.stroke(); context.setLineDash([]);
      for (const [index, point] of capturedOutline.points.entries()) {
        context.beginPath(); context.arc(point.x * scale, (BED - point.y) * scale, 4, 0, Math.PI * 2);
        context.fillStyle = index === 0 ? '#e9498b' : '#7b41c2'; context.fill();
        context.strokeStyle = '#fff'; context.lineWidth = 1; context.stroke();
      }
      context.restore();
    }
    if (activeAlignment.jig) {
      context.save(); context.setLineDash([9, 5]); context.strokeStyle = '#4270c8'; context.lineWidth = 2;
      context.strokeRect(0, (BED - activeAlignment.jig.max_height) * scale,
        activeAlignment.jig.max_width * scale, activeAlignment.jig.max_height * scale);
      context.restore();
    }
    if (activeAlignment.measurement) {
      const b = activeAlignment.measurement;
      context.save(); context.setLineDash([6, 4]); context.strokeStyle = '#d56932'; context.lineWidth = 3;
      context.strokeRect(b.minX * scale, (BED - b.maxY) * scale,
        (b.maxX - b.minX) * scale, (b.maxY - b.minY) * scale);
      context.restore();
    }
    if (pointerAction?.type === 'draw') {
      context.beginPath();
      pointerAction.points.forEach((point, index) => {
        const x = point.x * scale, y = (BED - point.y) * scale;
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
      });
      context.strokeStyle = '#121719';
      context.lineWidth = Math.max(1, Number($('drawWidth').value || 1) * scale);
      context.lineCap = 'round'; context.lineJoin = 'round'; context.stroke();
    }
    const object = selected();
    if (object) {
      const centerX = (object.x + object.w / 2) * scale;
      const centerY = (BED - object.y - object.h / 2) * scale;
      context.save();
      context.translate(centerX, centerY);
      context.rotate(-(object.rotation || 0) * Math.PI / 180);
      context.strokeStyle = '#30ad77'; context.lineWidth = 2;
      context.strokeRect(-object.w * scale / 2, -object.h * scale / 2, object.w * scale, object.h * scale);
      for (const x of [-object.w * scale / 2, object.w * scale / 2]) {
        for (const y of [-object.h * scale / 2, object.h * scale / 2]) {
          context.fillStyle = '#fff'; context.beginPath(); context.arc(x, y, 8, 0, Math.PI * 2);
          context.fill(); context.stroke();
        }
      }
      context.restore();
    }
    if (framePreview) {
      const bounds = objectBounds();
      if (bounds) {
        context.save(); context.setLineDash([8, 5]); context.strokeStyle = '#e98155'; context.lineWidth = 3;
        context.strokeRect(bounds.minX * scale, (BED - bounds.maxY) * scale,
          (bounds.maxX - bounds.minX) * scale, (bounds.maxY - bounds.minY) * scale);
        context.restore();
      }
    }
  }
}

function render() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; drawScene(ctx, canvas.width, { grid: true, selection: true }); });
}

function updateRulers(displayWidth) {
  const step = displayWidth >= 580 ? 10 : displayWidth >= 360 ? 20 : 50;
  const hideNextToEnd = step * displayWidth / BED < 36;
  if (rulerStep === `${step}:${hideNextToEnd}`) return;
  rulerStep = `${step}:${hideNextToEnd}`;
  const xLabels = [], yLabels = [];
  for (let mm = 0; mm <= BED; mm += step) {
    if (!(hideNextToEnd && mm === BED - step)) {
      const xLabel = document.createElement('span');
      xLabel.className = `ruler-label${mm % 100 === 0 ? ' major' : ''}`;
      xLabel.textContent = String(mm);
      xLabel.style.left = `${mm / BED * 100}%`;
      xLabels.push(xLabel);
    }
    const yLabel = document.createElement('span');
    yLabel.className = `ruler-label${mm % 100 === 0 ? ' major' : ''}`;
    yLabel.textContent = String(mm);
    yLabel.style.top = `${(BED - mm) / BED * 100}%`;
    yLabels.push(yLabel);
  }
  rulerX.replaceChildren(...xLabels);
  rulerY.replaceChildren(...yLabels);
}

function fitCanvasResolution() {
  const displayWidth = canvas.getBoundingClientRect().width;
  if (!displayWidth) return;
  updateRulers(displayWidth);
  const target = Math.max(900, Math.min(2000, Math.round(displayWidth * (window.devicePixelRatio || 1))));
  if (canvas.width !== target) canvas.width = canvas.height = target;
  render();
}

function cacheImage(object) {
  const image = new Image();
  const promise = new Promise((resolve, reject) => {
    image.onload = () => { promise.image = image; render(); resolve(image); };
    image.onerror = () => reject(new Error('Image could not be decoded.'));
  });
  imageCache.set(object.id, promise);
  image.src = object.dataUrl;
  return promise;
}

function projectCard(record, selectable) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'project-card';
  button.setAttribute('aria-pressed', String(selectable && selectingProjects && selectedProjectIds.has(record.id)));
  const thumb = document.createElement('div'); thumb.className = 'project-thumb';
  if (record.thumb) {
    const image = document.createElement('img'); image.src = record.thumb; image.alt = '';
    thumb.append(image);
  } else {
    const empty = document.createElement('span'); empty.textContent = 'No preview'; thumb.append(empty);
  }
  const meta = document.createElement('div'); meta.className = 'project-card-meta';
  const title = document.createElement('strong'); title.textContent = record.title || 'Untitled project';
  const sub = document.createElement('small');
  const count = record.objectCount || 0;
  sub.textContent = `${count} ${count === 1 ? 'object' : 'objects'} · ${new Date(record.updatedAt).toLocaleDateString()}`;
  meta.append(title, sub); button.append(thumb, meta);
  if (selectable && selectingProjects) {
    const check = document.createElement('span'); check.className = 'project-check';
    check.textContent = selectedProjectIds.has(record.id) ? '✓' : '○'; button.append(check);
  }
  button.addEventListener('click', () => {
    if (selectable && selectingProjects) {
      if (selectedProjectIds.has(record.id)) selectedProjectIds.delete(record.id);
      else selectedProjectIds.add(record.id);
      renderProjects();
    } else {
      try { acceptProject(record.data, record.title || 'project'); }
      catch (error) { $('projectsStatus').textContent = `Could not open project: ${error.message}`; return; }
      window.dispatchEvent(new Event('laserlink:show-create'));
    }
  });
  return button;
}

async function renderProjects() {
  try {
    const records = await listLocalProjects();
    const recent = $('recentProjectsGrid'), grid = $('projectsGrid');
    recent.replaceChildren(); grid.replaceChildren();
    if (!records.length) {
      const message = document.createElement('p'); message.textContent = 'No recent projects yet. Add artwork to save one in this browser.';
      recent.append(message);
      const empty = document.createElement('p'); empty.textContent = 'No saved projects yet. Create a design to start your local gallery.';
      grid.append(empty);
    } else {
      for (const record of records.slice(0, 4)) recent.append(projectCard(record, false));
      for (const record of records) grid.append(projectCard(record, true));
    }
    $('deleteProjects').hidden = !selectingProjects;
    $('deleteProjects').disabled = !selectedProjectIds.size;
    $('selectProjects').textContent = selectingProjects ? 'Cancel selection' : 'Select';
  } catch (error) {
    $('projectsStatus').textContent = `Project gallery unavailable: ${error.message}`;
  }
}

function scheduleAutosave() {
  if (!project.objects.length && history.length <= 1) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    saveQueue = saveQueue.then(async () => {
      const id = project.id;
      await Promise.all(project.objects.filter((object) => object.type === 'image').map(ensureImage));
      if (project.id !== id) return;
      const thumbnail = document.createElement('canvas'); thumbnail.width = thumbnail.height = 300;
      drawScene(thumbnail.getContext('2d'), 300);
      const data = JSON.parse(snapshot());
      await saveLocalProject({ id, title: data.parameters?.jobName?.replace(/\.nc$/i, '') || 'Untitled project',
        objectCount: data.objects.length, updatedAt: Date.now(), thumb: thumbnail.toDataURL('image/jpeg', 0.75), data });
      await renderProjects();
    }).catch((error) => { $('projectsStatus').textContent = `Autosave unavailable: ${error.message}`; });
  }, 400);
}

function addObject(object) {
  project.objects.push(object);
  project.selectedId = object.id;
  framePreview = false;
  if (object.dataUrl) cacheImage(object).catch((error) => hint(error.message));
  syncSelection(); commit(); render();
}

function objectBounds() {
  if (!project.objects.length) return null;
  return project.objects.reduce((result, object) => {
    const margin = object.type === 'path' ? (object.stroke || 1) / 2 : 0;
    const bounds = rotatedBounds(object, margin);
    result.minX = Math.min(result.minX, bounds.minX); result.maxX = Math.max(result.maxX, bounds.maxX);
    result.minY = Math.min(result.minY, bounds.minY); result.maxY = Math.max(result.maxY, bounds.maxY);
    return result;
  }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
}

function syncSelection() {
  const object = selected();
  const margin = object?.type === 'path' ? (object.stroke || 1) / 2 : 0;
  const bounds = object ? rotatedBounds(object, margin) : null;
  $('selectedSummary').textContent = object
    ? `${object.kind || 'Artwork'} · ${object.w.toFixed(1)} × ${object.h.toFixed(1)} mm artwork` +
      (object.rotation ? ` · occupies ${bounds.width.toFixed(1)} × ${bounds.height.toFixed(1)} mm` : '')
    : 'Select an object on the grid to position it.';
  for (const [id, key] of [['objectX', 'x'], ['objectY', 'y'], ['objectW', 'w'], ['objectH', 'h'], ['objectRotation', 'rotation']]) {
    $(id).disabled = !object;
    const value = key === 'x' ? bounds?.minX : key === 'y' ? bounds?.minY : object?.[key];
    $(id).value = object ? (Math.abs(value || 0) < 0.05 ? 0 : value).toFixed(key === 'rotation' ? 0 : 1) : '';
  }
  for (const id of ['flipHorizontal', 'flipVertical', 'deleteObject']) $(id).disabled = !object;
  if (object?.type === 'image') {
    $('brightnessInput').value = object.brightness || 100;
    $('contrastInput').value = object.contrast || 100;
    $('brightnessValue').value = `${$('brightnessInput').value}%`;
    $('contrastValue').value = `${$('contrastInput').value}%`;
    $('maskShape').value = object.mask || 'rectangle';
    for (const [i, id] of ['cropLeft', 'cropTop', 'cropRight', 'cropBottom'].entries()) $(id).value = object.crop?.[i] || 0;
    document.querySelectorAll('[data-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === (object.filter || 'original'))));
  }
}

async function addPictureFile(file) {
  if (!file) return;
  const svg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
  const supported = svg || ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type);
  if (!supported || file.size > 12 * 1024 * 1024) {
    hint('Choose an SVG, PNG, JPEG, WebP, or GIF under 12 MB.');
    return;
  }
  try {
    let svgBlob = file, svgRoot = null;
    if (svg) {
      const source = await file.text();
      const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
      if (parsed.querySelector('parsererror') || parsed.documentElement.localName !== 'svg' ||
        /<!DOCTYPE|<script\b|<foreignObject\b|\bon[a-z]+\s*=|\b(?:href|xlink:href)\s*=\s*["'](?:https?:|data:|javascript:)/i.test(source)) {
        throw new Error('SVG contains unsupported active or external content. Export it as a plain SVG or PNG.');
      }
      const root = parsed.documentElement;
      svgRoot = root;
      const viewBox = root.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
      if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0 &&
        (!root.hasAttribute('width') || !root.hasAttribute('height') ||
          root.getAttribute('width').includes('%') || root.getAttribute('height').includes('%'))) {
        root.setAttribute('width', String(viewBox[2]));
        root.setAttribute('height', String(viewBox[3]));
      }
      svgBlob = new Blob([new XMLSerializer().serializeToString(root)], { type: 'image/svg+xml' });
    }
    let bitmap;
    if (svg) {
      const url = URL.createObjectURL(svgBlob);
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        bitmap = image;
      } finally { URL.revokeObjectURL(url); }
    } else bitmap = await createImageBitmap(file);
    const sourceWidth = bitmap.width || bitmap.naturalWidth;
    const sourceHeight = bitmap.height || bitmap.naturalHeight;
    if (!sourceWidth || !sourceHeight || Math.max(sourceWidth, sourceHeight) > 20000) {
      bitmap.close?.();
      throw new Error('Image dimensions are missing or too large.');
    }
    const scale = Math.min(1, 1600 / Math.max(sourceWidth, sourceHeight));
    const asset = document.createElement('canvas');
    asset.width = Math.max(1, Math.round(sourceWidth * scale));
    asset.height = Math.max(1, Math.round(sourceHeight * scale));
    const imageContext = asset.getContext('2d');
    imageContext.fillStyle = '#fff'; imageContext.fillRect(0, 0, asset.width, asset.height);
    imageContext.drawImage(bitmap, 0, 0, asset.width, asset.height);
    bitmap.close?.();
    const width = Math.min(120, 120 * asset.width / Math.max(asset.width, asset.height));
    const height = Math.min(120, 120 * asset.height / Math.max(asset.width, asset.height));
    let contours = null, contourNote = '';
    if (svgRoot) {
      try {
        const result = extractSvgContours(svgRoot, sourceWidth, sourceHeight);
        contours = result.skipped ? null : result.contours;
        contourNote = result.skipped ? ` This SVG has ${result.skipped} unsupported shape(s), so contour tracing is unavailable for it.` : '';
      } catch (error) { contourNote = ` Contour tracing unavailable: ${error.message}`; }
    }
    addObject({ id: uid(), type: 'image', kind: 'Picture', dataUrl: asset.toDataURL('image/png'),
      contours,
      x: (BED - width) / 2, y: (BED - height) / 2, w: width, h: height,
      rotation: 0, flipX: false, flipY: false, filter: 'original', brightness: 100,
      contrast: 100, crop: [0, 0, 0, 0], mask: 'rectangle' });
    hint(`Imported ${file.name}${svg ? ' and retained supported contours for tracing' : ''}. Drag the image to move it, or drag a green corner to resize it.${contourNote}`);
  } catch (error) { hint(`Picture import failed: ${error.message}`); }
}

function addTextObject() {
  const content = $('textContent').value.trim();
  const sizeMm = Number($('textSize').value);
  if (!content || !Number.isFinite(sizeMm) || sizeMm < 2 || sizeMm > 60) {
    hint('Enter text and a height between 2 and 60 mm.'); return;
  }
  const asset = document.createElement('canvas');
  const context = asset.getContext('2d');
  context.font = 'bold 96px Arial, sans-serif';
  asset.width = Math.min(4000, Math.ceil(context.measureText(content).width + 28));
  asset.height = 132;
  context.font = 'bold 96px Arial, sans-serif';
  context.fillStyle = '#000'; context.textBaseline = 'middle';
  context.fillText(content, 14, 66);
  const width = Math.min(280, sizeMm * asset.width / 100);
  const height = Math.min(75, sizeMm * asset.height / 100);
  addObject({ id: uid(), type: 'image', kind: 'Text', dataUrl: asset.toDataURL('image/png'),
    x: (BED - width) / 2, y: (BED - height) / 2, w: width, h: height, rotation: 0,
    flipX: false, flipY: false, filter: 'original', brightness: 100, contrast: 100,
    crop: [0, 0, 0, 0], mask: 'rectangle' });
  hint('Text added. Adjust its size and location on the right.');
}

function qrContent() {
  const type = $('qrType').value;
  if (type === 'wifi') {
    const ssid = $('wifiName').value.trim(), password = $('wifiPassword').value;
    if (!ssid) throw new Error('Enter the Wi-Fi network name.');
    const escape = (value) => value.replace(/[\\;,:]/g, '\\$&');
    return `WIFI:T:WPA;S:${escape(ssid)};P:${escape(password)};;`;
  }
  if (type === 'vcard') {
    const name = $('cardName').value.trim();
    if (!name) throw new Error('Enter a business card name.');
    const safe = (value) => value.replace(/[\r\n]/g, ' ').trim();
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${safe(name)}\nTEL:${safe($('cardPhone').value)}\nEMAIL:${safe($('cardEmail').value)}\nEND:VCARD`;
  }
  const value = $('qrValue').value.trim();
  if (!value) throw new Error('Enter text or a URL.');
  if (type === 'url' && !/^https?:\/\//i.test(value)) throw new Error('URL must start with http:// or https://.');
  return value;
}

function addCodeObject() {
  try {
    let asset, kind, width, height;
    if ($('codeFamily').value === 'qr') {
      const content = qrContent();
      if (content.length > 1000) throw new Error('QR content must be under 1000 characters.');
      qrcode.stringToBytes = (value) => Array.from(new TextEncoder().encode(value));
      const code = qrcode(0, 'M');
      code.addData(content); code.make();
      const count = code.getModuleCount(), cell = 8, quiet = 4;
      asset = document.createElement('canvas');
      asset.width = asset.height = (count + quiet * 2) * cell;
      const context = asset.getContext('2d');
      context.fillStyle = '#fff'; context.fillRect(0, 0, asset.width, asset.height);
      context.fillStyle = '#000';
      for (let row = 0; row < count; row++) for (let col = 0; col < count; col++) {
        if (code.isDark(row, col)) context.fillRect((col + quiet) * cell, (row + quiet) * cell, cell, cell);
      }
      kind = 'QR code'; width = height = 55;
    } else {
      const value = $('barcodeValue').value.trim();
      if (!value) throw new Error('Enter a barcode value.');
      asset = document.createElement('canvas');
      JsBarcode(asset, value, { format: $('barcodeType').value, displayValue: false,
        width: 3, height: 130, margin: 20, lineColor: '#000', background: '#fff' });
      kind = `${$('barcodeType').value} barcode`; width = 90; height = 90 * asset.height / asset.width;
    }
    addObject({ id: uid(), type: 'image', kind, dataUrl: asset.toDataURL('image/png'),
      x: (BED - width) / 2, y: (BED - height) / 2, w: width, h: height,
      rotation: 0, flipX: false, flipY: false, filter: 'original', brightness: 100,
      contrast: 100, crop: [0, 0, 0, 0], mask: 'rectangle' });
    hint(`${kind} added. Keep its size large enough for reliable scanning.`);
  } catch (error) { hint(`Code generation failed: ${error.message || error}`); }
}

function pointerToMm(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: clamp((event.clientX - rect.left) / rect.width * BED, 0, BED),
    y: clamp(BED - (event.clientY - rect.top) / rect.height * BED, 0, BED) };
}
function hitObject(point) {
  return [...project.objects].reverse().find((object) => pointInRotatedRect(point, object));
}

function resizeHandleAt(point) {
  const rect = canvas.getBoundingClientRect();
  return hitResizeCorner(point, selected(), 15 / rect.width * BED);
}

canvas.addEventListener('pointerdown', (event) => {
  const point = pointerToMm(event);
  if (drawMode) {
    pointerAction = { type: 'draw', points: [point] };
    canvas.setPointerCapture(event.pointerId);
    return;
  }
  const handle = resizeHandleAt(point);
  if (handle) {
    const object = selected();
    pointerAction = { type: 'resize', original: { ...object }, corner: handle, changed: false };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = handle === 'topLeft' || handle === 'bottomRight' ? 'nwse-resize' : 'nesw-resize';
    return;
  }
  const object = hitObject(point);
  project.selectedId = object?.id || null;
  pointerAction = object ? { type: 'drag', start: point, x: object.x, y: object.y, changed: false } : null;
  if (pointerAction) canvas.setPointerCapture(event.pointerId);
  syncSelection(); render();
});
canvas.addEventListener('pointermove', (event) => {
  const point = pointerToMm(event);
  if (!pointerAction) {
    const handle = drawMode ? null : resizeHandleAt(point);
    canvas.style.cursor = handle
      ? handle === 'topLeft' || handle === 'bottomRight' ? 'nwse-resize' : 'nesw-resize'
      : drawMode ? 'crosshair' : hitObject(point) ? 'move' : 'crosshair';
    return;
  }
  if (pointerAction.type === 'draw') {
    pointerAction.points.push(point); render();
  } else if (pointerAction.type === 'resize') {
    const object = selected();
    if (!object) return;
    const next = resizeFromCorner(pointerAction.original, pointerAction.corner, point, BED);
    pointerAction.changed ||= ['x', 'y', 'w', 'h'].some((key) => Math.abs(next[key] - pointerAction.original[key]) > 0.001);
    Object.assign(object, next);
    syncSelection(); render();
  } else {
    const object = selected();
    if (!object) return;
    const original = { ...object, x: pointerAction.x, y: pointerAction.y };
    const margin = object.type === 'path' ? (object.stroke || 1) / 2 : 0;
    const bounds = rotatedBounds(original, margin);
    const position = moveRotatedBounds(original,
      bounds.minX + point.x - pointerAction.start.x,
      bounds.minY + point.y - pointerAction.start.y, BED, margin);
    object.x = position.x; object.y = position.y;
    pointerAction.changed ||= Math.abs(object.x - pointerAction.x) > 0.001 || Math.abs(object.y - pointerAction.y) > 0.001;
    syncSelection(); render();
  }
});
canvas.addEventListener('pointerup', () => {
  if (!pointerAction) return;
  if (pointerAction.type === 'draw') {
    const points = pointerAction.points;
    if (points.length === 1) points.push({ x: Math.min(BED, points[0].x + 0.2), y: points[0].y });
    const minX = Math.min(...points.map((p) => p.x)), maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y)), maxY = Math.max(...points.map((p) => p.y));
    const w = Math.max(0.2, maxX - minX), h = Math.max(0.2, maxY - minY);
    addObject({ id: uid(), type: 'path', kind: 'Drawing', x: minX, y: minY, w, h,
      sourceW: w, sourceH: h, points: points.map((p) => [p.x - minX, maxY - p.y]),
      stroke: Number($('drawWidth').value) || 1, rotation: 0, flipX: false, flipY: false });
  } else if (pointerAction.changed) commit();
  pointerAction = null;
  canvas.style.cursor = 'crosshair';
});
canvas.addEventListener('pointercancel', () => {
  if (pointerAction?.type === 'resize') {
    const object = selected();
    if (object) { Object.assign(object, pointerAction.original); syncSelection(); render(); }
  } else if (pointerAction?.type === 'drag') {
    const object = selected();
    if (object) { object.x = pointerAction.x; object.y = pointerAction.y; syncSelection(); render(); }
  }
  pointerAction = null;
  canvas.style.cursor = 'crosshair';
});

document.querySelectorAll('[data-tool]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-tool]').forEach((item) => item.setAttribute('aria-selected', String(item === button)));
  document.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== button.dataset.tool; });
}));
$('addPicture').addEventListener('click', () => $('pictureInput').click());
$('pictureInput').addEventListener('change', () => { addPictureFile($('pictureInput').files?.[0]); $('pictureInput').value = ''; });
$('addText').addEventListener('click', addTextObject);
$('addCode').addEventListener('click', addCodeObject);
$('codeFamily').addEventListener('change', () => { $('qrFields').hidden = $('codeFamily').value !== 'qr'; $('barcodeFields').hidden = $('codeFamily').value !== 'barcode'; });
$('qrType').addEventListener('change', () => {
  $('qrValueLabel').hidden = ['wifi', 'vcard'].includes($('qrType').value);
  $('qrValue').hidden = ['wifi', 'vcard'].includes($('qrType').value);
  $('wifiFields').hidden = $('qrType').value !== 'wifi';
  $('vcardFields').hidden = $('qrType').value !== 'vcard';
});
$('drawToggle').addEventListener('click', () => {
  drawMode = !drawMode; $('drawToggle').setAttribute('aria-pressed', String(drawMode));
  $('drawToggle').textContent = drawMode ? 'Stop drawing' : 'Start drawing';
  hint(drawMode ? 'Drag on the grid to draw. Click Stop drawing to select objects again.' : 'Drawing stopped.');
});
$('materialSelect').addEventListener('change', () => { project.material = $('materialSelect').value; commit(); });
$('materialNote').addEventListener('change', () => { project.materialNote = $('materialNote').value; commit(); });

document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  const object = selected(); if (!object || object.type !== 'image') { hint('Select a picture or code first.'); return; }
  object.filter = button.dataset.filter; processedCache.clear(); syncSelection(); commit(); render();
}));
for (const [id, key, output] of [['brightnessInput', 'brightness', 'brightnessValue'], ['contrastInput', 'contrast', 'contrastValue']]) {
  $(id).addEventListener('input', () => {
    $(output).value = `${$(id).value}%`;
    const object = selected(); if (!object || object.type !== 'image') return;
    object[key] = Number($(id).value); processedCache.clear(); render();
  });
  $(id).addEventListener('change', () => { if (selected()) commit(); });
}
for (const id of ['cropLeft', 'cropTop', 'cropRight', 'cropBottom']) $(id).addEventListener('change', () => {
  const object = selected(); if (!object || object.type !== 'image') return;
  const values = ['cropLeft', 'cropTop', 'cropRight', 'cropBottom'].map((key) => clamp(Number($(key).value) || 0, 0, 80));
  if (values[0] + values[2] >= 95 || values[1] + values[3] >= 95) { hint('Crop must leave at least 5% of the picture.'); syncSelection(); return; }
  object.crop = values; processedCache.clear(); commit(); render();
});
$('maskShape').addEventListener('change', () => {
  const object = selected(); if (!object || object.type !== 'image') return;
  object.mask = $('maskShape').value; commit(); render();
});
for (const [id, key] of [['objectX', 'x'], ['objectY', 'y'], ['objectW', 'w'], ['objectH', 'h'], ['objectRotation', 'rotation']]) $(id).addEventListener('change', () => {
  const object = selected(); if (!object) return;
  const value = Number($(id).value);
  if (!Number.isFinite(value)) { syncSelection(); return; }
  const before = { ...object };
  const margin = object.type === 'path' ? (object.stroke || 1) / 2 : 0;
  try {
    if (key === 'x' || key === 'y') {
      const bounds = rotatedBounds(object, margin);
      Object.assign(object, moveRotatedBounds(object,
        key === 'x' ? value : bounds.minX, key === 'y' ? value : bounds.minY, BED, margin));
    } else {
      object[key] = key === 'rotation' ? clamp(value, -180, 180) : clamp(value, 0.2, BED);
      const bounds = rotatedBounds(object, margin);
      Object.assign(object, moveRotatedBounds(object, bounds.minX, bounds.minY, BED, margin));
    }
  } catch (error) { Object.assign(object, before); hint(error.message); syncSelection(); return; }
  syncSelection(); commit(); render();
});
$('flipHorizontal').addEventListener('click', () => { const object = selected(); if (object) { object.flipX = !object.flipX; commit(); render(); } });
$('flipVertical').addEventListener('click', () => { const object = selected(); if (object) { object.flipY = !object.flipY; commit(); render(); } });
$('deleteObject').addEventListener('click', () => {
  if (!selected()) return;
  project.objects = project.objects.filter((object) => object.id !== project.selectedId);
  project.selectedId = null; syncSelection(); commit(); render();
});
$('undoEdit').addEventListener('click', () => restore(historyIndex - 1));
$('redoEdit').addEventListener('click', () => restore(historyIndex + 1));

function download(name, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function safeName(value, fallback) {
  return String(value || fallback).replace(/[^a-z0-9._-]+/gi, '-').slice(0, 80) || fallback;
}
function validProjectObject(object) {
  if (!object || typeof object !== 'object' || !['image', 'path'].includes(object.type) ||
    typeof object.id !== 'string' || object.id.length > 100 ||
    ![object.x, object.y, object.w, object.h, object.rotation || 0].every(Number.isFinite) ||
    object.w <= 0 || object.h <= 0 ||
    Math.abs(object.rotation || 0) > 180) return false;
  const margin = object.type === 'path' ? (object.stroke || 1) / 2 : 0;
  const bounds = rotatedBounds(object, margin);
  if (bounds.minX < -0.001 || bounds.minY < -0.001 ||
      bounds.maxX > BED + 0.001 || bounds.maxY > BED + 0.001) return false;
  if (object.type === 'image') {
    return typeof object.dataUrl === 'string' && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(object.dataUrl) &&
      (!object.contours || (Array.isArray(object.contours) && object.contours.length <= 1000 &&
        object.contours.reduce((count, path) => count + (Array.isArray(path) ? path.length : 12001), 0) <= 12000 &&
        object.contours.every((path) => Array.isArray(path) && path.length >= 2 &&
          path.every((point) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite))))) &&
      (!object.crop || (Array.isArray(object.crop) && object.crop.length === 4 &&
        object.crop.every((value) => Number.isFinite(value) && value >= 0 && value <= 80) &&
        object.crop[0] + object.crop[2] < 95 && object.crop[1] + object.crop[3] < 95));
  }
  return Array.isArray(object.points) && object.points.length >= 2 && object.points.length <= 50000 &&
    [object.sourceW, object.sourceH, object.stroke].every((value) => Number.isFinite(value) && value > 0) &&
    object.points.every((point) => Array.isArray(point) && point.length === 2 &&
      point.every(Number.isFinite));
}
function freshProject() {
  return { version: 1, id: uid(), objects: [], selectedId: null, material: 'Unspecified', materialNote: '',
    parameters: { power: 5, speed: 1000, passes: 1, framePower: 5, airAssist: false,
      sMax: 1000, resolution: 0.3, jobName: 'laser-link-job.nc' } };
}
$('newProject').addEventListener('click', () => {
  if (project.objects.length && !window.confirm('Start a new design? Save this project first if you want to keep it.')) return;
  project = freshProject(); imageCache.clear(); processedCache.clear();
  history = []; historyIndex = -1; framePreview = false;
  syncSelection(); commit(); render(); hint('New 300 × 300 mm project ready.');
});
$('saveProject').addEventListener('click', () => {
  const name = safeName(project.parameters?.jobName?.replace(/\.nc$/i, ''), 'laser-link-project');
  download(`${name}.laserlink.json`, JSON.stringify(project, null, 2), 'application/json');
  hint('Project saved as a local JSON file, including imported artwork.');
});
$('openProject').addEventListener('click', () => $('projectInput').click());
function acceptProject(loaded, label) {
  if (loaded.version !== 1 || !Array.isArray(loaded.objects) || loaded.objects.length > 100 ||
    loaded.objects.some((object) => !validProjectObject(object))) {
    throw new Error('This is not a supported Laser Link project.');
  }
  clearTimeout(autosaveTimer);
  project = { ...freshProject(), ...loaded, id: typeof loaded.id === 'string' && loaded.id.length < 100 ? loaded.id : uid(),
    parameters: { ...freshProject().parameters, ...(loaded.parameters || {}) } };
  imageCache.clear(); processedCache.clear(); history = []; historyIndex = -1;
  project.selectedId = null;
  $('materialSelect').value = project.material;
  $('materialNote').value = project.materialNote || '';
  syncSelection(); commit(); render();
  hint(`Opened ${label}.`);
}
$('projectInput').addEventListener('change', async () => {
  const file = $('projectInput').files?.[0]; $('projectInput').value = '';
  if (!file) return;
  if (file.size > 20 * 1024 * 1024) { hint('Project file exceeds 20 MB.'); return; }
  try {
    const loaded = JSON.parse(await file.text());
    acceptProject(loaded, file.name);
  } catch (error) { hint(`Could not open project: ${error.message}`); }
});

$('selectProjects').addEventListener('click', () => {
  selectingProjects = !selectingProjects;
  selectedProjectIds.clear();
  $('projectsStatus').textContent = selectingProjects ? 'Select projects to delete.' : '';
  renderProjects();
});
$('deleteProjects').addEventListener('click', async () => {
  if (!selectedProjectIds.size) return;
  if (!window.confirm(`Delete ${selectedProjectIds.size} selected project(s) from this browser? This cannot be undone.`)) return;
  const ids = [...selectedProjectIds];
  try {
    await removeLocalProjects(ids);
    if (ids.includes(project.id)) {
      clearTimeout(autosaveTimer);
      project = freshProject(); imageCache.clear(); processedCache.clear(); history = []; historyIndex = -1;
      syncSelection(); commit(); render();
    }
    selectingProjects = false; selectedProjectIds.clear();
    $('projectsStatus').textContent = `Deleted ${ids.length} project(s) from this browser.`;
    renderProjects();
  } catch (error) { $('projectsStatus').textContent = `Could not delete projects: ${error.message}`; }
});

function settingsMessage(message, error = false) {
  $('parameterError').textContent = message;
  $('parameterError').dataset.kind = error ? 'error' : 'neutral';
}
function readParameterForm() {
  const basename = safeName($('jobFileName').value, 'laser-link-job.nc').replace(/\.[^.]+$/, '');
  return {
    jobName: `${basename || 'laser-link-job'}.nc`,
    power: Number($('laserPower').value), speed: Number($('workSpeed').value),
    passes: Number($('passes').value), framePower: Number($('framePower').value),
    airAssist: $('airAssist').checked, sMax: Number($('sMaxInput').value),
    resolution: Number($('resolution').value),
  };
}
function openSettings() {
  if (!project.objects.length) { hint('Add a picture, text, drawing, QR code, or barcode first.'); return; }
  const parameters = project.parameters || freshProject().parameters;
  $('jobFileName').value = parameters.jobName;
  $('laserPower').value = parameters.power;
  $('workSpeed').value = parameters.speed;
  $('passes').value = parameters.passes;
  $('framePower').value = parameters.framePower;
  $('airAssist').checked = parameters.airAssist;
  $('resolution').value = String(parameters.resolution);
  $('sMaxInput').value = machineSettings?.sMax || parameters.sMax;
  $('machineConfig').textContent = machineSettings
    ? `Controller: $30=${machineSettings.sMax}, $32=${machineSettings.laserMode ?? 'unknown'}, travel ${machineSettings.travelX || '?'} × ${machineSettings.travelY || '?'} mm.`
    : 'Connect the laser to read its actual $30 and $32 settings.';
  settingsMessage('Screenshot example: 5% power, 1000 mm/min, one pass, M4. Preview the job before sending.');
  $('settingsDialog').hidden = false;
  $('jobFileName').focus();
}
function closeSettings() {
  project.parameters = readParameterForm();
  commit();
  $('settingsDialog').hidden = true;
}
$('settingsDialog').addEventListener('input', () => invalidatePreparedJob(readParameterForm()));
$('settingsDialog').addEventListener('change', () => invalidatePreparedJob(readParameterForm()));
$('openSettings').addEventListener('click', openSettings);
window.addEventListener('laserlink:open-settings', openSettings);
$('closeSettings').addEventListener('click', closeSettings);
$('settingsDialog').addEventListener('click', (event) => { if (event.target === $('settingsDialog')) closeSettings(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !$('settingsDialog').hidden) closeSettings();
});
window.addEventListener('laserlink:machine-settings', (event) => {
  machineSettings = event.detail;
  if (!$('settingsDialog').hidden) {
    $('sMaxInput').value = machineSettings?.sMax || $('sMaxInput').value;
    $('machineConfig').textContent = machineSettings
      ? `Controller: $30=${machineSettings.sMax}, $32=${machineSettings.laserMode ?? 'unknown'}, travel ${machineSettings.travelX || '?'} × ${machineSettings.travelY || '?'} mm.`
      : 'Connect the laser to read its actual $30 and $32 settings.';
  }
});

async function buildJob() {
  const parameters = readParameterForm();
  if (!Number.isInteger(parameters.framePower) || parameters.framePower < 1 || parameters.framePower > 10) {
    throw new Error('Frame power must be 1–10%; it is saved but not used by preview framing.');
  }
  const bounds = objectBounds();
  if (!bounds || bounds.minX < -0.001 || bounds.minY < -0.001 ||
    bounds.maxX > BED + 0.001 || bounds.maxY > BED + 0.001) {
    throw new Error('Artwork extends outside the 300 × 300 mm bed. Move or resize it before export.');
  }
  if (activeAlignment.jig && (bounds.minX < -0.001 || bounds.minY < -0.001 ||
      bounds.maxX > activeAlignment.jig.max_width + 0.001 ||
      bounds.maxY > activeAlignment.jig.max_height + 0.001)) {
    throw new Error('Artwork extends outside the active jig pocket.');
  }
  if (activeAlignment.jig && !activeAlignment.origin) {
    throw new Error('Connect and home the laser to calculate this jig’s work-coordinate offset.');
  }
  project.parameters = parameters;
  await Promise.all(project.objects.filter((object) => object.type === 'image').map(ensureImage));
  const size = Math.round(BED / parameters.resolution);
  const raster = document.createElement('canvas'); raster.width = raster.height = size;
  const context = raster.getContext('2d', { willReadFrequently: true });
  drawScene(context, size);
  const rgba = context.getImageData(0, 0, size, size).data;
  const pixels = new Uint8Array(size * size);
  for (let i = 0; i < pixels.length; i++) {
    const offset = i * 4;
    pixels[i] = 0.2126 * rgba[offset] + 0.7152 * rgba[offset + 1] + 0.0722 * rgba[offset + 2] < 128 ? 1 : 0;
  }
  const result = rasterToGcode({ pixels, width: size, height: size, stepMm: parameters.resolution,
    powerPercent: parameters.power, speedMmMin: parameters.speed, passes: parameters.passes,
    sMax: parameters.sMax, airAssist: parameters.airAssist,
    originX: activeAlignment.origin?.x || 0, originY: activeAlignment.origin?.y || 0 });
  if (activeAlignment.jig) {
    assertMachineBounds(result.bounds, activeAlignment.wco, activeAlignment.limits, activeAlignment.jig);
  }
  return { ...result, parameters };
}

function textContours(object, image) {
  const width = Math.max(1, Math.min(900, Math.round(object.w / 0.3)));
  const height = Math.max(1, Math.min(900, Math.round(object.h / 0.3)));
  const raster = document.createElement('canvas'); raster.width = width; raster.height = height;
  const context = raster.getContext('2d', { willReadFrequently: true });
  context.save(); context.translate(width / 2, height / 2);
  maskPath(context, object.mask || 'rectangle', width, height); context.clip();
  context.drawImage(processedImage(object, image), -width / 2, -height / 2, width, height);
  context.restore();
  const rgba = context.getImageData(0, 0, width, height).data;
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < binary.length; i++) {
    const at = i * 4;
    binary[i] = rgba[at + 3] > 127 &&
      0.2126 * rgba[at] + 0.7152 * rgba[at + 1] + 0.0722 * rgba[at + 2] < 128 ? 1 : 0;
  }
  return traceBinaryContours(binary, width, height);
}

window.addEventListener('laserlink:alignment', (event) => {
  const next = event.detail || { jig: null, origin: { x: 0, y: 0 }, measurement: null, outline: null };
  if (JSON.stringify(activeAlignment.jig) !== JSON.stringify(next.jig) ||
      JSON.stringify(activeAlignment.origin) !== JSON.stringify(next.origin)) {
    activeAlignment = next;
    if (preparedFingerprint) {
      preparedFingerprint = null;
      window.dispatchEvent(new CustomEvent('laserlink:job-invalidated'));
    }
  } else activeAlignment = next;
  $('fitMeasured').disabled = !next.measurement;
  render();
});

window.addEventListener('laserlink:geometry-request', async (event) => {
  try {
    if (event.detail.kind === 'box') {
      event.detail.resolve({ bounds: objectBounds() });
      return;
    }
    const objects = project.objects.map((object) => ({ ...object }));
    for (const object of objects.filter((item) => item.kind === 'Text')) {
      const image = await ensureImage(object);
      object.contours = textContours(object, image);
    }
    event.detail.resolve({ bounds: objectBounds(), paths: collectContourPaths(objects) });
  } catch (error) { event.detail.reject(error); }
});

$('fitMeasured').addEventListener('click', () => {
  const object = selected(), box = activeAlignment.measurement;
  if (!object || !box) { hint('Select an object and capture both measurement points first.'); return; }
  const angle = (object.rotation || 0) * Math.PI / 180;
  const c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle));
  const rotatedW = object.w * c + object.h * s;
  const rotatedH = object.w * s + object.h * c;
  const factor = Math.min((box.maxX - box.minX) / rotatedW, (box.maxY - box.minY) / rotatedH);
  object.w *= factor; object.h *= factor;
  object.x = (box.minX + box.maxX - object.w) / 2;
  object.y = (box.minY + box.maxY - object.h) / 2;
  syncSelection(); commit(); render();
  hint('Selected artwork fitted inside the measured box. Review its position before framing.');
});

$('previewFrame').addEventListener('click', () => {
  framePreview = true; closeSettings(); render();
  hint('Orange box shows the design bounds. This preview does not move or fire the laser.');
});
$('downloadGcode').addEventListener('click', async () => {
  settingsMessage('Building G-code…');
  try {
    const job = await buildJob();
    const contents = `${job.lines.join('\n')}\n`;
    if (contents.length > 20 * 1024 * 1024) throw new Error('Job exceeds 20 MB. Choose a coarser raster resolution.');
    download(job.parameters.jobName, contents, 'text/plain');
    commit();
    settingsMessage(`Downloaded ${job.parameters.jobName}: ${job.segments.toLocaleString()} dark runs, S${job.sValue}. Check orientation and origin in LightBurn before use.`);
  } catch (error) { settingsMessage(error.message, true); }
});
$('prepareJob').addEventListener('click', async () => {
  settingsMessage('Building G-code…');
  try {
    const job = await buildJob();
    if (machineSettings && (machineSettings.sMax !== job.parameters.sMax || machineSettings.laserMode !== 1)) {
      throw new Error('Controller $30 must match this job and $32 must be 1 (laser mode) before direct sending.');
    }
    const contentsLength = job.lines.join('\n').length;
    if (contentsLength > 20 * 1024 * 1024) throw new Error('Job exceeds 20 MB. Choose a coarser raster resolution.');
    commit(); $('settingsDialog').hidden = true;
    preparedFingerprint = jobFingerprint();
    window.dispatchEvent(new CustomEvent('laserlink:generated-job', { detail: {
      name: job.parameters.jobName, lines: job.lines, bounds: job.bounds, sMax: job.parameters.sMax,
      jigId: activeAlignment.jig?.id || '', origin: activeAlignment.origin || { x: 0, y: 0 },
    } }));
    hint(`Prepared ${job.segments.toLocaleString()} dark runs. Review the sender before starting.`);
  } catch (error) { settingsMessage(error.message, true); }
});

project = freshProject();
commit(); syncSelection(); fitCanvasResolution(); renderProjects();
window.addEventListener('resize', fitCanvasResolution);
new ResizeObserver(fitCanvasResolution).observe(canvas);
window.dispatchEvent(new Event('laserlink:editor-ready'));
