'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';

/**
 * Generic localStorage hook with SSR safety
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const cachedRawValueRef = useRef<string | null>(null);
    const cachedParsedValueRef = useRef<T>(initialValue);

    const getSnapshot = useCallback((): T => {
        if (typeof window === 'undefined') {
            return cachedParsedValueRef.current;
        }

        try {
            const rawValue = window.localStorage.getItem(key);
            if (rawValue === null) {
                cachedRawValueRef.current = null;
                cachedParsedValueRef.current = initialValue;
                return cachedParsedValueRef.current;
            }

            if (cachedRawValueRef.current === rawValue) {
                return cachedParsedValueRef.current;
            }

            cachedRawValueRef.current = rawValue;
            try {
                cachedParsedValueRef.current = JSON.parse(rawValue) as T;
            } catch {
                cachedParsedValueRef.current = (rawValue as unknown) as T;
            }
            return cachedParsedValueRef.current;
        } catch {
            cachedRawValueRef.current = null;
            cachedParsedValueRef.current = initialValue;
            return cachedParsedValueRef.current;
        }
    }, [initialValue, key]);

    const subscribe = useCallback((onStoreChange: () => void) => {
        if (typeof window === 'undefined') {
            return () => {};
        }

        const customEventName = `local-storage:${key}`;
        const handleStorage = (event: Event) => {
            if (event instanceof StorageEvent && event.key !== key) {
                return;
            }

            onStoreChange();
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener(customEventName, handleStorage);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener(customEventName, handleStorage);
        };
    }, [key]);

    const storedValue = useSyncExternalStore(subscribe, getSnapshot, () => initialValue);

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage.
    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                // Allow value to be a function so we have same API as useState
                const valueToStore =
                    value instanceof Function ? value(getSnapshot()) : value;

                if (typeof window !== 'undefined') {
                    const serializedValue = JSON.stringify(valueToStore);

                    cachedRawValueRef.current = serializedValue;
                    cachedParsedValueRef.current = valueToStore;

                    window.localStorage.setItem(key, serializedValue);
                    window.dispatchEvent(new Event(`local-storage:${key}`));
                }
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [getSnapshot, key]
    );

    return [storedValue, setValue];
}
