import AWS from "aws-sdk"
import 'dotenv/config.js'

//Config AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

//Create S3 instance
const s3 = new AWS.S3();

// Test function (you can remove this later)
export const testS3Connection = async () => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME
    };
    
    const result = await s3.headBucket(params).promise();
    console.log('S3 connection successful!');
    return true;
  } catch (error) {
    console.error('S3 connection failed:', error.message);
    return false;
  }
};

export default s3;