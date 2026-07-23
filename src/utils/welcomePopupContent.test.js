import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readLocale(locale) {
  const filePath = join(import.meta.dirname, '..', 'locales', `${locale}.json`);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

test('tr ve en welcome popup metinleri Diff, Convert, Model Export ve JWT tanitimini icerir', () => {
  const tr = readLocale('tr').welcomePopup;
  const en = readLocale('en').welcomePopup;

  assert.match(tr.newFeatureTitle ?? '', /JWT/i);
  assert.match(tr.newFeatureDesc ?? '', /JWT/i);
  assert.ok(tr.feature4Title); // Diff & Compare
  assert.ok(tr.feature5Title); // Format Converter
  assert.ok(tr.feature6Title); // Model Export
  assert.ok(tr.feature12Title); // JWT Auto-Parse

  assert.match(en.newFeatureTitle ?? '', /JWT/i);
  assert.match(en.newFeatureDesc ?? '', /JWT/i);
  assert.ok(en.feature4Title);
  assert.ok(en.feature5Title);
  assert.ok(en.feature6Title);
  assert.ok(en.feature12Title);
});
