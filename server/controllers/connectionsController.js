import Connections from "../models/Connections.js"
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

// Connection requests (used for LFG interest from users with non-public profiles)
const ensureInterestTable = () =>
    sequelize.query(`CREATE TABLE IF NOT EXISTS PostInterests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        postId INT NOT NULL,
        userId INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_post_interest (postId, userId)
    )`);

const ensureRequestTable = () =>
    sequelize.query(`CREATE TABLE IF NOT EXISTS ConnectionRequests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        senderId INT NOT NULL,
        receiverId INT NOT NULL,
        postId INT NULL,
        status VARCHAR(16) NOT NULL DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_connection_request (senderId, receiverId)
    )`);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const sendConnectionRequest = async (req, res) => {
    try {
        const senderId = Number(req.user.userId);
        const { publicId } = req.params;
        const postId = Number(req.body?.postId);
        if (!UUID_REGEX.test(publicId) || !Number.isInteger(postId) || postId <= 0) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        const target = await User.findOne({
            where: { publicId: publicId.toLowerCase() },
            attributes: ['id'],
        });
        if (!target || target.id === senderId) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (await isBlockedBetweenUsers(senderId, target.id)) {
            return res.status(403).json({ error: 'This connection is unavailable' });
        }

        await ensureInterestTable();
        // Only the author of an LFG post can request users who showed interest in it.
        const [allowed] = await sequelize.query(
            `SELECT p.id FROM Posts p
             JOIN PostInterests pi ON pi.postId = p.id AND pi.userId = :targetId
             WHERE p.id = :postId AND p.userId = :senderId AND p.type = 'lfg' LIMIT 1`,
            {
                replacements: { postId, senderId, targetId: target.id },
                type: sequelize.QueryTypes.SELECT,
            },
        );
        if (!allowed) {
            return res.status(403).json({ error: 'You can only request people interested in your LFG post' });
        }

        const connectionId = [senderId, target.id].sort((a, b) => a - b).join('-');
        if (await Connections.findByPk(connectionId)) {
            return res.status(200).json({ status: 'connected' });
        }

        await ensureRequestTable();
        const [reverse] = await sequelize.query(
            "SELECT id FROM ConnectionRequests WHERE senderId = ? AND receiverId = ? AND status = 'pending'",
            { replacements: [target.id, senderId], type: sequelize.QueryTypes.SELECT },
        );
        if (reverse) {
            return res.status(409).json({ error: 'This user already sent you a request. Check your connection requests.' });
        }

        await sequelize.query(
            `INSERT INTO ConnectionRequests (senderId, receiverId, postId, status)
             VALUES (?, ?, ?, 'pending')
             ON DUPLICATE KEY UPDATE postId = VALUES(postId), status = 'pending', createdAt = CURRENT_TIMESTAMP`,
            { replacements: [senderId, target.id, postId] },
        );
        return res.status(201).json({ status: 'pending' });
    } catch (error) {
        console.error('Error sending connection request:', error);
        return res.status(500).json({ error: 'Failed to send connection request' });
    }
};

export const getIncomingConnectionRequests = async (req, res) => {
    try {
        await ensureRequestTable();
        const rows = await sequelize.query(
            `SELECT cr.id, cr.createdAt, u.publicId, u.firstName, u.lastName, up.profileImageUrl, up.career
             FROM ConnectionRequests cr
             JOIN Users u ON u.id = cr.senderId
             LEFT JOIN UserProfiles up ON up.userId = u.id
             WHERE cr.receiverId = :userId AND cr.status = 'pending'
               AND NOT EXISTS (
                   SELECT 1 FROM BlockedUsers b
                   WHERE (b.blockerId = :userId AND b.blockedUserId = cr.senderId)
                      OR (b.blockerId = cr.senderId AND b.blockedUserId = :userId))
             ORDER BY cr.createdAt DESC`,
            { replacements: { userId: req.user.userId }, type: sequelize.QueryTypes.SELECT },
        );
        return res.json(
            rows.map((row) => ({
                id: row.id,
                publicId: row.publicId,
                name: `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unknown User',
                avatar: row.profileImageUrl || null,
                career: row.career || '',
                timestamp: new Date(row.createdAt).toLocaleDateString(),
            })),
        );
    } catch (error) {
        console.error('Error fetching connection requests:', error);
        return res.status(500).json({ error: 'Failed to fetch connection requests' });
    }
};

export const respondToConnectionRequest = async (req, res) => {
    try {
        const userId = Number(req.user.userId);
        const requestId = Number(req.params.requestId);
        const accept = req.params.action === 'accept';
        if (!accept && req.params.action !== 'decline') {
            return res.status(400).json({ error: 'Invalid action' });
        }
        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({ error: 'Invalid request ID' });
        }
        await ensureRequestTable();
        const [request] = await sequelize.query(
            "SELECT id, senderId FROM ConnectionRequests WHERE id = ? AND receiverId = ? AND status = 'pending'",
            { replacements: [requestId, userId], type: sequelize.QueryTypes.SELECT },
        );
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        if (accept) {
            if (await isBlockedBetweenUsers(userId, request.senderId)) {
                return res.status(403).json({ error: 'This connection is unavailable' });
            }
            const connection_id = [userId, request.senderId].sort((a, b) => a - b).join('-');
            await Connections.findOrCreate({
                where: { connection_id },
                defaults: { user1_id: request.senderId, user2_id: userId },
            });
        }
        await sequelize.query('DELETE FROM ConnectionRequests WHERE id = ?', { replacements: [requestId] });
        return res.json({ success: true, status: accept ? 'connected' : 'declined' });
    } catch (error) {
        console.error('Error responding to connection request:', error);
        return res.status(500).json({ error: 'Failed to respond to connection request' });
    }
};