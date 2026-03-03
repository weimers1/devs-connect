import { createContext, useEffect, useState, type ReactNode } from "react";
import API from "../../Service/service";
import React from "react";

//Connection Data
 interface connectionData  {
    career: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
    userId: string;
}
//The UserOCnnectionsContext Type | connection Data and setconnection.
interface UserConnectionsContextType {
    connections: connectionData[] | null;
    setConnections: React.Dispatch<
    React.SetStateAction<connectionData[] | null>
  >;
    currentUser: string | null;
    OthersConnections: connectionData[] | null;
}
//creating userconnection context
export const UserConnectionContext = createContext<UserConnectionsContextType | undefined>(
    undefined
);

export const UserConnectionContextProvider: React.FC<{children: ReactNode}> = ({
    children,
}) => {
    const [connections, setConnections] = useState<connectionData[] | null>(null);
    const [currentUser, setCurrentUser] = useState<string>();
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
    getUserConnections();
    }, [])
    return(
        <UserConnectionContext.Provider value={{connections, setConnections, currentUser}}>
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