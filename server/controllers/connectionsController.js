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


