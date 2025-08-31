import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../Components/Auth/AuthContext';
import { ProtectedRoute } from '../Components/Auth/ProtectedRoute';
import { PublicRoute } from '../Components/Auth/PublicRoute';
import AuthCallBack from '../Components/Auth/AuthCallBack';
import { defaultRoutes, protectedRoutes, publicRoutes } from '../Utils/routes';

const AppRoutes = () => {
    return (
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
                <Route path="authenticate" element={<AuthCallBack />} />
            </Routes>
        </BrowserRouter>
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
