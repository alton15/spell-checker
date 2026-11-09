import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTime, parseGameTime } from '../js/time.js';

test('formats seconds as MM:SS', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(754), '12:34');
  assert.equal(formatTime(5999), '99:59');
});

test('parses colon or dot separated times', () => {
  assert.equal(parseGameTime('12:34'), 754);
  assert.equal(parseGameTime('5:07'), 307);
  assert.equal(parseGameTime(' 12.34 '), 754);
});

test('parses digit-only input: last two digits are seconds', () => {
  assert.equal(parseGameTime('1234'), 754);
  assert.equal(parseGameTime('534'), 334);
});

test('treats one or two digits as whole minutes', () => {
  assert.equal(parseGameTime('5'), 300);
  assert.equal(parseGameTime('12'), 720);
});

test('rejects invalid input', () => {
  for (const input of ['', 'abc', '12:60', '1:2:3', '-1:00', '100:00', '12345']) {
    assert.equal(parseGameTime(input), null, `expected null for "${input}"`);
  }
});
