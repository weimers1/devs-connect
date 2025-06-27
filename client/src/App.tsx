import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../Components/Login';
import AuthCallBack from '../Components/AuthCallBack';
import Home from '../Components/Home';
import Profile from '../Components/Profile';
import Messages from '../Components/Messages';

//Routing To Direct to home page.
const App = () => {
    return (
        <BrowserRouter>
            {/* <div className="flex flex-column justify-content-center align-items-center"> */}
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
            </Routes>
            {/* </div> */}
        </BrowserRouter>
    );
};

export default App;
