import test from 'node:test';
import assert from 'node:assert/strict';

import { formatJson, validateJson, minifyJson } from './jsonOperations.ts';

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

test('trim secenegi acikken tum string degerlerin bosluklarini temizler', () => {
  const input = '{"name":"  Alice  ","nested":{"value":"  test  "},"items":["  a  ","b  "],"count":5}';

  const result = formatJson(input, 2, { trim: true });

  assert.equal(result, JSON.stringify({
    name: 'Alice',
    nested: { value: 'test' },
    items: ['a', 'b'],
    count: 5,
  }, null, 2));
});

test('gecerli jwt token yapistirildiginda formatJson header, payload ve signature iceren json uretir', () => {
  const sampleJwt = 'eyJraWQiOiI1UkZPU2lOSVVtIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLm1hdHJpa3NkYXRhLklReCIsImV4cCI6MTc4NDgyMDI0OSwiaWF0IjoxNzg0NzMzODQ5LCJzdWIiOiIwMDA4MTIuNzdhMWE2ZTIyZTY1NDM2M2I3OTMwNDY5YTc3YzNlNzIuMTE1NyIsImNfaGFzaCI6ImJJN0g1WDFjRmdrMDAtMkJHQ1I1yUEiLCJlbWFpbCI6ImFiYXlhejYxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdXRoX3RpbWUiOjE3ODQ3MzM4NDksIm5vbmNlX3N1cHBvcnRlZCI6dHJ1ZSwicmVhbF91c2VyX3N0YXR1cyI6Mn0.YaDEHPloSs9Bby7H-PI335qYs0QX73OuKhopr-JRXxwQ__Hi7AVwTCYj9zwtrJRm-HKA5UD3bcFHaoEnlJUh1T9KVB5ypTNmfvW4xbtgTGXxdH0UFD8Lq7-35xAEt4sF9eNj1gfRRMmGqCb2mV9W6hjBYez2vznrEWTD0XlWafOMMCiuKB1Co4a6Tn6UbvqKL7YHJ2WmmwDBH4m431u3QnARCv5xJ8JQ61Oxxh8LfxIoSYA5kfDtsmHsJgUKCr4IIYoXJ2qJVkEeedMPGNlDp_NNADSnyXcE0Dfcras0A4oZ1HYu_RsT4863zBioD1O1SV81xCzZLHtYbdI2bHdpCg';

  const formatted = formatJson(sampleJwt, 2);
  const validation = validateJson(sampleJwt);
  const minified = minifyJson(sampleJwt);

  assert.equal(validation.valid, true);
  assert.ok(formatted.includes('"kid": "5RFOSiNIUm"'));
  assert.ok(formatted.includes('"email": "abayaz61@gmail.com"'));
  assert.ok(formatted.includes('"signature": "YaDEHPlo'));
  assert.ok(formatted.includes('"raw": "eyJraWQi'));
  assert.ok(minified.includes('{"header":{"kid":"5RFOSiNIUm"'));
});
