export const LAST_SESSION_CONTENT_KEY = 'json-formatter-content';
export const TAB_SESSION_CONTENT_KEY = 'json-formatter-tab-content';
export const TAB_ID_KEY = 'json-formatter-tab-id';
export const TAB_SESSIONS_STORE_KEY = 'json-formatter-tabs-store';
export const MAX_TAB_SESSIONS = 10;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface TabSessionEntry {
  id: string;
  content: string;
  updatedAt: number;
}

export function getOrCreateTabId(sessionStorage: StorageLike | null | undefined): string {
  if (!sessionStorage) {
    return 'tab_default';
  }
  try {
    let tabId = sessionStorage.getItem(TAB_ID_KEY);
    if (!tabId) {
      tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem(TAB_ID_KEY, tabId);
    }
    return tabId;
  } catch {
    return 'tab_default';
  }
}

export function cleanRawContent(content: string | null | undefined): string {
  if (!content) return '';
  // Check if content was accidentally JSON-stringified previously (e.g. starts with " and ends with ")
  let text = content.trim();
  if (text.startsWith('"') && text.endsWith('"') && text.length >= 2) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'string') {
        return parsed;
      }
    } catch {
      // ignore parse error if it was just a string starting and ending with quotes
    }
  }
  return content;
}

export function getInitialSessionContent(
  sessionStorage: StorageLike | null | undefined,
  localStorage: StorageLike | null | undefined
): string {
  if (!sessionStorage || !localStorage) {
    return '';
  }

  try {
    const existingTabId = sessionStorage.getItem(TAB_ID_KEY);

    if (existingTabId) {
      // Refreshing an existing tab: try to fetch this tab's own content
      const storeJson = localStorage.getItem(TAB_SESSIONS_STORE_KEY);
      if (storeJson) {
        try {
          const store: Record<string, TabSessionEntry> = JSON.parse(storeJson);
          if (store && store[existingTabId] && typeof store[existingTabId].content === 'string') {
            return cleanRawContent(store[existingTabId].content);
          }
        } catch {
          // ignore parse error
        }
      }

      // Fallback to tab's sessionStorage
      const sessionContent = sessionStorage.getItem(TAB_SESSION_CONTENT_KEY);
      if (typeof sessionContent === 'string') {
        return cleanRawContent(sessionContent);
      }

      // Fallback to last active session
      return cleanRawContent(localStorage.getItem(LAST_SESSION_CONTENT_KEY));
    } else {
      // New tab opened: create a new tabId for this tab
      const newTabId = getOrCreateTabId(sessionStorage);
      const lastContent = cleanRawContent(localStorage.getItem(LAST_SESSION_CONTENT_KEY));

      // Initialize tab session in storage if lastContent exists
      saveTabSessionContent(newTabId, lastContent, sessionStorage, localStorage);

      return lastContent;
    }
  } catch {
    return '';
  }
}

let lastTimestamp = 0;
function getMonotonicTimestamp(): number {
  const now = Date.now();
  if (now <= lastTimestamp) {
    lastTimestamp += 1;
  } else {
    lastTimestamp = now;
  }
  return lastTimestamp;
}

export function saveTabSessionContent(
  tabId: string,
  content: string,
  sessionStorage: StorageLike | null | undefined,
  localStorage: StorageLike | null | undefined
): void {
  if (!sessionStorage || !localStorage) return;

  try {
    // 1. Keep tab's sessionStorage updated
    sessionStorage.setItem(TAB_SESSION_CONTENT_KEY, content);

    // 2. Keep last active session updated for new tabs
    localStorage.setItem(LAST_SESSION_CONTENT_KEY, content);

    // 3. Update tab store in localStorage
    const storeJson = localStorage.getItem(TAB_SESSIONS_STORE_KEY);
    let store: Record<string, TabSessionEntry> = {};
    if (storeJson) {
      try {
        store = JSON.parse(storeJson) || {};
      } catch {
        store = {};
      }
    }

    store[tabId] = {
      id: tabId,
      content,
      updatedAt: getMonotonicTimestamp(),
    };

    // 4. Enforce MAX 10 entries limit
    const entries = Object.values(store);
    if (entries.length > MAX_TAB_SESSIONS) {
      entries.sort((a, b) => b.updatedAt - a.updatedAt);
      const keepEntries = entries.slice(0, MAX_TAB_SESSIONS);
      store = {};
      for (const entry of keepEntries) {
        store[entry.id] = entry;
      }
    }

    localStorage.setItem(TAB_SESSIONS_STORE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage write errors (e.g. storage disabled/full)
  }
}

