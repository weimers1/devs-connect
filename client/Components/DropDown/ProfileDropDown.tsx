import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTheme } from '../../src/ThemeContext';

function ProfileDropdown() {
    const navigate = useNavigate();
    const { resetTheme, theme } = useTheme();

    const handleLogout = () => {
        localStorage.removeItem('session_token');
        resetTheme();
        navigate('/login');
    };

    const menuItems = [
        {
            label: 'Your Profile',
            icon: 'mdi:account-circle',
            to: '/profile',
        },
        {
            label: 'Settings',
            icon: 'mdi:cog',
            to: '/settings',
        },
        {
            label: 'Help & Support',
            icon: 'mdi:help-circle',
            to: '/help',
        },
    ];

    return (
        <div
            className={`absolute -right-4 top-10 w-56 rounded-lg shadow-xl border z-50 ${
                theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
            }`}
        >
            {/* User Info Section */}
            <div
                className={`px-4 py-3 border-b ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                }`}
            >
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium">U</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p
                            className={`text-sm font-medium truncate ${
                                theme === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                            }`}
                        >
                            User Name
                        </p>
                        <p
                            className={`text-xs truncate ${
                                theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                            }`}
                        >
                            user@example.com
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            theme === 'dark'
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <Icon
                            icon={item.icon}
                            className="w-4 h-4 mr-3"
                        />
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* Divider */}
            <div
                className={`border-t ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                }`}
            />

            {/* Logout Button */}
            <div className="py-1">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors ${
                        theme === 'dark'
                            ? 'text-red-400 hover:bg-gray-700 hover:text-red-300'
                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    }`}
                >
                    <Icon
                        icon="mdi:logout"
                        className="w-4 h-4 mr-3"
                    />
                    Sign out
                </button>
            </div>
        </div>
    );
}

export default ProfileDropdown;
