import { GrblTransport, parseGcode, TARGET_NAME, SERVICE_UUID, NOTIFY_UUID, WRITE_UUID } from './protocol.mjs';
import { buildCenterJogCommand, buildJogCommand, hasStartupCommands, parseGrblStatus, spindleOverrideCommands, workZeroCommands } from './control.mjs?v=0.5.4';
import { describeSdStatus, listMountedCard, parseSdListing, uploadMountedJob } from './sd-card.mjs';
import { assertMachineBounds, measuredBox, measurementToCanvas, outlineToCanvas, validateJig, validateOutlinePoint, workOriginForJig } from './alignment.mjs';
import { buildBoxFrame, buildContourFrame, buildLocateBox } from './framing.mjs';

const $ = (selector) => document.querySelector(selector);
const connectButton = $('#connectButton');
const fileInput = $('#fileInput');
const chooseButton = $('#chooseButton');
const startButton = $('#startButton');
const pauseButton = $('#pauseButton');
const abortButton = $('#abortButton');
const sdRefreshButton = $('#sdRefreshButton');
const sdSelectButton = $('#sdSelectButton');
const sdCardRefreshButton = $('#sdCardRefreshButton');
const sdStatus = $('#sdStatus');
const sdFiles = $('#sdFiles');
const recentSdFiles = $('#recentSdFiles');
const projectsSdFiles = $('#projectsSdFiles');
const recentSdStatus = $('#recentSdStatus');
const projectsSdStatus = $('#projectsSdStatus');
const recentSdRefresh = $('#recentSdRefresh');
const projectsSdRefresh = $('#projectsSdRefresh');
const sdCardName = $('#sdCardName');
const sdFilename = $('#sdFilename');
const sdUploadButton = $('#sdUploadButton');
const sdUploadStatus = $('#sdUploadStatus');
const senderHint = $('#senderHint');
const recoverButton = $('#recoverButton');
const editJobButton = $('#editJobButton');
const livePowerControls = $('#livePowerControls');
const livePowerPercent = $('#livePowerPercent');
const applyLivePowerButton = $('#applyLivePower');
const livePowerStatus = $('#livePowerStatus');
const statusText = $('#statusText');
const statusDot = $('#statusDot');
const deviceName = $('#deviceName');
const jobName = $('#jobName');
const jobMeta = $('#jobMeta');
const progress = $('#progress');
const progressText = $('#progressText');
const controllerText = $('#controllerText');
const log = $('#log');
const createView = $('#creatorView');
const sendView = $('#sendView');
const modeCreate = $('#modeCreate');
const modeSend = $('#modeSend');
const modeControl = $('#modeControl');
const modeProjects = $('#modeProjects');
const controlView = $('#controlView');
const projectsView = $('#projectsView');

let device = null;
let writeCharacteristic = null;
let notifyCharacteristic = null;
let transport = null;
let verified = false;
let connecting = false;
let job = null;
let running = false;
let paused = false;
let holdConfirmed = false;
let pauseBusy = false;
let pauseResolver = null;
let runId = 0;
let machineSettings = null;
let settingsCapture = null;
let sdCapture = null;
let sdWaiter = null;
let sdBusy = false;
let sdUploadBusy = false;
let cardDirectory = null;
let positionState = null;
let lastWco = null;
let controlBusy = false;
let homingInProgress = false;
let originEstablished = false;
let originMethod = null;
let selectedDistance = 1;
let selectedSpeed = 300;
let livePowerBusy = false;
let spindleOverride = null;
let framing = false;
let locateRunning = false;
let homedWco = null;
let pointA = null, pointB = null, measurement = null;
let outlinePoints = [], outlineClosed = false;
const JIGS_KEY = 'laserlink.jigs.v1';
const ACTIVE_JIG_KEY = 'laserlink.active-jig.v1';
let jigProfiles = readJigProfiles();
let activeJigId = readActiveJigId();
const SD_CACHE_KEY = 'laserlink.sd-files.laser-22504';
let sdSnapshot = readSdSnapshot();

function readJigProfiles() {
  try {
    const records = JSON.parse(localStorage.getItem(JIGS_KEY));
    return Array.isArray(records) ? records.filter((record) => {
      try { validateJig(record); return typeof record.id === 'string' && record.id.length < 100; }
      catch { return false; }
    }).slice(0, 100) : [];
  } catch { return []; }
}

function readActiveJigId() {
  try { return localStorage.getItem(ACTIVE_JIG_KEY) || ''; } catch { return ''; }
}

function activeJig() { return jigProfiles.find((profile) => profile.id === activeJigId) || null; }

function currentWco() {
  const { machine, work } = positionState || {};
  return machine && work ? { x: machine.x - work.x, y: machine.y - work.y } : null;
}

function machineLimits() {
  return machineSettings?.travelX > 0 && machineSettings?.travelY > 0
    ? { x: Math.min(300, machineSettings.travelX - (machineSettings.homingPullOff || 0)),
      y: Math.min(300, machineSettings.travelY - (machineSettings.homingPullOff || 0)) }
    : null;
}

function measurementLocalBounds() {
  if (!measurement) return null;
  try { return measurementToCanvas(measurement, activeJig(), homedWco); }
  catch { return null; }
}

function clearCapturedGeometry() {
  pointA = pointB = measurement = null;
  outlinePoints = [];
  outlineClosed = false;
  $('#outlineStatus').textContent = 'No outline captured.';
}

function updateOutlineStatus() {
  $('#outlineStatus').textContent = outlinePoints.length
    ? `${outlinePoints.length} perimeter point${outlinePoints.length === 1 ? '' : 's'} captured${outlineClosed ? '; outline closed on the design grid.' : '. Continue around the edge, then close the outline.'}`
    : 'No outline captured.';
}

function publishAlignment() {
  const jig = activeJig();
  let origin = jig ? null : { x: 0, y: 0 };
  if (jig && originEstablished && originMethod === 'homed') {
    try { origin = workOriginForJig(jig, currentWco()); } catch { /* Stay disabled until offset is reported. */ }
  }
  const local = measurementLocalBounds();
  let outline = null;
  try { if (outlinePoints.length) outline = { points: outlineToCanvas(outlinePoints, jig, homedWco), closed: outlineClosed }; }
  catch { /* Wait for a verified coordinate origin. */ }
  window.dispatchEvent(new CustomEvent('laserlink:alignment', { detail: {
    jig, origin, measurement: local, outline, wco: currentWco(), limits: machineLimits(),
  } }));
}

function readSdSnapshot() {
  try {
    const value = JSON.parse(localStorage.getItem(SD_CACHE_KEY));
    if (!value || !Array.isArray(value.files) || !Number.isFinite(value.seenAt)) return null;
    return { source: 'laser', seenAt: value.seenAt, files: value.files.filter((file) =>
      file && typeof file.name === 'string' && file.name.length <= 256 &&
      Number.isSafeInteger(file.bytes) && file.bytes >= 0).slice(0, 1000) };
  } catch { return null; }
}

function showMode(mode) {
  for (const [name, view, button] of [
    ['create', createView, modeCreate], ['send', sendView, modeSend],
    ['control', controlView, modeControl], ['projects', projectsView, modeProjects],
  ]) {
    view.hidden = mode !== name;
    button.setAttribute('aria-selected', String(mode === name));
  }
  if (mode === 'control' && verified && !running && !controlBusy) refreshPosition();
}

function generatedJobReady() {
  if (!job?.generated) return true;
  const settings = machineSettings;
  if (!(originEstablished && originMethod === 'homed' && settings?.sMax > 0 &&
      settings.laserMode === 1 && settings.sMax === job.sMax &&
      job.jigId === activeJigId)) return false;
  try {
    assertMachineBounds(job.bounds, currentWco(), machineLimits(), activeJig());
    const expected = workOriginForJig(activeJig(), currentWco());
    return Math.abs(expected.x - job.origin.x) < 0.01 && Math.abs(expected.y - job.origin.y) < 0.01;
  } catch { return false; }
}

function workTravelX() {
  return machineSettings?.travelX > 0
    ? Math.min(300, Math.max(0, machineSettings.travelX - (originMethod === 'homed' ? machineSettings.homingPullOff || 0 : 0)))
    : null;
}

function workTravelY() {
  return machineSettings?.travelY > 0
    ? Math.min(300, Math.max(0, machineSettings.travelY - (originMethod === 'homed' ? machineSettings.homingPullOff || 0 : 0)))
    : null;
}

function addLog(message) {
  const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
  const entry = document.createElement('div');
  entry.textContent = `${time}  ${message}`;
  log.prepend(entry);
  while (log.childElementCount > 80) log.lastElementChild.remove();
}

