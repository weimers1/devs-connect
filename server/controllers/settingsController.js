import UserProfile from "../Models/UserProfile.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import DisplaySettings from "../models/DisplaySettings.js";
import GeneralPreferences from "../models/GeneralPreferences.js";
import Privacy_Security from "../models/Privacy-Security.js";
import stytch from "../config/stytch.js";
import VisibilitySettings from "../models/VisibilitySettings.js";
import Certifications from "../models/Certifications.js";



//Profile Controller Get INFO
export const getProfileSettings = async(req, res) => {
    try {
        //Get the token from headers
    const user = await User.findOne({ //Find the user
        where: {id: req.user.userId}
    })
    if(!user) {
        return res.status(404).json({error: 'User not found'}) //If can't find user through an error
    }
    const profile = await UserProfile.findOne({ //Find the User Profile
        where: {userId: req.user.userId}
    })
    const certification = await Certifications.findOne({
        where: {userId: req.user.userId} 
    })
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
    //Edit Profile
    bio: profile?.bio || null,
    pfp: profile?.pfp || null, 
    career: profile?.career || null,
    school: profile?.school || null,
    certName: certification?.certName || null,          
    issuer: certification?.issuer || null,
    dateEarned:certification?.dateEarned || null,
    dateExpiration: certification?.dateExpiration || null,
    credentialID: certification?.credentialID || null,
    credentialURL: certification?.credentialURL || null,
    })
    } catch(error) {
        res.status(500).json({error: 'Failed to get profile settings'})
    }
 
}

//Update Profile Settings 
export const updateProfileSettings = async(req, res) => {
    try {
        
    const user = await User.findOne({ //Find the user
        where: {id: req.user.userId}
    })
    if(!user) {
        return res.status(404).json({error: 'User not found'}) //If can't find user through an error
    }
    const [profile, created] = await UserProfile.findOrCreate({ //Find or create Profile
        where: {userId: req.user.userId},
        defaults: {
            userId: req.user.userId
        }
    })
  await user.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
    })
    await profile.update({
        location: req.body.location,
        age: req.body.age,
        gender: req.body.gender,
        github: req.body.github,
        career: req.body.career,
        school: req.body.school,
        bio: req.body.bio,
    })
     if(req.body.certName) {  // Only if certification data is sent
            const [certification, certCreated] = await Certifications.findOrCreate({
                where: {userId: req.user.userId},
                defaults: {userId: req.user.userId}
            });
            
            await certification.update({
                certName: req.body.certName,           // Fixed field name
                issuer: req.body.issuer,
                dateEarned: req.body.dateEarned,
                dateExpiration: req.body.dateExpiration,
                credentialID: req.body.credentialID,
                credentialURL: req.body.credentialURL,
            });
        }

    res.json({message: 'Profile updated successfully',
    })
    } catch(error) {
        res.status(500).json({error: 'Failed to update profile settings'})
    }
}


//Get Display Settings
export const getDisplaySettings = async(req, res) => { 
    try {
    const display = await DisplaySettings.findOne({ //Find the User Profile
        where: {userId: req.user.userId}
    })
    res.json({
        //Display
    theme: display?.theme || null,
    //Edit Display
    font: display?.font_size || null,
    })
    } catch(error) {
        res.status(500).json({error: 'Failed to get display settings'})
    }
}

//Update Display Settings

