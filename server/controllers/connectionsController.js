import Connections from "../Models/Connections.js"
import sequelize from '../config/database.js';
import User from '../models/User.js';
import { canViewUserSetting, isBlockedBetweenUsers } from '../utils/userVisibility.js';


export const getUserConnections = async(req, res) => {
    const currentUser = req.user.userId; // Need to obtain all the connections from this user
    try{
        if(!currentUser) {
            return res.status(401).json({ error: 'Authenticated user not found' });
        }
        const getConnections = await sequelize.query(`
           SELECT 
    u.id AS userId,
    u.publicId AS publicId,
    up.career,
    u.firstName,
    u.lastName,
    up.profileImageUrl
FROM connections c
JOIN Users u 
    ON (c.user1_id = ? AND u.id = c.user2_id)
    OR (c.user2_id = ? AND u.id = c.user1_id)
LEFT JOIN UserProfiles up ON u.id = up.userId
WHERE NOT EXISTS (
    SELECT 1 FROM BlockedUsers b
    WHERE (b.blockerId = ? AND b.blockedUserId = u.id)
       OR (b.blockerId = u.id AND b.blockedUserId = ?)
);
            `, {
                replacements: [currentUser, currentUser, currentUser, currentUser],
                type: sequelize.QueryTypes.SELECT
            })
      
        return res.json(getConnections); //Return Connections
    } catch(error) {
        console.log(error, "Error Trying to obtain userConnection Data");
        return res.status(500).json({ error: 'Failed to get user connections' });
    }
}

export const getOtherUserConnections = async(req, res) => {
    const {userId} = req.params; // Need to obtain all the connections from this user
    try{
        if (
            typeof userId !== 'string' ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
        ) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }
        const targetUser = await User.findOne({
            where: { publicId: userId.toLowerCase() },
            attributes: ['id'],
        });
        if (!targetUser) {
            return res.status(404).json({ error: 'Connections not found' });
        }
        if (!(await canViewUserSetting(targetUser.id, req.user.userId, 'connectionsVisibility'))) {
            return res.status(404).json({ error: 'Connections not found' });
        }
        const getConnections = await sequelize.query(`
         SELECT 
    u.id AS userId,
    u.publicId AS publicId,
    up.career,
    u.firstName,
    u.lastName,
    up.profileImageUrl
FROM connections c
JOIN Users u 
    ON (c.user1_id = ? AND u.id = c.user2_id)
    OR (c.user2_id = ? AND u.id = c.user1_id)
LEFT JOIN UserProfiles up ON u.id = up.userId
WHERE NOT EXISTS (
    SELECT 1 FROM BlockedUsers b
    WHERE (b.blockerId = ? AND b.blockedUserId = u.id)
       OR (b.blockerId = u.id AND b.blockedUserId = ?)
);
            `, {
                replacements: [targetUser.id, targetUser.id, req.user.userId, req.user.userId],
                type: sequelize.QueryTypes.SELECT
            })
      
        return res.json(getConnections); //Return Connections
    } catch(error) {
        console.log(error, "Error Trying to obtain userConnection Data");
        return res.status(500).json({ error: 'Failed to get user connections' });
    }
}


export const getrelevantconnection = async(req, res) => {
    const {currentUserId, userId} = req.params;
    try {
        if (Number(currentUserId) !== Number(req.user.userId)) {
            return res.status(403).json({ error: "Cannot access another user's connections" });
        }
        if(!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
    const connection_id = [Number(req.user.userId), Number(userId)]
    .sort((a,b) => a-b)
    .join('-');
        const connection = await Connections.findByPk(connection_id);
            if (!connection) {
                return res.json({success:false});
            } else {
            
            return res.json({success:true, connection});
            }
    } catch(error) {
        console.log("error trying to obtain the connections between user");
        return res.status(500).json({error: "Failed to get connection between users"});
    }
}

//Connect to User

export const connectToUser = async(req,res) => {
    const {userId, currentUserId} = req.params;
    try {
        const authenticatedUserId = Number(req.user.userId);
        const targetUserId = Number(userId);
        if (currentUserId !== undefined && Number(currentUserId) !== authenticatedUserId) {
            return res.status(403).json({ error: "Cannot create a connection for another user" });
        }
        if (!Number.isInteger(targetUserId) || targetUserId <= 0 || targetUserId === authenticatedUserId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        if (!(await User.findByPk(targetUserId))) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (await isBlockedBetweenUsers(authenticatedUserId, targetUserId)) {
            return res.status(403).json({ error: 'This connection is unavailable' });
        }
    const connection_id = [authenticatedUserId, targetUserId]
        .sort((a,b) => a - b)
        .join('-');

    const [connectToUser, created] = await Connections.findOrCreate({
        where: { connection_id },
        defaults: {
            user1_id: authenticatedUserId,
            user2_id: targetUserId,
        },
    });

    return res.status(created ? 201 : 200).json({message: "connected", success: true, connectToUser })
        
    } catch(error) {
        console.error("Error Connecting to User", error);
        if (error?.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(503).json({
                error: 'Connection storage is out of sync with the user table. Run the connection foreign-key migration and retry.',
            });
        }
        return res.status(500).json({ error: 'Failed to connect to user' });
    }
}


//disconnect to User

export const disconnecttotUser = async(req,res) => {
    const {userId, currentUserId} = req.params; //Obtain the 2nd user Id;
    try {
        const authenticatedUserId = Number(req.user.userId);
        const targetUserId = Number(userId);
        if (Number(currentUserId) !== authenticatedUserId) {
            return res.status(403).json({ error: "Cannot remove another user's connection" });
        }
        if (!Number.isInteger(targetUserId) || targetUserId <= 0 || targetUserId === authenticatedUserId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
    const connection_id = [authenticatedUserId, targetUserId]
        .sort((a,b) => a - b)
        .join('-');

    const deletedCount = await Connections.destroy({ where: { connection_id } });
    if(deletedCount === 0) {
        return res.status(404).json({success: false, message: "No connection found to disconnect"});
    }

    return res.json({message: "disconnected", success: true })
        
    } catch(error) {
        console.log("Error Connecting to User", error);
        return res.status(500).json({ error: 'Failed to disconnect from user' });
    }
}
