import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readLocale(locale) {
  const filePath = join(import.meta.dirname, '..', 'locales', `${locale}.json`);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

test('tr ve en welcome popup metinleri JWT tanitimini icerir', () => {
  const tr = readLocale('tr').welcomePopup;
  const en = readLocale('en').welcomePopup;

  assert.match(tr.newFeatureTitle ?? '', /JWT/i);
  assert.match(tr.newFeatureDesc ?? '', /JWT/i);
  assert.ok(tr.feature10Title);
  assert.ok(tr.feature10Desc);

  assert.match(en.newFeatureTitle ?? '', /JWT/i);
  assert.match(en.newFeatureDesc ?? '', /JWT/i);
  assert.ok(en.feature10Title);
  assert.ok(en.feature10Desc);
});
