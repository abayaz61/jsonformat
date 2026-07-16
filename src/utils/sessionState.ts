export const LAST_SESSION_CONTENT_KEY = 'json-formatter-content';
export const TAB_SESSION_CONTENT_KEY = 'json-formatter-tab-content';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getInitialSessionContent(
  sessionStorage: StorageLike | null | undefined,
  localStorage: StorageLike | null | undefined
): string {
  const tabContent = sessionStorage?.getItem(TAB_SESSION_CONTENT_KEY);

  if (typeof tabContent === 'string') {
    return tabContent;
  }

  return localStorage?.getItem(LAST_SESSION_CONTENT_KEY) ?? '';
}
