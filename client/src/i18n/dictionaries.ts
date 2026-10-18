import type { Dictionary, Language } from './types';
import common from './translations/common';
import shell from './translations/shell';
import communities from './translations/communities';
import social from './translations/social';
import profile from './translations/profile';
import settings from './translations/settings';
import projects from './translations/projects';

const areas = [common, shell, communities, social, profile, settings, projects];

const merge = (language: Language): Dictionary =>
    Object.assign({}, ...areas.map((area) => area[language]));

export const dictionaries: Record<Language, Dictionary> = {
    en: merge('en'),
    es: merge('es'),
};
