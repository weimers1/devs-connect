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
       <>
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
                </div>          
        </nav>
     {/* Mobile Nav Dropdown */}
           
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {pages.map((page, i) => (
          <Link
            key={i}
            to={page.route}
            className="flex flex-col items-center py-2 px-3"
          >
            <Icon icon={page.icon} className="w-6 h-6" />
            <span className="text-xs mt-1">{page.title}</span>
          </Link>
        ))}
      </div>
    </nav>
     </>
    );
};

export default Navbar;
