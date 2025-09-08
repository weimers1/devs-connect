// In routes/uploadRoutes.js (or wherever you put routes)
import express from 'express';

import { uploadMiddleware, uploadProfileImage, testS3, updateProfileImage } from '../controllers/uploadController.js';

const router = express.Router();

// Test S3 connection
router.get('/test-s3', testS3);

// Upload image to S3
router.post('/profile-image', uploadMiddleware, uploadProfileImage);

// Save image URL to database
router.put('/profile-image', updateProfileImage);

export default router;
