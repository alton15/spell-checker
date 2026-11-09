import { SPELLS, ROLES, BOOTS, MAX_RESUME_MS, MAX_GAME_SECONDS } from './config.js';

const STATE_KEY = 'spell-checker:state';
const SETTINGS_KEY = 'spell-checker:settings';
const SCHEMA_VERSION = 1;
const DEFAULT_SETTINGS = Object.freeze({ sound: true });
// A cooldown can run past the last valid game second, so allow some slack.
const MAX_END_TIME = MAX_GAME_SECONDS + 600;

const isValidEndTime = (t) => t === null || (Number.isInteger(t) && t >= 0 && t <= MAX_END_TIME);

const isValidSpell = (s) => s && typeof s.id === 'string' && Object.hasOwn(SPELLS, s.id) && isValidEndTime(s.endTime);

const isValidProfile = (p, i) =>
  p && p.role === ROLES[i] &&
  typeof p.cosmicInsight === 'boolean' &&
  Object.hasOwn(BOOTS, p.boots) &&
  Array.isArray(p.spells) && p.spells.length === 2 && p.spells.every(isValidSpell);

function isValidState(state) {
  if (!state || typeof state !== 'object') return false;
  const { gameStartTime, profiles } = state;
  const startOk = gameStartTime === null || Number.isFinite(gameStartTime);
  return startOk && Array.isArray(profiles) && profiles.length === ROLES.length && profiles.every(isValidProfile);
}

// Rebuild from known fields only, so nothing unexpected from storage leaks into state.
const sanitize = ({ gameStartTime, profiles }) => ({
  gameStartTime,
  profiles: profiles.map(({ role, cosmicInsight, boots, spells }) => ({
    role, cosmicInsight, boots, spells: spells.map(({ id, endTime }) => ({ id, endTime }))
  }))
});

function readJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch (error) {
    console.warn(`[spell-checker] could not read ${key}:`, error.message);
    return null;
  }
}

function writeJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[spell-checker] could not save ${key}:`, error.message);
    return false;
  }
}

export function loadState(storage, now) {
  const saved = readJson(storage, STATE_KEY);
  if (!saved || saved.v !== SCHEMA_VERSION || !isValidState(saved.state)) return null;
  const { gameStartTime } = saved.state;
  if (gameStartTime !== null && now - gameStartTime > MAX_RESUME_MS) return null;
  return sanitize(saved.state);
}

export const saveState = (storage, state) => writeJson(storage, STATE_KEY, { v: SCHEMA_VERSION, state });

export function loadSettings(storage) {
  const saved = readJson(storage, SETTINGS_KEY);
  const sound = typeof saved?.sound === 'boolean' ? saved.sound : DEFAULT_SETTINGS.sound;
  return { sound };
}

export const saveSettings = (storage, settings) => writeJson(storage, SETTINGS_KEY, { sound: settings.sound });