function setStatus(message, kind = 'neutral') {
  statusText.textContent = message;
  statusDot.dataset.kind = kind;
  addLog(message);
}

function updateControls() {
  const connected = Boolean(device?.gatt?.connected);
  connectButton.disabled = connecting || running || controlBusy;
  connectButton.textContent = connecting ? 'Connecting…' : connected ? 'Disconnect' : 'Connect laser';
  chooseButton.disabled = running || controlBusy;
  startButton.disabled = !connected || !verified || !originEstablished || positionState?.state !== 'Idle' ||
    !job || running || controlBusy || sdBusy || sdUploadBusy || !generatedJobReady();
  pauseButton.disabled = !connected || !running || framing || pauseBusy || livePowerBusy;
  abortButton.disabled = !connected || !running;
  const canReadSdBle = connected && verified && positionState?.state === 'Idle';
  sdRefreshButton.disabled = running || controlBusy || sdBusy || sdUploadBusy || !canReadSdBle;
  recentSdRefresh.disabled = sdRefreshButton.disabled;
  projectsSdRefresh.disabled = sdRefreshButton.disabled;
  sdSelectButton.disabled = running || controlBusy || sdBusy || sdUploadBusy;
  sdCardRefreshButton.disabled = !cardDirectory || running || controlBusy || sdBusy || sdUploadBusy;
  sdUploadButton.disabled = !cardDirectory || !job || running || sdBusy || sdUploadBusy;
  pauseButton.textContent = pauseBusy ? 'Checking…' : paused ? holdConfirmed ? 'Resume' : 'Retry pause' : 'Pause';
  deviceName.textContent = connected ? TARGET_NAME : 'No laser connected';
  senderHint.textContent = running && paused && holdConfirmed && job?.generated
    ? 'Machine held. Adjust live power below, then Resume. Editing the design power will end this job and require a restart from the beginning.'
    : running && paused && holdConfirmed
      ? 'Machine held. This imported G-code has no editable source here; Abort and load a revised file to change power.'
      : running ? 'Job in progress. Keep watching the machine.'
    : !connected ? 'Connect the laser to send a job.'
      : !verified ? 'Controller needs reconnection before another job.'
        : positionState?.state === 'Alarm' ? 'Controller is in Alarm after reset. Open Control and Home with switches before restarting.'
          : !originEstablished ? 'Home with switches in Control before restarting the job.'
            : !job ? 'Prepare the design again after changing power, then return here.'
              : positionState?.state !== 'Idle' ? 'Wait for the controller to report Idle.'
                : !generatedJobReady() ? 'Home with switches and rebuild the job if its jig, offset, settings, or travel changed.'
                  : 'Ready to send. Check the power setting and artwork before starting.';
  recoverButton.hidden = !connected || running || (verified && originEstablished);
  recoverButton.textContent = verified ? 'Open Control to Home' : 'Reconnect laser';
  livePowerControls.hidden = !(running && paused && holdConfirmed);
  livePowerPercent.disabled = livePowerBusy;
  applyLivePowerButton.disabled = livePowerBusy || pauseBusy || !connected;
  applyLivePowerButton.textContent = livePowerBusy ? 'Applying…' : 'Apply power';
  const mayStopAndEdit = running && paused && holdConfirmed && !pauseBusy && job?.generated;
  editJobButton.disabled = controlBusy || (running && !mayStopAndEdit);
  editJobButton.textContent = mayStopAndEdit ? 'Abort job & edit design power' : 'Edit power & rebuild job';
  const canJog = connected && verified && originEstablished && !running && !controlBusy &&
    positionState?.state === 'Idle' && workTravelX() > 0 && workTravelY() > 0 &&
    positionState?.work && $('#jogArmed').checked;
  document.querySelectorAll('[data-jog-x]').forEach((button) => {
    let inBounds = false;
    if (canJog) {
      try {
        buildJogCommand({ dx: Number(button.dataset.jogX), dy: Number(button.dataset.jogY),
          distance: selectedDistance, speed: selectedSpeed, position: positionState.work,
          travelX: workTravelX(), travelY: workTravelY() });
        inBounds = true;
      } catch { /* This direction would leave the work area. */ }
    }
    button.disabled = !inBounds;
  });
  $('#moveToCenter').disabled = !canJog;
  $('#setWorkZero').disabled = !connected || !verified || running || controlBusy ||
    !$('#atWorkOrigin').checked || positionState?.state !== 'Idle';
  $('#centerTarget').textContent = workTravelX() > 0 && workTravelY() > 0
    ? `After setting the lower-left origin, moves to work X${workTravelX() / 2}, Y${workTravelY() / 2} mm.`
    : 'Set X0 Y0 at the lower-left corner first. Center uses work coordinates.';
  $('#originStatus').textContent = originEstablished
    ? `${originMethod === 'homed' ? 'Switch homing complete; work X0 Y0 set at the homing stop.' : 'Manual work X0 Y0 set; machine coordinates may still be stale.'} Do not move the head by hand.`
    : 'Work origin has not been set in this connection. Reported coordinates may be stale.';
  $('#refreshPosition').disabled = !connected || !verified || running || controlBusy;
  $('#cancelJog').disabled = !connected || !controlBusy || homingInProgress;
  const canHome = connected && verified && !running && !controlBusy &&
    machineSettings?.homingEnabled === 1 && ['Idle', 'Alarm'].includes(positionState?.state) && $('#homeArmed').checked;
  $('#homeMachine').disabled = !canHome;
  $('#homeMachineTop').disabled = !canHome;
  $('#controllerSettings').textContent = machineSettings
    ? `GRBL · $30=${machineSettings.sMax}, $32=${machineSettings.laserMode}`
    : 'Not connected';
  const homedIdle = connected && verified && originEstablished && originMethod === 'homed' &&
    homedWco && positionState?.state === 'Idle' && !running && !controlBusy && !sdBusy && !sdUploadBusy;
  $('#capturePointA').disabled = !homedIdle || !positionState?.machine;
  $('#capturePointB').disabled = !homedIdle || !positionState?.machine;
  $('#captureOutlinePoint').disabled = !homedIdle || !positionState?.machine || outlineClosed || outlinePoints.length >= 100;
  $('#undoOutlinePoint').disabled = !outlinePoints.length;
  $('#closeOutline').disabled = !homedIdle || outlineClosed || outlinePoints.length < 3;
  $('#clearOutline').disabled = !outlinePoints.length;
  $('#viewCapturedOutline').disabled = !outlinePoints.length;
  $('#deleteJig').disabled = !activeJig();
  $('#jigSelect').disabled = running || controlBusy;
  $('#saveJig').disabled = running || controlBusy;
  $('#deleteJig').disabled = $('#deleteJig').disabled || running || controlBusy;
  if (machineSettings?.sMax > 0) {
    const cap = Math.min(10, Math.floor(machineSettings.sMax * 0.01));
    $('#frameSValue').max = String(Math.max(1, cap));
    if (Number($('#frameSValue').value) > cap) $('#frameSValue').value = String(Math.max(1, cap));
    const rate = Math.min(4000, machineSettings.maxRateX || 0, machineSettings.maxRateY || 0);
    if (rate > 0) {
      $('#frameFeed').max = String(rate);
      if (Number($('#frameFeed').value) > rate) $('#frameFeed').value = String(Math.max(100, Math.floor(rate)));
    }
  }
  const canFrame = homedIdle && machineSettings?.laserMode === 1 && machineSettings?.sMax >= 100 &&
    machineSettings?.maxRateX >= 100 && machineSettings?.maxRateY >= 100 &&
    machineLimits()?.x > 0 && machineLimits()?.y > 0 && Boolean(currentWco()) && $('#frameArmed').checked;
  $('#frameDesign').disabled = !canFrame;
  $('#frameMeasurement').disabled = !canFrame || !measurement;
  $('#frameContour').disabled = !canFrame;
  $('#stopFrame').disabled = !framing;
  const canLocate = homedIdle && machineSettings?.maxRateX >= 100 && machineSettings?.maxRateY >= 100 &&
    machineLimits()?.x > 0 && machineLimits()?.y > 0 && Boolean(currentWco()) && $('#locateArmed').checked;
  $('#locateTest').disabled = !canLocate;
  $('#stopLocate').disabled = !locateRunning;
}

function onControllerLine(line) {
  if (settingsCapture) settingsCapture.push(line);
  if (sdCapture && sdCapture.length < 1000) sdCapture.push(line);
  if (sdWaiter?.matches(line)) {
    const waiter = sdWaiter;
    sdWaiter = null;
    clearTimeout(waiter.timer);
    waiter.resolve(line);
  }
  if (line.startsWith('<')) {
    controllerText.textContent = line;
    try { updatePosition(line); } catch (error) { addLog(`Position report: ${error.message}`); }
  } else if (line !== 'ok') {
    addLog(line);
  }
}

