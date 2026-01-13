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
    getCommunityMemberShip,
    getCommunitiesFromUser,
    getLikes,
    getLikeStatus,
} from '../controllers/communityController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCommunities);
router.get('/:id', getCommunityById);
router.get('/:id/posts', getCommunityPosts);
router.get('/:id/members', getCommunityMembers);
router.get('/:id/posts', getCommunityPosts);
router.post('/:id/posts', authMiddleware, createCommunityPost);
router.post('/:communityId/join', authMiddleware, joinCommunity);
router.post('/create', authMiddleware, createCommunity);
router.put('/:id', authMiddleware, updateCommunity);
router.post('/posts/:postId/like', authMiddleware, likePost);
router.post('/posts/:postId/comment', authMiddleware, commentOnPost);
router.get('/posts/:postId/comments', authMiddleware, getPostComments);
router.post('/posts/:postId/interest', authMiddleware, expressInterest);
router.delete('/posts/:postId', authMiddleware, deletePost);
router.get('/:communityId/membership/:userId', authMiddleware, getCommunityMemberShip);
router.get('/:userId/communities', authMiddleware, getCommunitiesFromUser); // Get all communities a user is in
router.get('/posts/:postId/likes', authMiddleware, getLikes); //Get Likes from a Users Post
router.get('/posts/:postId/likes/:userId', authMiddleware, getLikeStatus); //Get Likes from a Users Post

export default router;
