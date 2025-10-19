import Community from '../Models/Communites.js';
import UserCommunity from '../Models/UserCommunity.js';
import Post from '../Models/Post.js';
import PostLike from '../Models/PostLike.js';
import PostComment from '../Models/PostComment.js';
import sequelize from '../config/database.js';

export const createCommunity = async (req, res) => {
    try {
        const { name, description, icon, color, isPrivate } = req.body;

        if (!name || !description) {
            return res
                .status(400)
                .json({ error: 'Name and description are required' });
        }

        const community = await Community.create({
            name: name.trim(),
            description: description.trim(),
            createdBy: req.user.userId,
            icon: icon || null,
            color: color || null,
            isPrivate: isPrivate || false,
        });

        // Add creator as admin member
        await UserCommunity.create({
            userId: req.user.userId,
            communityId: community.id,
            role: 'admin',
            joinedAt: new Date(),
        });

        res.status(201).json({
            message: 'Community created successfully',
            community: {
                id: community.id,
                name: community.name,
                description: community.description,
            },
        });
    } catch (error) {
        console.error('Error creating community:', error);
        res.status(500).json({ error: 'Failed to create community' });
    }
};

export const getCommunities = async (req, res) => {
    try {
        const communities = await Community.findAll({
            order: [['createdAt', 'DESC']],
        });
        res.json(communities);
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({
            error: 'Failed to fetch communities' + JSON.stringify(error),
        });
    }
};

export const getCommunityById = async (req, res) => {
    try {
        const { id } = req.params;
        const community = await Community.findByPk(id);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Get actual member count
        const memberCount = await UserCommunity.count({
            where: { communityId: id },
        });

        // Check if current user is the owner
        const isOwner = community.createdBy === req.user.userId;

        // Check if current user is a member
        const isMember = await UserCommunity.findOne({
            where: { userId: req.user.userId, communityId: id },
        });

        res.json({
            ...community.toJSON(),
            memberCount,
            isOwner,
            isMember: !!isMember,
        });
    } catch (error) {
        console.error('Error fetching community:', error);
        res.status(500).json({ error: 'Failed to fetch community' });
    }
};

export const updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, color, isPrivate } = req.body;

        const community = await Community.findByPk(id);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if current user is the owner
        if (community.createdBy !== req.user.userId) {
            return res
                .status(403)
                .json({ error: 'Only community owners can edit' });
        }

        await community.update({
            name: name?.trim() || community.name,
            description: description?.trim() || community.description,
            icon: icon !== undefined ? icon : community.icon,
            color: color !== undefined ? color : community.color,
            isPrivate:
                isPrivate !== undefined ? isPrivate : community.isPrivate,
        });

        res.json({
            message: 'Community updated successfully',
            community: community.toJSON(),
        });
    } catch (error) {
        console.error('Error updating community:', error);
        res.status(500).json({ error: 'Failed to update community' });
    }
};

export const getCommunityMembers = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching members for community:', id);

        if (!UserCommunity) {
            console.error('UserCommunity model not found');
            return res.json([]);
        }

        let members = [];
        try {
            members = await sequelize.query(
                `
                SELECT uc.userId, uc.role, uc.joinedAt, u.firstName, u.lastName, up.profileImageUrl
                FROM UserCommunities uc
                LEFT JOIN Users u ON uc.userId = u.id
                LEFT JOIN UserProfiles up ON u.id = up.userId
                WHERE uc.communityId = ?
                ORDER BY uc.joinedAt ASC
            `,
                {
                    replacements: [id],
                    type: sequelize.QueryTypes.SELECT,
                }
            );
        } catch (queryError) {
            console.error(
                'SQL query failed, falling back to simple query:',
                queryError
            );
            const fallbackMembers = await UserCommunity.findAll({
                where: { communityId: id },
            });
            members = fallbackMembers.map((m) => ({
                userId: m.userId,
                role: m.role,
                joinedAt: m.joinedAt,
                firstName: `User ${m.userId}`,
                lastName: '',
            }));
        }

        console.log('Raw members found:', members.length, members);

        const formattedMembers = Array.isArray(members)
            ? members.map((member) => ({
                  id: member.userId,
                  firstName: member.firstName || 'User',
                  lastName: member.lastName || '',
                  profileImageUrl: member.profileImageUrl,
                  role: member.role || 'member',
                  joinedAt: member.joinedAt,
                  isOnline: Math.random() > 0.5,
              }))
            : [];

        res.json(formattedMembers);
    } catch (error) {
        console.error(
            'Error fetching community members:',
            error.message,
            error.stack
        );
        res.json([]);
    }
};