export const updateDisplaySettings = async(req, res) => {
    try {
      const display = await DisplaySettings.findOne({ //Find the User Profile via display
        where: {userId: req.user.userId}
    })
     if(!display) {
        return res.status(404).json({error: 'Display Settings not found'}) //If can't find display through an error
    }
    await display.update({
        theme: req.body.theme,
        font_size: req.body.font_size 
    })
    res.json({
        theme: display.theme || null,
        font_size: display.font_size || null
    })
    } catch(error) {
        res.status(500).json({error: 'Failed to update display settings'})
    }
}
//Get General Preferences
export const getGeneralPreferences = async(req, res) => {
    try  {

    const general = await GeneralPreferences.findOne({
        where: {userId: req.user.userId}
    })
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
    content_filtering: general?.content_filtering || null
 })
    } catch(error) {
        res.status(500).json({error: 'Failed to get general preferences'})
    }
}
//Update General Preferences
export const updateGeneralPreferences = async(req, res) => {
    try {
    const [generalPrefs, created] = await GeneralPreferences.findOrCreate({ //Find or create the General Preferences
    where: {userId: req.user.userId},
    defaults: {
        userId: req.user.userId,
        time_zone: 'UTC' 
    }
})
    await generalPrefs.update({
        language: req.body.language,
        time_zone: req.body.time_zone,
        notifications: req.body.notifications,
        feed_preferences: req.body.feed_preferences,
        content_filtering: req.body.content_filtering
    })
     res.json({
        language:  generalPrefs?.language || null,
        time_zone:  generalPrefs?.time_zone || null,
        notifications:  generalPrefs?.notifications || null,
        feed_preferences:  generalPrefs?.feed_preferences || null,
        content_filtering:  generalPrefs?.content_filtering || null,
    })
} catch(error) {
    res.status(500).json({error: 'Failed to update general preferences'})
}
}
//Get Privacy/Security Settings
export const getPrivacySecuritySettings = async(req,res) => {
     try {

    const privacy_security = await Privacy_Security.findOrCreate({
        where: {userId: req.user.userId}
    })
      const user = await User.findOne({ //Find the user
        where: {id: req.user.userId}
    })
    if(!user) {
        return res.status(404).json({error: 'User not found'})
    }
    res.json({
        //Privacy
        phone: privacy_security?.phone || null,
        email: user?.email || null, //Change Email for Users (Probably Gonna Be A Requirement for base launch) 
        //Security
        two_factor_auth: privacy_security?.two_factor_auth || null,
   
    })

}catch(error) {
    res.status(500).json({error: 'Failed to get privacy/security settings'})
}
}
//Update Privacy/Security Settings
export const updatePrivacySecuritySettings = async(req, res) => {
    try {

    const [privacy_security, created] = await Privacy_Security.findOrCreate({ //If not privacy_security find or create thus
        where:{userId: req.user.userId}
    })

    const user = await User.findOne({ //Find the user
        where: {id: req.user.userId}
    })
    if(!user.email !== req.body.email) { //If the email is not the same as the user's email then return an error
        return res.status(400).json({error: 'Email cannot be changed'})
    }

    await privacy_security.update({ //Update the user 
        phone: req.body.phone,
        two_factor_auth: req.body.two_factor_auth,
        email: req.body.email
    })
    res.json({ //Response for a given user
    phone: privacy_security?.phone || null, 
    email: user?.email || null,
    two_factor_auth: privacy_security?.two_factor_auth || null
})
}  catch(error){
    res.status(500).json({error: 'Failed to get privacy/security settings'});
}

}
//Stytch EMAIL REQUEST EMAIL CHANGE
export const requestEmailChange = async(req, res) => {
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
            magic_link_url: `${process.env.CLIENT_URL}/verify-email-change`
        });
        
        res.json({ 
            message: 'Verification email sent to new address',
            request_id: response.request_id 
        });
    } catch(error) {
        res.status(500).json({ error: 'Failed to send verification' });
    }
}
//STYTcH EMAIL confirmEmailChange
export const confirmEmailChange = async(req, res) => {
    try {
        const { token } = req.body; // From magic link
        
        // Authenticate the magic link
        const response = await stytchClient.magicLinks.authenticate({
            token: token
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
            newEmail: newEmail 
        });
    } catch(error) {
        res.status(500).json({ error: 'Invalid verification token' });
    }
}
//Get Visibility Settings
export const getVisibilitySettings = async(req,res) => {
    try {
        const [visibility, created] = await VisibilitySettings.findOrCreate({
            where: {userId: req.user.userId}
        })
    if(!visibility) {
        return res.status(404).json({error: 'Visibility settings not found'})
    }
    res.json({
     Profile_Visibility: visibility?.Profile_Visibility || null,
     Connections_Visibility: visibility?.Connections_Visibility || null,
    Communities_Visibility: visibility?.Communities_Visibility || null
    })
    } catch(error) {
        res.status(500).json({error: 'Failed to get visibility settings'})
    }
}
//Update Visibility Settings
export const updateVisibilitySettings = async(req, res) => {
    try {
        const [visibility, created] = await VisibilitySettings.findOrCreate({
            where: {userId: req.user.userId}
        })
        if(!visibility) {
            return res.status(404).json({error: 'Visibility settings not found'})
        }
        await visibility.update({
            Profile_Visibility: req.body.Profile_Visibility,
            Connections_Visibility: req.body.Connections_Visibility,
            Communities_Visibility: req.body.Communities_Visibility
        })
        res.json({
            Profile_Visibility: visibility?.Profile_Visibility || null,
            Connections_Visibility: visibility?.Connections_Visibility || null,
            Communities_Visibility: visibility?.Communities_Visibility || null
        })
    } catch(error) {
        res.status(500).json({error: 'Failed to update visibility settings'})
    }
}
//Sign out
export const signOut = async(req, res) => {
    try {
        const user = await User.findOne({ //Find the user
            where: {id: req.user.userId}
        })
        if(!user) {
            return res.status(404).json({error: 'User not found'}) //If can't find user through an error
        }
        const [session, created] = await Session.findOrCreate({ //Find or create the Session
            where: {userId: req.user.userId},
            defaults: {
                userId: req.user.userId
            }
        })
        await session.update({ //Update the session
            isActive: false
        })
        res.json({message: 'User signed out successfully'})
    } catch(error) {
        res.status(500).json({error: 'Failed to sign out'})
    }
}
//Delete Account 
export const deleteAccount = async(req, res) => {
    try {
        const user = await User.findOne({ //Find the user
            where: {id: req.user.userId}
        })
        if(!user) {
            return res.status(404).json({error: 'User not found'}) //If can't find user through an error
        }
        await user.destroy() //Destroy the user
        res.json({message: 'User deleted successfully'})
    } catch(error) {
        res.status(500).json({error: 'Failed to delete account'})
    }
}
