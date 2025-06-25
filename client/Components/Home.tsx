import { useStytchUser, useStytch } from '@stytch/react';
import { useNavigate } from 'react-router-dom';
//This is the Home Page Haven't Done Anything Yet 
const Home = () => {
  const stytch = useStytch();
  const { user } = useStytchUser();
  const navigate = useNavigate();
  //Testing out Tailwind to make sure its implemented properly
  return (
    <div className="h-screen w-screen bg-linear-to-tr from-blue-700 to-slate-950">
       <h1 className="text-center  text-4xl font-bold text-white"> Home Page</h1> 
    </div>
  );
};

export default Home;