import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import API from '../../Service/service';
import { useAuth } from '../../Components/Auth/AuthContext';
import {
    LanguageContext,
    STORAGE_KEY,
    detectInitialLanguage,
    fromServerName,
    translate,
    type LanguageContextType,
} from './LanguageContext';
import type { Language } from './types';

// Kept apart from LanguageContext so components that only call useLanguage
// don't pull in the API and auth modules.
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated } = useAuth();
    const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

    useEffect(() => {
        document.documentElement.lang = language;
        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch {
            // Persisting is best effort.
        }
    }, [language]);

    // A saved account preference wins over this browser's cached choice.
    useEffect(() => {
        if (!isAuthenticated) return;
        let active = true;
        API.getGeneralPreferences()
            .then((preferences) => {
                const saved = fromServerName(preferences?.language);
                if (active && saved) setLanguageState(saved);
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, [isAuthenticated]);

    const setLanguage = useCallback(
        (next: Language) => {
            setLanguageState(next);
            if (isAuthenticated) {
                API.updateGeneralPreferences({ language: next }).catch((error) =>
                    console.error('Could not save language preference:', error),
                );
            }
        },
        [isAuthenticated],
    );

    const value = useMemo<LanguageContextType>(
        () => ({
            language,
            setLanguage,
            t: (key, params) => translate(language, key, params),
        }),
        [language, setLanguage],
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