function controlHint(message, error = false) {
  $('#controlHint').textContent = message;
  $('#controlHint').dataset.kind = error ? 'error' : 'neutral';
}

function updatePosition(line) {
  const parsed = parseGrblStatus(line, lastWco);
  if (parsed.state === 'Alarm') {
    originEstablished = false;
    originMethod = null;
    homedWco = null;
    clearCapturedGeometry();
    $('#jogArmed').checked = false;
    $('#frameArmed').checked = false;
    $('#locateArmed').checked = false;
    publishAlignment();
  }
  if (originMethod === 'homed' && homedWco && parsed.wco &&
      (Math.abs(parsed.wco.x * (machineSettings?.reportInches === 1 ? 25.4 : 1) - homedWco.x) > 0.1 ||
       Math.abs(parsed.wco.y * (machineSettings?.reportInches === 1 ? 25.4 : 1) - homedWco.y) > 0.1)) {
    originEstablished = false; originMethod = null;
    clearCapturedGeometry();
    $('#jogArmed').checked = false; $('#frameArmed').checked = false; $('#locateArmed').checked = false;
    publishAlignment();
    controlHint('Work offset changed since homing. Home again before jig alignment or framing.', true);
  }
  lastWco = parsed.wco;
  const multiplier = machineSettings?.reportInches === 1 ? 25.4 : 1;
  const scale = (point) => point && { x: point.x * multiplier, y: point.y * multiplier };
  positionState = { ...parsed, work: scale(parsed.work), machine: scale(parsed.machine) };
  const point = positionState.work || positionState.machine;
  $('#xPosition').textContent = point ? point.x.toFixed(2) : '—';
  $('#yPosition').textContent = point ? point.y.toFixed(2) : '—';
  $('#positionKind').textContent = positionState.work
    ? `Work position in mm · controller ${parsed.state}${originEstablished ? '' : ' · origin unverified'}`
    : positionState.machine
      ? 'Machine position in mm. Waiting for work offset before jogging.'
      : 'Controller did not report a position.';
  updateControls();
}

async function refreshPosition() {
  if (!verified || !transport || running || controlBusy) return;
  try {
    // GRBL reports WCO periodically rather than in every status reply. After a
    // reconnect, collect enough read-only replies to establish work position.
    for (let attempt = 0; attempt < 12 && !positionState?.work; attempt++) {
      await transport.queryStatus();
    }
    if (positionState?.work) await transport.queryStatus();
    controlHint(positionState?.state === 'Alarm'
      ? 'Controller is in Alarm. Inspect the machine, then Home with switches to restore its position.'
      : positionState?.work
      ? originEstablished
        ? 'Position updated. Check the work area before enabling jog.'
        : 'Controller position read, but it may be stale. Home with switches, or set a manual work X0 Y0 at the physical lower-left corner.'
      : 'Work offset was not reported after 12 status checks. Jogging stays disabled.');
  } catch (error) { controlHint(`Could not read position: ${error.message}`, true); }
}

async function executeMovement(makeCommand, description) {
  if (!verified || !originEstablished || !transport || running || controlBusy || !$('#jogArmed').checked) return;
  if (!(workTravelX() > 0 && workTravelY() > 0)) {
    controlHint('Travel limits are unavailable from this controller. Jogging stays disabled.', true); return;
  }
  controlBusy = true; updateControls();
  try {
    const before = await transport.queryStatus();
    if (!before.startsWith('<Idle')) throw new Error(`Controller is not idle: ${before}`);
    const command = makeCommand();
    if (!command) { controlHint('The laser head is already at the work-area center.'); return; }
    await transport.sendCommand('M5');
    await transport.sendCommand(command);
    controlHint(`${description} at ${selectedSpeed} mm/min…`);
    let idleReadings = 0;
    for (let attempt = 0; attempt < 1200; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const status = await transport.queryStatus();
      idleReadings = status.startsWith('<Idle') ? idleReadings + 1 : 0;
      if (idleReadings >= 2) break;
      if (attempt === 1199) throw new Error('Movement did not return to idle in five minutes. Check the machine.');
    }
    controlHint('Movement complete. Position updated.');
  } catch (error) { controlHint(`Movement stopped: ${error.message}`, true); }
  finally { controlBusy = false; updateControls(); }
}

function jog(dx, dy) {
  return executeMovement(() => buildJogCommand({ dx, dy, distance: selectedDistance, speed: selectedSpeed,
    position: positionState?.work, travelX: workTravelX(), travelY: workTravelY() }),
  `Jogging ${selectedDistance} mm`);
}

function moveToCenter() {
  return executeMovement(() => buildCenterJogCommand({ position: positionState?.work,
    speed: selectedSpeed, travelX: workTravelX(), travelY: workTravelY() }),
  'Moving to work-area center');
}

async function homeMachine() {
  if (!verified || !transport || running || controlBusy || machineSettings?.homingEnabled !== 1 || !$('#homeArmed').checked) return;
  controlBusy = true;
  homingInProgress = true;
  originEstablished = false;
  originMethod = null;
  clearCapturedGeometry();
  $('#jogArmed').checked = false;
  $('#frameArmed').checked = false;
  $('#locateArmed').checked = false;
  publishAlignment();
  updateControls();
  try {
    const before = await transport.queryStatus();
    if (!/^<(Idle|Alarm)(?:\||>)/.test(before)) throw new Error(`Controller is not ready for homing: ${before}`);
    // Grbl locks ordinary G-code in Alarm. $H is its recovery path after reset.
    if (before.startsWith('<Idle')) await transport.sendCommand('M5');
    settingsCapture = [];
    try {
      await transport.sendCommand('$N');
      if (hasStartupCommands(settingsCapture)) {
        throw new Error('Controller has a nonempty startup script that could run after homing.');
      }
    } finally { settingsCapture = null; }
    controlHint('Homing with the limit switches… watch the machine and use its physical stop if needed.');
    await transport.sendCommand('$H', 120000);
    let idleReadings = 0;
    for (let attempt = 0; attempt < 20; attempt++) {
      const status = await transport.queryStatus();
      idleReadings = status.startsWith('<Idle') ? idleReadings + 1 : 0;
      if (idleReadings >= 2) break;
      if (attempt === 19) throw new Error('Homing did not settle to Idle. Check the machine.');
    }
    for (const command of workZeroCommands().slice(1)) await transport.sendCommand(command);
    lastWco = null;
    positionState = null;
    for (let attempt = 0; attempt < 12 && !positionState?.work; attempt++) await transport.queryStatus();
    if (!positionState?.work || positionState.state !== 'Idle' ||
        Math.abs(positionState.work.x) > 0.1 || Math.abs(positionState.work.y) > 0.1) {
      throw new Error('Controller did not confirm Idle at work X0 Y0.');
    }
    originMethod = 'homed';
    originEstablished = true;
    homedWco = currentWco();
    if (!homedWco) throw new Error('Controller did not report both machine and work coordinates after homing.');
    publishAlignment();
    $('#homeArmed').checked = false;
    $('#atWorkOrigin').checked = false;
    $('#positionKind').textContent = 'Work position in mm · controller Idle';
    controlHint('Switch homing complete. Work X0 Y0 is at the stopped head position.');
  } catch (error) {
    originEstablished = false;
    originMethod = null;
    homedWco = null;
    verified = false;
    $('#homeArmed').checked = false;
    publishAlignment();
    controlHint(`Homing failed: ${error.message} Movement stays disabled; check the machine, then reconnect.`, true);
  } finally { homingInProgress = false; controlBusy = false; updateControls(); }
}

async function setWorkZero() {
  if (!verified || !transport || running || controlBusy || !$('#atWorkOrigin').checked) return;
  controlBusy = true; updateControls();
  try {
    const status = await transport.queryStatus();
    if (!status.startsWith('<Idle')) throw new Error(`Controller is not idle: ${status}`);
    for (const command of workZeroCommands()) await transport.sendCommand(command);
    lastWco = null;
    positionState = null;
    for (let attempt = 0; attempt < 12 && !positionState?.work; attempt++) {
      await transport.queryStatus();
    }
    if (!positionState?.work || Math.abs(positionState.work.x) > 0.1 || Math.abs(positionState.work.y) > 0.1) {
      throw new Error('Controller did not confirm work X0 Y0. Refresh position and check the machine.');
    }
    originEstablished = true;
    originMethod = 'manual';
    homedWco = null;
    clearCapturedGeometry();
    publishAlignment();
    $('#atWorkOrigin').checked = false;
    $('#homeArmed').checked = false;
    $('#jogArmed').checked = false;
    $('#positionKind').textContent = 'Work position in mm · controller Idle';
    controlHint('Current head position is now work X0 Y0. The laser did not move; machine coordinates may still be stale.');
  } catch (error) {
    originEstablished = false;
    originMethod = null;
    homedWco = null;
    clearCapturedGeometry();
    publishAlignment();
    controlHint(`Could not set X0 Y0: ${error.message}`, true);
  } finally { controlBusy = false; updateControls(); }
}

