import { SPELLS, ROLES, DEFAULT_SPELLS, BOOTS_ORDER, MAX_GAME_SECONDS } from './config.js';
import { calculateCooldown, getHaste } from './cooldown.js';

const createProfile = (role) => ({
  role,
  cosmicInsight: false,
  boots: 'none',
  spells: DEFAULT_SPELLS[role].map(id => ({ id, endTime: null }))
});

export const createInitialState = () => ({
  gameStartTime: null,
  profiles: ROLES.map(createProfile)
});

export const isGameRunning = (state) => state.gameStartTime !== null;

export function getElapsedSeconds(state, now) {
  if (!isGameRunning(state)) return 0;
  return Math.max(0, Math.floor((now - state.gameStartTime) / 1000));
}

const clampGameSeconds = (s) => Math.min(MAX_GAME_SECONDS, Math.max(0, s));

const updateProfile = (state, profileIndex, update) => ({
  ...state,
  profiles: state.profiles.map((p, i) => (i === profileIndex ? update(p) : p))
});

const updateSpell = (state, profileIndex, spellIndex, update) =>
  updateProfile(state, profileIndex, profile => ({
    ...profile,
    spells: profile.spells.map((s, i) => (i === spellIndex ? update(s, profile) : s))
  }));

export function startGame(state, now, startAtSeconds = 0) {
  return { ...state, gameStartTime: now - clampGameSeconds(startAtSeconds) * 1000 };
}

export const endGame = () => createInitialState();

/** Moves the game clock; remaining cooldowns stay the same, so ETAs move with it. */
export function shiftGameTime(state, deltaSeconds, now) {
  if (!isGameRunning(state)) return state;
  const elapsed = getElapsedSeconds(state, now);
  const actualDelta = clampGameSeconds(elapsed + deltaSeconds) - elapsed;
  if (actualDelta === 0) return state;
  return {
    gameStartTime: state.gameStartTime - actualDelta * 1000,
    profiles: state.profiles.map(profile => ({
      ...profile,
      spells: profile.spells.map(spell =>
        spell.endTime === null ? spell : { ...spell, endTime: spell.endTime + actualDelta })
    }))
  };
}

export function setGameTime(state, seconds, now) {
  if (!isGameRunning(state)) return startGame(state, now, seconds);
  return shiftGameTime(state, seconds - getElapsedSeconds(state, now), now);
}

export function useSpell(state, profileIndex, spellIndex, now) {
  const profile = state.profiles[profileIndex];
  const base = SPELLS[profile?.spells[spellIndex]?.id]?.cooldown ?? null;
  if (!isGameRunning(state) || base === null) return state;
  const endTime = getElapsedSeconds(state, now) + calculateCooldown(base, getHaste(profile));
  return updateSpell(state, profileIndex, spellIndex, spell => ({ ...spell, endTime }));
}

export function changeSpell(state, profileIndex, spellIndex, spellId) {
  if (!SPELLS[spellId]) return state;
  return updateProfile(state, profileIndex, profile => {
    const otherIndex = spellIndex === 0 ? 1 : 0;
    const current = profile.spells[spellIndex];
    if (current.id === spellId) return profile;
    const spells = profile.spells.map((s, i) => {
      if (i === spellIndex) return { id: spellId, endTime: null };
      // Two slots can't hold the same spell: move the old one over instead.
      if (i === otherIndex && s.id === spellId) return { ...current };
      return s;
    });
    return { ...profile, spells };
  });
}

export const toggleCosmic = (state, profileIndex) =>
  updateProfile(state, profileIndex, p => ({ ...p, cosmicInsight: !p.cosmicInsight }));

export const cycleBoots = (state, profileIndex) =>
  updateProfile(state, profileIndex, p => {
    const next = BOOTS_ORDER[(BOOTS_ORDER.indexOf(p.boots) + 1) % BOOTS_ORDER.length];
    return { ...p, boots: next };
  });

/** Clears cooldowns that have finished. Returns the same state object when nothing changed. */
export function expireCooldowns(state, now) {
  const elapsed = getElapsedSeconds(state, now);
  const expired = [];
  state.profiles.forEach((profile, profileIndex) => {
    profile.spells.forEach((spell, spellIndex) => {
      if (spell.endTime !== null && spell.endTime <= elapsed) {
        expired.push({ profileIndex, spellIndex });
      }
    });
  });
  if (expired.length === 0) return { state, expired };
  const isExpired = (p, s) => expired.some(e => e.profileIndex === p && e.spellIndex === s);
  const next = {
    ...state,
    profiles: state.profiles.map((profile, p) => ({
      ...profile,
      spells: profile.spells.map((spell, s) => (isExpired(p, s) ? { ...spell, endTime: null } : spell))
    }))
  };
  return { state: next, expired };
}
