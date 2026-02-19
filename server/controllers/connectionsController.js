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
    const currentUser = req.user.userId;
    const {user2Id} = req.params; //Obtain the 2nd user Id;
    try {
        if(!currentUser || !user2Id) {
            console.log("missing requiremnts in order to connect");
            return;
        }
    const connection_id = [currentUser, user2Id]
        .sort((a,b) => a - b)
        .join('-');

    const connectToUser = await Connections.create({
        user1_id: currentUser, 
        user2_id: user2Id, 
        connection_id: connection_id
    })
    if(connectToUser) {
        return res.json({success: true, data: connectToUser});
    }
    return res.json("unable to connect to user");
        
    } catch(error) {
        console.log("Error Connecting to User", error);
    }
}





//Unconnect User


