import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState, getElapsedSeconds, startGame, endGame, setGameTime,
  shiftGameTime, useSpell, changeSpell, toggleCosmic, cycleBoots, expireCooldowns
} from '../js/state.js';

const T0 = 1_000_000_000_000;
const at = (seconds) => T0 + seconds * 1000;

test('initial state has five roles with two default spells each', () => {
  const state = createInitialState();
  assert.equal(state.gameStartTime, null);
  assert.deepEqual(state.profiles.map(p => p.role), ['top', 'jungle', 'mid', 'adc', 'support']);
  assert.deepEqual(state.profiles[0].spells.map(s => s.id), ['flash', 'teleport']);
  assert.ok(state.profiles.every(p => p.spells.every(s => s.endTime === null)));
});

test('startGame begins at the given game time', () => {
  const state = startGame(createInitialState(), T0, 90);
  assert.equal(getElapsedSeconds(state, T0), 90);
  assert.equal(getElapsedSeconds(state, at(10)), 100);
});

test('useSpell sets the end time using haste and does not mutate input', () => {
  const started = startGame(createInitialState(), T0);
  const withCosmic = toggleCosmic(started, 0);
  const used = useSpell(withCosmic, 0, 0, at(60));
  assert.equal(used.profiles[0].spells[0].endTime, 60 + 254);
  assert.equal(withCosmic.profiles[0].spells[0].endTime, null);
});

test('useSpell is a no-op before the game starts or for untracked spells', () => {
  const idle = createInitialState();
  assert.equal(useSpell(idle, 0, 0, T0), idle);
  const started = startGame(idle, T0);
  assert.equal(useSpell(started, 1, 1, T0), started); // jungle smite
});

test('setGameTime starts an idle game at that time', () => {
  const state = setGameTime(createInitialState(), 754, T0);
  assert.equal(getElapsedSeconds(state, T0), 754);
});

test('setGameTime keeps remaining cooldown and shifts ETA', () => {
  const started = startGame(createInitialState(), T0);
  const used = useSpell(started, 0, 0, at(100)); // endTime 400, remaining 300
  const synced = setGameTime(used, 130, at(100));
  assert.equal(getElapsedSeconds(synced, at(100)), 130);
  assert.equal(synced.profiles[0].spells[0].endTime, 430);
});

test('shiftGameTime clamps at zero', () => {
  const started = startGame(createInitialState(), T0, 3);
  const shifted = shiftGameTime(started, -5, T0);
  assert.equal(getElapsedSeconds(shifted, T0), 0);
});

test('endGame resets everything', () => {
  const used = useSpell(startGame(createInitialState(), T0), 0, 0, T0);
  assert.deepEqual(endGame(used), createInitialState());
});

test('changeSpell swaps slots when the spell is already in the other slot', () => {
  const state = changeSpell(createInitialState(), 0, 1, 'flash');
  assert.deepEqual(state.profiles[0].spells.map(s => s.id), ['teleport', 'flash']);
});

test('changeSpell clears the running cooldown of the changed slot', () => {
  const used = useSpell(startGame(createInitialState(), T0), 2, 1, T0);
  const changed = changeSpell(used, 2, 1, 'barrier');
  assert.deepEqual(changed.profiles[2].spells[1], { id: 'barrier', endTime: null });
});

test('changeSpell ignores unknown spell ids', () => {
  const state = createInitialState();
  assert.equal(changeSpell(state, 0, 0, 'nope'), state);
});

test('cycleBoots goes none -> lucidity -> crimson -> none', () => {
  let state = createInitialState();
  const seen = [];
  for (let i = 0; i < 3; i++) {
    state = cycleBoots(state, 0);
    seen.push(state.profiles[0].boots);
  }
  assert.deepEqual(seen, ['lucidity', 'crimson', 'none']);
});

test('expireCooldowns clears finished cooldowns and reports them', () => {
  const used = useSpell(startGame(createInitialState(), T0), 2, 1, T0); // ignite 180
  const before = expireCooldowns(used, at(179));
  assert.equal(before.state, used);
  assert.deepEqual(before.expired, []);

  const after = expireCooldowns(used, at(180));
  assert.equal(after.state.profiles[2].spells[1].endTime, null);
  assert.deepEqual(after.expired, [{ profileIndex: 2, spellIndex: 1 }]);
});
