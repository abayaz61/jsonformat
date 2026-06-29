'use client';

import { useCallback, useSyncExternalStore } from 'react';

const storageListeners = new Map<string, Set<() => void>>();

function subscribeToKey(key: string, onStoreChange: () => void): () => void {
    if (!storageListeners.has(key)) {
        storageListeners.set(key, new Set());
    }
    storageListeners.get(key)!.add(onStoreChange);

    const handleStorage = (event: StorageEvent) => {
        if (event.key === key) {
            onStoreChange();
        }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
        storageListeners.get(key)?.delete(onStoreChange);
        window.removeEventListener('storage', handleStorage);
    };
}

function notifyKey(key: string) {
    storageListeners.get(key)?.forEach((listener) => listener());
}

function readStoredValue<T>(key: string, initialValue: T): T {
    try {
        const item = window.localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return initialValue;
    }
}

/**
 * Generic localStorage hook with SSR safety
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const storedValue = useSyncExternalStore(
        (onStoreChange) => subscribeToKey(key, onStoreChange),
        () => readStoredValue(key, initialValue),
        () => initialValue,
    );

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                const previousValue = readStoredValue(key, initialValue);
                const valueToStore =
                    value instanceof Function ? value(previousValue) : value;
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                notifyKey(key);
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, initialValue],
    );

    return [storedValue, setValue];
}
