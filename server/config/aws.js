import { S3Client, HeadBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import 'dotenv/config.js';

// Validate required environment variables
const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_BUCKET_NAME',
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// Create S3 client (AWS SDK v3)
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Test function (you can remove this later)
export const testS3Connection = async () => {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
        };

        await s3Client.send(new HeadBucketCommand(params));
        console.log('S3 connection successful!');
        return true;
    } catch (error) {
        console.error('S3 connection failed:', error?.message || error);
        return false;
    }
};

// Convenience helper to upload an object and return a public URL-like Location
export const uploadToS3 = async ({ Bucket, Key, Body, ContentType }) => {
    const params = { Bucket, Key, Body, ContentType };
    await s3Client.send(new PutObjectCommand(params));

    // Construct a publicly-accessible URL (assumes public-read or served via CloudFront)
    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(Key)}`;
    return { Location: url };
};

export default s3Client;
