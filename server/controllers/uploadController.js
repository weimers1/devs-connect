import multer from 'multer';
import s3 from '../config/aws.js';
import { testS3Connection } from '../config/aws.js';
import UserProfile from '../Models/UserProfile.js';
import Community from '../Models/Communites.js';

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

// Test endpoint to check S3 connection
export const testS3 = async (req, res) => {
    try {
        const isConnected = await testS3Connection();

        if (isConnected) {
            res.json({
                success: true,
                message: ' S3 connection successful!',
            });
        } else {
            res.status(500).json({
                success: false,
                message: ' S3 connection failed',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Upload to S3 function
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Generate unique filename
        const fileName = `profile-images/${Date.now()}-${
            req.file.originalname
        }`;

        // Validate AWS bucket name
        if (!process.env.AWS_BUCKET_NAME) {
            return res
                .status(500)
                .json({ error: 'AWS bucket configuration missing' });
        }

        // S3 upload parameters
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        // Upload to S3
        const result = await s3.upload(params).promise();

        res.json({
            success: true,
            imageUrl: result.Location,
            message: 'Image uploaded successfully!',
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
};

// Save image URL to database
export const updateProfileImage = async (req, res) => {
    try {
        // Check if user is authenticated (should be set by authMiddleware)
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { imageUrl } = req.body;

        // Validate imageUrl format
        if (!imageUrl || typeof imageUrl !== 'string') {
            return res.status(400).json({ error: 'Invalid image URL' });
        }

        // Validate URL format and ensure it's from expected S3 bucket
        const urlPattern = /^https:\/\/[a-zA-Z0-9.-]+\.amazonaws\.com\/.+/;
        if (!urlPattern.test(imageUrl)) {
            return res.status(400).json({ error: 'Invalid image URL format' });
        }

        // Find or create UserProfile record, then update image URL
        const [userProfile, created] = await UserProfile.findOrCreate({
            where: { userId: req.user.userId },
            defaults: { userId: req.user.userId }
        });
        
        await userProfile.update({ profileImageUrl: imageUrl });

        res.json({
            success: true,
            message: 'Profile image updated successfully',
        });
    } catch (error) {
        console.error('Profile image update error:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?.userId,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ error: 'Failed to update profile image' });
    }
};

// Upload community image
export const uploadCommunityImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileName = `community-images/${Date.now()}-${req.file.originalname}`;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        const result = await s3.upload(params).promise();

        res.json({
            success: true,
            imageUrl: result.Location,
            message: 'Community image uploaded successfully!',
        });
    } catch (error) {
        console.error('Community image upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
};

// Export multer middleware
export const uploadMiddleware = upload.single('profileImage');
export const uploadCommunityMiddleware = upload.single('communityImage');
