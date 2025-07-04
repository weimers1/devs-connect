import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../Components/Login';
import AuthCallBack from '../Components/AuthCallBack';
import Home from '../Components/Home';
import Profile from '../Components/Profile';
import Messages from '../Components/Messages/Messages';
import Communities from '../Components/Communities/Communities';
import MessagesContent from '../Components/Messages/MessagesContent';

//Routing To Direct to home page.
const App = () => {
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
                <Route
                    path="authenticate"
                    element={<AuthCallBack />}
                />
                <Route
                    path="/profile"
                    element={<Profile />}
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
