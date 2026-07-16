import test from 'node:test';
import assert from 'node:assert/strict';

import { formatJson } from './jsonOperations.ts';

test('array disindaki obje listesi, sondaki virgulu ve ciplak Error degerini otomatik onarir', () => {
  const input = `{"status":Error,"id":1}
{"status":"Ok","id":2},`;

  const result = formatJson(input, 2);

  assert.equal(result, JSON.stringify([
    { status: 'Error', id: 1 },
    { status: 'Ok', id: 2 },
  ], null, 2));
});

test('json string icindeki escape edilmis log kayitlarini da formatlar', () => {
  const input = '"{\\"Date\\":\\"2026-07-14 17:59:45,597\\",\\"Level\\":Error,\\"RequestID\\":\\"(null)\\"},\\r\\n{\\"Date\\":\\"2026-07-14 17:59:49,999\\",\\"Level\\":Error,\\"RequestID\\":\\"(null)\\"},\\r\\n"';

  const result = formatJson(input, 2);

  assert.equal(result, JSON.stringify([
    { Date: '2026-07-14 17:59:45,597', Level: 'Error', RequestID: '(null)' },
    { Date: '2026-07-14 17:59:49,999', Level: 'Error', RequestID: '(null)' },
  ], null, 2));
});
