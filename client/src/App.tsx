import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Login from "../Components/Login"
import AuthCallBack from "../Components/AuthCallBack"; 
import Home from "../Components/Home"

//Routing To Direct to home page. 
function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Routes>
          <Route path='/' element={<Login />} />
          <Route path='authenticate' element={<AuthCallBack />} />
          <Route path='home' element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;