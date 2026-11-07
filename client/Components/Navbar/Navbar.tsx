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
        if (!isProfileDropdownOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeAll();
            }
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
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
            className={`sticky top-0 z-50 border-b bg-white shadow-lg`}
            //     // theme === 'dark'
            //     //     ? 'bg-gray-800 border-gray-700'
            //     //     : 'bg-white border-gray-200'
            // }`}
        >
            <div className="">
                <div className="flex justify-between relative items-center h-20">
                    {/* Logo */}
                    <div className="flex min-w-0 flex-1 items-center ml-3 md:flex-none">
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
                        <div className="md:hidden min-w-0 flex-1 max-w-xl mx-3 relative">
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
                    <div className={`hidden md:flex items-center space-x-3 ml-12 ${!isAuthenticated ? 'mr-12' : ''}`}>
                        <button
                            type="button"
                            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                            className="rounded-lg border border-gray-300 px-2.5 py-1 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                            aria-label={t('nav.switchLanguage')}
                            title={t('nav.switchLanguage')}
                        >
                            {language === 'en' ? 'ES' : 'EN'}
                        </button>
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

                    {isAuthenticated && (
                        <div ref={profileMenuRef} className="relative ml-2 shrink-0 md:mx-12">
                            <button
                                type="button"
                                onClick={toggleProfileDropdown}
                                className="block h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-100 transition hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label={t('nav.openProfileMenu')}
                                aria-expanded={isProfileDropdownOpen}
                                aria-controls="profile-menu"
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
                            {isProfileDropdownOpen && (
                                <ProfileDropdown profile={profileDetails} onClose={closeAll} />
                            )}
                        </div>
                    )}

                    <div className="flex shrink-0 items-center gap-2 px-2 md:hidden">
                        <button
                            type="button"
                            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                            aria-label={t('nav.switchLanguage')}
                            title={t('nav.switchLanguage')}
                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700"
                        >
                            {language === 'en' ? 'ES' : 'EN'}
                        </button>
                        {!isAuthenticated && (
                            <Link
                                to="/login"
                                className="rounded-lg bg-blue-600 px-2 py-2 text-xs font-medium text-white hover:bg-blue-700"
                            >
                                {t('nav.login')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div
                id="mobile-navigation"
                role="navigation"
                aria-label={t('nav.mobileNavigation')}
                className="fixed inset-x-0 bottom-0 flex overflow-x-auto border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.08)] md:hidden"
            >
                {pages.map((page) => {
                    const active = isActive(page.route);
                    return (
                        <Link
                            key={page.route}
                            to={page.route}
                            aria-label={routeTitle(page.title)}
                            aria-current={active ? 'page' : undefined}
                            onClick={() => {
                                closeAll();
                                handleSearchClose();
                            }}
                            className={`flex min-h-16 min-w-12 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-center transition-colors ${
                                active ? 'text-blue-700' : 'text-slate-500 hover:text-blue-700'
                            }`}
                        >
                            <Icon icon={page.icon} className="h-6 w-6 shrink-0" />
                            <span className="w-full truncate text-[9px] font-medium leading-tight">
                                {routeTitle(page.title)}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default Navbar;
