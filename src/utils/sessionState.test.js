import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getInitialSessionContent,
  saveTabSessionContent,
  getOrCreateTabId,
  cleanRawContent,
  LAST_SESSION_CONTENT_KEY,
  TAB_SESSION_CONTENT_KEY,
  TAB_ID_KEY,
  TAB_SESSIONS_STORE_KEY,
  MAX_TAB_SESSIONS,
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

test('ilk kez açıldığında (geçmiş yoksa) boş içerik açar ve tabId oluşturur', () => {
  const localStorage = createStorage();
  const sessionStorage = createStorage();

  const result = getInitialSessionContent(sessionStorage, localStorage);

  assert.equal(result, '');
  assert.ok(sessionStorage.getItem(TAB_ID_KEY));
});

test('yeni sekmede son oturum içeriğini yükler ve yeni tabId atar', () => {
  const localStorage = createStorage({
    [LAST_SESSION_CONTENT_KEY]: '{"latest":true}',
  });
  const sessionStorage = createStorage();

  const result = getInitialSessionContent(sessionStorage, localStorage);

  assert.equal(result, '{"latest":true}');
  assert.ok(sessionStorage.getItem(TAB_ID_KEY));
});

test('çift stringify edilmiş eski önbellek verisini doğru temizler', () => {
  const doubleEscaped = JSON.stringify('{\n  "dte": "22.07.2026"\n}');
  const localStorage = createStorage({
    [LAST_SESSION_CONTENT_KEY]: doubleEscaped,
  });
  const sessionStorage = createStorage();

  const result = getInitialSessionContent(sessionStorage, localStorage);

  assert.equal(result, '{\n  "dte": "22.07.2026"\n}');
});

test('birden fazla sekmede çalışırken refresh sonrası her sekme kendi içeriğini korur', () => {
  const localStorage = createStorage();

  // Tab 1 & Tab 2 session storages
  const sessionStorageTab1 = createStorage();
  const sessionStorageTab2 = createStorage();

  // Tab 1 initial open & edit
  const tab1Id = getOrCreateTabId(sessionStorageTab1);
  saveTabSessionContent(tab1Id, '{"tab":1}', sessionStorageTab1, localStorage);

  // Tab 2 opened (inherits tab 1 content initially)
  const tab2Id = getOrCreateTabId(sessionStorageTab2);
  saveTabSessionContent(tab2Id, '{"tab":2}', sessionStorageTab2, localStorage);

  // Tab 1 refresh simulation: sessionStorageTab1 still has tab1Id
  const refreshedTab1Content = getInitialSessionContent(sessionStorageTab1, localStorage);
  assert.equal(refreshedTab1Content, '{"tab":1}');

  // Tab 2 refresh simulation: sessionStorageTab2 still has tab2Id
  const refreshedTab2Content = getInitialSessionContent(sessionStorageTab2, localStorage);
  assert.equal(refreshedTab2Content, '{"tab":2}');
});

test('max 10 sekme sınırı korunur ve en eski sekmeler silinir', () => {
  const localStorage = createStorage();

  // 12 farklı sekme kaydedelim
  for (let i = 1; i <= 12; i++) {
    const sessionStorage = createStorage();
    const tabId = `tab_${i}`;
    sessionStorage.setItem(TAB_ID_KEY, tabId);
    saveTabSessionContent(tabId, `{"index":${i}}`, sessionStorage, localStorage);
  }

  const storeJson = localStorage.getItem(TAB_SESSIONS_STORE_KEY);
  assert.ok(storeJson);

  const store = JSON.parse(storeJson);
  const keys = Object.keys(store);

  assert.equal(keys.length, MAX_TAB_SESSIONS);
  // En son eklenen tab_12 ve tab_11 durmalı, ilk eklenen tab_1 ve tab_2 silinmiş olmalı
  assert.ok(store['tab_12']);
  assert.ok(store['tab_11']);
  assert.equal(store['tab_1'], undefined);
  assert.equal(store['tab_2'], undefined);
});


