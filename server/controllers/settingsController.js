import UserProfile from '../Models/UserProfile.js';
import sequelize from '../config/database.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import DisplaySettings from '../Models/DisplaySettings.js';
import GeneralPreferences from '../Models/GeneralPreferences.js';
import Privacy_Security from '../Models/Privacy-Security.js';
import stytch from '../config/stytch.js';
import VisibilitySettings from '../Models/VisibilitySettings.js';
import Certifications from '../Models/Certifications.js';

//Profile Controller Get INFO
export const getProfileSettings = async (req, res) => {
    try {
        //Get the token from headers
        const user = await User.findOne({
            //Find the user
            where: { id: req.user.userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' }); //If can't find user through an error
        }
        const profile = await UserProfile.findOne({
            //Find the User Profile
            where: { userId: req.user.userId },
        });
        const certification = await Certifications.findOne({
            where: { userId: req.user.userId },
        });
        res.json({
            //Name/Location || null handles missing Information
            firstName: user.firstName,
            lastName: user.lastName,
            location: profile?.location || null,
            email: user.email,
            //DemoGraphics
            age: profile?.age || null,
            gender: profile?.gender || null,
            //Verifications
            githubEmail: user?.githubEmail || null,
            githubUsername: user?.githubUsername || null,
            githubId: user?.githubId || null,
            githubProfileVisible: !!user?.githubProfileVisible,
            githubUrl: user?.githubProfileVisible && user?.githubUsername ? `https://github.com/${encodeURIComponent(user.githubUsername)}` : '',
            githubUrl:
                user?.githubProfileVisible && user?.githubUsername
                    ? `https://github.com/${encodeURIComponent(user.githubUsername)}`
                    : '',
            bio: profile?.bio || null,
            pfp: profile?.profileImageUrl || null,
            bannerImageUrl: profile?.bannerImageUrl || null,
            career: profile?.career || null,
            school: profile?.school || null,
            certName: certification?.certName || null,
            issuer: certification?.issuer || null,
            dateEarned: certification?.dateEarned || null,
            dateExpiration: certification?.dateExpiration || null,
            credentialID: certification?.credentialID || null,
            credentialURL: certification?.credentialURL || null,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get profile settings' });
    }
};

//Update Profile Settings
export const updateProfileSettings = async (req, res) => {
    try {
        // Input validation
        const {
            firstName,
            lastName,
            email,
            location,
            age,
            gender,
            career,
            school,
            bio,
            pfp,
            bannerImageUrl,
        } = req.body;

        // Validate required fields
        if (
            typeof firstName !== 'string' ||
            !firstName.trim() ||
            typeof lastName !== 'string' ||
            !lastName.trim()
        ) {
            return res
                .status(400)
                .json({ error: 'First name and last name are required' });
        }

        // Validate email format using literal regex
        if (
            email &&
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
        ) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (
            bannerImageUrl !== undefined &&
            bannerImageUrl !== null &&
            (typeof bannerImageUrl !== 'string' ||
                bannerImageUrl.length > 2048 ||
                !/^https:\/\/[a-zA-Z0-9.-]+\.amazonaws\.com\/.+|^https?:\/\/[a-zA-Z0-9.-]+(:[0-9]+)?\/api\/upload\/images\/.+/.test(
                    bannerImageUrl,
                ))
        ) {
            return res.status(400).json({ error: 'Invalid banner image URL' });
        }
        if (
            pfp !== undefined &&
            pfp !== null &&
            (typeof pfp !== 'string' ||
                pfp.length > 2048 ||
                !/^https:\/\/[a-zA-Z0-9.-]+\.amazonaws\.com\/.+|^https?:\/\/[a-zA-Z0-9.-]+(:[0-9]+)?\/api\/upload\/images\/.+/.test(
                    pfp,
                ))
        ) {
            return res.status(400).json({ error: 'Invalid profile image URL' });
        }

        // Validate age if provided
        if (age && (isNaN(age) || age < 13 || age > 120)) {
            return res
                .status(400)
                .json({ error: 'Age must be between 13 and 120' });
        }

        // Sanitize string inputs
        const sanitizedData = {
            firstName: firstName.trim().substring(0, 50),
            lastName: lastName.trim().substring(0, 50),
            email: email?.trim(),
            location: location?.trim().substring(0, 100),
            gender: gender?.trim().substring(0, 20),
            career: career?.trim().substring(0, 100),
            school: school?.trim().substring(0, 100),
            bio: bio?.trim().substring(0, 500),
            profileImageUrl:
                pfp === undefined ? undefined : pfp || null,
            bannerImageUrl:
                bannerImageUrl === undefined
                    ? undefined
                    : bannerImageUrl || null,
        };

        const user = await User.findOne({
            //Find the user
            where: { id: req.user.userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' }); //If can't find user through an error
        }
        await sequelize.transaction(async (transaction) => {
            const [profile] = await UserProfile.findOrCreate({
                where: { userId: req.user.userId },
                defaults: { userId: req.user.userId },
                transaction,
            });
            await user.update({
                firstName: sanitizedData.firstName,
                lastName: sanitizedData.lastName,
                email: sanitizedData.email,
            }, { transaction });
            await profile.update({
                location: sanitizedData.location,
                age,
                gender: sanitizedData.gender,
                career: sanitizedData.career,
                school: sanitizedData.school,
                bio: sanitizedData.bio,
                profileImageUrl: sanitizedData.profileImageUrl,
                bannerImageUrl: sanitizedData.bannerImageUrl,
            }, { transaction });

            if (req.body.certName) {
                const [certification] = await Certifications.findOrCreate({
                    where: { userId: req.user.userId },
                    defaults: { userId: req.user.userId },
                    transaction,
                });

                await certification.update({
                    certName: req.body.certName,
                    issuer: req.body.issuer,
                    dateEarned: req.body.dateEarned,
                    dateExpiration: req.body.dateExpiration,
                    credentialID: req.body.credentialID,
                    credentialURL: req.body.credentialURL,
                }, { transaction });
            }
        });

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile settings' });
    }
};

//Get Display Settings
export const getDisplaySettings = async (req, res) => {
    try {
        const display = await DisplaySettings.findOne({
            //Find the User Profile
            where: { userId: req.user.userId },
        });
        res.json({
            //Display
            theme: display?.theme || null,
            //Edit Display
            font: display?.font_size || null,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get display settings' });
    }
};

//Update Display Settings

export const updateDisplaySettings = async (req, res) => {
    try {
        const display = await DisplaySettings.findOne({
            //Find the User Profile via display
            where: { userId: req.user.userId },
        });
        if (!display) {
            return res
                .status(404)
                .json({ error: 'Display Settings not found' }); //If can't find display through an error
        }
        await display.update({
            theme: req.body.theme,
            font_size: req.body.font_size,
        });
        res.json({
            theme: display.theme || null,
            font_size: display.font_size || null,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update display settings' });
    }
};
//Get General Preferences
export const getGeneralPreferences = async (req, res) => {
    try {
        const general = await GeneralPreferences.findOne({
            where: { userId: req.user.userId },
        });
       
        res.json({
            //Language
            language: general?.language || null,
            //Time Zone
            time_zone: general?.time_zone || null,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get general preferences' });
    }
};
//Update General Preferences
export const updateGeneralPreferences = async (req, res) => {
    try {
        const LanguageMap = {
            en: 'English',
            es: 'Spanish',
            English: 'English',
            Spanish: 'Spanish',
        };
        const updates = {};
        if (req.body.language !== undefined) {
            const languageValue = LanguageMap[req.body.language];
            if (!languageValue) {
                return res.status(400).json({ error: 'Unsupported language' });
            }
            updates.language = languageValue;
        }
        const timeZoneValue = req.body.time_zone || req.body.TimeZone;
        if (timeZoneValue) {
            try {
                new Intl.DateTimeFormat('en-US', { timeZone: timeZoneValue });
            } catch {
                return res.status(400).json({ error: 'Invalid time zone' });
            }
            updates.time_zone = timeZoneValue;
        }
        const [generalPrefs] = await GeneralPreferences.findOrCreate({
            //Find or create the General Preferences
            where: { userId: req.user.userId },
            defaults: {
                userId: req.user.userId
            },
        });
        if(!generalPrefs) {
            return res
            .status(404)
            .json({error: "Didn't find user"});

        }
        await generalPrefs.update(updates);
        res.json({
            language: generalPrefs.language ,
            time_zone: generalPrefs.time_zone,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update general preferences' });
    }
};
//Get Privacy/Security Settings
export const getPrivacySecuritySettings = async (req, res) => {
    try {
        const privacy_security = await Privacy_Security.findOrCreate({
            where: { userId: req.user.userId },
        });
        const user = await User.findOne({
            //Find the user
            where: { id: req.user.userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            //Privacy
            phone: privacy_security?.phone || null,
            email: user?.email || null, //Change Email for Users (Probably Gonna Be A Requirement for base launch)
            //Security
            two_factor_auth: privacy_security?.two_factor_auth || null,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get privacy/security settings',
        });
    }
};
//Update Privacy/Security Settings
export const updatePrivacySecuritySettings = async (req, res) => {
    try {
        const [privacy_security, created] = await Privacy_Security.findOrCreate(
            {
                //If not privacy_security find or create thus
                where: { userId: req.user.userId },
            }
        );

        const user = await User.findOne({
            //Find the user
            where: { id: req.user.userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.email !== req.body.email) {
            //If the email is different from the user's email then return an error
            return res.status(400).json({ error: 'Email cannot be changed' });
        }

        await privacy_security.update({
            //Update the user
            phone: req.body.phone,
            two_factor_auth: req.body.two_factor_auth,
            email: req.body.email,
        });
        res.json({
            //Response for a given user
            phone: privacy_security?.phone || null,
            email: user?.email || null,
            two_factor_auth: privacy_security?.two_factor_auth || null,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get privacy/security settings',
        });
    }
};
//Stytch EMAIL REQUEST EMAIL CHANGE
export const requestEmailChange = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const user = await User.findOne({ where: { id: req.user.userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send magic link to new email for verification
        const response = await stytchClient.magicLinks.email.send({
            user_id: user.stytchUserId, // Your stored Stytch user ID
            email: newEmail,
            magic_link_url: `${process.env.CLIENT_URL}/verify-email-change`,
        });

        res.json({
            message: 'Verification email sent to new address',
            request_id: response.request_id,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send verification' });
    }
};
//STYTcH EMAIL confirmEmailChange
export const confirmEmailChange = async (req, res) => {
    try {
        const { token } = req.body; // From magic link

        // Authenticate the magic link
        const response = await stytchClient.magicLinks.authenticate({
            token: token,
        });

        // Get the new email from Stytch response
        const newEmail = response.user.emails[0].email;
        const stytchUserId = response.user.user_id;

        // Update your database to match Stytch
        await User.update(
            { email: newEmail },
            { where: { stytchUserId: stytchUserId } }
        );

        res.json({
            message: 'Email updated successfully',
            newEmail: newEmail,
        });
    } catch (error) {
        res.status(500).json({ error: 'Invalid verification token' });
    }
};
//Get Visibility Settings
export const getVisibilitySettings = async (req, res) => {
    try {
        const [visibility] = await VisibilitySettings.findOrCreate({
            where: { userId: req.user.userId },
        });
        return res.json({
            profileVisibility: visibility.profileVisibility,
            connectionsVisibility: visibility.connectionsVisibility,
            communitiesVisibility: visibility.communitiesVisibility,
        });
    } catch (error) {
        console.error('Failed to get visibility settings:', error);
        return res.status(500).json({ error: 'Failed to get visibility settings' });
    }
};
//Update Visibility Settings
export const updateVisibilitySettings = async (req, res) => {
    try {
        const fields = [
            'profileVisibility',
            'connectionsVisibility',
            'communitiesVisibility',
        ];
        const allowedValues = ['Everyone', 'ConnectionsOnly', 'OnlyMe'];
        const updates = {};

        for (const field of fields) {
            const value = req.body[field];
            if (value === undefined) continue;
            if (!allowedValues.includes(value)) {
                return res.status(400).json({ error: `Invalid ${field}` });
            }
            updates[field] = value;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No visibility settings provided' });
        }

        const [visibility] = await VisibilitySettings.findOrCreate({
            where: { userId: req.user.userId },
        });
        await visibility.update(updates);
        return res.json({
            profileVisibility: visibility.profileVisibility,
            connectionsVisibility: visibility.connectionsVisibility,
            communitiesVisibility: visibility.communitiesVisibility,
        });
    } catch (error) {
        console.error('Failed to update visibility settings:', error);
        return res.status(500).json({ error: 'Failed to update visibility settings' });
    }
};
//Sign out
export const signOut = async (req, res) => {
    try {
        const user = await User.findOne({
            //Find the user
            where: { id: req.user.userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' }); //If can't find user through an error
        }
        const [session, created] = await Session.findOrCreate({
            //Find or create the Session
            where: { userId: req.user.userId },
            defaults: {
                userId: req.user.userId,
            },
        });
        await session.update({
            //Update the session
            isActive: false,
        });
        res.json({ message: 'User signed out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to sign out' });
    }
};
//Delete Account
export const deleteAccount = async (req, res) => {
    try {
        const user = await User.findOne({
            //Find the user
            where: { id: req.user.userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' }); //If can't find user through an error
        }
        await user.destroy(); //Destroy the user
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

//Get GitHub Connection Status
export const getGitHubConnection = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            isConnected: !!(user.githubId && user.githubUsername),
            githubUsername: user.githubUsername || null,
            githubEmail: user.githubEmail || null,
            githubProfileVisible: !!user.githubProfileVisible,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get GitHub connection' });
    }
};
//Show or hide the connected GitHub account on the user's profile
export const updateGitHubVisibility = async (req, res) => {
    try {
        if (typeof req.body?.visible !== 'boolean') {
            return res.status(400).json({ error: 'visible must be true or false' });
        }
        const user = await User.findOne({ where: { id: req.user.userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.githubId || !user.githubUsername) {
            return res.status(400).json({ error: 'GitHub account is not connected' });
        }
        await user.update({ githubProfileVisible: req.body.visible });
        res.json({ githubProfileVisible: user.githubProfileVisible });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update GitHub visibility' });
    }
};
//Get Github Information
export const getGitHubInformation = async (req, res) => {
    try {
        const username = await User.findOne({
            where: { id: req.user.userId },
        });
        if (!username) {
            return res.status(404).json({ error: 'Username not found' });
        }
        res.json({
            githubEmail: username?.githubEmail || null,
            githubUsername: username?.githubUsername || null,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get username' });
    }
};
