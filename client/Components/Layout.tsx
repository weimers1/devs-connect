import Navbar from './Navbar';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <>
            <Navbar />
            <main className="h-screen w-full bg-linear-to-tr from-blue-700 to-slate-950">
                {children}
            </main>
        </>
    );
};

export default Layout;
