import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import React from "react";
import API from '../../Service/service';
import { useNavigate } from "react-router-dom";


//Connection Data
 interface connectionData  {
    career: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
    userId: string;
}

interface SuggestionData {
  author: string
  userId: string,
  age: string,
  profileImageUrl: string,
  career: string,
  school: string
}

//The UserOCnnectionsContext Type | connection Data and setconnection.
interface UserConnectionsContextType {
    connections: connectionData[] | null;
    setConnections: React.Dispatch<
    React.SetStateAction<connectionData[] | null>
  >;
    handleConnect: (targetUserId: string) => Promise<void>;
    handleDisconnect: (targetUserId: string) => Promise<void>;
    currentUser: string | null;
    suggestionData: SuggestionData[] | null
}
//creating userconnection context
export const UserConnectionContext = createContext<UserConnectionsContextType | undefined>(
    undefined
);

export const UserConnectionContextProvider: React.FC<{children: ReactNode}> = ({
    children,
}) => {

    //  const {userId} = useParams(); //2nd userId
    const [connectStatus, setconnectStatus] = useState(false);
    const [connections, setConnections] = useState<connectionData[] | null>(null);
    const [suggestionData, setsuggestionData] = useState<SuggestionData[] | null>(null);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
     const navigate = useNavigate();
    //Handle Connect to user
       
        useEffect(() =>  {
        const getUserConnections = async() => {
      try {
            const user = await API.getCurrentUser();
            if(!user.userId) return;
            setCurrentUser(user.userId);
            const userConnections = await API.getUserConnections(user.userId);
            // console.log("user connections are:", userConnections);
           if (!userConnections) {
            console.log("error getting userconnects");
            return;
    }
        setConnections(userConnections);
      } catch(error)  {
        console.log("error obtaing all userConnections" ,error);
      }
    }
    const getUserSuggestions = async () => {
      try {
        
        const response = await API.getUserSuggestions();
        setsuggestionData(response.UserRecommendations || []);
      } catch(error) {
        console.log("getUserSuggestions", error);
      }
    }
    getUserSuggestions();
    getUserConnections();
    }, [])

    //Connect to User
      const handleConnect = async (userId: string) => {
        try{
            if(!currentUser ) {
                navigate('/login');
                return;
            }
        
            if(currentUser == undefined) return;
            const connect = await API.connectToUser(currentUser, userId);
            if(connect.success == false) {
                console.log("failed to connect to user");
                setconnectStatus(false);
            }
            setconnectStatus(true);
              const updatedConnections = await API.getUserConnections(currentUser);
              setConnections(updatedConnections);
        } catch(error) {
            console.log("there was an error trying to connect to user", error);
        }
      } 
      //Handle Disconnect
       const handleDisconnect = async (userId: string) => {
        try {
            if(!currentUser) {
                navigate("/login");
                return;
            }
            
            const disconnect = await API.disconnecttoUser(userId, currentUser);
            if(disconnect.success === false) {
                console.log("failed to disconnect");
                return;
            }
            
            // Update connections state by removing the disconnected user
            setConnections(prev => 
                prev?.filter(conn => conn.userId !== userId) || null
            );
        }catch(error) {
            console.log("there was an error trying to disconnect to user", error);
        }
    }
    const value = useMemo(() => ({
    connections, currentUser, suggestionData, handleConnect, handleDisconnect, setconnectStatus, setConnections, connectStatus
}), [connections, currentUser, suggestionData, connectStatus]); // Only re-render when these change

    return(
        <UserConnectionContext.Provider value={value}>
            {children}
        </UserConnectionContext.Provider>
    )
};
//Creating A use COntext universal function
export const useUserConnections = ()  => {
    const context = React.useContext(UserConnectionContext);
    if (context === undefined) {
      throw new Error(
        "useUserConnections must be used within a UserConnectionsContextProvider"
      );
    }
    return context;
  };