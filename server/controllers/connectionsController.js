import Connections from "../Models/Connections.js"
import sequelize from '../config/database.js';


export const getUserConnections = async(req, res) => {
    const currentUser = req.user.userId; // Need to obtain all the connections from this user
    try{
        if(!currentUser) {
            console.log("Couldn't detect current User");
        }
        const getConnections = await sequelize.query(`
            SELECT * from dev_connect.connections WHERE user1_id = ?;
            `, {
                replacements: [currentUser],
                type: sequelize.QueryTypes.SELECT
            })
        if(!getConnections || getConnections.length === 0) { //If length is 0 
            return;
        }
        return res.json({getConnections: getConnections}); //Return Connections
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


