import Navbar from './Navbar';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <>
            <Navbar />
<main className="min-h-screen pt-6 pb-20 md:pb-6">{children}</main>

        </>
    );
};

export default Layout;
