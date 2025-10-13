import UserProfile from '../Models/UserProfile.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import DisplaySettings from '../models/DisplaySettings.js';
import GeneralPreferences from '../models/GeneralPreferences.js';
import Privacy_Security from '../models/Privacy-Security.js';
import stytch from '../config/stytch.js';
import VisibilitySettings from '../models/VisibilitySettings.js';
import Certifications from '../models/Certifications.js';

export const linkGitHub = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate GitHub data
        const { githubId, githubUsername, githubEmail } = req.body;

        if (!githubId || !githubUsername) {
            return res
                .status(400)
                .json({ error: 'GitHub ID and username are required' });
        }

        // Validate email format if provided using literal regex
        if (
            githubEmail &&
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                githubEmail
            )
        ) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Update user with GitHub info
        await user.update({
            githubId,
            githubUsername,
            githubEmail,
        });

        res.json({
            message: 'GitHub account linked successfully',
            githubUsername: req.body.githubUsername,
            githubEmail: req.body.githubEmail,
        });
    } catch (error) {
        console.error('GitHub link error:', error);
        res.status(500).json({ error: 'Failed to link GitHub account' });
    }
};

export const addCertification = async (req, res) => {
    try {
        // Get session token
        //Get the token from headers
        const user = await User.findOne({
            //Find the user
            where: { id: req.user.userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' }); //If can't find user through an error
        }
        // Create new certification
        const certification = await Certifications.create({
            userId: req.user.userId,
            certName: req.body.certName,
            issuer: req.body.issuer,
            dateEarned: req.body.dateEarned,
            dateExpiration: req.body.dateExpiration,
            credentialID: req.body.credentialID,
            credentialURL: req.body.credentialURL,
        });

        res.json({
            message: 'Certification added successfully',
            certification,
        });
    } catch (error) {
        console.error('Add certification error:', error);
        res.status(500).json({ error: 'Failed to add certification' });
    }
};

// Get Certifications
export const getCertifications = async (req, res) => {
    try {
        const certifications = await Certifications.findAll({
            where: { userId: req.user.userId },
        });
        res.json(certifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get certifications' });
    }
};

//Update Certification
export const updateCertifications = async (req, res) => {
    try {
        const cert = await Certifications.findOne({
            where: {
                id: req.params.id,
                userId: req.user.userId,
            },
        });

        if (!cert) {
            return res.status(404).json({ error: 'Certification not found' });
        }

        await cert.update({
            certName: req.body.certName,
            issuer: req.body.issuer,
            dateEarned: req.body.dateEarned,
            dateExpiration: req.body.dateExpiration,
            credentialID: req.body.credentialID,
            credentialURL: req.body.credentialURL,
        });

        res.json({
            message: 'Certification updated successfully',
            certification: cert,
        });
    } catch (error) {
        console.error('Update certification error:', error);
        res.status(500).json({ error: 'Failed to update certification' });
    }
};

//Delete Certification
export const deleteCertification = async (req, res) => {
    try {
        const cert = await Certifications.findOne({
            where: {
                id: req.params.id,
                userId: req.user.userId,
            },
        });

        if (!cert) {
            return res.status(404).json({ error: 'Certification not found' });
        }

        await cert.destroy();

        res.json({
            message: 'Certification deleted successfully',
        });
    } catch (error) {
        console.error('Delete certification error:', error);
        res.status(500).json({ error: 'Failed to delete certification' });
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
            //Notifications
            notifications: general?.notifications || null,
            //Feed Preferences
            feed_preferences: general?.feed_preferences || null,
            //Content Filtering
            content_filtering: general?.content_filtering || null,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get general preferences' });
    }
};

//Delete Skill From The List
// export const deleteSkill = async(req, res) => {

//   try {
//     const skill = await userSkills.findOne({
//       where: {
//         id: req.params.id,
//         userId: req.user.userId
//       }
//     });
//     if(!skill) {
//       return res.status(404).json({error: 'Skill not found'});
//     }
//     await skill.destroy();
//   } catch( error) {
//     res.status(500).json({error: 'Failed to Delete the Skill'});
//   }
// }

// //Get Skills From The User to Display on the big screen
// export const getSkills = async(req, res) => {
//   try{
//     const skill = await userSkills.findAll({
//       where: {
//         userId: req.user.userId
//       }
//     });
//     res.json({
//       skillName: skill?.skillName || null,
//       skillDescription: skill?.skillDescription || null
//     })
//   } catch(error) {
//     res.status(500).json({error: 'Failed to get skills'});
//   }
// }
