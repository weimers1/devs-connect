import multer from 'multer';
import s3 from '../config/aws.js';
import { testS3Connection } from '../config/aws.js';
import Session from '../models/Session.js'
import UserProfile from '../Models/UserProfile.js'

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Test endpoint to check S3 connection
export const testS3 = async (req, res) => {
  try {
    const isConnected = await testS3Connection();
    
    if (isConnected) {
      res.json({ 
        success: true, 
        message: ' S3 connection successful!' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: ' S3 connection failed' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
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
    const fileName = `profile-images/${Date.now()}-${req.file.originalname}`;
    
    // S3 upload parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    // Upload to S3
    const result = await s3.upload(params).promise();
    
    res.json({
      success: true,
      imageUrl: result.Location,
      message: 'Image uploaded successfully!'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// Save image URL to database
export const updateProfileImage = async (req, res) => {
  console.log(' Update profile image called');
  console.log(' Request body:', req.body);
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    const session = await Session.findOne({
      where: {token, isActive: true}
    });
    
    console.log(' Session found:', session ? 'Yes' : 'No');
    
    if (!session) {
      return res.status(401).json({error: 'Invalid session'});
    }
    
    const { imageUrl } = req.body;
    console.log(' Image URL to save:', imageUrl);
    
    // Update user's profile image URL
    const result = await UserProfile.update(
      { pfp: imageUrl },
      { where: { id: req.user.userId } }
    );
    
    console.log(' Database update result:', result);
    
    res.json({
      success: true,
      message: 'Profile image updated successfully'
    });
    
  } catch (error) {
    console.error(' Error updating profile image:', error);
    res.status(500).json({error: 'Failed to update profile image'});
  }
};

// Export multer middleware
export const uploadMiddleware = upload.single('profileImage');
