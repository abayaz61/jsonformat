'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Language, TranslationStrings } from '@/types';

// Import all locale files
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';
import de from '@/locales/de.json';
import it from '@/locales/it.json';
import fr from '@/locales/fr.json';
import zh from '@/locales/zh.json';

const translations: Record<Language, TranslationStrings> = {
    en: en as TranslationStrings,
    tr: tr as TranslationStrings,
    de: de as TranslationStrings,
    it: it as TranslationStrings,
    fr: fr as TranslationStrings,
    zh: zh as TranslationStrings
};

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: TranslationStrings;
    availableLanguages: { code: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

const availableLanguages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'fr', name: 'Français' },
    { code: 'zh', name: '中文' }
];

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguage] = useLocalStorage<Language>('json-formatter-language', 'en');

    const t = useMemo(() => translations[language], [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
