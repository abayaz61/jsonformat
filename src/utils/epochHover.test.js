import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEpochTimestamp } from './epochHover.ts';

test('parseEpochTimestamp saniye cinsi unix timestamp i dogru cozer', () => {
  const result = parseEpochTimestamp(1784820249);
  assert.ok(result);
  assert.ok(result.utc.endsWith('UTC'));
  assert.ok(result.utc.startsWith('2026-07'));
  assert.equal(result.isSeconds, true);
});

test('parseEpochTimestamp milisaniye cinsi unix timestamp i dogru cozer', () => {
  const result = parseEpochTimestamp(1784820249000);
  assert.ok(result);
  assert.ok(result.utc.endsWith('UTC'));
  assert.ok(result.utc.startsWith('2026-07'));
  assert.equal(result.isSeconds, false);
});

test('parseEpochTimestamp gecersiz ve aralik disi sayilar icin null doner', () => {
  assert.equal(parseEpochTimestamp(12345), null);
  assert.equal(parseEpochTimestamp(0), null);
  assert.equal(parseEpochTimestamp(NaN), null);
});
