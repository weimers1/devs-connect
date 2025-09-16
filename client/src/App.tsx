import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../Components/Auth/ProtectedRoute";
import Login from "../Components/Login";
import Home from "../Components/Home";
import Profile from "../Components/Profile/Profile";
import AuthCallBack from "../Components/Auth/AuthCallBack";
import Messages from "../Components/Messages/Messages";
import Communities from "../Components/Communities/Communities";
import Setting from "../Components/Settings/Settings";
import { ThemeProvider }  from "./ThemeContext"

const App = () => {
    return (
        <ThemeProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="authenticate" element={<AuthCallBack />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/settings" element={<Setting/>} />
            </Routes>
        </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
