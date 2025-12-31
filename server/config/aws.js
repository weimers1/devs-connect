import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import 'dotenv/config.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

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

//Config AWS
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
        const command = new HeadBucketCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
        });
        await s3Client.send(command);
        console.log('S3 connection successful!');
        return true;
    } catch (error) {
        console.error('S3 connection failed:', error.message);
        return false;
    }
};

export const uploadToS3 = async ({ Bucket, Key, Body, ContentType }) => {
    const params = { Bucket, Key, Body, ContentType };
    await s3Client.send(new PutObjectCommand(params));

    const url = `https://${Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
    return { Location: url };
};

export default s3Client;
