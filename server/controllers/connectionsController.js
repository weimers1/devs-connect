import Connections from "../Models/Connections.js"
import sequelize from '../config/database.js';


export const getUserConnections = async(req, res) => {
    const currentUser = req.user.userId; // Need to obtain all the connections from this user
    try{
        if(!currentUser) {
            console.log("Couldn't detect current User");
        }
        const getConnections = await sequelize.query(`
           SELECT 
    u.id AS userId,
    up.career,
    u.firstName,
    u.lastName,
    up.profileImageUrl
FROM Connections c
JOIN Users u 
    ON (c.user1_id = ? AND u.id = c.user2_id)
    OR (c.user2_id = ? AND u.id = c.user1_id)
LEFT JOIN UserProfiles up ON u.id = up.userId;
            `, {
                replacements: [currentUser, currentUser],
                type: sequelize.QueryTypes.SELECT
            })
      
        return res.json(getConnections); //Return Connections
    } catch(error) {
        console.log(error, "Error Trying to obtain userConnection Data");
    }
}

export const getOtherUserConnections = async(req, res) => {
    const {userId} = req.params; // Need to obtain all the connections from this user
    try{
        if(!userId) {
            console.log("Couldn't detect current User");
        }
        const getConnections = await sequelize.query(`
         SELECT 
    u.id AS userId,
    up.career,
    u.firstName,
    u.lastName,
    up.profileImageUrl
FROM Connections c
JOIN Users u 
    ON (c.user1_id = ? AND u.id = c.user2_id)
LEFT JOIN UserProfiles up ON u.id = up.userId;
            `, {
                replacements: [userId, userId],
                type: sequelize.QueryTypes.SELECT
            })
      
        return res.json(getConnections); //Return Connections
    } catch(error) {
        console.log(error, "Error Trying to obtain userConnection Data");
    }
}


export const getrelevantconnection = async(req, res) => {
    const {currentUserId, userId} = req.params;
    try {
        if(!currentUserId || !userId) {
            console.log("missing requirements");
            return res.json({success: false});
        }
        //sorrt connection ID
    const connection_id = [currentUserId, userId] 
    .sort((a,b) => a-b)
    .join('-');
        const connection = await sequelize.query(`SELECT * FROM dev_connect.connections WHERE 
            connection_id = ? `, {
                replacements: [connection_id.toString()],
                type: sequelize.QueryTypes.SELECT,
            })
            if(connection.length == 0 || !connection ) {
                return res.json({success:false});
            } else {
            
            return res.json({success:true, connection: connection[0]});
            }
    } catch(error) {
        console.log("error trying to obtain the connections between user");
        res.status(500).json({error: "Failed to get connection between users"});
    }
}

//Connect to User

export const connectToUser = async(req,res) => {
    const {userId, currentUserId} = req.params; //Obtain the 2nd user Id;
    try {
        if(!currentUserId || !userId) {
            console.log("missing requiremnts in order to connect");
      
        }
    const connection_id = [currentUserId, userId]
        .sort((a,b) => a - b)
        .join('-');

    const connectToUser = await Connections.create({
        user1_id: currentUserId, 
        user2_id: userId, 
        connection_id: connection_id.toString()
    })

    res.status(201).json({message: "connected", success: true, connectToUser })

    return res.json({success:false, message: "unable to connect"});
        
    } catch(error) {
        console.log("Error Connecting to User", error);
        res.status(500).json({ error: 'Failed to connect to user' });
    }
}


//Unconnect User

export const disconnecttotUser = async(req,res) => {
    const {userId, currentUserId} = req.params; //Obtain the 2nd user Id;
    try {
        if(!currentUserId || !userId) {
            console.log("missing requiremnts in order to connect");
      
        }
    const connection_id = [currentUserId, userId]
        .sort((a,b) => a - b)
        .join('-');

    const disconnectToUser = await sequelize.query(`
        DELETE FROM dev_connect.connections WHERE (connection_id = ?);`, {
            replacements: [connection_id.toString()],
            type: sequelize.QueryTypes.DELETE
        }
 )
    if(disconnectToUser === 0) {
        return res.json({success: false, message: "No connection found to disconnect"});
    }

    res.status(201).json({message: "disconnected", success: true, connectToUser })
        
    } catch(error) {
        console.log("Error Connecting to User", error);
        res.status(500).json({ error: 'Failed to connect to user' });
    }
}


