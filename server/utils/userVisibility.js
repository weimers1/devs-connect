import sequelize from '../config/database.js';
import BlockedUser from '../Models/BlockedUser.js';
import VisibilitySettings from '../Models/VisibilitySettings.js';
import { Op } from 'sequelize';

export const isBlockedBetweenUsers = async (firstUserId, secondUserId) => {
    if (!firstUserId || !secondUserId) return false;

    const blocked = await BlockedUser.findOne({
        where: {
            [Op.or]: [
                {
                    blockerId: firstUserId,
                    blockedUserId: secondUserId,
                },
                {
                    blockerId: secondUserId,
                    blockedUserId: firstUserId,
                },
            ],
        },
        attributes: ['id'],
    });
    return Boolean(blocked);
};

export const canViewUserSetting = async (
    targetUserId,
    viewerUserId,
    setting,
) => {
    if (String(targetUserId) === String(viewerUserId)) return true;
    if (await isBlockedBetweenUsers(targetUserId, viewerUserId)) return false;

    const visibility = await VisibilitySettings.findOne({
        where: { userId: targetUserId },
    });
    const value = visibility?.[setting] || 'Everyone';

    if (value === 'Everyone') return true;
    if (value === 'OnlyMe' || !viewerUserId) return false;

    if (value === 'ConnectionsOnly') {
        const connectionId = [Number(targetUserId), Number(viewerUserId)]
            .sort((a, b) => a - b)
            .join('-');
        const [connection] = await sequelize.query(
            'SELECT connection_id FROM connections WHERE connection_id = ? LIMIT 1',
            {
                replacements: [connectionId],
                type: sequelize.QueryTypes.SELECT,
            },
        );
        return Boolean(connection);
    }

    return false;
};
