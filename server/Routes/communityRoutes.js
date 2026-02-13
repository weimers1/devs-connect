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
    getCommunityAdmins, 
    kickCommunityMember,
    isCommunityOwner,
     getCommunitiesDataFromUser,
     PromoteCommunityMember,
     LeaveCommunity,
     demoteCommunityMember,
     BanCommunityMember,
     UnBanCommunityMember,
     checkBanStatus
     
} from '../controllers/communityController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/user/:userId', getCommunities);
router.delete("/member/:userId/community/:communityId/from/:currentUserId", authMiddleware, kickCommunityMember); //Kick a member from a community
router.delete('/leave/communityMember/:userId/community/:communityId',authMiddleware, LeaveCommunity);
router.put('/demote/:communityId/member/:userId/with/:currentUserId', authMiddleware, demoteCommunityMember);
router.put('/Ban/:communityId/member/:userId/from/:currentUserId', authMiddleware, BanCommunityMember)//Ban Community Member
router.put('/Unban/communityMember/:userId/in/community/:communityId/from/:currentUserId', authMiddleware, UnBanCommunityMember);
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
router.get("/:communityId/communityAdmin/:userId", authMiddleware, getCommunityAdmins); //Returns Community adminship
router.get('/communityOwner/:id/communities/:communityId', authMiddleware, isCommunityOwner); //Gets a community Owner
router.get('/:userId/communities/Data', authMiddleware,  getCommunitiesDataFromUser) //Get Data from communiites
router.put('/:userId/community/:communityId/promote/from/:currentUserId', authMiddleware, PromoteCommunityMember);
router.get('/checkBanStatus/:communityId/member/:userId', authMiddleware, checkBanStatus);




export default router;
