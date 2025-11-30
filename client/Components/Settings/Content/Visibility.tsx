import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useMemo, useCallback } from 'react';
// import { useTheme } from '../../../src/ThemeContext';

const VISIBILITY_OPTIONS = [
    {
        id: 'profile-visibility',
        name: 'Profile Visibility',
        description: 'Control who can see your profile',
    },
    {
        id: 'communities-visibility',
        name: 'Communities Visibility',
        description: 'Control who can see your communities',
    },
    {
        id: 'connections-visibility',
        name: 'Connections Visibility',
        description: 'Control who can see your connections',
    },
];

export default function Visibility() {
    const [openSetting, setOpenSetting] = useState<string | null>(null);
    // const { theme } = useTheme();

    const handleSettingClick = useCallback((settingId: string) => {
        setOpenSetting(prev => prev === settingId ? null : settingId);
    }, []);

    // const isDark = theme === 'dark';

    return (
        <div>
            <div
                id="Visibility"
                className={`md:w-200 w-full md:rounded-xl col-start-1 row-start-1 overflow-hidden shadow-sm border border-gray-100 
                    // isDark ? 'bg-gray-900' : 'bg-white'
                `}
            >
                <div
                    className={`p-6 border-b border-gray-100 
                        // isDark ? 'text-white' : 'text-gray-900'
                    `}
                >
                    <h2 className="text-xl font-semibold ">
                        Visibility Settings
                    </h2>
                    <p className="text-sm  mt-1">
                        Control what others can see about you
                    </p>
                </div>

                {VISIBILITY_OPTIONS.map((item, index) => (
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
                                <p className="text-sm ">{item.description}</p>
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
                                    //     ? 'bg-gray-800'
                                    //     : 'bg-white'
                                `}
                            >
                                <div className="p-6 space-y-4">
                                    {(item.id === 'profile-visibility' ||
                                        item.id === 'communities-visibility' ||
                                        item.id ===
                                            'connections-visibility') && (
                                        <div
                                            className={` 
                                                // theme === 'dark'
                                                //     ? 'text-white'
                                                //     : 'text-gray-900'
                                            `}
                                        >
                                            <h3 className="text-sm font-semibold  mb-3">
                                                Who can see this?
                                            </h3>
                                            <div className="space-y-3">
                                                <div
                                                    className={` 
                                                        // theme === 'dark'
                                                        //     ? 'hover:bg-gray-600'
                                                        //     : 'hover:bg-gray-50'
                                                    `}
                                                >
                                                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg  cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={item.id}
                                                            value="everyone"
                                                            className="w-4 h-4 text-blue-600"
                                                        />
                                                        <div className="flex items-center">
                                                            <Icon
                                                                icon="mdi:earth"
                                                                className="w-5 h-5 text-gray-400 mr-3"
                                                            />
                                                            <div>
                                                                <span className="font-medium ">
                                                                    Everyone
                                                                </span>
                                                                <p className="text-sm ">
                                                                    Anyone can
                                                                    see this
                                                                    information
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                                <div
                                                    className={` 
                                                        // theme === 'dark'
                                                        //     ? 'hover:bg-gray-600'
                                                        //     : 'hover:bg-gray-50'
                                                    `}
                                                >
                                                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg  cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={item.id}
                                                            value="connections"
                                                            className="w-4 h-4 text-blue-600"
                                                            defaultChecked
                                                        />
                                                        <div className="flex items-center">
                                                            <Icon
                                                                icon="mdi:account-group"
                                                                className="w-5 h-5 text-gray-400 mr-3"
                                                            />
                                                            <div
                                                                className={` 
                                                                    // theme ===
                                                                    // 'dark'
                                                                    //     ? 'text-white'
                                                                    //     : 'text-gray-900'
                                                                `}
                                                            >
                                                                <span className="font-medium ">
                                                                    Connections
                                                                    only
                                                                </span>
                                                                <p className="text-sm ">
                                                                    Only people
                                                                    you're
                                                                    connected
                                                                    with
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                                <div
                                                    className={` 
                                                        // theme === 'dark'
                                                        //     ? 'hover:bg-gray-600'
                                                        //     : 'hover:bg-gray-50'
                                                    `}
                                                >
                                                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg  cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={item.id}
                                                            value="nobody"
                                                            className="w-4 h-4 text-blue-600"
                                                        />
                                                        <div className="flex items-center">
                                                            <Icon
                                                                icon="mdi:lock"
                                                                className="w-5 h-5 text-gray-400 mr-3"
                                                            />
                                                            <div
                                                                className={` 
                                                                    // theme ===
                                                                    // 'dark'
                                                                    //     ? 'text-white'
                                                                    //     : 'text-gray-900'
                                                                `}
                                                            >
                                                                <span className="font-medium ">
                                                                    Only me
                                                                </span>
                                                                <p className="text-sm ">
                                                                    Keep this
                                                                    information
                                                                    private
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {index !== VISIBILITY_OPTIONS.length - 1 && (
                            <hr className="border-gray-100" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
