import sequelize from '../config/database.js';

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
        
        const users = await sequelize.query(`
            SELECT 
                u.id as userId, u.firstName, u.lastName,
                up.profileImageUrl, up.career, up.location
            FROM users u
            LEFT JOIN userprofiles up ON u.id = up.userId
            WHERE (u.firstName LIKE ? OR u.lastName LIKE ? OR 
                   CONCAT(u.firstName, ' ', u.lastName) LIKE ? OR
                   up.career LIKE ?)
            ORDER BY u.firstName ASC, u.lastName ASC
            LIMIT 10
        `, {
            replacements: [searchTerm, searchTerm, searchTerm, searchTerm],
            type: sequelize.QueryTypes.SELECT
        });

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
};