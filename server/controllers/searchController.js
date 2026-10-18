import sequelize from '../config/database.js';
import { canViewUserSetting } from '../utils/userVisibility.js';

export const searchCommunities = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.json([]);
        }

        const searchTerm = `%${q.trim()}%`;
        
        const communities = await sequelize.query(`
            SELECT 
                id, name, description, memberCount, icon, color, isPrivate
            FROM communities 
            WHERE (name LIKE ? OR description LIKE ?) 
            AND isPrivate = false
            ORDER BY memberCount DESC, name ASC
            LIMIT 10
        `, {
            replacements: [searchTerm, searchTerm],
            type: sequelize.QueryTypes.SELECT
        });

        res.json(communities);
    } catch (error) {
        console.error('Error searching communities:', error);
        res.status(500).json({ error: 'Failed to search communities' });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.json([]);
        }

        const searchTerm = `%${q.trim()}%`;
        const viewerId = req.user?.userId || null;

        const users = await sequelize.query(`
            SELECT 
                u.publicId as publicId, u.firstName, u.lastName,
                up.profileImageUrl, up.career, up.location
            FROM Users u
            LEFT JOIN UserProfiles up ON u.id = up.userId
            LEFT JOIN VisibilitySettings visibility ON visibility.userId = u.id
            WHERE (u.firstName LIKE ? OR u.lastName LIKE ? OR 
                   CONCAT(u.firstName, ' ', u.lastName) LIKE ? OR
                   up.career LIKE ?)
              AND (? IS NULL OR u.id != ?)
              AND (
                    COALESCE(visibility.profileVisibility, 'Everyone') = 'Everyone'
                    OR (
                        COALESCE(visibility.profileVisibility, 'Everyone') = 'ConnectionsOnly'
                        AND EXISTS (
                        SELECT 1 FROM connections c
                        WHERE (c.user1_id = ? AND c.user2_id = u.id)
                           OR (c.user2_id = ? AND c.user1_id = u.id)
                        )
                    )
              )
              AND NOT EXISTS (
                    SELECT 1 FROM BlockedUsers b
                    WHERE (b.blockerId = ? AND b.blockedUserId = u.id)
                       OR (b.blockerId = u.id AND b.blockedUserId = ?)
              )
            ORDER BY u.firstName ASC, u.lastName ASC
            LIMIT 10
        `, {
            replacements: [
                searchTerm, searchTerm, searchTerm, searchTerm,
                viewerId, viewerId, viewerId, viewerId, viewerId, viewerId,
            ],
            type: sequelize.QueryTypes.SELECT
        });

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
};