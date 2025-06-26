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
            <div className="flex items-center justify-between h-20 px-2 sm:px-6 lg:px-8">
                {/* Logo */}
                <img
                    src={assets.Logo}
                    className="w-14 h-15"
                    alt="home"
                />

                {/* Desktop Search Bar */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                    <input
                        type="text"
                        className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                        placeholder="Search...."
                    />
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex">
                    {pages.map((page, i) => {
                        return (
                            <Link
                                className="hover:bg-white text-white hover:text-blue-900 rounded-lg mx-5 p-3"
                                to={page.route}
                                key={`link-${i}`}
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
                <div className="md:hidden">
                    <button
                        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    ></button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
                    <div className="px-4 py-2 space-y-2">
                        <Link
                            className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
                            to="/home"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
                            to="/communities"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Communities
                        </Link>
                        <Link
                            className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
                            to="/messages"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Messages
                        </Link>
                        <Link
                            className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
                            to="/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Profile
                        </Link>

                        {/* Mobile Search */}
                        <div className="pt-2">
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Search...."
                            />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
