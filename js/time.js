import { MAX_GAME_SECONDS } from './config.js';

const pad = (n) => String(n).padStart(2, '0');

export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(safe / 60))}:${pad(safe % 60)}`;
}

const SEPARATED = /^(\d{1,2})[:.](\d{1,2})$/;
const DIGITS = /^\d{1,4}$/;

function splitInput(text) {
  const separated = SEPARATED.exec(text);
  if (separated) return [Number(separated[1]), Number(separated[2])];
  if (!DIGITS.test(text)) return null;
  // "5" / "12" → whole minutes, "534" / "1234" → MMSS
  if (text.length <= 2) return [Number(text), 0];
  return [Number(text.slice(0, -2)), Number(text.slice(-2))];
}

/** Parses user-entered game time ("12:34", "12.34", "1234", "12") into seconds, or null. */
export function parseGameTime(input) {
  const parts = splitInput(String(input).trim());
  if (!parts) return null;
  const [minutes, seconds] = parts;
  if (seconds >= 60) return null;
  const total = minutes * 60 + seconds;
  return total <= MAX_GAME_SECONDS ? total : null;
}
