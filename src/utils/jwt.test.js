import test from 'node:test';
import assert from 'node:assert/strict';

import { decodeJwtPayload, findJwtAtOffset, formatJwtPayloadTooltip } from './jwt.ts';

const sampleToken = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9',
  'c2lnbmF0dXJl',
].join('.');

test('gecerli jwt payload bilgisini cozer', () => {
  assert.deepEqual(decodeJwtPayload(sampleToken), {
    sub: '1234567890',
    name: 'John Doe',
    admin: true,
  });
});

test('gecersiz token icin payload donmez', () => {
  assert.equal(decodeJwtPayload('not-a-jwt'), null);
});

test('metin icinde imlecin altindaki jwt degerini bulur', () => {
  const source = `{"token":"${sampleToken}","other":"value"}`;
  const offset = source.indexOf(sampleToken) + 5;
  const match = findJwtAtOffset(source, offset);

  assert.ok(match);
  assert.equal(match?.token, sampleToken);
  assert.deepEqual(match?.payload, {
    sub: '1234567890',
    name: 'John Doe',
    admin: true,
  });
});

test('tooltip icin okunabilir payload metni uretir', () => {
  const tooltip = formatJwtPayloadTooltip(sampleToken);

  assert.match(tooltip ?? '', /"name": "John Doe"/);
  assert.match(tooltip ?? '', /"admin": true/);
});
