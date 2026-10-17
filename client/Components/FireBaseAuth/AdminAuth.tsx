// Rename this file to: src/context/AdminAuthContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
// import { auth } from './Firebase';
// import {
//     signInWithEmailAndPassword,
//     signOut,
//     onAuthStateChanged,
//     type User,
//     setPersistence,
//     browserSessionPersistence,
//     type UserCredential,
// } from 'firebase/auth';

interface AdminAuthContextType {
    adminUser: any | null; // Renamed to keep separate from Stytch user
    adminLoading: boolean;
    adminToken: string | null;
    adminLogin: (email: string, password: string) => Promise<any>;
    adminLogout: () => Promise<void>;
}

// Named context specifically for administrators
const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

interface AdminAuthProviderProps {
    children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
    const [adminUser, setAdminUser] = useState<any | null>(null);
    const [adminLoading, setAdminLoading] = useState<boolean>(false);
    const [adminToken, setAdminToken] = useState<string | null>(null);

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    //         setAdminUser(currentUser);
    //         setAdminLoading(false);
    //         if (currentUser) {
    //             try {
    //                 const idToken = await currentUser.getIdToken(true);
    //                 setAdminToken(idToken);
    //             } catch (error) {
    //                 setAdminToken(null);
    //             }
    //         } else {
    //             setAdminToken(null);
    //         }
    //     });
    //     return () => unsubscribe();
    // }, []);

    const adminLogin = async (email: string, password: string) => {
        // await setPersistence(auth, browserSessionPersistence);
        // return signInWithEmailAndPassword(auth, email, password);
        return {} as any;
    };
    const adminLogout = async () => {
        // signOut(auth);
    };

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
