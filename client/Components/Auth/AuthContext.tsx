import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';
import { validateSession, extendSession } from '../../Utils/Session';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (sessionToken: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const login = (sessionToken: string) => {
        localStorage.setItem('session_token', sessionToken);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('session_token');
        setIsAuthenticated(false);
    };

    useEffect(() => {
        const checkSession = async () => {
            const sessionToken = localStorage.getItem('session_token');

            if (!sessionToken) {
                setIsLoading(false);
                return;
            }

            const isValid = await validateSession(sessionToken);

            if (isValid) {
                setIsAuthenticated(true);
                // Extend session for returning users
                await extendSession(sessionToken);
            } else {
                logout();
            }

            setIsLoading(false);
        };

        checkSession();
    }, []);

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, isLoading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
