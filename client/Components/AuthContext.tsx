import { createContext, useContext } from 'react';
import { useStytchSession } from '@stytch/react';

// set type for isAuthenticated
interface AuthContextType {
    isAuthenticated: boolean;
}

// create a context to provide other components with auth state
export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

// 
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { session } = useStytchSession();
    const isAuthenticated = !!session;

    return (
        <AuthContext.Provider value={{ isAuthenticated }}>
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
