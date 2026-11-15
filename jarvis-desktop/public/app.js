// =============================================================
//  J.A.R.V.I.S. — a tela
//  Etapa 1: núcleo animado e modo leve (ainda sem voz).
// =============================================================

const core = document.getElementById('core');
const statusEl = document.getElementById('status');
const caption = document.getElementById('caption');
const liteToggle = document.getElementById('liteToggle');

// ---------- Estados do núcleo ----------
// idle = em espera, listening = ouvindo, thinking = pensando, speaking = falando
const STATUS_TEXT = {
  idle: 'Em espera',
  listening: 'Ouvindo',
  thinking: 'Processando',
  speaking: 'Falando',
};

let pulseTimer = null;

function setState(state) {
  core.dataset.state = state;
  statusEl.textContent = STATUS_TEXT[state] || '';
  stopPulse();
  if (state === 'speaking') startPulse();
}

// Faz o núcleo "pulsar" enquanto ele fala.
// (A voz do navegador não informa o volume, então imitamos a fala com
//  uma variação suave e aleatória.)
function startPulse() {
  let t = 0;
  pulseTimer = setInterval(() => {
    t += 1;
    const level = 0.35 + 0.35 * Math.abs(Math.sin(t * 0.7)) + Math.random() * 0.3;
    setLevel(level);
  }, 90);
}

function stopPulse() {
  clearInterval(pulseTimer);
  pulseTimer = null;
  setLevel(0);
}

function setLevel(value) {
  core.style.setProperty('--level', Math.max(0, Math.min(1, value)).toFixed(2));
}

// ---------- Demonstração (só na etapa 1) ----------
// Clique no núcleo para ver os estados em sequência.
const DEMO = [
  ['listening', 'Ouvindo… (aqui o núcleo fica azul)'],
  ['thinking', 'Pensando… (os anéis giram mais rápido)'],
  ['speaking', 'Falando, Senhor. (o núcleo pulsa com a voz)'],
  ['idle', 'Em espera, Senhor.'],
];
let demoIndex = 0;
core.addEventListener('click', () => {
  const [state, text] = DEMO[demoIndex];
  setState(state);
  caption.textContent = text;
  demoIndex = (demoIndex + 1) % DEMO.length;
});

// ---------- Modo leve ----------
// Guardamos a escolha no navegador (se ele permitir).
function readPref(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function savePref(key, value) {
  try { localStorage.setItem(key, value); } catch { /* sem problema */ }
}

function applyLite(on) {
  document.body.classList.toggle('lite', on);
  liteToggle.checked = on;
}
applyLite(readPref('jarvis-lite') === '1');
liteToggle.addEventListener('change', () => {
  applyLite(liteToggle.checked);
  savePref('jarvis-lite', liteToggle.checked ? '1' : '0');
});
