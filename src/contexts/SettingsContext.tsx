'use client';

import React, { createContext, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Settings } from '@/types';
import {
    LAST_SESSION_CONTENT_KEY,
    getOrCreateTabId,
    saveTabSessionContent,
} from '@/utils/sessionState';

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
    const [savedContent, setSavedContentState] = React.useState<string>('');

    const latestContentRef = useRef<string>('');

    const updateSettings = (partial: Partial<Settings>) => {
        setSettings((prev) => ({ ...prev, ...partial }));
    };

    // Synchronous immediate content save so new tabs get the latest state without delay
    const setSavedContent = useCallback((content: string) => {
        latestContentRef.current = content;
        setSavedContentState(content);

        if (typeof window !== 'undefined') {
            const tabId = getOrCreateTabId(window.sessionStorage);
            saveTabSessionContent(tabId, content, window.sessionStorage, window.localStorage);
        }
    }, []);

    // Flush on unmount or beforeunload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (typeof window !== 'undefined' && latestContentRef.current !== undefined) {
                const tabId = getOrCreateTabId(window.sessionStorage);
                saveTabSessionContent(tabId, latestContentRef.current, window.sessionStorage, window.localStorage);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
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
