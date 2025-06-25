import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Login from "../Components/Login";
import AuthCallBack from "../Components/AuthCallBack";
import Home from "../Components/Home";
import  Navbar from "../Components/navbar";
import Profile from "../Components/Profile";
import Messages from "../Components/Messages";
import Communities from "../Components/Communities";

//Routing To Direct to home page. 
function App() {
  return (
      
    <BrowserRouter>
           {location.pathname !== "/" &&  <Navbar />}
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
         <Routes>
         <Route path='/' element={<Login />} />
          <Route path='authenticate' element={<AuthCallBack />} />
          <Route path='/home' element={<Home />} />
          <Route path ='/profile' element={<Profile />} />
          <Route path='/messages' element={<Messages />} />
          <Route path='/communities' element={<Communities />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;