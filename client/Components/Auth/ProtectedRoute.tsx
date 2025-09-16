import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

// check if user is authenticated with authcontext and navgate to login if they are not
export const ProtectedRoute: React.FC = () => {
    const authContext = useAuth();

    // Handle case where auth context is not available
    if (!authContext) {
        console.error('Auth context not available');
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    const { isAuthenticated, isLoading } = authContext;

    // Show loading state while authentication is being checked
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                Loading...
            </div>
        );
    }

    // use Outlet as a placeholder within parent route's component to render child routes;
    // if not auth, send to login page
    return isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate
            to="/login"
            replace
        />
    );
};
