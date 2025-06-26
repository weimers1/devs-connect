import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Navbar: React.FC = () => {
    {
        /* Mobile Responsive Feature */
    }
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const pages = [
        {
            route: '/',
            src: assets.Home,
            title: 'Home',
            alt: 'home',
            icon: 'mdi:home-outline',
        },
        {
            route: '/communities',
            src: assets.Communities,
            title: 'Communities',
            alt: 'Communities',
            icon: 'mdi:account-group-outline',
        },
        {
            route: '/messages',
            src: assets.Messages,
            title: 'Messages',
            alt: 'Messages',
            icon: 'mdi:message-reply-text-outline',
        },
        {
            route: '/profile',
            src: assets.Profile,
            title: 'Profile',
            alt: 'Profile',
            icon: 'mdi:account-circle-outline',
        },
    ];

    return (
        <nav className="bg-transparent relative">
            <div className="flex grid grid-cols-2 md:grid-cols-3 px-8 pt-5">
                {/* Logo */}
                <Link to="/">
                    <img
                        src={assets.Logo}
                        className="w-14 h-15"
                        alt="logo"
                    />
                </Link>

                {/* Desktop Search Bar */}
                <div className="hidden md:block">
                    <input
                        type="text"
                        className="border-2 border-gray-300 bg-white h-10 w-100 px-5 mt-3 pr-16 rounded-lg text-sm focus:outline-none"
                        placeholder="Search...."
                    />
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex">
                    {pages.map((page, i) => {
                        return (
                            <Link
                                className="hover:bg-white text-white hover:text-blue-900 rounded-lg mx-2 p-3"
                                to={page.route}
                                key={`desktop-link-${i}`}
                            >
                                <div className="grid place-items-center">
                                    <Icon
                                        icon={page.icon}
                                        className="w-5 h-5"
                                    />
                                    <span className="font-medium">
                                        {page.title}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden">
                    <button
                        className="hover:bg-white text-white hover:text-blue-900"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Icon
                            icon="mdi:menu"
                            className="w-8 h-8"
                        />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 z-50">
                    {/* Mobile Search */}
                    <div className="pt-2 px-3">
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Search...."
                        />
                    </div>

                    <div className="px-4 py-2 space-y-2">
                        {pages.map((page, i) => {
                            return (
                                <Link
                                    key={`mobile-link-${i}`}
                                    className="flex py-2 text-white"
                                    to={page.route}
                                >
                                    <Icon
                                        icon={page.icon}
                                        className="w-6 h-6"
                                    />
                                    <span className="ps-2">{page.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
