/* Stopwatch with separate Stop (pause) + Reset that saves and auto-starts */
let isRunning = false;
let startTime = 0;
let elapsed = 0;        // ms currently accumulated (kept when paused)
let rafId = null;

let results = [];       // newest first

const display = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsList = document.getElementById('resultsList');
const infoBtn = document.getElementById('infoBtn');
const instructionsDialog = document.getElementById('instructionsDialog');
const resetConfirmDialog = document.getElementById('resetConfirmDialog');
const confirmResetAll = document.getElementById('confirmResetAll');

function formatTime(ms) {
  const hundredths = Math.floor(ms / 10);
  const minutes = Math.floor(hundredths / 6000);
  const seconds = Math.floor((hundredths % 6000) / 100);
  const h = hundredths % 100;
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(h).padStart(2,'0')}`;
}

function tick() {
  if (!isRunning) return;
  const now = performance.now();
  elapsed = now - startTime;
  display.textContent = formatTime(elapsed);
  rafId = requestAnimationFrame(tick);
}

function start() {
  if (isRunning) return;
  // Resume from current elapsed (if paused) or start fresh (if after reset)
  isRunning = true;
  startTime = performance.now() - elapsed;
  rafId = requestAnimationFrame(tick);
}

function stop() {
  if (!isRunning) return;
  isRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  // Keep "elapsed" as-is so Start will resume from here
}

function resetAndAutoStart() {
  // Save elapsed (if > 0), then reset and auto-start a new cycle
  if (elapsed > 0) addResult(elapsed);
  // Reset
  isRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  elapsed = 0;
  display.textContent = '00:00.00';
  // Auto-start from zero
  start();
}

function addResult(ms) {
  results.unshift({ ms, createdAt: Date.now() }); // newest first
  renderResults();
}

function renderResults() {
  resultsList.innerHTML = '';
  resultsSection.classList.toggle('hidden', results.length === 0);
  results.forEach((r, idx) => {
    const li = document.createElement('li');
    const number = idx + 1; // newest = 1
    li.innerHTML = `<span>${number}.</span><code>${formatTime(r.ms)}</code>`;
    resultsList.appendChild(li);
  });
}

async function copyLog() {
  const lines = results.map((r, i) => `${i+1}. ${formatTime(r.ms)}`);
  const text = 'Demonstration Stopwatch Results\n' + (lines.join('\n') || 'No results.');
  try {
    await navigator.clipboard.writeText(text);
    flash('Copied!');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    flash('Copied!');
  }
}

function clearAll() {
  results = [];
  renderResults();
  // Also stop and reset timer/display
  if (rafId) cancelAnimationFrame(rafId);
  isRunning = false;
  rafId = null;
  elapsed = 0;
  display.textContent = '00:00.00';
}

function flash(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.position = 'fixed';
  toast.style.left = '50%';
  toast.style.bottom = '24px';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '10px 14px';
  toast.style.background = 'rgba(139,92,246,0.15)';
  toast.style.border = '1px solid rgba(250,204,21,0.6)';
  toast.style.borderRadius = '999px';
  toast.style.backdropFilter = 'blur(8px)';
  toast.style.color = '#fff';
  toast.style.zIndex = '9999';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1000);
}

// Hook up buttons
startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);
resetBtn.addEventListener('click', resetAndAutoStart);
copyBtn.addEventListener('click', copyLog);
resetAllBtn.addEventListener('click', () => resetConfirmDialog.showModal());
confirmResetAll.addEventListener('click', clearAll);
infoBtn.addEventListener('click', () => instructionsDialog.showModal());

// PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  });
}
