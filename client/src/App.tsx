import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import Login from '../Components/Login';
import AuthCallBack from '../Components/AuthCallBack';
import Home from '../Components/Home';
import Navbar from '../Components/Navbar';
import Profile from '../Components/Profile';
import Messages from '../Components/Messages';
import Communities from '../Components/Communities/Communities';
import Layout from '../Components/Layout';

 
//Routing To Direct to home page.
function App() {
 
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
                <Route
                    path="/communities"
                    element={<Communities />}
                />
            </Routes>
            {/* </div> */}
        </BrowserRouter>
    );
}

export default App;
