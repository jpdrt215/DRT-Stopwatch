// --- Splash timing + fade handling ---
const SPLASH_DELAY_MS = 2500;

window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  const timer  = document.getElementById('timer');

  setTimeout(() => {
    splash.classList.add('fading');
    splash.addEventListener('transitionend', () => {
      splash.style.display = 'none';
      timer.classList.remove('hidden');
      timer.classList.add('fadein');
      document.body.classList.remove('noscroll');
      window.scrollTo(0, 0);
    }, { once: true });
  }, SPLASH_DELAY_MS);
});

// --- Stopwatch: MM:SS:hundredths (00:00:00) ---
let startTime, tInterval, running = false, difference = 0;

const display   = document.getElementById('display');
const startBtn  = document.getElementById('start');
const stopBtn   = document.getElementById('stop');
const resetBtn  = document.getElementById('reset');      // big bottom reset
const resetAll  = document.getElementById('resetAll');
const copyBtn   = document.getElementById('copy');
const listEl    = document.getElementById('list');
const resultsEl = document.getElementById('results');

function updateTimer() {
  const now = Date.now();
  difference = now - startTime;

  let minutes    = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  let seconds    = Math.floor((difference % (1000 * 60)) / 1000);
  let hundredths = Math.floor((difference % 1000) / 10);

  if (minutes    < 10) minutes    = "0" + minutes;
  if (seconds    < 10) seconds    = "0" + seconds;
  if (hundredths < 10) hundredths = "0" + hundredths;

  display.textContent = `${minutes}:${seconds}:${hundredths}`;
}

function startTimer() {
  if (running) return;
  startTime = Date.now() - difference;
  tInterval = setInterval(updateTimer, 10);
  running = true;
}

function stopTimer() {
  if (!running) return;
  clearInterval(tInterval);
  running = false;
  logResult(display.textContent);   // store on Stop
}

function resetAndStart() {
  // Log current time (if any), then reset to 0 and immediately start again
  if (difference > 0) logResult(display.textContent);   // store on Reset
  clearInterval(tInterval);
  running = false;
  difference = 0;
  display.textContent = "00:00:00";
  startTimer();
}

function resetEverything() {
  clearInterval(tInterval);
  running = false;
  difference = 0;
  display.textContent = "00:00:00";
  listEl.innerHTML = '';
  resultsEl.classList.remove('show');
}

function logResult(timeText) {
  const li = document.createElement('li');
  li.textContent = timeText;

  // Insert new result at the top (most recent is #1)
  if (listEl.firstChild) {
    listEl.insertBefore(li, listEl.firstChild);
  } else {
    listEl.appendChild(li);
  }

  resultsEl.classList.add('show');
}

async function copyLog() {
  const items = [...listEl.querySelectorAll('li')].map((li, i) => `${i + 1}. ${li.textContent}`);
  const text = items.length ? items.join('\n') : 'No results';
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy log'), 1000);
  } catch {
    copyBtn.textContent = 'Copy failed';
    setTimeout(() => (copyBtn.textContent = 'Copy log'), 1200);
  }
}

startBtn .addEventListener('click', startTimer);
stopBtn  .addEventListener('click', stopTimer);
resetBtn .addEventListener('click', resetAndStart);
resetAll .addEventListener('click', resetEverything);
copyBtn  .addEventListener('click', copyLog);

// Initial paint
display.textContent = "00:00:00";
