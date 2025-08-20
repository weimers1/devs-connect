import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../Components/Auth/ProtectedRoute';
import Login from '../Components/Login';
import Home from '../Components/Home';
import Profile from '../Components/Profile';
import AuthCallBack from '../Components/Auth/AuthCallBack';
import Messages from '../Components/Messages';
import Communities from '../Components/Communities/Communities';
import { validateSession } from '../Utils/Session';

const App = () => {
    // check for session_token in user's localStorage
    const sessionToken = localStorage.getItem('session_token');

    // if invalid, remove it to prevent issues
    if (!sessionToken) {
        localStorage.removeItem('session_token');
    } else {
        // otherwise, validate session_token in the database
        validateSession(sessionToken);
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Home />}
                />
                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/profile"
                        element={<Profile />}
                    />
                </Route>
                <Route
                    path="authenticate"
                    element={<AuthCallBack />}
                />
                <Route
                    path="/messages"
                    element={<Messages />}
                />
                <Route
                    path="/communities"
                    element={<Communities />}
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
