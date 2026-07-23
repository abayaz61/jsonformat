import test from 'node:test';
import assert from 'node:assert/strict';

import { decodeJwtPayload, findJwtAtOffset, formatJwtPayloadHoverMarkdown, formatJwtPayloadTooltip, parseJwt, extractJwt, formatJwtTimeClaims } from './jwt.ts';

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
    auth_time: 1699992800,
  };
  const token = [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

  const tooltip = formatJwtPayloadTooltip(token);

  assert.match(tooltip ?? '', /"exp": "1700000000 \(2023-11-14 22:13:20 UTC\)"/);
  assert.match(tooltip ?? '', /"iat": "1699996400 \(2023-11-14 21:13:20 UTC\)"/);
  assert.match(tooltip ?? '', /"nbf": "1699992800 \(2023-11-14 20:13:20 UTC\)"/);
  assert.match(tooltip ?? '', /"auth_time": "1699992800 \(2023-11-14 20:13:20 UTC\)"/);
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
  assert.match(markdown ?? '', /"exp": "1700000000 \(2023-11-14 22:13:20 UTC\)"/);
});

test('parseJwt tum jwt yapisini (header, payload, signature) cozmektedir', () => {
  const sampleJwt = 'eyJraWQiOiI1UkZPU2lOSVVtIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLm1hdHJpa3NkYXRhLklReCIsImV4cCI6MTc4NDgyMDI0OSwiaWF0IjoxNzg0NzMzODQ5LCJzdWIiOiIwMDA4MTIuNzdhMWE2ZTIyZTY1NDM2M2I3OTMwNDY5YTc3YzNlNzIuMTE1NyIsImNfaGFzaCI6ImJJN0g1WDFjRmdrMDAtMkJHQ1I1yUEiLCJlbWFpbCI6ImFiYXlhejYxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdXRoX3RpbWUiOjE3ODQ3MzM4NDksIm5vbmNlX3N1cHBvcnRlZCI6dHJ1ZSwicmVhbF91c2VyX3N0YXR1cyI6Mn0.YaDEHPloSs9Bby7H-PI335qYs0QX73OuKhopr-JRXxwQ__Hi7AVwTCYj9zwtrJRm-HKA5UD3bcFHaoEnlJUh1T9KVB5ypTNmfvW4xbtgTGXxdH0UFD8Lq7-35xAEt4sF9eNj1gfRRMmGqCb2mV9W6hjBYez2vznrEWTD0XlWafOMMCiuKB1Co4a6Tn6UbvqKL7YHJ2WmmwDBH4m431u3QnARCv5xJ8JQ61Oxxh8LfxIoSYA5kfDtsmHsJgUKCr4IIYoXJ2qJVkEeedMPGNlDp_NNADSnyXcE0Dfcras0A4oZ1HYu_RsT4863zBioD1O1SV81xCzZLHtYbdI2bHdpCg';
  
  const parsed = parseJwt(sampleJwt);
  assert.ok(parsed);
  assert.deepEqual(parsed.header, { kid: '5RFOSiNIUm', alg: 'RS256' });
  assert.equal(parsed.payload.email, 'abayaz61@gmail.com');
  assert.equal(parsed.payload.iss, 'https://appleid.apple.com');
  assert.ok(parsed.signature && parsed.signature.startsWith('YaDEHPlo'));
});

test('parseJwt Bearer on-eki olan tokenlari da cozmektedir', () => {
  const sampleJwt = 'Bearer eyJraWQiOiI1UkZPU2lOSVVtIiwiYWxnIjoiUlMyNTYifQ.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.signature';
  const parsed = parseJwt(sampleJwt);
  assert.ok(parsed);
  assert.equal(parsed.payload.email, 'test@example.com');
});

test('extractJwt kirlenmis veya ust uste yapistirilmis metin icinden jwt yi ayiklayip cozmektedir', () => {
  const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.signature';
  const dirtyContent = `{\n  "header": {\n    "alg": "RS256"\n  }\n}\n${validJwt}`;

  const extracted = extractJwt(dirtyContent);
  assert.ok(extracted);
  assert.equal(extracted.payload.email, 'test@example.com');
});

test('parseJwt tirnakli, noktalivirgullu ve arti/bolu karakterli jwt tokenlari cozmektedir', () => {
  const quotedJwt = '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.sig+na/ture==";';
  const parsed = parseJwt(quotedJwt);
  const extracted = extractJwt(quotedJwt);

  assert.ok(parsed);
  assert.equal(parsed.payload.email, 'user@example.com');
  assert.ok(extracted);
  assert.equal(extracted.payload.email, 'user@example.com');
});

test('formatJwtTimeClaims akilli unix zaman damgasi (milisaniye, saniye ve ozel key) tespiti yapar', () => {
  const payload = {
    custom_time: 1784820249,
    login_date: 1784820249000,
    normal_id: 12345,
  };
  const formatted = formatJwtTimeClaims(payload);
  assert.ok(typeof formatted.custom_time === 'string');
  assert.ok(String(formatted.custom_time).includes('UTC'));
  assert.ok(String(formatted.login_date).includes('UTC'));
  assert.equal(formatted.normal_id, 12345);
});
