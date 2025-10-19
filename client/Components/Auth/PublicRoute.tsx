import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const PublicRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};