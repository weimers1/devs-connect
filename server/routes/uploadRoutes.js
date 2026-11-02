import express from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/aws.js';
import {
    uploadMiddleware,
    uploadProfileImage,
    updateProfileImage,
    uploadCommunityImage,
    uploadCommunityMiddleware,
    uploadProfileBanner,
    uploadBannerMiddleware,
} from '../controllers/uploadController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload image to S3
router.post('/profile-image', authMiddleware, uploadMiddleware, uploadProfileImage);
router.post('/profile-banner', authMiddleware, uploadBannerMiddleware, uploadProfileBanner);

// Save image URL to database
router.put('/profile-image', authMiddleware, updateProfileImage);

// Upload community image
router.post('/community-image', authMiddleware, uploadCommunityMiddleware, uploadCommunityImage);

// Image proxy route - serve images through backend
router.use('/images', async (req, res, next) => {
    try {
        const imagePath = req.path.match(
            /^\/(profile-images|profile-banners|community-images)\/([^/\\]+)$/
        );
        const extension = imagePath?.[2]
            .match(/\.([a-z0-9]+)$/i)?.[1]
            ?.toLowerCase();
        const contentTypes = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
        };
        const contentType = extension ? contentTypes[extension] : null;

        if (!imagePath || !contentType) {
            return res.status(400).json({ error: 'Invalid image key' });
        }
        if (!process.env.AWS_BUCKET_NAME) {
            return res
                .status(503)
                .json({ error: 'Image storage is unavailable' });
        }

        const imageKey = `${imagePath[1]}/${imagePath[2]}`;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageKey,
        };

        const s3Object = await s3Client.send(new GetObjectCommand(params));
        if (!s3Object.Body) {
            return res.status(404).json({ error: 'Image not found' });
        }
        res.set({
            'Content-Type': contentType,
            'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy': "default-src 'none'; sandbox",
            'Content-Disposition': 'inline; filename="image"',
            'Cache-Control': 'public, max-age=31536000, immutable',
        });

        s3Object.Body.on('error', () => res.destroy());
        s3Object.Body.pipe(res);
    } catch (error) {
        if (error?.name === 'NoSuchKey' || error?.name === 'NotFound') {
            return res.status(404).json({ error: 'Image not found' });
        }
        next(error);
    }
});


export default router;
