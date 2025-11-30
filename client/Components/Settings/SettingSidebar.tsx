import React from 'react';
import { assets } from '../../assets/assets';
import { Icon } from '@iconify/react/dist/iconify.js';
// import SettingSidebarProps from './SettingProps';
// import { useTheme } from '../../src/ThemeContext';

interface SettingSidebarProps {
    activeSection: string;
    onSelectionClick: (id: string) => void;
}

function SettingSidebar({
    activeSection,
    onSelectionClick,
}: SettingSidebarProps) {
    // const { theme } = useTheme();

    const SettingsOptions = [
        {
            id: 'Profile-Information',
            icon: 'mdi:account-card',
            title: 'Account Preferences',
        },
        {
            id: 'Privacy',
            icon: 'dashicons:privacy',
            title: 'Account Privacy',
        },
        {
            id: 'Visibility',
            icon: 'material-symbols:visibility-outline',
            title: 'Visibility',
        },
        //  { WILL ADD EVENTUALLY
        //     id: 'Billing',
        //     icon: 'mage:dollar-fill',
        //     title: 'Billing Preferences',
        // },
        {
            id: 'Management',
            icon: 'mdi:account-outline',
            title: 'Account Management',
        },
    ];
    return (
        <div className="w-80 h-screen pt-8 border-gray-200 sticky top-0">
            <div className="flex justify-start ml-3">
                <Icon
                    className="ml-2.5 mt-3"
                    width="35"
                    height="35"
                    icon="flat-color-icons:settings"
                ></Icon>
                <span
                    className={`font-semi-bold text-4xl mt-2 ml-3 
                        // theme === 'dark' ? 'text-white' : 'text-gray-600'
                    `}
                >
                    Settings
                </span>
            </div>
            {SettingsOptions.map((option) => (
                <button
                    key={option.id}
                    onClick={() => onSelectionClick(option.id)}
                >
                    <div
                        className={`flex pt-8 justify-start ml-6 
                            activeSection === option.id
                                // ? 'text-blue-700'
                                // : theme === 'dark' ? 'text-white' : 'text-gray-600'
                        `}
                    >
                        <Icon
                            icon={option.icon}
                            width="26"
                            height="30"
                        />
                        <span className="ml-6 text-xl mt-0.5">
                            {option.title}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}

export default SettingSidebar;
