import React, { useEffect, useState } from "react";
import Layout from "../Layout";
import { useUserConnections } from "./UserConnectionContext.tsx";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../Service/service.ts";
import { useAuthRedirect } from "../Auth/useAuthRedirect";
import { Icon } from "@iconify/react/dist/iconify.js";

function Connections() {
  const { connections, currentUser, handleDisconnect } = useUserConnections();
  const { requireAuth } = useAuthRedirect();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [editUsers, setEditUsers] = useState(false);
  const [areyousure, setareyousure] = useState(false);
  const [name, setName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [otherConnections, setOtherConnections] = useState<connectionData[] | null>(null);

  // Determine whose profile is being viewed
  const profileUserId = userId || currentUser;
  const isOwnProfile = profileUserId === currentUser;

  // Decide which connections to display
  const data = isOwnProfile ? connections : otherConnections;


  const handleProfileClick = (userId: string) => {
    requireAuth(() => {
      if (userId === currentUser) {
        navigate("/profile");
      } else {
        navigate(`/profile/${userId}`);
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

  const areyousureCall = (value: boolean, firstName: string) => {
    if (!areyousure && firstName) {
      setEditUsers(false);
      setareyousure(value);
      setName(firstName);
    } else {
      setareyousure(false);
      setName("");
    }
  };
  useEffect(() => {
    if (isOwnProfile) {
      navigate('/connections', { replace: true });
      return;
    }

    const getOtherUserConnections = async () => {
      if (!profileUserId) return;

      try {
        const result = await API.getOtherUserConnections(profileUserId);
        setOtherConnections(result);
      } catch (error) {
        console.log("error fetching other user connections", error);
      } finally {
        setIsLoading(false);
      }
    };

    getOtherUserConnections();
  }, [profileUserId, isOwnProfile, navigate]);

  // const handleRemoveConnection = async (userId: string) => {
  //   try {
  //     setIsLoading(true);

  //     if (!userId || !currentUser) {
  //       navigate("/login");
  //       return;
  //     }
  //   const removedConnection = connections?.find(c => c.userId === userId);

  //     setConnections(prev => 
  //     prev?.filter(conn => conn.userId !== userId) || null
  //   );
  //   setareyousure(false);

  //     const disconnect = await API.disconnecttoUser(userId, currentUser);

  //      if (!disconnect.success) {
  //     // Restore the removed connection
  //     if (removedConnection) {
  //       setConnections(prev => [...(prev || []), removedConnection]);
  //     }
  //     alert("Failed to remove connection");
  //   }

    
  //   } catch (error) {
  //     console.log("error removing connection", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Fetch other user's connections only if viewing another profile


  return (
    <Layout>
      <div className="fixed inset-0 flex items-start justify-center pt-4">
        <div className="bg-stone-100 w-full max-w-3xl h-150  md:rounded-xl mt-20 p-6 overflow-y-auto relative border">
          <h2 className="text-2xl mb-4 text-center">Connections</h2>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
            {data && data.length > 0 ? (
              data.map((connection) => (
                <div
                  key={connection.userId}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center mt-1 justify-center text-white font-semibold">
                        <button
                          onClick={() =>
                            handleProfileClick(connection.userId)
                          }
                        >
                          {connection.profileImageUrl ? (
                            <img
                              className="w-16 h-16 rounded-full object-cover"
                              src={connection.profileImageUrl}
                              alt=""
                            />
                          ) : (
                            <span>
                              {connection.firstName.charAt(0) +
                                connection.lastName.charAt(0)}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p
                        className="font-bold text-md truncate cursor-pointer"
                        onClick={() =>
                          handleProfileClick(connection.userId)
                        }
                      >
                        {connection.firstName}{" "}
                        {connection.lastName.slice(0, 10)}
                      </p>
                    </div>
                  </div>

                  {/* Only allow editing if viewing your own profile */}
                  {isOwnProfile && (
                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        className="text-blue-600 hover:bg-blue-50 bg-white text-md h-8 w-25 rounded-2xl font-medium border"
                        onClick={() =>
                          navigate(`/messages?user=${connection.userId}`)
                        }
                      >
                        Message
                      </button>

                      <div className="relative">
                        <button
                          onClick={() =>
                            handleClick(connection.userId)
                          }
                        >
                          <Icon
                            icon="uil:ellipsis-h"
                            width="28"
                            height="28"
                          />
                        </button>

                        {editUsers &&
                          selectedUserId === connection.userId && (
                            <div className="absolute mt-1 right-0 w-36 bg-white shadow-lg rounded-lg border z-50">
                              <button
                                className="w-full p-3 flex justify-between hover:bg-gray-100"
                                onClick={() =>
                                  areyousureCall(
                                    true,
                                    connection.firstName
                                  )
                                }
                              >
                                Remove
                                <Icon
                                  icon="mdi:trash-can"
                                  width="24"
                                  height="24"
                                />
                              </button>
                               <button
                                className="w-full p-3 flex justify-between hover:bg-gray-100"
                                onClick={() =>
                                  areyousureCall(
                                    true,
                                    connection.firstName
                                  )
                                }
                              >
                                Block
                                <Icon
                                  icon="fa-solid:user-lock"
                                  width="24"
                                  height="24"
                                />
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {areyousure &&
                    selectedUserId === connection.userId && (
                      <div className="fixed inset-0 z-50 backdrop-invert backdrop-opacity-10 flex items-center justify-center">
                        <div className="bg-white rounded-xl p-6 md:w-90 mx-4 md:mb-100 inset-1">
                          <Icon
                            icon="streamline-plump-color:sad-face-flat"
                            className="mb-2 mx-auto"
                            width="72"
                            height="72"
                          />
                          <h2 className="text-2xl font-bold mb-6 text-center">
                            {`Are you sure you want to remove ${name} as a connection?`}
                          </h2>

                          <div className="flex flex-col gap-3">
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                              onClick={() =>
                               handleDisconnect(
                                  connection.userId
                                )
                              }
                            >
                              Confirm
                            </button>

                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                              onClick={() =>
                                areyousureCall(false, "")
                              }
                            >
                              Deny
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center mt-4">
                No Connections Yet
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Connections;