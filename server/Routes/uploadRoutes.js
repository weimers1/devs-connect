import express from 'express';
import {
    uploadMiddleware,
    uploadProfileImage,
    testS3,
    updateProfileImage,
} from '../controllers/uploadController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route GET /test-s3
 * @description Test S3 connection
 * @access Public
 */
router.get('/test-s3', testS3);

// Upload image to S3
router.post('/profile-image', uploadMiddleware, uploadProfileImage);

// Save image URL to database
router.put('/profile-image', authMiddleware, updateProfileImage);

export default router;
