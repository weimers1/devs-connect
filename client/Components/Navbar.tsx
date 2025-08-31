import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from './Auth/AuthContext';
import { defaultRoutes, protectedRoutes, publicRoutes } from '../Utils/routes';

const Navbar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const getVisiblePages = () => {
        const alwaysVisible = defaultRoutes.filter(
            (route) => route.showInNav && route.path !== '/login'
        );

        if (isAuthenticated) {
            return [
                ...alwaysVisible,
                ...protectedRoutes.filter((route) => route.showInNav),
            ];
        } else {
            return [
                ...alwaysVisible,
                ...publicRoutes.filter((route) => route.showInNav),
            ];
        }
    };

    const visiblePages = getVisiblePages();

    return (
        <nav className="sticky top-0 z-1 relative">
            <div className="flex flex-wrap items-center justify-between px-8 pt-5 bg-linear-to-t from-blue-700 to-slate-950 pb-3">
                {/* Logo */}
                <div className="w-18 bg-linear-to-b to-slate-950/10 ps-2 shadow-lg rounded-xl">
                    <Link to="/">
                        <img src={assets.Logo} className="h-16" alt="logo" />
                    </Link>
                </div>

                {/* Desktop Search Bar */}
                <div className="hidden xl:block xl:flex-1 xl:max-w-md xl:mx-4">
                    <input
                        type="text"
                        className="border-2 border-gray-300 bg-white h-10 w-full px-5 mt-3 pr-16 rounded-lg text-sm focus:outline-none"
                        placeholder="Search...."
                    />
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden xl:flex xl:flex-wrap xl:gap-2">
                    {visiblePages.map((page, i) => {
                        return (
                            <Link
                                className="hover:bg-white text-white hover:text-blue-900 rounded-lg px-3 py-2 whitespace-nowrap"
                                to={page.path}
                                key={`desktop-link-${i}`}
                            >
                                <div className="flex items-center gap-2">
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
                <div className="xl:hidden">
                    <button
                        className="hover:bg-white rounded p-3 cursor-pointer text-white hover:text-blue-900"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Icon icon="mdi:menu" className="w-8 h-8" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="xl:hidden absolute top-full left-0 right-0 z-2 bg-linear-to-b from-blue-700 to-slate-950">
                    {/* Mobile Search */}
                    <div className="pt-2 px-3">
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Search...."
                        />
                    </div>

                    <div className="px-4 py-2 space-y-2">
                        {visiblePages.map((page, i) => {
                            return (
                                <Link
                                    key={`mobile-link-${i}`}
                                    className="flex py-2 text-white rounded p-3"
                                    to={page.path}
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
