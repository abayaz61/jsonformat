import test from 'node:test';
import assert from 'node:assert/strict';

import { decodeJwtPayload, findJwtAtOffset, formatJwtPayloadHoverMarkdown, formatJwtPayloadTooltip } from './jwt.ts';

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

test('tooltip icinde epoch jwt alanlarini utc zamanla birlikte gosterir', () => {
  const payload = {
    sub: 'user-1',
    exp: 1700000000,
    iat: 1699996400,
    nbf: 1699992800,
  };
  const token = [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

  const tooltip = formatJwtPayloadTooltip(token);

  assert.match(tooltip ?? '', /"exp": 1700000000 \(2023-11-14 22:13:20 UTC\)/);
  assert.match(tooltip ?? '', /"iat": 1699996400 \(2023-11-14 21:13:20 UTC\)/);
  assert.match(tooltip ?? '', /"nbf": 1699992800 \(2023-11-14 20:13:20 UTC\)/);
});

test('editor hover markdown ciktisi utc aciklamali jwt payload kullanir', () => {
  const payload = {
    exp: 1700000000,
  };
  const token = [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

  const markdown = formatJwtPayloadHoverMarkdown(token);

  assert.match(markdown ?? '', /```json/);
  assert.match(markdown ?? '', /"exp": 1700000000 \(2023-11-14 22:13:20 UTC\)/);
});
