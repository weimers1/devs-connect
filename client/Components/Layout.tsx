import Navbar from './Navbar';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-6">{children}</main>
        </>
    );
};

export default Layout;
