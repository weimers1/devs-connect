import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';
import { validateSession } from '../../Utils/Session';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const login = () => {
        setIsAuthenticated(true);
    };

    const logout = async () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:6969';
        try {
            const response = await fetch(`${apiUrl}/session/destroy`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Server session revocation failed.');
            }
        } catch {
            console.error('Could not reach the server to revoke the session.');
        } finally {
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            const isValid = await validateSession();

            if (isValid) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
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
