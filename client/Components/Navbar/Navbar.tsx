import React, { useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useDropdown } from '../DropDown/DropDownContext';
import ProfileDropdown from '../DropDown/ProfileDropDown';
// import { useTheme } from '../../src/ThemeContext';
import { useAuth } from '../Auth/AuthContext';
import { defaultRoutes, protectedRoutes } from '../../Utils/routes';
import API from '../../Service/service';
import NavBarSearch from './NavBarSearch';
import { useLanguage } from '../../src/i18n/LanguageContext';

const Navbar: React.FC = () => {
    // const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    // const { theme } = useTheme();
    const { isProfileDropdownOpen, toggleProfileDropdown, closeAll } = useDropdown();
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const routeTitle = (title: string) => {
        const key = `nav.route.${title}`;
        const translated = t(key);
        return translated === key ? title : translated;
    };
    const [userProfile, setUserProfile] = useState('');
    const [profileDetails, setProfileDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        avatar: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        if (!isProfileDropdownOpen) return;

        const closeOnOutsideClick = (event: MouseEvent) => {
            if (
                event.target instanceof Node &&
                !profileMenuRef.current?.contains(event.target)
            ) {
                closeAll();
            }
        };

        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
        };
    }, [closeAll, isProfileDropdownOpen]);

    useEffect(() => {
        let active = true;
        const loadProfileData = async () => {
            try {
                const response = await API.getProfileInformation();
                if (active) {
                    setUserProfile(response?.pfp || '');
                    setProfileDetails({
                        firstName: response?.firstName || '',
                        lastName: response?.lastName || '',
                        email: response?.email || '',
                        avatar: response?.pfp || '',
                    });
                }
            } catch (error) {
                console.error('Failed to Load UserProfile', error);
            }
        };

        if (isAuthenticated) {
            void loadProfileData();
        } else {
            setUserProfile('');
            setProfileDetails({ firstName: '', lastName: '', email: '', avatar: '' });
        }
        return () => {
            active = false;
        };
    }, [isAuthenticated]);

    //Overall Search Bar Update
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        setShowSearch(value.trim().length > 0);
    };

    const handleSearchClose = () => {
        setSearchQuery('');
        setShowSearch(false);
    };
    // Combine routes based on auth status and filter by showInNav
    const availableRoutes = isAuthenticated
        ? [
              ...defaultRoutes.filter((route) => route.showInNav),
              ...protectedRoutes.filter((route) => route.showInNav),
          ]
        : defaultRoutes.filter((route) => route.showInNav);

    const pages = availableRoutes.map((route) => ({
        route: route.path,
        title: route.title,
        icon: route.icon,
    }));

    const isActive = (route: string) => location.pathname === route;

    return (
        <nav
            className={`sticky top-0 z-50 shadow-lg border-b`}
            //     // theme === 'dark'
            //     //     ? 'bg-gray-800 border-gray-700'
            //     //     : 'bg-white border-gray-200'
            // }`}
        >
            <div className="">
                <div className="flex justify-between relative items-center h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center ml-3">
                        <Link
                            to="/"
                            className="flex items-center space-x-2"
                        >
                            <img
                                src={assets.Logo}
                                className="h-10 w-auto"
                                alt={t('nav.logoAlt')}
                            />
                            <span
                                className={`text-xl font-bold hidden sm:block
                                    // theme === 'dark'
                                    //     ? 'text-white'
                                    //     : 'text-gray-900'
                                }`}
                            >
                                DevConnect
                            </span>
                        </Link>

                        {/* Desktop Search Bar */}
                        <div className="hidden md:block flex-1 max-w-sm ml-3 mt-0.5 relative">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon
                                        icon="mdi:magnify"
                                        className="h-5 w-5 text-gray-400"
                                    />
                                </div>

                                <input
                                    type="text"
                                    value={searchQuery}
                                    className="block rounded-2xl w-full pl-10 pr-3 py-1.5 border leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out bg-white border-black"
                                    placeholder={t('nav.searchLong')}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            {showSearch && (
                                <NavBarSearch
                                    searchQuery={searchQuery}
                                    onClose={handleSearchClose}
                                />
                            )}
                        </div>

                        {/* Mobile Search Bar  */}
                        <div className="md:hidden flex-1 max-w-xl mx-3 relative">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon
                                        icon="mdi:magnify"
                                        className="h-6 w-6 text-gray-400"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    className="block w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300"
                                    placeholder={t('nav.searchShort')}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            {showSearch && (
                                <NavBarSearch
                                    searchQuery={searchQuery}
                                    onClose={handleSearchClose}
                                />
                            )}
                        </div>
                    </div>

                    <div className=" hidden md:flex items-center pr-22">
                        {pages.map((page, i) => {
                            const active = isActive(page.route);
                            return (
                                <Link
                                    key={`desktop-link-${i}`}
                                    to={page.route}
                                    className={`px-6 py-2 rounded-lg text-me font-medium transition-all duration-200 flex items-center space-x-2 ${
                                        active
                                        // ? theme === 'dark'
                                        //     ? 'bg-blue-900 text-blue-300 shadow-sm'
                                        //     : 'bg-blue-100 text-blue-700 shadow-sm'
                                        // : theme === 'dark'
                                        // ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                        // : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon
                                        icon={page.icon}
                                        className="w-7 h-7"
                                    />
                                    <span>{routeTitle(page.title)}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center  space-x-3 mx-12">
                        <button
                            type="button"
                            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                            className="rounded-lg border border-gray-300 px-2.5 py-1 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                            aria-label={t('nav.switchLanguage')}
                            title={t('nav.switchLanguage')}
                        >
                            {language === 'en' ? 'ES' : 'EN'}
                        </button>
                        {/* User Profile / DROPDOWN - Only show if authenticated */}
                        {isAuthenticated && (
                            <div
                                ref={profileMenuRef}
                                className="ml-4 flex items-center space-x-3"
                            >
                                <div className="relative">
                                    <button
                                        onClick={toggleProfileDropdown}
                                        className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 bg-gray-100 transition hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        aria-label={t('nav.openProfileMenu')}
                                    >
                                        <img
                                            alt=""
                                            src={userProfile || assets.Profile}
                                            className="h-full w-full rounded-full object-cover"
                                            onError={(e) => {
                                                if (e.currentTarget.src !== new URL(assets.Profile, window.location.href).href) {
                                                    e.currentTarget.src = assets.Profile;
                                                }
                                            }}
                                        />
                                    </button>
                                </div>

                                {isProfileDropdownOpen && (
                                    <ProfileDropdown profile={profileDetails} />
                                )}
                            </div>
                        )}

                        {/* Login button for unauthenticated users */}
                        {!isAuthenticated && (
                            <div className="ml-4">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {t('nav.login')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden ">
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className={`p-2 rounded-lg transition-colors 
                                // theme === 'dark'
                                //     ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                //     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            `}
                        >
                            <Icon
                                icon={
                                    isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'
                                }
                                className="w-6 h-6"
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className={`md:hidden border-t 
                        // theme === 'dark'
                        //     ? 'border-gray-700 bg-gray-800'
                        //     : 'border-gray-200 bg-white'
                    `}
                >
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
                                        // ? theme === 'dark'
                                        //     ? 'bg-blue-900 text-blue-300'
                                        //     : 'bg-blue-100 text-blue-700'
                                        // : theme === 'dark'
                                        // ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                        // : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon
                                        icon={page.icon}
                                        className="w-6 h-6"
                                    />
                                    <span>{routeTitle(page.title)}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile User Section */}
                    <div className="border-t px-4 py-3">
                        <button
                            type="button"
                            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700"
                        >
                            {t('nav.switchLanguage')} ({language === 'en' ? 'ES' : 'EN'})
                        </button>
                    </div>
                    {isAuthenticated ? (
                        <div
                            className={`border-t px-4 py-3 
                                // theme === 'dark'
                                //     ? 'border-gray-700'
                                //     : 'border-gray-200'
                            `}
                        >
                            <div className="flex items-center space-x-3">
                                <img
                                    src={userProfile || assets.Profile}
                                    alt=""
                                    className="h-10 w-10 rounded-full border border-gray-200 bg-gray-100 object-cover"
                                    onError={(e) => {
                                        if (e.currentTarget.src !== new URL(assets.Profile, window.location.href).href) {
                                            e.currentTarget.src = assets.Profile;
                                        }
                                    }}
                                />
                                <div className="flex-1">
                                    <div
                                        className={`text-base font-medium 
                                            // theme === 'dark'
                                            //     ? 'text-white'
                                            //     : 'text-gray-900'
                                        `}
                                    >
                                        {t('nav.userProfile')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`border-t px-4 py-3 
                                // theme === 'dark'
                                //     ? 'border-gray-700'
                                //     : 'border-gray-200'
                            `}
                        >
                            <Link
                                to="/login"
                                className="w-full flex justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t('nav.login')}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
