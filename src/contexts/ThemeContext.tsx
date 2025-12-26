'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Theme, ColorTheme } from '@/types';

interface ThemeContextType {
    theme: Theme;
    setMode: (mode: 'light' | 'dark') => void;
    setColor: (color: ColorTheme) => void;
    toggleMode: () => void;
}

const defaultTheme: Theme = {
    mode: 'dark',
    color: 'ocean'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useLocalStorage<Theme>('json-formatter-theme', defaultTheme);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme.mode);
        document.documentElement.setAttribute('data-color', theme.color);
    }, [theme]);

    const setMode = (mode: 'light' | 'dark') => {
        setTheme((prev) => ({ ...prev, mode }));
    };

    const setColor = (color: ColorTheme) => {
        setTheme((prev) => ({ ...prev, color }));
    };

    const toggleMode = () => {
        setTheme((prev) => ({
            ...prev,
            mode: prev.mode === 'light' ? 'dark' : 'light'
        }));
    };

    return (
        <ThemeContext.Provider value={{ theme, setMode, setColor, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
