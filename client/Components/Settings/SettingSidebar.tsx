import React from 'react';
import { assets } from '../../assets/assets';
import { Icon } from '@iconify/react/dist/iconify.js';
// import SettingSidebarProps from './SettingProps';
import { useLanguage } from '../../src/i18n/LanguageContext';
// import { useTheme } from '../../src/ThemeContext';

interface SettingSidebarProps {
    activeSection: string;
    onSelectionClick: (id: string) => void;
}

function SettingSidebar({
    activeSection,
    onSelectionClick,
}: SettingSidebarProps) {
    const { t } = useLanguage();
    // const { theme } = useTheme();

    const SettingsOptions = [
        {
            id: 'Profile-Information',
            icon: 'mdi:account-card',
            title: t('settings.sidebar.accountPreferences'),
        },
        {
            id: 'Privacy',
            icon: 'dashicons:privacy',
            title: t('settings.sidebar.accountPrivacy'),
        },
        {
            id: 'Visibility',
            icon: 'material-symbols:visibility-outline',
            title: t('settings.sidebar.visibility'),
        },
        //  { WILL ADD EVENTUALLY
        //     id: 'Billing',
        //     icon: 'mage:dollar-fill',
        //     title: 'Billing Preferences',
        // },
        {
            id: 'Management',
            icon: 'mdi:account-outline',
            title:             t('settings.sidebar.accountManagement'),
        },
    ];
    return (
        <div className="w-80 shrink-0 h-screen pt-8 border-gray-200 sticky top-0 px-3">
            <div className="flex items-center gap-3 px-3 mb-4">
                <Icon
                    className="shrink-0"
                    width="35"
                    height="35"
                    icon="flat-color-icons:settings"
                ></Icon>
                <span className="text-3xl font-semibold text-gray-700 leading-tight">
                    {t('settings.sidebar.title')}
                </span>
            </div>
            <nav className="flex flex-col gap-1">
                {SettingsOptions.map((option) => {
                    const isActive = activeSection === option.id;
                    return (
                        <button
                            key={option.id}
                            onClick={() => onSelectionClick(option.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Icon
                                className="shrink-0"
                                icon={option.icon}
                                width="24"
                                height="24"
                            />
                            <span className="text-base leading-snug break-words">
                                {option.title}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

export default SettingSidebar;
