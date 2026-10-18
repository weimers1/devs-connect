import User from '../models/User.js';
import UserProfile from '../Models/UserProfile.js';
import sequelize from '../config/database.js';
import { canViewUserSetting } from '../utils/userVisibility.js';
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        if (
            typeof userId !== 'string' ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
        ) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }

        const user = await User.findOne({
            where: { publicId: userId.toLowerCase() },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (
            !(await canViewUserSetting(
                user.id,
                req.user.userId,
                'profileVisibility',
            ))
        ) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profile =
            (await UserProfile.findOne({ where: { userId: user.id } })) || {};

        res.json({
            id: user.id,
            publicId: user.publicId,
            firstName: user.firstName,
            lastName: user.lastName,
            ...(String(req.user.userId) === String(user.id)
                ? { email: user.email }
                : {}),
            bio: profile.bio || '',
            location: profile.location || '',
            career: profile.career || '',
            school: profile.school || '',
            pfp: profile.profileImageUrl || '',
            bannerImageUrl: profile.bannerImageUrl || '',
            githubUrl:
                user.githubProfileVisible && user.githubUsername
                    ? `https://github.com/${encodeURIComponent(user.githubUsername)}`
                    : '',
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

export const getUserProfileByInternalId = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await User.findByPk(userId);
        if (
            !user ||
            !(await canViewUserSetting(user.id, req.user.userId, 'profileVisibility'))
        ) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profile = await UserProfile.findOne({ where: { userId: user.id } });
        res.json({
            publicId: user.publicId,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: profile?.bio || '',
            location: profile?.location || '',
            career: profile?.career || '',
            school: profile?.school || '',
            pfp: profile?.profileImageUrl || '',
            bannerImageUrl: profile?.bannerImageUrl || '',
        });
    } catch (error) {
        console.error('Error fetching message recipient profile:', error);
        res.status(500).json({ error: 'Failed to fetch message recipient profile' });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            userId: userId,
            publicId: user.publicId,
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
};
//Obtain All User information:
export const getAllUsers = async(req,res) => {
        try {
            const requestedUserId = Number(req.params.userId);
            const currentUserId = Number(req.user.userId);
            if (!Number.isInteger(requestedUserId) || requestedUserId <= 0) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }
            if (requestedUserId !== currentUserId) {
                return res.status(403).json({ error: 'Access denied' });
            }

            let UserData =[]
                    UserData= await sequelize.query(
            `
            SELECT u.firstName, u.lastName, u.email, u.verifiedAt, u.id, u.createdAt, up.userId,up.school, up.career, up.profileImageUrl FROM Users u
  LEFT JOIN UserProfiles up ON u.id = up.userId
  WHERE u.id = ?;

            `,
            {
                replacements: [currentUserId],
                type: sequelize.QueryTypes.SELECT,
            },
        );
      const FormattedData =  UserData.map((index) => ({
        firstName: index.firstName || 'First Name',
        lastName: index.lastName || 'Last Name',
        email: index.email,
        id: index.id,
        createdAt: index.createdAt,
        verifiedAt: index.verifiedAt,
        career: index.career || 'Temp',
        profileImage: index.profileImageUrl,
        }));

        res.json(FormattedData)
        } catch(error){
            console.log("THERE WAS AN ERROR OBTAINING USER INFORMATION", error);
            res.status(500).json({ error: 'Failed to obtain user information' });
        }
}