import express from 'express';
import { createCommunity, getCommunities, getCommunityById, updateCommunity, getCommunityMembers, getCommunityPosts, createCommunityPost, joinCommunity, likePost, commentOnPost, getPostComments, expressInterest, deletePost } from '../controllers/communityController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getCommunities);
router.get('/:id', getCommunityById);
router.get('/:id/members', getCommunityMembers);
router.get('/:id/posts', getCommunityPosts);
router.post('/:id/posts', createCommunityPost);
router.post('/:id/join', joinCommunity);
router.post('/create', createCommunity);
router.put('/:id', updateCommunity);
router.post('/posts/:postId/like', likePost);
router.post('/posts/:postId/comment', commentOnPost);
router.get('/posts/:postId/comments', getPostComments);
router.post('/posts/:postId/interest', expressInterest);
router.delete('/posts/:postId', deletePost);

export default router;