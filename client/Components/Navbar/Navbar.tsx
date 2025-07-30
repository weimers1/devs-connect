import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useDropdown } from '../DropDown/DropDownContext';
import ProfileDropdown from "../DropDown/ProfileDropDown";

const Navbar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const {isProfileDropdownOpen, toggleProfileDropdown} = useDropdown();

    const pages = [
        {
            route: '/',
            title: 'Home',
            icon: 'mdi:home',
        },
        {
            route: '/communities',
            title: 'Communities',
            icon: 'mdi:account-group',
        },
        {
            route: '/messages',
            title: 'Messages',
            icon: 'mdi:message-reply-text',
        },
        {
            route: '/profile',
            title: 'Profile',
            icon: 'mdi:account-circle',
        },
    ];

    const isActive = (route: string) => location.pathname === route;

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-18">
                    
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <img
                                src={assets.Logo}
                                className="h-10 w-auto"
                                alt="DevConnect Logo"
                            />
                            <span className="text-xl font-bold text-gray-900 hidden sm:block">
                                DevConnect
                            </span>
                        </Link>
                    </div>

                    {/* Mobile Search Bar  */}
                    <div className="md:hidden flex-1 max-w-sm mx-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon icon="mdi:magnify" className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Search..."
                            />
                        </div>
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:block flex-1 max-w-lg mx-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon icon="mdi:magnify" className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                                placeholder="Search developers, projects, communities..."
                            />
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {pages.map((page, i) => {
                            const active = isActive(page.route);
                            return (
                                <Link
                                    key={`desktop-link-${i}`}
                                    to={page.route}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                                        active
                                            ? 'bg-blue-100 text-blue-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon icon={page.icon} className="w-5 h-5" />
                                    <span>{page.title}</span>
                                </Link>
                            );
                        })}
                        
                        {/* User Profile / DROPDOWN */}
                        <div className="ml-4 flex items-center space-x-3">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <Icon icon="mdi:bell-outline" className="w-6 h-6" />
                            </button>
                            <button
                                onClick={toggleProfileDropdown}
                                className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                            >
                                <span className="text-white text-sm font-medium">U</span>
                            </button>
                        </div>
                        {isProfileDropdownOpen && (
                            <ProfileDropdown />
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                            <Icon
                                icon={isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'}
                                className="w-6 h-6"
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    {/* Mobile Navigation Links */}
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {pages.map((page, i) => {
                            const active = isActive(page.route);
                            return (
                                <Link
                                    key={`mobile-link-${i}`}
                                    to={page.route}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                                        active
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon icon={page.icon} className="w-6 h-6" />
                                    <span>{page.title}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile User Section */}
                    <div className="border-t border-gray-200 px-4 py-3">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-medium">U</span>
                            </div>
                            <div>
                                <div className="text-base font-medium text-gray-800">User Name</div>
                                <div className="text-sm text-gray-500">user@example.com</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
