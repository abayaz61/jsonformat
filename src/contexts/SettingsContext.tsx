'use client';

import React, { createContext, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Settings } from '@/types';

interface SettingsContextType {
    settings: Settings;
    updateSettings: (partial: Partial<Settings>) => void;
    savedContent: string;
    setSavedContent: (content: string) => void;
}

const defaultSettings: Settings = {
    theme: {
        mode: 'dark',
        color: 'ocean'
    },
    language: 'en',
    indentSize: 2,
    fontSize: 14,
    wordWrap: true,
    lineNumbers: true,
    minimap: false
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useLocalStorage<Settings>('json-formatter-settings', defaultSettings);
    const [savedContent, setSavedContentLocal] = useLocalStorage<string>('json-formatter-content', '');

    // Debounce timer ref
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateSettings = (partial: Partial<Settings>) => {
        setSettings((prev) => ({ ...prev, ...partial }));
    };

    // Debounced content save
    const setSavedContent = useCallback((content: string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setSavedContentLocal(content);
        }, 500);
    }, [setSavedContentLocal]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, savedContent, setSavedContent }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
