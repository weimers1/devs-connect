import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../Auth/AuthContext';
import { useLanguage } from '../../src/i18n/LanguageContext';

type ProfileDropdownProps = {
    profile: {
        firstName: string;
        lastName: string;
        email: string;
        avatar: string;
    };
    onClose: () => void;
};

function ProfileDropdown({ profile, onClose }: ProfileDropdownProps) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { t } = useLanguage();

    const handleLogout = async () => {
        await logout();
        onClose();
        navigate('/');
    };

    const menuItems = [
        {
            label: t('nav.route.Profile'),
            icon: 'mdi:account-circle',
            to: '/profile',
        },
        {
            label: t('nav.route.Saved Posts'),
            icon: 'mdi:bookmark-outline',
            to: '/saved-posts',
        },
        {
            label: t('nav.route.Settings'),
            icon: 'mdi:cog',
            to: '/settings',
        },
        {
            label: t('nav.route.Help & Support'),
            icon: 'mdi:help-circle',
            to: '/help',
        },
    ];
    return (
        <div
            id="profile-menu"
            className="absolute right-0 top-full z-50 mt-2 w-70 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-xl"
        >
            {/* User Info Section */}
            <div
                className={`px-4 py-3 border-b 
                 
                `}
            >
                <div className="flex  items-center space-x-3">
                    {profile.avatar && (
                        <img
                            alt={t('nav.profileAlt')}
                            src={profile.avatar}
                            className="w-10 h-10 rounded-3xl"
                            onError={(event) => {
                                event.currentTarget.style.display = 'none';
                            }}
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p
                            className={`text-me font-medium truncate 
                              
                            `}
                        >
                            {profile.firstName} {profile.lastName}
                        </p>
                        <p
                            className={`text-me truncate 
                               
                            `}
                        >
                            {profile.email}
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
                        onClick={onClose}
                        className="flex items-center px-4 py-3 text-sm transition-colors hover:bg-gray-100"
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
                className={`border-t 
                    // theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                `}
            />

            {/* Logout Button */}
            <div className="py-1">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-3 text-left text-sm transition-colors hover:bg-gray-100"
                >
                    <Icon
                        icon="mdi:logout"
                        className="w-4 h-4 mr-3"
                    />
                    {t('nav.signOut')}
                </button>
            </div>
        </div>
    );
}

export default ProfileDropdown;
