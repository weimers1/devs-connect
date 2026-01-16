import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../Components/Auth/AuthContext';
import { ProtectedRoute } from '../Components/Auth/ProtectedRoute';
import { PublicRoute } from '../Components/Auth/PublicRoute';
import AuthCallBack from '../Components/Auth/AuthCallBack';
import { defaultRoutes, protectedRoutes, publicRoutes } from '../Utils/routes';
// import { ThemeProvider } from './ThemeContext';
import CommunityPage from '../Components/Communities/CommunityPage';
import CreateCommunity from '../Components/Communities/CreateCommunity';
import EditCommunity from '../Components/Communities/EditCommunity';
import React from 'react';

const AppRoutes = () => {
    return (
        // <ThemeProvider>
            <BrowserRouter>
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
                </Routes>
            </BrowserRouter>
        // </ThemeProvider>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
};

export default App;
