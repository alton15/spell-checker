import { SPELLS, TICK_MS, READY_HIGHLIGHT_MS } from './config.js';
import {
  createInitialState, isGameRunning, getElapsedSeconds, startGame, endGame, setGameTime,
  shiftGameTime, useSpell, changeSpell, toggleCosmic, cycleBoots, expireCooldowns
} from './state.js';
import { loadState, saveState, loadSettings, saveSettings } from './storage.js';
import { formatTime } from './time.js';
import { getLang, getStrings } from './i18n.js';
import { createAlerter } from './alerts.js';
import { buildBoard, updateBoard } from './view-board.js';
import { createSpellPicker } from './view-picker.js';
import { createTimerEditor } from './view-timer.js';
import { setText, setAttr } from './dom.js';

// Accessing localStorage can throw (privacy mode, blocked site data).
const storage = (() => {
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('[spell-checker] storage unavailable:', error.message);
    return null;
  }
})();
const lang = getLang(document);
const t = getStrings(lang);
const $ = (id) => document.getElementById(id);

const dom = {
  gameButton: $('game-btn'),
  timer: $('game-timer'),
  adjustButtons: document.querySelectorAll('.time-adj-btn'),
  soundButton: $('sound-btn'),
  board: $('profiles'),
  announcer: $('announcer')
};

// Spells that came back while the page was closed are cleared silently.
let state = expireCooldowns((storage && loadState(storage, Date.now())) ?? createInitialState(), Date.now()).state;
let settings = storage ? loadSettings(storage) : { sound: true };
let tickHandle = null;
const readyUntil = new Map();

const alerter = createAlerter(window, () => settings.sound);
const board = buildBoard(dom.board, state, t);
const picker = createSpellPicker($('spell-picker'), lang, t, (p, s, id) => dispatch(st => changeSpell(st, p, s, id)));

function render(now = Date.now()) {
  const running = isGameRunning(state);
  setText(dom.timer, formatTime(getElapsedSeconds(state, now)));
  setText(dom.gameButton, running ? t.end : t.start);
  dom.gameButton.classList.toggle('is-running', running);
  dom.adjustButtons.forEach(btn => { btn.disabled = !running; });
  setAttr(dom.soundButton, 'aria-pressed', String(settings.sound));
  setAttr(dom.soundButton, 'aria-label', settings.sound ? t.soundOn : t.soundOff);
  setText(dom.soundButton, settings.sound ? '🔔' : '🔕');
  updateBoard(board, state, now, { lang, t, readyUntil });
}

function persist() {
  if (storage) saveState(storage, state);
}

function dispatch(transition) {
  const next = transition(state, Date.now());
  if (next === state) return;
  state = next;
  persist();
  syncTicking();
  render();
}

function announceReady(expired) {
  const now = Date.now();
  const names = expired.map(({ profileIndex, spellIndex }) => {
    readyUntil.set(`${profileIndex}-${spellIndex}`, now + READY_HIGHLIGHT_MS);
    const profile = state.profiles[profileIndex];
    return t.ready(t.roles[profile.role], SPELLS[profile.spells[spellIndex].id].name[lang]);
  });
  dom.announcer.textContent = names.join(', ');
  alerter.notifyReady();
}

function tick() {
  const now = Date.now();
  const { state: next, expired } = expireCooldowns(state, now);
  if (expired.length > 0) {
    state = next;
    persist();
    announceReady(expired);
  }
  render(now);
}

function syncTicking() {
  const running = isGameRunning(state);
  if (running && tickHandle === null) tickHandle = setInterval(tick, TICK_MS);
  if (!running && tickHandle !== null) {
    clearInterval(tickHandle);
    tickHandle = null;
    readyUntil.clear();
  }
}

function handleBoardClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const p = Number(target.dataset.profile);
  const s = Number(target.dataset.spell);
  const actions = {
    use: () => dispatch((st, now) => useSpell(st, p, s, now)),
    cosmic: () => dispatch(st => toggleCosmic(st, p)),
    boots: () => dispatch(st => cycleBoots(st, p)),
    pick: () => picker.open(p, s, t.roles[state.profiles[p].role], state.profiles[p].spells[s].id)
  };
  actions[target.dataset.action]?.();
}

dom.gameButton.addEventListener('click', () => {
  dispatch((st, now) => (isGameRunning(st) ? endGame() : startGame(st, now)));
});
dom.adjustButtons.forEach(btn => btn.addEventListener('click', () => {
  dispatch((st, now) => shiftGameTime(st, Number(btn.dataset.delta), now));
}));
dom.soundButton.addEventListener('click', () => {
  settings = { ...settings, sound: !settings.sound };
  if (storage) saveSettings(storage, settings);
  render();
});
dom.board.addEventListener('click', handleBoardClick);
createTimerEditor(
  { display: dom.timer, form: $('timer-form'), input: $('timer-input'), error: $('timer-error') },
  t,
  (seconds) => dispatch((st, now) => setGameTime(st, seconds, now))
);
// Browsers only allow audio after a user gesture; any tap/key on the page unlocks it.
['pointerdown', 'keydown'].forEach(type => document.addEventListener(type, alerter.unlock, { capture: true }));

syncTicking();
tick();
