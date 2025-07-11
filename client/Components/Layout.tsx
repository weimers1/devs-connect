import Navbar from './Navbar';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <>
            <Navbar />
            <main className="flex items-center justify-center">
                <div className="min-h-screen max-w-9/10 w-7/10 lg:w-9/10 ">
                    {children}
                </div>
            </main>
        </>
    );
};

export default Layout;