function onDisconnected() {
  const wasRunning = running;
  runId++;
  running = false;
  paused = false;
  holdConfirmed = false;
  pauseBusy = false;
  livePowerBusy = false;
  spindleOverride = null;
  verified = false;
  machineSettings = null;
  positionState = null;
  lastWco = null;
  controlBusy = false;
  homingInProgress = false;
  originEstablished = false;
  originMethod = null;
  homedWco = null;
  clearCapturedGeometry();
  framing = false;
  $('#jogArmed').checked = false;
  $('#atWorkOrigin').checked = false;
  $('#homeArmed').checked = false;
  $('#frameArmed').checked = false;
  $('#locateArmed').checked = false;
  $('#xPosition').textContent = '—'; $('#yPosition').textContent = '—';
  $('#positionKind').textContent = 'Connect Laser-22504 to read its GRBL position.';
  controlHint('Disconnected. Connect the laser to enable movement.');
  window.dispatchEvent(new CustomEvent('laserlink:machine-settings', { detail: null }));
  publishAlignment();
  pauseResolver?.();
  pauseResolver = null;
  transport?.cancel();
  sdCapture = null;
  if (sdWaiter) {
    clearTimeout(sdWaiter.timer);
    sdWaiter.resolve(null);
    sdWaiter = null;
  }
  sdBusy = false;
  sdFiles.replaceChildren();
  sdStatus.textContent = cardDirectory ? 'Use Browse selected card to refresh its files.' : 'Connect the laser or select its card in a Mac card reader.';
  renderSdLibrary();
  writeCharacteristic = null;
  notifyCharacteristic = null;
  transport = null;
  controllerText.textContent = 'Waiting for controller';
  setStatus(wasRunning
    ? 'Bluetooth disconnected during the job. Stop the machine at its controls.'
    : 'Disconnected', wasRunning ? 'error' : 'neutral');
  updateControls();
}

async function refreshSdCard() {
  const bleReady = transport && verified && positionState?.state === 'Idle';
  if (running || controlBusy || sdBusy || sdUploadBusy || !bleReady) return;
  sdBusy = true;
  sdFiles.replaceChildren();
  sdStatus.textContent = 'Reading the laser SD card…';
  recentSdStatus.textContent = 'Reading the laser SD card…';
  projectsSdStatus.textContent = 'Reading the laser SD card…';
  updateControls();
  try {
    sdCapture = [];
    await transport.sendCommand('[ESP200]');
    await waitForSdLine((line) => /^SD_OK$|SD card detected|No SD card|SD card not enabled|Busy/i.test(line), 8000);
    const status = describeSdStatus(sdCapture);
    if (/No SD card|SD card not enabled|Busy/i.test(status)) {
      sdStatus.textContent = status;
      recentSdStatus.textContent = status;
      projectsSdStatus.textContent = status;
      return;
    }
    // A few L1 Pro builds acknowledge the status request before emitting
    // their own card-ready line. Listing is read-only, so try it even when
    // that first response is absent.
    sdCapture = [];
    await transport.sendCommand('[ESP210]');
    // Makerbase ends the listing with a capacity line. Some firmware omits
    // it, so keep any file replies captured before the timeout as well.
    await waitForSdLine((line) => /^\[SD Free:/i.test(line), 5000);
    const files = parseSdListing(sdCapture);
    const reply = sdCapture.some((line) => /^\[SD Free:|^\[FILE:/i.test(line));
    if (reply) showSdFiles(files, 'Card listed over Bluetooth.', 'laser');
    else {
      sdStatus.textContent = `The controller did not return an SD file listing over Bluetooth${status === 'Card status was not reported.' ? '' : ` (${status})`}.`;
      recentSdStatus.textContent = sdStatus.textContent;
      projectsSdStatus.textContent = sdStatus.textContent;
    }
  } catch (error) {
    sdStatus.textContent = `Could not read SD card: ${error.message}`;
    recentSdStatus.textContent = sdStatus.textContent;
    projectsSdStatus.textContent = sdStatus.textContent;
  } finally {
    sdCapture = null;
    sdBusy = false;
    updateControls();
  }
}

function waitForSdLine(matches, timeoutMs) {
  if (sdCapture?.some(matches)) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      sdWaiter = null;
      resolve(null);
    }, timeoutMs);
    sdWaiter = { matches, resolve, timer };
  });
}

function formatFileSize(file) {
  return typeof file.bytes === 'number'
    ? file.bytes < 1024 ? `${file.bytes} B` : `${(file.bytes / 1024).toFixed(1)} KB`
    : file.size || '';
}

function renderSdLibrary() {
  for (const [grid, status] of [[recentSdFiles, recentSdStatus], [projectsSdFiles, projectsSdStatus]]) {
    grid.replaceChildren();
    if (!sdSnapshot) {
      status.textContent = 'Connect the laser to browse its card. SD files are separate from editable projects on this Mac.';
      continue;
    }
    const source = sdSnapshot.source === 'laser' ? 'laser SD card' : 'selected card on this Mac';
    const seen = new Date(sdSnapshot.seenAt).toLocaleString();
    status.textContent = `${sdSnapshot.files.length} file${sdSnapshot.files.length === 1 ? '' : 's'} · ${source} · last read ${seen}. Refresh after changing cards. These are G-code files, not editable projects.`;
    for (const file of sdSnapshot.files) {
      const card = document.createElement('div'); card.className = 'project-card sd-project-card';
      const thumb = document.createElement('div'); thumb.className = 'project-thumb sd-project-thumb'; thumb.textContent = 'NC';
      const meta = document.createElement('div'); meta.className = 'project-card-meta';
      const title = document.createElement('strong'); title.textContent = file.name;
      const detail = document.createElement('small'); detail.textContent = `${source} · ${formatFileSize(file)}`;
      meta.append(title, detail); card.append(thumb, meta); grid.append(card);
    }
  }
}

function showSdFiles(files, prefix, source = 'selected') {
  sdFiles.replaceChildren();
  sdStatus.textContent = files.length
    ? `${prefix} ${files.length} file${files.length === 1 ? '' : 's'} shown.`
    : `${prefix} No files were listed.`;
  sdSnapshot = { source, seenAt: Date.now(), files };
  if (source === 'laser') {
    try { localStorage.setItem(SD_CACHE_KEY, JSON.stringify(sdSnapshot)); }
    catch { /* A live listing still works when browser storage is unavailable. */ }
  }
  renderSdLibrary();
  for (const file of files) {
    const row = document.createElement('li');
    const name = document.createElement('span');
    const size = document.createElement('small');
    name.textContent = file.name;
    size.textContent = formatFileSize(file);
    row.append(name, size);
    sdFiles.append(row);
  }
}

async function selectSdCard() {
  if (running || controlBusy || sdBusy || sdUploadBusy) return;
  if (!window.showDirectoryPicker) {
    sdStatus.textContent = 'Card access needs a recent Chrome version on this Mac.';
    return;
  }
  try {
    const directory = await window.showDirectoryPicker({ mode: 'readwrite' });
    cardDirectory = directory;
    sdCardName.textContent = `Selected folder: ${directory.name}`;
    updateControls();
    await refreshMountedCard();
  } catch (error) {
    if (error.name !== 'AbortError') sdStatus.textContent = `Could not open card: ${error.message}`;
  }
}

async function refreshMountedCard() {
  if (!cardDirectory || running || controlBusy || sdBusy || sdUploadBusy) return;
  sdBusy = true;
  sdStatus.textContent = 'Reading the selected card…';
  updateControls();
  try {
    const files = await listMountedCard(cardDirectory);
    showSdFiles(files, `Selected card ${cardDirectory.name}.`);
  } catch (error) {
    sdStatus.textContent = `Could not read selected card: ${error.message}`;
  } finally {
    sdBusy = false;
    updateControls();
  }
}

