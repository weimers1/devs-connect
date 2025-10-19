import express from 'express';
import {
    createCommunity,
    getCommunities,
    getCommunityById,
    updateCommunity,
    getCommunityMembers,
    getCommunityPosts,
    createCommunityPost,
    joinCommunity,
    likePost,
    commentOnPost,
    getPostComments,
    expressInterest,
    deletePost,
} from '../controllers/communityController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCommunities);
router.get('/:id', getCommunityById);
router.get('/:id/posts', getCommunityPosts);
router.get('/:id/members', getCommunityMembers);
router.get('/:id/posts', getCommunityPosts);
router.post('/:id/posts', authMiddleware, createCommunityPost);
router.post('/:id/join', authMiddleware, joinCommunity);
router.post('/create', authMiddleware, createCommunity);
router.put('/:id', authMiddleware, updateCommunity);
router.post('/posts/:postId/like', authMiddleware, likePost);
router.post('/posts/:postId/comment', authMiddleware, commentOnPost);
router.get('/posts/:postId/comments', authMiddleware, getPostComments);
router.post('/posts/:postId/interest', authMiddleware, expressInterest);
router.delete('/posts/:postId', authMiddleware, deletePost);

export default router;
