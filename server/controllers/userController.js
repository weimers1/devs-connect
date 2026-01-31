import User from '../models/User.js';
import UserProfile from '../Models/UserProfile.js';

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const profile =
            (await UserProfile.findOne({ where: { userId } })) || {};

        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: sser.email,
            bio: profile.bio || '',
            location: profile.location || '',
            career: profile.career || '',
            school: profile.school || '',
            pfp: profile.profileImageUrl || '',
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
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
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
};