async function uploadSdJob() {
  if (!cardDirectory || !job || running || controlBusy || sdBusy || sdUploadBusy) return;
  const filename = sdFilename.value.trim();
  if (!/^[a-z0-9][a-z0-9_-]{0,31}\.(nc|gc|gcode)$/i.test(filename)) {
    sdUploadStatus.textContent = 'Use a short .nc, .gc, or .gcode filename with letters, numbers, _ or -.';
    return;
  }
  sdUploadBusy = true;
  sdUploadStatus.textContent = `Copying ${filename} to the selected card…`;
  updateControls();
  try {
    const content = `${job.lines.join('\n')}\n`;
    await uploadMountedJob(cardDirectory, filename, content);
    sdUploadStatus.textContent = `${filename} was copied and verified on the selected card. The laser has not started.`;
    showSdFiles(await listMountedCard(cardDirectory), `Selected card ${cardDirectory.name}.`);
  } catch (error) {
    sdUploadStatus.textContent = `Copy failed: ${error.message}`;
  } finally {
    sdUploadBusy = false;
    updateControls();
  }
}

async function connect() {
  if (running || connecting) return;
  if (device?.gatt?.connected) {
    device.gatt.disconnect();
    return;
  }
  if (!navigator.bluetooth) {
    setStatus('Web Bluetooth is unavailable here. Open this page in Google Chrome on the Mac.', 'error');
    return;
  }
  connecting = true;
  updateControls();
  try {
    // requestDevice must run from this button click so Chrome can show its device picker.
    const chosen = await navigator.bluetooth.requestDevice({
      filters: [{ name: TARGET_NAME }],
      optionalServices: [SERVICE_UUID],
    });
    if (device) device.removeEventListener('gattserverdisconnected', onDisconnected);
    device = chosen;
    device.addEventListener('gattserverdisconnected', onDisconnected);
    setStatus('Connecting to Laser-22504…');
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    notifyCharacteristic = await service.getCharacteristic(NOTIFY_UUID);
    writeCharacteristic = await service.getCharacteristic(WRITE_UUID);
    transport = new GrblTransport(
      (bytes) => writeCharacteristic.writeValueWithResponse(bytes),
      (bytes) => writeCharacteristic.writeValueWithoutResponse(bytes),
      onControllerLine,
    );
    notifyCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
      transport?.feed(event.target.value);
    });
    await notifyCharacteristic.startNotifications();
    setStatus('Checking GRBL controller…');
    const status = await transport.queryStatus();
    if (!/^<(Idle|Alarm|Run|Hold|Jog|Home|Check|Door|Sleep)(?:\||>)/i.test(status)) {
      throw new Error(`Unexpected controller status: ${status}`);
    }
    if (!/^<(Idle|Alarm)(?:\||>)/i.test(status)) {
      throw new Error(`Controller is busy: ${status}`);
    }
    if (status.startsWith('<Idle')) await transport.sendCommand('$G');
    verified = true;
    try {
      settingsCapture = [];
      await transport.sendCommand('$$');
      const values = Object.fromEntries(settingsCapture
        .map((line) => /^\$(\d+)=([\d.]+)/.exec(line))
        .filter(Boolean)
        .map((match) => [Number(match[1]), Number(match[2])]));
      if (values[30] > 0) {
        machineSettings = { sMax: values[30], laserMode: values[32], travelX: values[130], travelY: values[131],
          reportInches: values[13], homingEnabled: values[22], homingPullOff: values[27],
          maxRateX: values[110], maxRateY: values[111] };
        window.dispatchEvent(new CustomEvent('laserlink:machine-settings', { detail: machineSettings }));
      }
    } catch (error) {
      addLog(`Could not read machine settings: ${error.message}`);
    } finally {
      settingsCapture = null;
    }
    setStatus(status.startsWith('<Alarm')
      ? 'Laser-22504 connected in Alarm. Open Control and Home with switches before restarting.'
      : machineSettings
        ? `Laser-22504 connected. GRBL verified; S max ${machineSettings.sMax}.`
        : 'Laser-22504 connected. GRBL sender verified.', status.startsWith('<Alarm') ? 'error' : 'ready');
    await refreshPosition();
    if (positionState?.state === 'Idle') void refreshSdCard();
  } catch (error) {
    if (device?.gatt?.connected) device.gatt.disconnect();
    verified = false;
    if (error.name === 'NotFoundError') setStatus('No laser selected. Click Connect laser to try again.');
    else if (/unsupported device/i.test(error.message)) {
      setStatus('Connection failed. Close the native laser app and disconnect the phone, then try again.', 'error');
    } else setStatus(`Connection failed: ${error.message}`, 'error');
  } finally {
    connecting = false;
    updateControls();
  }
}

