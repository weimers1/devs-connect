import React, { useEffect, useState } from "react"
import Layout from "../Layout";
import {useUserConnections} from "./UserConnectionContext.tsx";
import { useNavigate} from 'react-router-dom';
import API from "../../Service/service.ts";

import { useAuthRedirect } from '../Auth/useAuthRedirect';
import { Icon } from "@iconify/react/dist/iconify.js";

function Connections() {

    const {connections} = useUserConnections();
    const {currentUser} = useUserConnections();
    const { requireAuth } = useAuthRedirect();
    const navigate = useNavigate();
    const [currentUserId, setCurrentUserId] = React.useState<string>();
    const [isLoading, setIsLoading] = React.useState(true);
    const [editUsers, setEditUsers] = React.useState(false);
    const [areyousure, setareyousure] = React.useState(false);
    const [name, setName] = React.useState("");
    const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
    const [otherConnections, setOtherConnections] = useState<connectionData[] | null>(null);
    const handleProfileClick = async (userId: string) => {
        requireAuth(async () => {
          if(currentUser != undefined && currentUser != null) {
            try {
                    if(!currentUser) navigate('/login');
                    setCurrentUserId(currentUser);
                    if(userId == currentUser) {
                        navigate('/profile');
                    } else
                    navigate(`/profile/${userId}`);
            } catch (error) {
                console.error('Failed to get current user:', error);
                // Fallback to other user profile
                navigate(`/profile/${userId}`);
            }
          }
        });
    };
     const handleClick = (userId: string) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setEditUsers(false);
    } else {
      setSelectedUserId(userId);
      setEditUsers(true);
    }
  };
  //Pop up window to confirm if user wants to remove connection
  const areyousureCall = (value: boolean, firstName: string) => {
    if(areyousure == false && firstName != null) {
      setEditUsers(false);
      setareyousure(value);
      setName(firstName);
    } else {
      setareyousure(false);
      setName("");
    }
  } 

  //Remove User Connection
  const handleRemoveConnection = async (userId: string) => {
     try {
      setIsLoading(true);
            if(!userId || !currentUser) {
                navigate("/login");
            }
              if(currentUser != undefined && currentUser != null) {
                const disconnect = await API.disconnecttoUser(userId, currentUser);
                if(disconnect.success == false) {
                    console.log("failed to disconnect");
                }
                setareyousure(false);
              }   
        }catch(error) {
            console.log("there was an error trying to disconnect to user", error);
        } finally {
          setIsLoading(false);
        }
  }

  useEffect(() => {
      const getOtherUserConnections = async() => {
            try  {
                if(!selectedUserId) return;
               const getOtheruserConnections = await API.getOtherUserConnections(selectedUserId);
               if(!getOtheruserConnections) {
                console.log("error getting other user connections");
            }   
            setOtherConnections(getOtheruserConnections);
            } catch(error) {
                console.log("error fetching other user connections", error);
            }
        }
        getOtherUserConnections();
  }, [selectedUserId])

    return (
        
        <Layout>
      
  <div className="fixed inset-0 flex items-start justify-center pt-4">
    <div className="bg-stone-100 w-full h-2xl max-w-3xl md:rounded-xl mt-20  p-6 overflow-y-auto relative border ">
      
      {/* Modal Title */}
      <h2 className="text-2xl  mb-4 text-center inset-0">Connections</h2>
        
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
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center mt-1 justify-center text-white font-semibold">
                               <button
                               onClick={() => navigate(`/profile/${connection.userId}`)}
                               >
                                    {connection.profileImageUrl ? (
                                        <img
                                className="w-16 h-16 rounded-full object-cover"
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
                            <div className="flex  items-center space-x-2 pt-2">              
                  <button className="text-blue-600 hover:bg-blue-50 bg-white text-md  h-8 w-25 rounded-2xl font-medium border color-blue "
                                  onClick={() => navigate(`/messages?user=${connection.userId}`)}
                                >
                                    Message
                                   
                                </button>
                                <div className="relative"> 
                                <button className="items-center"
                                onClick={() => handleClick(connection.userId)}
                                >  
                                   <Icon icon="uil:ellipsis-h" className="align-items:noraml hover:bg-gray-200 rounded-xl" width="28" height="28" />
                                      </button>
                                      {editUsers && selectedUserId === connection.userId && (
                                         <div className="absolute mt-1 right-0  w-36 bg-white shadow-lg rounded-lg border z-50 transition ease-out duration-150 transform scale-100 ">
                                            <button
                                            className="w-full p-3 flex justify-between py-2 hover:bg-gray-100"
                                            onClick={() => areyousureCall(true, connection.firstName)}
                                            >
                                              Remove
                                               <Icon icon="mdi:trash-can" className="ml-auto "  width="24" height="24"/>
                                            </button>
                                             
                                          </div>
                                        )}
                                      </div>
                                         {areyousure && (
                                                                          <>
                                                      <div className="fixed  backdrop-invert backdrop-opacity-10 inset-0 flex items-center justify-center ">
                                                     
                                              <div className="bg-white rounded-xl mb-100 p-6  md:w-90 mx-4">
                                                    <Icon icon="streamline-plump-color:sad-face-flat" className="mb-2 mx-auto" width="72" height="72" />
                                                  <h2 className="text-2xl font-bold mb-6 text-center">{`Are You Sure You Want To Remove ${name} as a Connection?`}</h2>
                                                  <div className="flex flex-col gap-3">
                                                     <button className="flex bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg" onClick={() => handleRemoveConnection(connection.userId)}>Confirm</button>
                                                  <button className="flex bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg" onClick={() => areyousureCall(false, "")}>Deny</button>
                                                  </div>
                                                 
                                                
                                              </div> 
                                      
                                          </div>
                                          </>
                                          )}
                                      </div>
                                       
                                      
              </div>
              
              
            ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-4  h-2xl">No Connections Yet yet</p>
        )}
      </div>
    </div>
  </div>
        </Layout>
    )
}   


export default Connections;

