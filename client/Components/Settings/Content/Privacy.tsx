import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState } from 'react';
import { useLanguage } from '../../../src/i18n/LanguageContext';
// import { useTheme } from '../../../src/ThemeContext';

const PrivacyOptions = [
    {
        id: 'email',
        name: 'settings.privacy.email.name',
        description: 'settings.privacy.email.description',
    },
    // {  WILL BE IN FUTURE ITERATION
    //   id: 'phone',
    //   name: 'Phone Numbers',
    //   description: 'Add and verify phone numbers'
    // },
    // {
    //   id: 'passkeys',
    //   name: 'PassKeys',
    //   description: 'Secure authentication methods'
    // }
];

function Privacy() {
    const { t } = useLanguage();
    // const { theme } = useTheme();
    const [openSetting, setOpenSetting] = useState<string | null>(null);

    const handleSettingClick = (settingId: string) => {
        setOpenSetting(openSetting === settingId ? null : settingId);
    };

    return (
        <div>
            <div
                id="Privacy"
                className={`md:w-200 w-full md:rounded-xl col-start-1 row-start-1 overflow-hidden shadow-sm border border-gray-100" 
                    // theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                `}
            >
                <div
                    className={`p-6 border-b border-gray-100 
                        // theme === 'dark' ? 'text-white' : 'text-gray-900'
                    `}
                >
                    <h2 className="text-xl font-semibold ">
                        {t('settings.privacy.title')}
                    </h2>
                    <p className="text-sm  mt-1">
                        {t('settings.privacy.subtitle')}
                    </p>
                </div>

                {PrivacyOptions.map((item, index) => (
                    <div key={item.id}>
                        <div
                            className={`px-6 py-4 flex justify-between items-center transition-colors cursor-pointer 
                                // theme === 'dark'
                                //     ? 'hover:bg-gray-700'
                                //     : 'hover:bg-white'
                            `}
                            onClick={() => handleSettingClick(item.id)}
                        >
                            <div
                                className={`
                                    // theme === 'dark'
                                    //     ? 'text-white'
                                    //     : 'text-gray-900'
                                `}
                            >
                                <h3 className="font-medium ">                                {t(item.name)}</h3>
                                                                <p className="text-sm">{t(item.description)}</p>
                            </div>
                            <Icon
                                icon={
                                    openSetting === item.id
                                        ? 'mdi:chevron-up'
                                        : 'mdi:chevron-down'
                                }
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                    openSetting === item.id ? 'rotate-180' : ''
                                }`}
                            />
                        </div>

                        {openSetting === item.id && (
                            <div
                                className={`mx-4 mb-4 rounded-lg shadow-sm border border-gray-100 
                                    // theme === 'dark'
                                    //     ? 'bg-gray-900'
                                    //     : 'bg-white'
                                `}
                            >
                                <div className="p-6 space-y-4">
                                    {item.id === 'email' && (
                                        <>
                                            <div
                                                className={` 
                                                    // theme === 'dark'
                                                    //     ? 'text-white'
                                                    //     : 'text-gray-900'
                                                `}
                                            >
                                                <label className="block text-sm font-medium  mb-2">
                                                    {t('settings.privacy.primaryEmail')}
                                                </label>
                                                <input
                                                    type="email"
                                                    defaultValue="ethanmclaughlin24@gmail.com"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    id="emailNotifications"
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <label
                                                    htmlFor="emailNotifications"
                                                    className="text-sm text-gray-700"
                                                >
                                                    {t('settings.privacy.emailNotifications')}
                                                </label>
                                            </div>
                                        </>
                                    )}

                                    {item.id === 'phone' && (
                                        <>
                                            <div
                                                className={` 
                                                    // theme === 'dark'
                                                    //     ? 'text-white'
                                                    //     : 'text-gray-900'
                                                `}
                                            >
                                                <label className="block text-sm font-medium  mb-2">
                                                    {t('settings.privacy.phoneNumber')}
                                                </label>
                                                <input
                                                    type="tel"
                                                    placeholder="+1 (555) 123-4567"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    id="smsNotifications"
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <label
                                                    htmlFor="smsNotifications"
                                                    className="text-sm text-gray-700"
                                                >
                                                    {t('settings.privacy.smsNotifications')}
                                                </label>
                                            </div>
                                        </>
                                    )}

                                    {item.id === 'passkeys' && (
                                        <div
                                            className={` 
                                                // theme === 'dark'
                                                //     ? 'text-white'
                                                //     : 'text-gray-900'
                                            `}
                                        >
                                            <p className="text-sm  mb-4">
                                                {t('settings.privacy.passkeysIntro')}
                                            </p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center">
                                                        <Icon
                                                            icon="mdi:fingerprint"
                                                            className="w-6 h-6 text-blue-600 mr-3"
                                                        />
                                                        <div>
                                                            <span className="font-medium ">
                                                                {t('settings.privacy.touchId')}
                                                            </span>
                                                            <p className="text-sm ">
                                                                {t('settings.privacy.touchIdDescription')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                                        {t('settings.privacy.setup')}
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center">
                                                        <Icon
                                                            icon="mdi:key"
                                                            className="w-6 h-6 text-blue-600 mr-3"
                                                        />
                                                        <div>
                                                            <span className="font-medium ">
                                                                {t('settings.privacy.securityKey')}
                                                            </span>
                                                            <p className="text-sm ">
                                                                {t('settings.privacy.securityKeyDescription')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                                        {t('settings.privacy.add')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {index !== PrivacyOptions.length - 1 && (
                            <hr className="border-gray-100" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Privacy;
