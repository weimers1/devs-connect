import Navbar from './Navbar/Navbar';
import { useLocation } from 'react-router-dom';
import { DropdownProvider } from './DropDown/DropDownContext';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    const location = useLocation();
    const isProfilePage = location.pathname === '/profile';
    
    return (
        <>
            <DropdownProvider>
            <Navbar />
            <main className="flex items-center justify-center">
                <div className={`min-h-screen ${isProfilePage ? 'w-full md:w-3/4 lg:w-2/3 xl:w-2/4 md:mx-auto' : 'max-w-10/10 lg:w-9/10'}`}>
                    {children}
                </div>
            </main>
            </DropdownProvider>
        </>
    );
};

export default Layout;
