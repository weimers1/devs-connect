import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState } from 'react';
// import { useTheme } from '../../../src/ThemeContext';

const PrivacyOptions = [
    {
        id: 'email',
        name: 'Email Address',
        description: 'Manage your email preferences',
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
                        Privacy & Security
                    </h2>
                    <p className="text-sm  mt-1">
                        Manage your account security and privacy settings
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
                                <h3 className="font-medium ">{item.name}</h3>
                                <p className="text-sm">{item.description}</p>
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
                                                    Primary Email
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
                                                    Receive email notifications
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
                                                    Phone Number
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
                                                    Receive SMS notifications
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
                                                Passkeys provide a more secure
                                                way to sign in without
                                                passwords.
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
                                                                Touch ID
                                                            </span>
                                                            <p className="text-sm ">
                                                                Use your
                                                                fingerprint to
                                                                sign in
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                                        Setup
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
                                                                Security Key
                                                            </span>
                                                            <p className="text-sm ">
                                                                Use a hardware
                                                                security key
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                                        Add
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
