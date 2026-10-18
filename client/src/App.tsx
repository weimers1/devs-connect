import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../Components/Auth/AuthContext';
import { LanguageProvider } from './i18n/LanguageProvider';
import { ProtectedRoute } from '../Components/Auth/ProtectedRoute';
import { PublicRoute } from '../Components/Auth/PublicRoute';
import AuthCallBack from '../Components/Auth/AuthCallBack';
import { defaultRoutes, protectedRoutes, publicRoutes } from '../Utils/routes';
// import { ThemeProvider } from './ThemeContext';
import CommunityPage from '../Components/Communities/CommunityPage';
import CreateCommunity from '../Components/Communities/CreateCommunity';
import EditCommunity from '../Components/Communities/EditCommunity';
import React from 'react';
import { UserConnectionContextProvider } from '../Components/Connections/UserConnectionContext';
import Connections from '../Components/Connections/Connections';

const AppRoutes = () => {
    return (
        // <ThemeProvider>

        <Routes>
            {defaultRoutes.map((route) => (
                <Route
                    key={route.path}
                    path={route.path}
                    element={<route.component />}
                />
            ))}
            <Route element={<ProtectedRoute />}>
                {protectedRoutes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={<route.component />}
                    />
                ))}
            </Route>
            <Route element={<PublicRoute />}>
                {publicRoutes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={<route.component />}
                    />
                ))}
            </Route>
            <Route
                path="authenticate"
                element={<AuthCallBack />}
            />
            {/* ROUTE FIX: Added missing community dynamic routes */}
            <Route
                path="/community/:communityId"
                element={<CommunityPage />}
            />
            <Route
                path="/communities/create"
                element={<CreateCommunity />}
            />
            <Route
                path="/edit-community/:communityId"
                element={<EditCommunity />}
            />
            <Route
                path="/connections/:userId"
                element={<Connections />}
            />
            {/* <Route
                path="/admin"
                element={<AdminDashboard />}
            />
            <Route
                path="/admin-login"
                element={<AdminLogin />}
            /> */}
        </Routes>

        // </ThemeProvider>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <LanguageProvider>
                    <UserConnectionContextProvider>
                        <AppRoutes />
                    </UserConnectionContextProvider>
                </LanguageProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
