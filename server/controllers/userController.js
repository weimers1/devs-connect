import User from '../models/users.js';

// get user info
export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// information update
export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const user = await User.findByPk(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        await user.update({ firstName, lastName });
        res.status(200).json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
