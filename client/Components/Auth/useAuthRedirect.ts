import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const useAuthRedirect = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const requireAuth = (callback?: () => void) => {
        if (!isAuthenticated) {
            navigate('/login');
            return false;
        }
        if (callback) callback();
        return true;
    };

    return { requireAuth, isAuthenticated };
};