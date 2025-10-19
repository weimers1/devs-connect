import User from '../models/User.js';
import Session from '../models/Session.js'; // Idk how imports with 'models' folder (as opposed to 'Models' folder) are even working rn
import Career from '../Models/Career.js';

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
        const { firstName, lastName, careerId } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        // validate firstName
        if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
            throw Object.assign(new Error('First name error'), {
                status: 400,
                message: 'First name must be non-empty',
            });
        }

        // validate lastName
        if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
            throw Object.assign(new Error('Last name error'), {
                status: 400,
                message: 'Last name must be non-empty',
            });
        }

        // validate careerId
        if (!careerId || isNaN(parseInt(careerId))) {
            throw Object.assign(new Error('Invalid career'), {
                status: 400,
                message: 'Please select a career from our list.',
            });
        }

        // check if careerId exists and is active
        const career = await Career.findOne({
            where: {
                id: parseInt(careerId),
                isActive: 1,
            },
        });

        if (!career) {
            throw Object.assign(new Error('Invalid career'), {
                status: 400,
                message: 'Please select a career from our list.',
            });
        }

        // get active session for user
        const session = await Session.findOne({
            where: {
                token: token,
                isActive: 1,
            },
        });

        // if it doesn't exist, call them out
        if (!session) {
            throw Object.assign(new Error('Invalid or inactive session'), {
                status: 401,
                message: 'Invalid or inactive session',
            });
        }

        // update that thang
        await User.update(
            {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                careerId: parseInt(careerId),
            },
            {
                where: { id: session.userId },
            }
        );

        res.status(200).json({
            status: 200,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || 'Failed to update profile',
        });
    }
};
