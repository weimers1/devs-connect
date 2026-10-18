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
};

function ProfileDropdown({ profile }: ProfileDropdownProps) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { t } = useLanguage();

    const handleLogout = async () => {
        await logout();
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
            className={`absolute -right-1 bg-stone-200 top-20 mr-1 w-70  shadow-xl border z-50 
             
            `}
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
                        className={` hover:bg-gray-700 flex items-center px-4 py-2 text-me transition-colors 
                           
                        `}
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
                    className={`w-full  hover:bg-gray-700 flex items-center px-4 py-2 text-me text-left transition-colors 
                        
                    `}
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
