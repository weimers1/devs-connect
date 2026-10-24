import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { uploadToS3 } from '../config/aws.js';
import UserProfile from '../models/UserProfile.js';

const imageTypes = new Map([
    ['image/jpeg', { extension: 'jpg', signature: (buffer) =>
        buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff }],
    ['image/png', { extension: 'png', signature: (buffer) =>
        buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) }],
    ['image/gif', { extension: 'gif', signature: (buffer) =>
        buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6)) }],
    ['image/webp', { extension: 'webp', signature: (buffer) =>
        buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' }],
]);

const getValidatedImage = (file) => {
    const imageType = imageTypes.get(file.mimetype);
    if (!imageType || !imageType.signature(file.buffer)) {
        return null;
    }
    return { contentType: file.mimetype, extension: imageType.extension };
};

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (imageTypes.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
        }
    },
});

// Upload to S3 function
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const image = getValidatedImage(req.file);
        if (!image) {
            return res.status(400).json({ error: 'Invalid image file' });
        }

        const fileName = `profile-images/${randomUUID()}.${image.extension}`;

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
            ContentType: image.contentType,
        };

        await uploadToS3(params);
        
        const baseUrl = process.env.BASE_URL || 'http://localhost:6969';
        const proxyUrl = `${baseUrl}/api/upload/images/${fileName}`;

        res.json({
            success: true,
            imageUrl: proxyUrl,
            message: 'Image uploaded successfully!',
        });
    } catch (error) {
        console.error('Image upload failed:', {
            name: error.name,
            code: error.$metadata?.httpStatusCode || error.code,
        });
        res.status(500).json({ error: 'Upload failed' });
    }
};

export const uploadProfileBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const image = getValidatedImage(req.file);
        if (!image) {
            return res.status(400).json({ error: 'Invalid image file' });
        }
        if (!process.env.AWS_BUCKET_NAME) {
            return res
                .status(500)
                .json({ error: 'AWS bucket configuration missing' });
        }

        const fileName = `profile-banners/${randomUUID()}.${image.extension}`;
        await uploadToS3({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: image.contentType,
        });

        const baseUrl = process.env.BASE_URL || 'http://localhost:6969';
        return res.json({
            success: true,
            imageUrl: `${baseUrl}/api/upload/images/${fileName}`,
        });
    } catch (error) {
        console.error('Profile banner upload failed:', {
            name: error.name,
            code: error.$metadata?.httpStatusCode || error.code,
        });
        return res.status(500).json({ error: 'Banner upload failed' });
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

        // Validate URL format - accepting both S3 URLs and proxy URLs
        const s3UrlPattern = /^https:\/\/[a-zA-Z0-9.-]+\.amazonaws\.com\/.+/;
        const proxyUrlPattern = /^https?:\/\/[a-zA-Z0-9.-]+(:[0-9]+)?\/api\/upload\/images\/.+/;
        
        if (!s3UrlPattern.test(imageUrl) && !proxyUrlPattern.test(imageUrl)) {
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
        console.error('Profile image update failed:', {
            name: error.name,
            code: error.original?.code || error.code,
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

        const image = getValidatedImage(req.file);
        if (!image) {
            return res.status(400).json({ error: 'Invalid image file' });
        }

        const fileName = `community-images/${randomUUID()}.${image.extension}`;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: image.contentType,
        };

        await uploadToS3(params);

        // Extract the S3 key from the fileName
        const s3Key = fileName;
        
        // Return proxy URL instead of direct S3 URL
        const baseUrl = process.env.BASE_URL || 'http://localhost:6969';
        const proxyUrl = `${baseUrl}/api/upload/images/${s3Key}`;

        res.json({
            success: true,
            imageUrl: proxyUrl,
            message: 'Community image uploaded successfully!',
        });
    } catch (error) {
        console.error('Community image upload failed:', {
            name: error.name,
            code: error.$metadata?.httpStatusCode || error.code,
        });
        res.status(500).json({ error: 'Upload failed' });
    }
};

// Export multer middleware
export const uploadMiddleware = upload.single('profileImage');
export const uploadBannerMiddleware = upload.single('profileBanner');
export const uploadCommunityMiddleware = upload.single('communityImage');
