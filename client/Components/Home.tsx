import { useStytchUser, useStytch } from '@stytch/react';
import { useNavigate } from 'react-router-dom';
//This is the Home Page Haven't Done Anything Yet 
const Home = () => {
  const stytch = useStytch();
  const { user } = useStytchUser();
  const navigate = useNavigate();
  //Testing out Tailwind to make sure its implemented properly
  return (
    <div className="p-8 bg-blue-100 rounded-lg shadow-md" style={{backgroundColor: 'lightblue', padding: '20px'}}>
      <p className="text-2xl font-bold text-blue-800 mb-4" style={{fontSize: '24px', fontWeight: 'bold', color: 'darkblue'}}>Home</p>
      <p className="text-gray-700" style={{color: 'gray'}}>{user?.emails?.[0]?.email}</p>
    </div>
  );
};

export default Home;