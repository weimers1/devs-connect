import Navbar from './Navbar';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <>
            <Navbar />
            <main className="h-screen w-full">{children}</main>
        </>
    );
};

export default Layout;
