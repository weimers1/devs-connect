import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState } from 'react';
import { useTheme } from '../../../src/ThemeContext';

const Management = [
    {
        id: 'logout',
        name: 'Sign Out',
        description: 'Sign out of your account on this device',
    },
    {
        id: 'delete-account',
        name: 'Delete Account',
        description: 'Permanently delete your account and data',
    },
];

function AccountManagement() {
    const { theme } = useTheme();
    const [openSetting, setOpenSetting] = useState<string | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const handleSettingClick = (settingId: string) => {
        setOpenSetting(openSetting === settingId ? null : settingId);
    };

    const handleLogout = () => {
        localStorage.removeItem('session_token');
        window.location.href = '/login';
    };

    return (
        <div
            id="Management"
            className={`md:w-200 w-full md:rounded-xl col-start-1 row-start-1 overflow-hidden shadow-sm border border-gray-100"  ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}
        >
            <div
                className={`p-6 border-b border-gray-100 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
            >
                <h2 className="text-xl font-semibold ">Account Management</h2>
                <p className="text-sm  mt-1">
                    Manage your account settings and data
                </p>
            </div>

            {Management.map((item, index) => (
                <div key={item.id}>
                    <div
                        className={`px-6 py-4 flex justify-between items-center transition-colors cursor-pointer ${
                            theme === 'dark'
                                ? 'hover:bg-gray-700'
                                : 'hover:bg-white'
                        }`}
                        onClick={() => handleSettingClick(item.id)}
                    >
                        <div
                            className={` ${
                                theme === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                            }`}
                        >
                            <div
                                className={` ${
                                    theme === 'dark'
                                        ? 'text-white'
                                        : 'text-gray-900'
                                }`}
                            >
                                <h3
                                    className={`font-medium ${
                                        item.id === 'delete-account'
                                            ? 'text-red-600'
                                            : ''
                                    }`}
                                >
                                    {item.name}
                                </h3>
                            </div>
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
                            className={`mx-4 mb-4 rounded-lg shadow-sm border border-gray-100${
                                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                            }`}
                        >
                            <div className="p-6 space-y-4">
                                {item.id === 'delete-account' && (
                                    <div>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                            <div className="flex items-start">
                                                <Icon
                                                    icon="mdi:alert-circle"
                                                    className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-red-800 mb-2">
                                                        This action cannot be
                                                        undone
                                                    </h3>
                                                    <p className="text-sm text-red-700 mb-3">
                                                        Your account and all
                                                        associated data will be
                                                        permanently deleted
                                                        after 14 days.
                                                    </p>
                                                    <div className="text-sm text-red-700 space-y-1">
                                                        <div>
                                                            • All your posts and
                                                            comments will be
                                                            removed
                                                        </div>
                                                        <div>
                                                            • Your community
                                                            memberships will be
                                                            cancelled
                                                        </div>
                                                        <div>
                                                            • Your hackathon
                                                            history will be
                                                            deleted
                                                        </div>
                                                        <div>
                                                            • Any active
                                                            subscriptions will
                                                            be cancelled
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div
                                                    className={` ${
                                                        theme === 'dark'
                                                            ? 'text-white'
                                                            : 'text-gray-900'
                                                    }`}
                                                >
                                                    <label className="block text-sm font-medium  mb-2">
                                                        Type{' '}
                                                        <span className="font-mono  px-1 rounded">
                                                            DELETE
                                                        </span>{' '}
                                                        to confirm
                                                    </label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={deleteConfirmation}
                                                    onChange={(e) =>
                                                        setDeleteConfirmation(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="DELETE"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => {
                                                        setOpenSetting(null);
                                                        setDeleteConfirmation(
                                                            ''
                                                        );
                                                    }}
                                                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    disabled={
                                                        deleteConfirmation !==
                                                        'DELETE'
                                                    }
                                                    className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {item.id === 'logout' && (
                                    <div>
                                        <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                                            <Icon
                                                icon="mdi:information"
                                                className="w-5 h-5 text-blue-600 mr-3"
                                            />
                                            <p className="text-sm text-blue-800">
                                                You will be signed out of your
                                                account and redirected to the
                                                login page.
                                            </p>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() =>
                                                    setOpenSetting(null)
                                                }
                                                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {index !== Management.length - 1 && (
                        <hr className="border-gray-100" />
                    )}
                </div>
            ))}
        </div>
    );
}

export default AccountManagement;