async function loadFile(file) {
  if (!file || running) return;
  job = null;
  sdUploadStatus.textContent = 'Choose a valid G-code job before copying to the card.';
  jobName.textContent = 'No file selected';
  jobMeta.textContent = 'Up to 20 MB · ASCII G-code';
  progress.max = 1;
  progress.value = 0;
  progressText.textContent = '0 / 0';
  updateControls();
  if (!/\.(nc|gc|gcode)$/i.test(file.name)) {
    setStatus('Choose an .nc, .gc, or .gcode file exported for this laser.', 'error');
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    setStatus('Job exceeds 20 MB. Split it into smaller files.', 'error');
    return;
  }
  try {
    const text = await file.text();
    const lines = parseGcode(text);
    job = { name: file.name, lines };
    sdUploadStatus.textContent = cardDirectory
      ? 'Ready to copy this job to the selected card.'
      : 'Select the laser card in a Mac card reader to copy this job.';
    sdFilename.value = file.name;
    jobName.textContent = file.name;
    jobMeta.textContent = `${lines.length.toLocaleString()} G-code commands · ${(file.size / 1024).toFixed(1)} KB`;
    progress.max = lines.length;
    progress.value = 0;
    progressText.textContent = `0 / ${lines.length.toLocaleString()}`;
    setStatus('Job loaded. Preview it in LightBurn before starting.', verified ? 'ready' : 'neutral');
    updateControls();
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function waitWhilePaused() {
  if (!paused) return;
  await new Promise((resolve) => { pauseResolver = resolve; });
  pauseResolver = null;
}

async function runJob() {
  if (!verified || !originEstablished || positionState?.state !== 'Idle' || !job || running || controlBusy || sdBusy || sdUploadBusy || !device?.gatt?.connected) return;
  if (!generatedJobReady()) {
    setStatus('Generated job settings do not match the connected controller. Rebuild it after reading $30 and $32.', 'error');
    return;
  }
  const currentJob = job;
  const accepted = window.confirm(`Send ${currentJob.name} to Laser-22504?\n\nThe laser can move and fire. Keep the area clear and watch the machine.`);
  if (!accepted) return;
  const thisRun = ++runId;
  running = true;
  paused = false;
  holdConfirmed = false;
  pauseBusy = false;
  progress.value = 0;
  setStatus(`Sending ${currentJob.name}…`, 'busy');
  updateControls();
  try {
    const initialStatus = await transport.queryStatus();
    if (!initialStatus.startsWith('<Idle')) throw new Error(`Controller is not idle: ${initialStatus}`);
    if (currentJob.generated) {
      await transport.sendCommand('M5');
      await transport.sendCommand('G54');
      await transport.sendCommand('G92.1');
      lastWco = null; positionState = null;
      for (let attempt = 0; attempt < 12 && !currentWco(); attempt++) await transport.queryStatus();
      if (!generatedJobReady()) throw new Error('Jig offset or machine travel changed. Home and rebuild the job.');
    }
    // An override from a previous session must not silently alter this job.
    await transport.sendRealtime(0x99, { confirmed: true });
    livePowerPercent.value = '100';
    spindleOverride = 100;
    livePowerStatus.textContent = '100% uses the power in the prepared job. Pause to adjust 10–200% and verify the controller before resuming.';
    for (const [index, line] of currentJob.lines.entries()) {
      if (thisRun !== runId) return;
      await waitWhilePaused();
      if (thisRun !== runId) return;
      await transport.sendCommand(line);
      if (thisRun !== runId) return;
      progress.value = index + 1;
      progressText.textContent = `${(index + 1).toLocaleString()} / ${currentJob.lines.length.toLocaleString()}`;
    }
    setStatus('All commands accepted. Waiting for the machine to become idle…', 'busy');
    while (thisRun === runId) {
      await waitWhilePaused();
      if (thisRun !== runId) return;
      const status = await transport.queryStatus();
      if (status.startsWith('<Idle') && !paused) break;
      if (!/^<(Run|Hold|Idle)(?:[:|>])/i.test(status)) {
        throw new Error(`Unexpected controller state while waiting for completion: ${status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    if (thisRun !== runId) return;
    running = false;
    if (!currentJob.generated) {
      originEstablished = false;
      originMethod = null;
      homedWco = null;
      clearCapturedGeometry();
      $('#jogArmed').checked = false;
      publishAlignment();
    }
    try { await transport.sendRealtime(0x99, { confirmed: true }); }
    catch (error) { addLog(`Could not reset live power override after job: ${error.message}`); }
    setStatus('Job complete. Machine is idle.', 'ready');
  } catch (error) {
    if (thisRun !== runId) return;
    running = false;
    originEstablished = false;
    originMethod = null;
    homedWco = null;
    clearCapturedGeometry();
    $('#jogArmed').checked = false;
    $('#homeArmed').checked = false;
    $('#frameArmed').checked = false;
    $('#locateArmed').checked = false;
    publishAlignment();
    const limitAlarm = /ALARM:1\b/i.test(error.message);
    if (limitAlarm) {
      try { await transport?.queryStatus(); } catch { verified = false; }
    } else {
      verified = false;
      try { await transport?.sendRealtime(0x18); } catch { /* connection may already be gone */ }
    }
    setStatus(limitAlarm
      ? 'Job stopped by hard-limit alarm (ALARM:1). Check the machine and switches, then Home before retrying.'
      : `Job stopped: ${error.message} Check the machine, reconnect if needed, then Home before retrying.`, 'error');
  } finally {
    if (thisRun === runId) { pauseBusy = false; updateControls(); }
  }
}

async function waitForMachineState(accepted, attempts = 8) {
  let status = '';
  for (let attempt = 0; attempt < attempts; attempt++) {
    status = await transport.queryStatus();
    if (accepted(status)) return status;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return status;
}

async function applyLivePower() {
  if (!running || !paused || !holdConfirmed || pauseBusy || livePowerBusy || !transport) return;
  const target = Number(livePowerPercent.value);
  let commands;
  try { commands = spindleOverrideCommands(target); }
  catch (error) { livePowerStatus.textContent = `${error.message} The value is relative to the prepared job power.`; return; }
  const thisRun = runId;
  livePowerBusy = true;
  livePowerStatus.textContent = `Setting ${target}% of the prepared power…`;
  updateControls();
  try {
    for (const command of commands) {
      if (thisRun !== runId) return;
      await transport.sendRealtime(command, { confirmed: true });
    }
    let reported = null;
    for (let attempt = 0; attempt < 12; attempt++) {
      if (thisRun !== runId) return;
      const status = await transport.queryStatus();
      reported = parseGrblStatus(status).spindleOverride ?? reported;
      if (reported === target) break;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    if (thisRun !== runId) return;
    if (reported !== target) throw new Error(reported === null
      ? 'the controller did not report an Ov power value'
      : `the controller reported ${reported}% instead of ${target}%`);
    spindleOverride = target;
    livePowerStatus.textContent = `Controller reports ${target}% of the prepared job power. Press Resume to continue this held job.`;
    setStatus(`Live power override confirmed at ${target}%. Job remains paused.`, 'ready');
  } catch (error) {
    if (thisRun === runId) {
      livePowerStatus.textContent = `Power change unconfirmed: ${error.message}. The job remains held; check the machine before resuming or aborting.`;
      setStatus('Live power change could not be verified. Job remains paused.', 'error');
    }
  } finally {
    if (thisRun === runId) { livePowerBusy = false; updateControls(); }
  }
}

async function togglePause() {
  if (!running || !transport || pauseBusy) return;
  const thisRun = runId;
  const resuming = paused && holdConfirmed;
  pauseBusy = true;
  if (!resuming) paused = true; // Stop feeding commands before the BLE write starts.
  updateControls();
  try {
    if (resuming) {
      await transport.sendRealtime('~'.charCodeAt(0), { confirmed: true });
      const status = await waitForMachineState((line) => /^<(Run|Idle)(?:\||>)/i.test(line));
      if (thisRun !== runId) return;
      if (!/^<(Run|Idle)(?:\||>)/i.test(status)) throw new Error(`Controller did not resume: ${status}`);
      paused = false;
      holdConfirmed = false;
      pauseResolver?.();
      setStatus('Controller resumed. Sending remaining commands…', 'busy');
    } else {
      await transport.sendRealtime('!'.charCodeAt(0), { confirmed: true });
      const status = await waitForMachineState((line) => /^<(Hold:0|Idle)(?:\||>)/i.test(line));
      if (thisRun !== runId) return;
      if (/^<Hold:0(?:\||>)/i.test(status)) {
        holdConfirmed = true;
        setStatus('Machine is stopped in Hold. Press Resume to continue.', 'busy');
      } else if (/^<Idle(?:\||>)/i.test(status)) {
        holdConfirmed = true;
        setStatus('Sender paused; controller is idle. Press Resume to continue.', 'busy');
      } else {
        setStatus(`Sender paused, but machine stop is unconfirmed (${status}). Watch the laser; use Abort or its physical stop if it keeps moving.`, 'error');
      }
    }
  } catch (error) {
    if (thisRun === runId) setStatus(`Pause control failed: ${error.message}. The sender remains paused; check the machine and use Abort if it keeps moving.`, 'error');
  } finally {
    if (thisRun === runId) { pauseBusy = false; updateControls(); }
  }
}

async function abortJob() {
  if (!running || !transport) return false;
  const currentTransport = transport;
  const wasFraming = framing;
  const wasLocating = locateRunning;
  controlBusy = true;
  runId++;
  running = false;
  framing = false;
  locateRunning = false;
  paused = false;
  holdConfirmed = false;
  pauseBusy = false;
  livePowerBusy = false;
  verified = false;
  originEstablished = false;
  originMethod = null;
  homedWco = null;
  $('#jogArmed').checked = false;
  $('#homeArmed').checked = false;
  $('#atWorkOrigin').checked = false;
  $('#frameArmed').checked = false;
  $('#locateArmed').checked = false;
  if (wasLocating) $('#locateStatus').textContent = 'Locate test stopped. Check the head, then Home before retrying.';
  clearCapturedGeometry();
  publishAlignment();
  pauseResolver?.();
  pauseResolver = null;
  currentTransport.cancel(new Error('Job aborted.'));
  updateControls();
  try {
    await currentTransport.sendRealtime(0x18);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const status = await currentTransport.queryStatus();
    if (!/^<(Idle|Alarm)(?:\||>)/i.test(status)) throw new Error(`Controller is still ${status}`);
    if (status.startsWith('<Idle')) {
      try { await currentTransport.sendCommand('M5'); }
      catch (error) { addLog(`Could not confirm M5 after reset: ${error.message}`); }
    }
    verified = true;
    setStatus(wasLocating
      ? 'Locate test stopped by controller reset. Check the head, then Home before another test.'
      : wasFraming
      ? 'Framing stopped by controller reset. Check the head, then Home before another frame.'
      : 'Job aborted. Home with switches, change power, and prepare the job again before restarting.', 'error');
    return true;
  } catch (error) {
    setStatus(`Abort recovery needs reconnection: ${error.message}. Check the machine first.`, 'error');
    return false;
  } finally {
    controlBusy = false;
    updateControls();
  }
}

function renderJigProfiles() {
  const select = $('#jigSelect');
  select.replaceChildren(new Option('No jig · bed origin', ''));
  for (const jig of jigProfiles) select.add(new Option(jig.jig_name, jig.id));
  if (!activeJig()) activeJigId = '';
  select.value = activeJigId;
  const jig = activeJig();
  $('#jigName').value = jig?.jig_name || '';
  $('#jigOriginX').value = jig?.origin_x ?? '';
  $('#jigOriginY').value = jig?.origin_y ?? '';
  $('#jigWidth').value = jig?.max_width ?? '';
  $('#jigHeight').value = jig?.max_height ?? '';
  $('#jigStatus').textContent = jig
    ? `${jig.jig_name}: machine X${jig.origin_x}, Y${jig.origin_y}; pocket ${jig.max_width} × ${jig.max_height} mm. Home before use.`
    : 'No jig active. Canvas X0 Y0 uses the homed bed origin.';
  publishAlignment(); updateControls();
}

function saveJig() {
  if (running || controlBusy) return;
  try {
    for (const id of ['jigName', 'jigOriginX', 'jigOriginY', 'jigWidth', 'jigHeight']) {
      if (!$('#' + id).value.trim()) throw new Error('Fill in the jig name, origin, width, and height.');
    }
    const profile = validateJig({
      id: activeJigId || crypto.randomUUID(), jig_name: $('#jigName').value,
      origin_x: Number($('#jigOriginX').value), origin_y: Number($('#jigOriginY').value),
      max_width: Number($('#jigWidth').value), max_height: Number($('#jigHeight').value),
    }, machineLimits());
    const index = jigProfiles.findIndex((jig) => jig.id === profile.id);
    if (index >= 0) jigProfiles[index] = profile;
    else jigProfiles.push(profile);
    localStorage.setItem(JIGS_KEY, JSON.stringify(jigProfiles));
    localStorage.setItem(ACTIVE_JIG_KEY, profile.id);
    activeJigId = profile.id;
    $('#locateArmed').checked = false;
    clearCapturedGeometry();
    renderJigProfiles();
    $('#jigStatus').textContent = `Saved ${profile.jig_name}. Home before physical framing.`;
  } catch (error) { $('#jigStatus').textContent = `Could not save jig: ${error.message}`; }
}

async function captureMeasurePoint(which) {
  if (!verified || !originEstablished || originMethod !== 'homed' || !homedWco || running || controlBusy || !transport) return;
  controlBusy = true; updateControls();
  try {
    const status = await transport.queryStatus();
    if (!status.startsWith('<Idle') || !positionState?.machine || !originEstablished || originMethod !== 'homed') {
      throw new Error('Controller must report Idle with a verified homed machine position.');
    }
    const point = { ...positionState.machine };
    if (which === 'A') { pointA = point; pointB = null; measurement = null; }
    else {
      pointB = point;
      measurement = measuredBox(pointA, pointB);
      const jig = activeJig();
      const edge = jig ? { minX: jig.origin_x, minY: jig.origin_y,
        maxX: jig.origin_x + jig.max_width, maxY: jig.origin_y + jig.max_height }
        : { minX: homedWco.x, minY: homedWco.y,
          maxX: homedWco.x + 300, maxY: homedWco.y + 300 };
      const limits = machineLimits();
      if (measurement.minX < edge.minX - 0.001 || measurement.minY < edge.minY - 0.001 ||
          measurement.maxX > edge.maxX + 0.001 || measurement.maxY > edge.maxY + 0.001 ||
          !limits || measurement.minX < -0.001 || measurement.minY < -0.001 ||
          measurement.maxX > limits.x + 0.001 || measurement.maxY > limits.y + 0.001) {
        measurement = null;
        throw new Error('Measured object extends outside the active pocket or bed.');
      }
    }
    publishAlignment();
    $('#measureStatus').textContent = measurement
      ? `A (${pointA.x.toFixed(2)}, ${pointA.y.toFixed(2)}) · B (${pointB.x.toFixed(2)}, ${pointB.y.toFixed(2)}) machine mm. Width ${measurement.width} mm, height ${measurement.height} mm.`
      : `Point A captured at machine X${point.x.toFixed(2)}, Y${point.y.toFixed(2)}. Jog to the opposite corner and set Point B.`;
  } catch (error) { $('#measureStatus').textContent = `Capture failed: ${error.message}`; }
  finally { controlBusy = false; updateControls(); }
}

async function captureOutlinePoint() {
  if (!verified || !originEstablished || originMethod !== 'homed' || !homedWco ||
      running || controlBusy || !transport || outlineClosed || outlinePoints.length >= 100) return;
  controlBusy = true; updateControls();
  try {
    const status = await transport.queryStatus();
    if (!status.startsWith('<Idle') || !positionState?.machine || !originEstablished || originMethod !== 'homed') {
      throw new Error('Controller must report Idle with a verified homed machine position.');
    }
    const point = validateOutlinePoint(positionState.machine, activeJig(), homedWco, machineLimits());
    const last = outlinePoints.at(-1);
    if (last && Math.hypot(point.x - last.x, point.y - last.y) < 0.2) {
      throw new Error('Jog at least 0.2 mm before capturing another point.');
    }
    outlinePoints.push(point);
    updateOutlineStatus(); publishAlignment();
  } catch (error) { $('#outlineStatus').textContent = `Capture failed: ${error.message}`; }
  finally { controlBusy = false; updateControls(); }
}

function requestEditorGeometry(kind) {
  return new Promise((resolve, reject) => {
    window.dispatchEvent(new CustomEvent('laserlink:geometry-request', { detail: { kind, resolve, reject } }));
  });
}

async function executeFrame(kind) {
  const isLocate = kind === 'locate';
  const statusElement = $(isLocate ? '#locateStatus' : '#frameStatus');
  if (!verified || !originEstablished || originMethod !== 'homed' || running || controlBusy ||
      positionState?.state !== 'Idle' || !(isLocate ? $('#locateArmed') : $('#frameArmed')).checked || !transport) return;
  controlBusy = true; updateControls();
  let geometry;
  try {
    geometry = kind === 'measurement' ? { bounds: measurementLocalBounds() } :
      await requestEditorGeometry(kind === 'contour' ? 'contour' : 'box');
    if (!geometry?.bounds) throw new Error('Create a design or capture a measurement first.');
    const maxFeed = Math.min(machineSettings?.maxRateX || 0, machineSettings?.maxRateY || 0);
    const sValue = Number($('#frameSValue').value);
    const feed = isLocate ? Math.min(1500, maxFeed) : Number($('#frameFeed').value);
    // Build once before touching the controller so bad geometry or settings
    // fail while the laser is still untouched.
    const options = { origin: workOriginForJig(activeJig(), currentWco()), wco: currentWco(),
      limits: machineLimits(), pocket: activeJig(), sValue, sMax: machineSettings?.sMax, feed, maxFeed };
    if (isLocate) buildLocateBox({ bounds: geometry.bounds, ...options });
    else if (kind === 'contour') buildContourFrame({ paths: geometry.paths, ...options });
    else buildBoxFrame({ bounds: geometry.bounds, ...options });
    if (!isLocate && !window.confirm(`Physically trace the ${kind} at S${sValue}, F${feed} mm/min? Low power can still mark material. Watch the machine and keep its stop accessible.`)) return;
    const thisRun = ++runId;
    running = true; framing = true; locateRunning = isLocate; controlBusy = false;
    (isLocate ? $('#locateArmed') : $('#frameArmed')).checked = false;
    statusElement.textContent = isLocate ? 'Checking controller coordinates before the laser-off test…' : 'Checking controller coordinates before framing…';
    updateControls();
    try {
      let status = await transport.queryStatus();
      if (!status.startsWith('<Idle')) throw new Error(`Controller is not idle: ${status}`);
      await transport.sendCommand('M5');
      if (isLocate) await transport.sendCommand('S0');
      await transport.sendCommand('G54');
      await transport.sendCommand('G92.1');
      lastWco = null; positionState = null;
      for (let attempt = 0; attempt < 12 && !currentWco(); attempt++) await transport.queryStatus();
      if (!originEstablished || !positionState?.work || !currentWco()) throw new Error('Work offset could not be verified after selecting G54.');
      const fresh = { ...options, origin: workOriginForJig(activeJig(), currentWco()), wco: currentWco() };
      const lines = isLocate ? buildLocateBox({ bounds: geometry.bounds, ...fresh })
        : kind === 'contour' ? buildContourFrame({ paths: geometry.paths, ...fresh })
          : buildBoxFrame({ bounds: geometry.bounds, ...fresh });
      statusElement.textContent = isLocate
        ? `Tracing the design box with the laser off at F${feed} mm/min. Watch the head.`
        : `Tracing ${kind}: ${lines.length} commands. Watch the machine.`;
      for (const line of lines) {
        if (thisRun !== runId) return;
        await transport.sendCommand(line);
      }
      // Idle confirms the queued laser-off path has finished executing.
      let idle = false;
      for (let attempt = 0; attempt < 600 && thisRun === runId; attempt++) {
        status = await transport.queryStatus();
        if (status.startsWith('<Idle')) { idle = true; break; }
        if (!/^<(Run|Hold)(?:[:|>])/i.test(status)) throw new Error(`Unexpected controller state: ${status}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (thisRun !== runId) return;
      if (!idle) throw new Error('Motion did not return to Idle in five minutes.');
      await transport.sendCommand('M5');
      if (isLocate) await transport.sendCommand('S0');
      running = false; framing = false; locateRunning = false;
      statusElement.textContent = isLocate
        ? 'Locate test complete. Controller is Idle; M5 and S0 were acknowledged.'
        : `${kind} frame complete. Controller reports Idle and M5 was acknowledged.`;
    } catch (error) {
      if (thisRun !== runId) return;
      await abortJob();
      statusElement.textContent = `${isLocate ? 'Locate test' : 'Framing'} stopped: ${error.message}. Check the machine and Home before retrying.`;
    } finally {
      if (thisRun === runId) { running = false; framing = false; locateRunning = false; updateControls(); }
    }
  } catch (error) { statusElement.textContent = `${isLocate ? 'Cannot locate' : 'Cannot frame'}: ${error.message}`; }
  finally { if (!running) { controlBusy = false; updateControls(); } }
}

connectButton.addEventListener('click', connect);
chooseButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  loadFile(fileInput.files?.[0]);
  fileInput.value = '';
});
startButton.addEventListener('click', runJob);
pauseButton.addEventListener('click', togglePause);
applyLivePowerButton.addEventListener('click', applyLivePower);
abortButton.addEventListener('click', abortJob);
sdRefreshButton.addEventListener('click', refreshSdCard);
recentSdRefresh.addEventListener('click', refreshSdCard);
projectsSdRefresh.addEventListener('click', refreshSdCard);
sdSelectButton.addEventListener('click', selectSdCard);
sdCardRefreshButton.addEventListener('click', refreshMountedCard);
sdUploadButton.addEventListener('click', uploadSdJob);
recoverButton.addEventListener('click', () => {
  if (!verified) {
    if (device?.gatt?.connected) {
      device.removeEventListener('gattserverdisconnected', onDisconnected);
      device.gatt.disconnect();
      onDisconnected();
    }
    showMode('send');
    connect();
  } else showMode('control');
});
editJobButton.addEventListener('click', async () => {
  if (controlBusy) return;
  if (running) {
    if (!paused || !holdConfirmed || pauseBusy || !job?.generated) return;
    if (!window.confirm('Abort this held job and edit the design power? It cannot Resume afterward. Home with switches and start the rebuilt job from the beginning.')) return;
    // A GRBL acknowledgement only says a command entered the planner. Some
    // low-power moves may already be queued, so editing requires a stop and
    // a fresh job from the beginning after homing.
    if (!await abortJob()) return;
    window.dispatchEvent(new Event('laserlink:job-invalidated'));
  }
  showMode('create');
  window.dispatchEvent(new Event('laserlink:open-settings'));
});
modeCreate.addEventListener('click', () => showMode('create'));
modeSend.addEventListener('click', () => showMode('send'));
modeControl.addEventListener('click', () => showMode('control'));
modeProjects.addEventListener('click', () => showMode('projects'));
$('#openProjectsFromCreate').addEventListener('click', () => showMode('projects'));
window.addEventListener('laserlink:show-create', () => showMode('create'));
$('#refreshPosition').addEventListener('click', refreshPosition);
$('#atWorkOrigin').addEventListener('change', updateControls);
$('#setWorkZero').addEventListener('click', setWorkZero);
$('#homeArmed').addEventListener('change', updateControls);
$('#homeMachine').addEventListener('click', homeMachine);
$('#homeMachineTop').addEventListener('click', homeMachine);
$('#jogArmed').addEventListener('change', () => {
  controlHint($('#jogArmed').checked
    ? originEstablished
      ? 'Jog enabled while idle. Each move turns the laser off first.'
      : 'Set X0 Y0 at the physical lower-left corner before moving.'
    : 'Jog disabled. Check the work origin and clear the area before enabling it.');
  updateControls();
});
for (const [group, key, setter] of [
  ['jogDistances', 'distance', (value) => { selectedDistance = value; }],
  ['jogSpeeds', 'speed', (value) => { selectedSpeed = value; }],
]) {
  document.querySelectorAll(`#${group} button`).forEach((button) => button.addEventListener('click', () => {
    setter(Number(button.dataset[key]));
    document.querySelectorAll(`#${group} button`).forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    updateControls();
  }));
}
document.querySelectorAll('[data-jog-x]').forEach((button) => button.addEventListener('click', () =>
  jog(Number(button.dataset.jogX), Number(button.dataset.jogY))));
$('#moveToCenter').addEventListener('click', moveToCenter);
$('#cancelJog').addEventListener('click', async () => {
  if (!controlBusy || !transport) return;
  try {
    await transport.sendRealtime(0x85);
    controlHint('Jog cancel requested. Wait for the machine to stop.');
  } catch (error) { controlHint(`Could not cancel jog: ${error.message}. Use the physical stop control.`, true); }
});
window.addEventListener('laserlink:generated-job', (event) => {
  if (running) { setStatus('Wait for the current job to stop before preparing another.', 'error'); return; }
  const { name, lines, bounds, sMax, jigId, origin } = event.detail;
  if (!Array.isArray(lines) || !lines.length || lines.join('\n').length > 20 * 1024 * 1024) {
    setStatus('Generated job is too large. Use a coarser raster resolution.', 'error');
    return;
  }
  job = { name, lines, generated: true, bounds, sMax, jigId, origin };
  sdUploadStatus.textContent = 'Ready to copy this job to a selected card. Check its settings before running it.';
  sdFilename.value = name;
  jobName.textContent = name;
  jobMeta.textContent = `${lines.length.toLocaleString()} commands · generated in this browser`;
  progress.max = lines.length;
  progress.value = 0;
  progressText.textContent = `0 / ${lines.length.toLocaleString()}`;
  showMode('send');
  setStatus(generatedJobReady()
    ? 'Generated job ready. Check the design and machine position before starting.'
    : 'Generated job prepared. Connect the laser and verify $30 / $32 before starting.',
    generatedJobReady() ? 'ready' : 'neutral');
  updateControls();
});
window.addEventListener('laserlink:job-invalidated', () => {
  if (!job?.generated) return;
  job = null;
  sdUploadStatus.textContent = 'Rebuild the edited job before copying it to the card.';
  jobName.textContent = 'Design changed';
  jobMeta.textContent = 'Prepare to send again with the updated settings';
  if (!running) {
    progress.max = 1;
    progress.value = 0;
    progressText.textContent = '0 / 0';
  }
  setStatus('Design or power changed. Prepare the job again before sending.', 'neutral');
  updateControls();
});
window.addEventListener('beforeunload', (event) => {
  if (!running) return;
  event.preventDefault();
  event.returnValue = '';
});
$('#jigSelect').addEventListener('change', () => {
  activeJigId = $('#jigSelect').value;
  $('#locateArmed').checked = false;
  try { localStorage.setItem(ACTIVE_JIG_KEY, activeJigId); } catch { /* Selection still works for this session. */ }
  clearCapturedGeometry();
  renderJigProfiles();
});
$('#saveJig').addEventListener('click', saveJig);
$('#deleteJig').addEventListener('click', () => {
  const jig = activeJig();
  if (!jig || !window.confirm(`Delete jig profile ${jig.jig_name}?`)) return;
  jigProfiles = jigProfiles.filter((record) => record.id !== jig.id);
  activeJigId = '';
  $('#locateArmed').checked = false;
  try {
    localStorage.setItem(JIGS_KEY, JSON.stringify(jigProfiles));
    localStorage.removeItem(ACTIVE_JIG_KEY);
  } catch { /* Keep the current-session list. */ }
  clearCapturedGeometry();
  renderJigProfiles();
});
$('#capturePointA').addEventListener('click', () => captureMeasurePoint('A'));
$('#capturePointB').addEventListener('click', () => captureMeasurePoint('B'));
$('#captureOutlinePoint').addEventListener('click', captureOutlinePoint);
$('#undoOutlinePoint').addEventListener('click', () => {
  if (!outlinePoints.length) return;
  outlinePoints.pop(); outlineClosed = false;
  updateOutlineStatus(); publishAlignment(); updateControls();
});
$('#closeOutline').addEventListener('click', () => {
  if (outlinePoints.length < 3 || outlineClosed) return;
  outlineClosed = true;
  updateOutlineStatus(); publishAlignment(); updateControls();
});
$('#clearOutline').addEventListener('click', () => {
  outlinePoints = []; outlineClosed = false;
  updateOutlineStatus(); publishAlignment(); updateControls();
});
$('#viewCapturedOutline').addEventListener('click', () => showMode('create'));
$('#clearMeasurement').addEventListener('click', () => {
  pointA = pointB = measurement = null;
  $('#measureStatus').textContent = 'No measurement captured.';
  publishAlignment(); updateControls();
});
$('#frameArmed').addEventListener('change', updateControls);
$('#locateArmed').addEventListener('change', updateControls);
window.addEventListener('laserlink:design-changed', () => {
  $('#locateArmed').checked = false;
  updateControls();
});
$('#locateTest').addEventListener('click', () => executeFrame('locate'));
$('#stopLocate').addEventListener('click', () => abortJob());
$('#frameDesign').addEventListener('click', () => executeFrame('design'));
$('#frameMeasurement').addEventListener('click', () => executeFrame('measurement'));
$('#frameContour').addEventListener('click', () => executeFrame('contour'));
$('#stopFrame').addEventListener('click', () => abortJob());
window.addEventListener('laserlink:editor-ready', publishAlignment);
renderSdLibrary();
renderJigProfiles();

if (!navigator.bluetooth) {
  setStatus('Open this localhost page in Google Chrome to use Bluetooth.', 'error');
} else {
  setStatus('Ready. Turn on Laser-22504, then click Connect laser.');
}
updateControls();
showMode('create');
