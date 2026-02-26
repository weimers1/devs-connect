import React, { useEffect } from "react"
import Layout from "../Layout";
import {useUserConnections} from "./UserConnectionContext.tsx";
import { useNavigate} from 'react-router-dom';
import API from "../../Service/service.ts";
import Profile from '/assets/images/Nav-Profile.png';
import { useAuthRedirect } from '../Auth/useAuthRedirect';

function Connections() {

    const {connections} = useUserConnections();
    const { requireAuth } = useAuthRedirect();
    const navigate = useNavigate();
    const [showConnectionsCenter, setShowConnectionsCenter] = React.useState(false);
     const Temppfp = Profile;
    const handleProfileClick = async (userId: string) => {
        requireAuth(async () => {
            try {
                const currentUser = await API.getCurrentUser();
                    if(!currentUser) navigate('/login');
                    if(userId == currentUser.userId) {
                        navigate('/profile');
                    } else
                    navigate(`/profile/${userId}`);
            } catch (error) {
                console.error('Failed to get current user:', error);
                // Fallback to other user profile
                navigate(`/profile/${userId}`);
            }
        });
    };

    return (
        
        <Layout>
      
  <div className="fixed inset-0  flex items-start justify-center pt-4 ">
    <div className="bg-stone-100 w-full max-w-2xl rounded-xl mt-20  p-6 overflow-hidden relative border-2xl ">
      
      {/* Modal Title */}
      <h2 className="text-2xl font-bold mb-4 text-center">Connections</h2>
        <br className="bg-black"></br>
      {/* Connections List */}
      <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
        
         { connections != undefined && connections?.length > 0 ? ( 
            connections
            .map(connection => (
              <div
                key={connection.userId}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                    <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                               <button
                               onClick={() => navigate(`/profile/${connection.userId}`)}
                               >
                                    {connection.profileImageUrl ? (
                                        <img
                                className="w-12 h-12 rounded-full object-cover"
                                src={connection.profileImageUrl}
                                ></img>
                                    ) : (
                                        <span>{connection.firstName.charAt(0) + connection.lastName.charAt(0)}</span>
                                    )}
                               </button>
                                    </div>
                                    {/* {connection.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    )} */}
                                </div>       
                  <div>
                    <p className="font-bold text-md  truncate"
                     onClick={() => handleProfileClick(connection.userId)}
                    >{connection.firstName} {connection.lastName.slice(0,10)}</p>
                    {/* <p className="text-xs text-gray-500">{member.isOnline ? "Online" : "Offline"}</p> */}
                  </div>
                  
                </div>
                  <button className="text-blue-600 hover:bg-blue-50 bg-white text-xs h-8 w-25 rounded-2xl font-medium"
                                  onClick={() => navigate(`/messages?user=${connection.userId}`)}
                                >
                                    Message
                                </button>
              </div>
            ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-4">No Connections Yet yet</p>
        )}
      </div>
    </div>
  </div>
        </Layout>
    )
}   


export default Connections;

