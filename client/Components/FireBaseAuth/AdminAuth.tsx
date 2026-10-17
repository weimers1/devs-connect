// Rename this file to: src/context/AdminAuthContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { auth } from './Firebase';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User,
    setPersistence,
    browserSessionPersistence,
    type UserCredential,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// import { useNavigate } from 'react-router-dom';
interface AdminAuthContextType {
    adminUser: User | null; // Renamed to keep separate from Stytch user
    adminLoading: boolean;
    adminToken: string | null;
    adminLogin: (email: string, password: string) => Promise<UserCredential>;
    adminLogout: () => Promise<void>;
}


// Named context specifically for administrators
const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

interface AdminAuthProviderProps {
    children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
    // const [sessionToken, setSessionToken] = useState('');
    // const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [adminLoading, setAdminLoading] = useState<boolean>(true);
    const [adminToken, setAdminToken] = useState<string | null>(null);
 
    
    useEffect(() => {
        //    const original_Token = localStorage.getItem('session_token');
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setAdminUser(currentUser);
            setAdminLoading(false);
            if (currentUser) {
                try {
            //   const token  =  localStorage.getItem('session_token');
            //     if(token == '' || token == null || token != original_Token) {
            //      console.log('test');
            //     } else  {
            //         setSessionToken(token);
            //     }
                    // Generates the ID token right after a successful login
                    // Passing 'true' forces a fresh token pull from Firebase servers
                    const idToken = await currentUser.getIdToken(true);
                    console.log('Pulled Firebase ID token:', idToken);
                    setAdminToken(idToken);
                } catch (error) {
                    console.error('Failed to pull Firebase ID token:', error);
                    setAdminToken(null);
                }
            } else {
                console.log('Admin logged out. Session destroyed.');
                setAdminToken(null);
            }
        });
        return () => unsubscribe();
    }, []);


    const adminLogin = async (email: string, password: string) => {
        await setPersistence(auth, browserSessionPersistence);

        return signInWithEmailAndPassword(auth, email, password);
    };
    const adminLogout = () => signOut(auth);

    return (
        
        <AdminAuthContext.Provider
            value={{
                adminUser,
                adminLogin,
                adminLogout,
                adminLoading,
                adminToken,
            }}
        >
            {!adminLoading && children}
        </AdminAuthContext.Provider>
    );
}

// Renamed custom hook to clear up global component file imports
export const useAdminAuth = (): AdminAuthContextType => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error(
            'useAdminAuth must be used inside an AdminAuthProvider wrapper',
        );
    }
    return context;
};
