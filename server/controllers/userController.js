import User from '../models/User.js';
import Career from '../models/Career.js';
import Session from '../models/Session.js';

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
        const { firstName, lastName, careerId, sessionToken } = req.body;

        // validate firstName
        if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
            throw Object.assign(
                new Error('First name must be a non-empty string'),
                {
                    status: 400,
                    message: 'First name must be a non-empty string',
                }
            );
        }

        // validate lastName
        if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
            throw Object.assign(
                new Error('Last name must be a non-empty string'),
                {
                    status: 400,
                    message: 'Last name must be a non-empty string',
                }
            );
        }

        // validate careerId
        if (!careerId || isNaN(parseInt(careerId))) {
            throw Object.assign(
                new Error('Invalid career. Please select one from our list.'),
                {
                    status: 400,
                    message: 'Invalid career. Please select one from our list.',
                }
            );
        }

        // check if careerId exists and is active
        const career = await Career.findOne({
            where: {
                id: parseInt(careerId),
                isActive: 1,
            },
        });

        if (!career) {
            throw Object.assign(
                new Error('Invalid career. Please select one from our list.'),
                {
                    status: 400,
                    message: 'Invalid career. Please select one from our list.',
                }
            );
        }

        // get active session for user
        const session = await Session.findOne({
            where: {
                token: sessionToken,
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
            message: 'Failed to update profile',
        });
    }
};
