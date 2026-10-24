import sequelize from '../config/database.js';
import BlockedUser from '../models/BlockedUser.js';
import Connections from '../models/Connections.js';
import User from '../models/User.js';

const getConnectionId = (firstUserId, secondUserId) =>
    [Number(firstUserId), Number(secondUserId)]
        .sort((a, b) => a - b)
        .join('-');

export const getBlockedUsers = async (req, res) => {
    try {
        const blockedUsers = await sequelize.query(
            `SELECT u.id, u.firstName, u.lastName
             FROM BlockedUsers b
             JOIN Users u ON u.id = b.blockedUserId
             WHERE b.blockerId = ?
             ORDER BY b.createdAt DESC`,
            {
                replacements: [req.user.userId],
                type: sequelize.QueryTypes.SELECT,
            },
        );
        return res.json(blockedUsers);
    } catch (error) {
        console.error('Failed to retrieve blocked users:', error);
        return res.status(500).json({ error: 'Failed to retrieve blocked users' });
    }
};

export const blockUser = async (req, res) => {
    const blockerId = Number(req.user.userId);
    const blockedUserId = Number(req.params.userId);
    if (!Number.isInteger(blockedUserId) || blockedUserId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    if (blockedUserId === blockerId) {
        return res.status(400).json({ error: 'You cannot block yourself' });
    }

    try {
        const targetUser = await User.findByPk(blockedUserId, {
            attributes: ['id'],
        });
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        await sequelize.transaction(async (transaction) => {
            await BlockedUser.findOrCreate({
                where: { blockerId, blockedUserId },
                transaction,
            });
            await Connections.destroy({
                where: {
                    connection_id: getConnectionId(blockerId, blockedUserId),
                },
                transaction,
            });
        });
        const io = req.app.get('io');
        if (io) {
            io.to(`user-${blockerId}`).emit('user-blocked', {
                userId: blockedUserId,
            });
            io.to(`user-${blockedUserId}`).emit('user-blocked', {
                userId: blockerId,
            });
        }
        return res.json({ success: true });
    } catch (error) {
        console.error('Failed to block user:', error);
        return res.status(500).json({ error: 'Failed to block user' });
    }
};

export const unblockUser = async (req, res) => {
    const blockedUserId = Number(req.params.userId);
    if (!Number.isInteger(blockedUserId) || blockedUserId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const deleted = await BlockedUser.destroy({
            where: {
                blockerId: req.user.userId,
                blockedUserId,
            },
        });
        if (!deleted) {
            return res.status(404).json({ error: 'Blocked user not found' });
        }
        return res.json({ success: true });
    } catch (error) {
        console.error('Failed to unblock user:', error);
        return res.status(500).json({ error: 'Failed to unblock user' });
    }
};
