import Navbar from './Navbar/Navbar';
import { useLocation } from 'react-router-dom';
import { DropdownProvider } from './DropDown/DropDownContext';
import { useTheme } from '../src/ThemeContext';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    const location = useLocation();
    const { theme } = useTheme();
    const isProfilePage = location.pathname === '/profile';

    const mainBgClass =
        theme === 'dark'
            ? 'bg-gray-900'
            : 'bg-linear-to-tr from-blue-700 to-slate-950';
    const containerWidthClass = isProfilePage
        ? 'w-full md:w-3/4 lg:w-2/3 xl:w-2/4 md:mx-auto'
        : 'max-w-10/10 lg:w-9/10';

    return (
        <>
            <DropdownProvider>
                <Navbar />
                <main
                    className={`flex items-center justify-center min-h-screen ${mainBgClass}`}
                >
                    <div className={`min-h-screen ${containerWidthClass}`}>
                        {children}
                    </div>
                </main>
            </DropdownProvider>
        </>
    );
};

export default Layout;
