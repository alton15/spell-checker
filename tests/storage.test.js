import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadState, saveState, loadSettings, saveSettings } from '../js/storage.js';
import { createInitialState, startGame, useSpell } from '../js/state.js';
import { MAX_RESUME_MS } from '../js/config.js';

const T0 = 1_000_000_000_000;

const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k)
  };
};

const throwingStorage = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
  removeItem: () => { throw new Error('blocked'); }
};

test('round-trips a running game', () => {
  const storage = memoryStorage();
  const state = useSpell(startGame(createInitialState(), T0), 0, 0, T0);
  assert.equal(saveState(storage, state), true);
  assert.deepEqual(loadState(storage, T0 + 5000), state);
});

test('returns null when nothing is saved', () => {
  assert.equal(loadState(memoryStorage(), T0), null);
});

test('drops a game that started too long ago', () => {
  const storage = memoryStorage();
  saveState(storage, startGame(createInitialState(), T0));
  assert.equal(loadState(storage, T0 + MAX_RESUME_MS + 1), null);
});

test('rejects malformed or tampered data', () => {
  const storage = memoryStorage();
  const bad = [
    'not json',
    JSON.stringify({ v: 1, state: { gameStartTime: null, profiles: [] } }),
    JSON.stringify({ v: 1, state: { ...createInitialState(), profiles: createInitialState().profiles.map(p => ({ ...p, boots: 'rocket' })) } }),
    JSON.stringify({ v: 99, state: createInitialState() })
  ];
  for (const raw of bad) {
    storage.setItem('spell-checker:state', raw);
    assert.equal(loadState(storage, T0), null, raw);
  }
});

test('survives storage that throws', () => {
  assert.equal(loadState(throwingStorage, T0), null);
  assert.equal(saveState(throwingStorage, createInitialState()), false);
  assert.deepEqual(loadSettings(throwingStorage), { sound: true });
  assert.equal(saveSettings(throwingStorage, { sound: false }), false);
});

test('round-trips settings', () => {
  const storage = memoryStorage();
  saveSettings(storage, { sound: false });
  assert.deepEqual(loadSettings(storage), { sound: false });
});
