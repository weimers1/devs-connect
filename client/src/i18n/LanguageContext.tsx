import React, { createContext, useContext } from 'react';
import { dictionaries } from './dictionaries';
import {
    DEFAULT_LANGUAGE,
    LANGUAGE_SERVER_NAMES,
    SUPPORTED_LANGUAGES,
    type Language,
} from './types';

export const STORAGE_KEY = 'devs-connect-language';

type TranslateParams = Record<string, string | number>;

export interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, params?: TranslateParams) => string;
}

const isLanguage = (value: unknown): value is Language =>
    typeof value === 'string' &&
    (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

export const fromServerName = (value: unknown): Language | null => {
    const match = (Object.keys(LANGUAGE_SERVER_NAMES) as Language[]).find(
        (code) => LANGUAGE_SERVER_NAMES[code] === value,
    );
    return match ?? null;
};

export const detectInitialLanguage = (): Language => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (isLanguage(stored)) return stored;
    } catch {
        // Storage can be unavailable (private mode); fall back to the browser language.
    }
    if (typeof navigator !== 'undefined' && /^es\b/i.test(navigator.language)) {
        return 'es';
    }
    return DEFAULT_LANGUAGE;
};

export const translate = (
    language: Language,
    key: string,
    params?: TranslateParams,
): string => {
    const template =
        dictionaries[language][key] ?? dictionaries[DEFAULT_LANGUAGE][key] ?? key;
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
    );
};

const fallbackContext: LanguageContextType = {
    language: DEFAULT_LANGUAGE,
    setLanguage: () => undefined,
    t: (key, params) => translate(DEFAULT_LANGUAGE, key, params),
};

export const LanguageContext = createContext<LanguageContextType>(fallbackContext);

export const useLanguage = (): LanguageContextType => useContext(LanguageContext);
