'use client';

import { useSyncExternalStore } from 'react';

/**
 * SSR-safe client detection without setState in useEffect.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
