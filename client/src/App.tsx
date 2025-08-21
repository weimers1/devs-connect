import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../Components/Auth/AuthContext';
import { ProtectedRoute } from '../Components/Auth/ProtectedRoute';
import Login from '../Components/Login';
import Home from '../Components/Home';
import Profile from '../Components/Profile';
import AuthCallBack from '../Components/Auth/AuthCallBack';
import Messages from '../Components/Messages';
import Communities from '../Components/Communities/Communities';

const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={
                    <AuthenticatedRoute>
                        <Login />
                    </AuthenticatedRoute>
                } />
                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/communities" element={<Communities />} />
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