export const getCommunityPosts = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const currentUserId = req.user.userId;

        const whereClause = { communityId: id };
        if (type) {
            whereClause.type = type;
        }

        const posts = await sequelize.query(
            `
            SELECT 
                p.*,
                u.firstName,
                u.lastName,
                up.profileImageUrl
            FROM Posts p
            LEFT JOIN Users u ON p.userId = u.id
            LEFT JOIN UserProfiles up ON u.id = up.userId
            WHERE p.communityId = :communityId
            ${type ? 'AND p.type = :type' : ''}
            ORDER BY p.createdAt DESC
            LIMIT 20
        `,
            {
                replacements: { communityId: id, ...(type && { type }) },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        const formattedPosts = posts.map((post) => ({
            id: post.id,
            userId: post.userId,
            type: post.type,
            author:
                post.firstName && post.lastName
                    ? `${post.firstName} ${post.lastName}`
                    : 'Unknown User',
            avatar: post.profileImageUrl || null,
            timestamp: new Date(post.createdAt).toLocaleDateString(),
            content: post.content,
            title: post.title,
            codeSnippet: post.codeSnippet,
            language: post.language,
            projectType: post.projectType,
            skillsNeeded: post.skillsNeeded,
            duration: post.duration,
            question: post.question,
            isAnswered: post.isAnswered,
            bestAnswer: post.bestAnswer,
            tags: post.tags || [],
            likes: post.likes,
            comments: post.comments,
            canDelete: post.userId === currentUserId,
        }));

        res.json(formattedPosts);
    } catch (error) {
        console.error('Error fetching community posts:', error);
        res.status(500).json({ error: 'Failed to fetch community posts' });
    }
};

export const createCommunityPost = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            type,
            content,
            title,
            codeSnippet,
            language,
            projectType,
            skillsNeeded,
            duration,
            question,
            tags,
        } = req.body;

        if (!content || !type) {
            return res
                .status(400)
                .json({ error: 'Content and type are required' });
        }

        const post = await Post.create({
            communityId: id,
            userId: req.user.userId,
            type,
            content,
            title,
            codeSnippet,
            language,
            projectType,
            skillsNeeded,
            duration,
            question,
            tags,
        });

        res.status(201).json({
            message: 'Post created successfully',
            post: {
                id: post.id,
                type: post.type,
                content: post.content,
            },
        });
    } catch (error) {
        console.error('Error creating community post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

export const joinCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const existingMembership = await UserCommunity.findOne({
            where: { userId, communityId: id },
        });

        if (existingMembership) {
            return res
                .status(400)
                .json({ error: 'Already a member of this community' });
        }

        await UserCommunity.create({
            userId,
            communityId: id,
            role: 'member',
        });

        res.json({ message: 'Successfully joined community' });
    } catch (error) {
        console.error('Error joining community:', error);
        res.status(500).json({ error: 'Failed to join community' });
    }
};

export const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        // Check if table exists, if not create it
        try {
            await sequelize.query(`CREATE TABLE IF NOT EXISTS PostLikes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                postId INT NOT NULL,
                userId INT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_like (postId, userId)
            )`);
        } catch (createError) {
            console.log('Table creation handled:', createError.message);
        }

        const existingLike = await PostLike.findOne({
            where: { postId, userId },
        });

        if (existingLike) {
            await existingLike.destroy();
            res.json({ message: 'Post unliked', liked: false });
        } else {
            await PostLike.create({ postId, userId });
            res.json({ message: 'Post liked', liked: true });
        }
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;

        if (!content?.trim()) {
            return res
                .status(400)
                .json({ error: 'Comment content is required' });
        }

        // Check if table exists, if not create it
        try {
            await sequelize.query(`CREATE TABLE IF NOT EXISTS PostComments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                postId INT NOT NULL,
                userId INT NOT NULL,
                content TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);
        } catch (createError) {
            console.log('Table creation handled:', createError.message);
        }

        const comment = await PostComment.create({
            postId,
            userId,
            content: content.trim(),
        });

        res.status(201).json({ message: 'Comment added', comment });
    } catch (error) {
        console.error('Error commenting on post:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

export const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await sequelize.query(
            `
            SELECT 
                pc.*,
                u.firstName,
                u.lastName,
                up.profileImageUrl
            FROM PostComments pc
            LEFT JOIN Users u ON pc.userId = u.id
            LEFT JOIN UserProfiles up ON u.id = up.userId
            WHERE pc.postId = :postId
            ORDER BY pc.createdAt ASC
        `,
            {
                replacements: { postId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        const formattedComments = comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            author:
                comment.firstName && comment.lastName
                    ? `${comment.firstName} ${comment.lastName}`
                    : 'Unknown User',
            avatar: comment.profileImageUrl || null,
            timestamp: new Date(comment.createdAt).toLocaleDateString(),
        }));

        res.json(formattedComments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

export const expressInterest = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        // Check if table exists, if not create it
        try {
            await sequelize.query(`CREATE TABLE IF NOT EXISTS PostComments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                postId INT NOT NULL,
                userId INT NOT NULL,
                content TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);
        } catch (createError) {
            console.log('Table creation handled:', createError.message);
        }

        await PostComment.create({
            postId,
            userId,
            content: "I'm interested in this project!",
        });

        res.json({ message: 'Interest expressed successfully' });
    } catch (error) {
        console.error('Error expressing interest:', error);
        res.status(500).json({ error: 'Failed to express interest' });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.userId !== userId) {
            return res
                .status(403)
                .json({ error: 'You can only delete your own posts' });
        }

        // Delete related records first
        await PostLike.destroy({ where: { postId } });
        await PostComment.destroy({ where: { postId } });

        // Then delete the post
        await post.destroy();

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};
