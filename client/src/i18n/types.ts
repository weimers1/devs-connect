export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

// Names stored by the server (GeneralPreferences.language) for each code.
export const LANGUAGE_SERVER_NAMES: Record<Language, string> = {
    en: 'English',
    es: 'Spanish',
};

export type Dictionary = Record<string, string>;
export type AreaTranslations = Record<Language, Dictionary>;
