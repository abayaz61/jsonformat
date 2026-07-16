import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getInitialSessionContent,
  LAST_SESSION_CONTENT_KEY,
  TAB_SESSION_CONTENT_KEY,
} from './sessionState.ts';

function createStorage(initial = {}) {
  const store = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
  };
}

test('yeni sekmede son oturum içeriğini yükler', () => {
  const localStorage = createStorage({
    [LAST_SESSION_CONTENT_KEY]: '{"latest":true}',
  });
  const sessionStorage = createStorage();

  const result = getInitialSessionContent(sessionStorage, localStorage);

  assert.equal(result, '{"latest":true}');
});

test('refresh sonrası aynı sekmenin kendi içeriğini korur', () => {
  const localStorage = createStorage({
    [LAST_SESSION_CONTENT_KEY]: '{"latest":true}',
  });
  const sessionStorage = createStorage({
    [TAB_SESSION_CONTENT_KEY]: '{"tabSpecific":true}',
  });

  const result = getInitialSessionContent(sessionStorage, localStorage);

  assert.equal(result, '{"tabSpecific":true}');
});
