import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCooldown, getHaste } from '../js/cooldown.js';

test('returns base cooldown when there is no haste', () => {
  assert.equal(calculateCooldown(300, 0), 300);
});

test('applies summoner spell haste with the 100 / (100 + haste) formula', () => {
  assert.equal(calculateCooldown(300, 18), 254); // 254.24
  assert.equal(calculateCooldown(300, 28), 234); // 234.375
  assert.equal(calculateCooldown(180, 28), 141); // 140.625 rounds up
});

test('sums Cosmic Insight and boots haste', () => {
  assert.equal(getHaste({ cosmicInsight: false, boots: 'none' }), 0);
  assert.equal(getHaste({ cosmicInsight: true, boots: 'none' }), 18);
  assert.equal(getHaste({ cosmicInsight: false, boots: 'lucidity' }), 10);
  assert.equal(getHaste({ cosmicInsight: true, boots: 'crimson' }), 38);
});
