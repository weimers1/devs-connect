import express from "express";
import { getProfileSettings, updateProfileSettings, getDisplaySettings, updateDisplaySettings, getGeneralPreferences, updateGeneralPreferences, updatePrivacySecuritySettings, getPrivacySecuritySettings, requestEmailChange, confirmEmailChange, updateVisibilitySettings, getVisibilitySettings } from "../controllers/settingsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { addCertification} from "../controllers/ProfileController.js";
import { updateProfileImage } from "../controllers/uploadController.js";
import { getCertifications } from "../controllers/ProfileController.js"
import { updateCertifications, deleteCertification } from "../controllers/ProfileController.js";
const router = express.Router();


router.use(authMiddleware);
//Get Profile Settings
router.get('/profile', getProfileSettings);
//Update Profile Settings
router.put('/profile', updateProfileSettings);
//Update || add to profile settings
router.post('/certifications', addCertification);
//Get Certs
router.get('/get-certifications', getCertifications );
//Update Certifications
router.put('/update-certifications/:id', updateCertifications);
//Delete Certification
router.delete('/certifications/:id', deleteCertification);
//Get Display Settings
router.get('/display', getDisplaySettings);
//Update Display Settings
router.put('/display', updateDisplaySettings);
//Get General Preferences
router.get('/general', getGeneralPreferences);
//Update General Preferences
router.put('/general', updateGeneralPreferences);
//Update Privacy and Security Settings
router.put('/privacy-security', updatePrivacySecuritySettings);
//Get Privacy and Security Settings
router.get('/privacy-security', getPrivacySecuritySettings);
//Request Email Change
router.post('/request-email-change', requestEmailChange);
//Confirm Email Change
router.post('/confirm-email-change', confirmEmailChange);
//get Visibility Settings
router.get('/visibility', getVisibilitySettings);
//Update Visibility Settings
router.put('/visibility', updateVisibilitySettings);
//Update Profile Image URL
router.put('/profile-image', updateProfileImage);

export default router;
