import express from 'express';
import AWS from 'aws-sdk';
import {
    uploadMiddleware,
    uploadProfileImage,
    testS3,
    updateProfileImage,
    uploadCommunityImage,
    uploadCommunityMiddleware,
} from '../controllers/uploadController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// Configure S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

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

// Upload community image
router.post('/community-image', uploadCommunityMiddleware, uploadCommunityImage);

// Image proxy route - serve images through backend
router.use('/images', async (req, res, next) => {
    try {
        const imageKey = req.path.substring(1);
        
        if (!imageKey || imageKey.includes('..')) {
            return res.status(400).json({ error: 'Invalid image key' });
        }
        
        // Get object from S3 and stream it
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME || 'devsconnect',
            Key: imageKey
        };
        
        const s3Object = s3.getObject(params);
        const stream = s3Object.createReadStream();
        
        // Set appropriate headers
        res.set({
            'Content-Type': 'image/jpeg', // Default, will be overridden by S3 metadata
            'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
        });
        
        // Handle S3 response
        s3Object.on('httpHeaders', (statusCode, headers) => {
            if (headers['content-type']) {
                res.set('Content-Type', headers['content-type']);
            }
            if (headers['content-length']) {
                res.set('Content-Length', headers['content-length']);
            }
        });
        
        // Pipe the S3 stream to response
        stream.pipe(res);
        
        stream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(404).json({ error: 'Image not found' });
            }
        });
        
    } catch (error) {
        console.error('Image proxy error:', error);
        res.status(404).json({ error: 'Image not found' });
    }
});


export default router;
