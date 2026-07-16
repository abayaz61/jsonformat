import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createPopupSuppressedUntil,
  isPopupSuppressed,
  suppressPopupForOneMonth,
} from './popupState.ts';

function createStorage(initial = {}) {
  const store = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

test('popup kapatılınca bitiş tarihi bir ay sonrasına yazılır', () => {
  const now = new Date('2026-07-16T10:30:00.000Z');

  const result = createPopupSuppressedUntil(now);

  assert.equal(result, '2026-08-16T10:30:00.000Z');
});

test('gelecekteki tarih varsa popup yeniden gösterilmez', () => {
  const storage = createStorage({
    welcome: '2026-08-16T10:30:00.000Z',
  });

  const result = isPopupSuppressed(storage, 'welcome', new Date('2026-07-20T10:30:00.000Z'));

  assert.equal(result, true);
});

test('süresi geçmiş kayıt temizlenir ve popup yeniden gösterilebilir', () => {
  const storage = createStorage({
    welcome: '2026-07-10T10:30:00.000Z',
  });

  const result = isPopupSuppressed(storage, 'welcome', new Date('2026-07-16T10:30:00.000Z'));

  assert.equal(result, false);
  assert.equal(storage.getItem('welcome'), null);
});

test('popup kapatılınca storage içine bir aylık erteleme yazılır', () => {
  const storage = createStorage();

  suppressPopupForOneMonth(storage, 'privacy', new Date('2026-07-16T10:30:00.000Z'));

  assert.equal(storage.getItem('privacy'), '2026-08-16T10:30:00.000Z');
});
