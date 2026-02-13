import Community from '../Models/Communites.js';
import UserCommunity from '../Models/UserCommunity.js';
import Post from '../Models/Post.js';
import PostLike from '../Models/PostLike.js';
import PostComment from '../Models/PostComment.js';
import sequelize from '../config/database.js';
import User from "../models/User.js";
import { json } from 'sequelize';

export const createCommunity = async (req, res) => {
    
    try {
        const { name, description, icon, color, isPrivate } = req.body;
        console.log('User:', req.user)

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
            isOwner: 1,
            isMember: true
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
        const {userId} = req.params;
        const communities = await sequelize.query(`
            SELECT 
            uc.id,
            uc.name, uc.description, uc.createdBy, uc.icon, uc.color, uc.image, uc.memberCount, uc.id, uc.isOwner
            FROM communities uc
            INNER JOIN usercommunities u 
            ON u.communityId = uc.id
            AND u.role != 'banned' WHERE u.userId = ?;`,{
            replacements: [userId],
            type: sequelize.QueryTypes.SELECT,
     
})
      
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

        // Check if current user is the owner (only if authenticated)
        const isOwner = req.user ? community.createdBy === req.user.userId : false;

        // Check if current user is a member (only if authenticated)
        let isMember = false;
        if (req.user) {
            const memberRecord = await UserCommunity.findOne({
                where: { userId: req.user.userId, communityId: id },
            });
            isMember = !!memberRecord;
        }

        res.json({
            ...community.toJSON(),
            memberCount,
            isOwner,
            isMember,
        });
    } catch (error) {
        console.error('Error fetching community:', error);
        res.status(500).json({ error: 'Failed to fetch community' });
    }
};
   
export const updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, color, isPrivate, rules, image } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

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
            rules: rules.trim() || community.rules,
            description: description?.trim() || community.description,
            icon: icon !== undefined ? icon : community.icon,
            color: color !== undefined ? color : community.color,
            image: image !== undefined ? image : community.image,
            isPrivate: isPrivate !== undefined ? isPrivate : community.isPrivate,
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

export const isCommunityOwner = async (req, res) => {
    try {
       const createdBy = req.user.userId;
       const {id} = req.params; 
        if(!createdBy || !id) {
            console.log("no user or no community");
            return; 
        }
        const owner = await sequelize.query(`
           SELECT * FROM dev_connect.communities WHERE createdBy = ? AND id = ?;
            `, {
                    replacements:[createdBy, id], 
                    type: sequelize.QueryTypes.SELECT
            });
        if(!owner || owner.length === 0) {
            console.log("Not the owner no return");
            return res.json({owner: false});
        }   
         return res.json({owner: owner});

    } catch(error) {
        console.log(error, "error getting community Owner");
        res.json({error});
    }
}


//Retrieving Community Membership
export const getCommunityMemberShip = async (req, res) => {
    try {
        const {communityId} = req.params;
        const userId=  req.user.userId;

        const membership = await sequelize.query(
            `SELECT * FROM dev_connect.usercommunities WHERE communityId = ? AND userId = ?`,
            {
                replacements: [communityId, userId],
                type: sequelize.QueryTypes.SELECT
            }
        );
        
        if(!membership || membership.length === 0) {
            console.log("No membership found");
            return res.json({isMember: false});
        }
        
        return res.json({isMember: true});
    } catch (error) {
        console.log("Error fetching community membership:", error);
        res.status(500).json({
            error: 'Failed to fetch membership: ' + error.message
        });
    }
}


    //Getting all the communities a user is in
export const getCommunitiesFromUser = async(req, res) => {
    try { 
        const { userId } = req.params;
        
        const communitiesfromuser = await sequelize.query(
            `SELECT communityId FROM usercommunities WHERE userId = ?`,
            {
                replacements: [userId],
                type: sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(communitiesfromuser);
    } catch(queryError) {
        console.log("No Communities found for user:", queryError);
        res.status(500).json({
            error: 'Failed to fetch communities: ' + queryError.message
        });
    }
}

//Getting all of the communities a user is in but obtaining the data. 
export const getCommunitiesDataFromUser = async(req, res) => {
    try { 
        const { userId } = req.params;
        
        const communitiesDatafromuser = await sequelize.query(
            ` SELECT uc.name, uc.description, uc.createdBy, uc.icon, uc.color, uc.image, uc.memberCount, uc.id, uc.isOwner
                FROM communities uc
                LEFT JOIN usercommunities u ON  uc.id = u.communityId
                WHERE u.userId = ?;
             `,
            {
                replacements: [userId],
                type: sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(communitiesDatafromuser);
    } catch(queryError) {
        console.log("No Communities found for user:", queryError);
        res.status(500).json({
            error: 'Failed to fetch communities: ' + queryError.message
        });
    }
}


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
                SELECT uc.userId, uc.role, uc.joinedAt, u.firstName, u.lastName, up.profileImageUrl, uc.BanStatus
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
                profileImageUrl: m.profileImageUrl,
                BanStatus: m.BanStatus
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
                  BanStatus: member.BanStatus || false
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
    //kick CommunityMember
export const kickCommunityMember = async (req, res) => {
     const transaction = await sequelize.transaction();
    try {
        const {userId, communityId} = req.params;  
        
        if(!userId || !communityId) {
            return res.status(400).json({error: "need user and communityId to kick member"});
        }

        // First, find the record to get the primary key (id)
        const memberRecord = await sequelize.query(`
            SELECT id FROM dev_connect.usercommunities 
            WHERE userId = ? AND communityId = ? AND role = "member"
        `, {
            replacements: [userId, communityId],
            type: sequelize.QueryTypes.SELECT,
             transaction
        });

        if (!memberRecord || memberRecord.length === 0) {
            return res.status(404).json({error: "Member not found or not a member"});
        }
        const primaryKeyId = memberRecord[0].id;

        // Now delete using the primary key
        const kickMember = await sequelize.query(`
            DELETE FROM dev_connect.usercommunities 
            WHERE id = ?
        `, {
            replacements: [primaryKeyId],
            type: sequelize.QueryTypes.DELETE,
            transaction
        });
              await sequelize.query(`
            UPDATE dev_connect.communities
            SET memberCount = GREATEST(memberCount - 1, 0)
            WHERE id = ?
        `, {
            replacements: [communityId],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });
        
        await transaction.commit();
        res.json({message: "Member kicked successfully", kick: kickMember});
        
    } catch(error) {
        await transaction.rollback();
        console.log(error, "Can't kick member from community");
        res.status(500).json({error: "Failed to kick member"});
    }       
}

//Leave Community
export const LeaveCommunity = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {userId, communityId} = req.params;  
        
        if(!userId || !communityId) {
            await transaction.rollback();
            return res.status(400).json({error: "need user and communityId to leave community"});
        }

        // Find the record to get the primary key (id)
        const memberRecord = await sequelize.query(`
            SELECT id FROM dev_connect.usercommunities 
            WHERE userId = ? AND communityId = ?
        `, {
            replacements: [userId, communityId],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (!memberRecord || memberRecord.length === 0) {
            await transaction.rollback();
            return res.status(404).json({error: "You are not a member of this community"});
        }
        const primaryKeyId = memberRecord[0].id;

        // Delete using the primary key
        await sequelize.query(`
            DELETE FROM dev_connect.usercommunities 
            WHERE id = ?
        `, {
            replacements: [primaryKeyId],
            type: sequelize.QueryTypes.DELETE,
            transaction
        });
        
        // Decrement memberCount (fast operation)
        await sequelize.query(`
            UPDATE dev_connect.communities
            SET memberCount = GREATEST(memberCount - 1, 0)
            WHERE id = ?
        `, {
            replacements: [communityId],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });
        
        await transaction.commit();
        res.json({message: "Successfully left the community", success: true});
        
    } catch(error) {
        await transaction.rollback();
        console.log(error, "Can't leave community");
        res.status(500).json({error: "Failed to leave community"});
    }       
}



//Getting Community to determine OwnerShip.
export const getCommunityAdmins = async (req, res) => {
    try {
        const {communityId, userId} = req.params; 

        if(!userId || !communityId) {
            console.log("need user and communityId to fetch admins");
            return res.status(400).json({error: "Missing userId or communityId"});
        }

        const admins = await sequelize.query(`
                
            SELECT * from dev_connect.usercommunities WHERE userId = ? AND communityId = ? AND role='admin'`, {
                replacements: [userId, communityId],
                  type: sequelize.QueryTypes.SELECT,
            }) 
            if(!admins || admins.length === 0) {
                return res.status(403).json({error: "User is not an admin of this community"});
            }
        res.json({admin: true}); 
        
    } catch(error) {
        console.log(error, "Something Went Wrong Trying to fetch the communityAdmins");
        res.json({error: "Failed to fetch community admins" });
    }
}

export const demoteCommunityMember = async (req, res) => {
    try {
        const {userId, communityId, currentUserId} = req.params;
        if(!userId || !communityId) {
            return res.status(400).json({ error: "Missing required parameters" });
        }
            const isadmin = await sequelize.query(`    
            SELECT id from dev_connect.usercommunities WHERE userId = ? AND communityId = ? AND role='admin'`, {
                replacements: [currentUserId, communityId],
                  type: sequelize.QueryTypes.SELECT,
            }) 
            if(!isadmin || isadmin.length === 0) {
                return res.status(403).json({error: "User is not an admin of this community"});
            } 
        const demoteMember = await sequelize.query(`
        UPDATE dev_connect.usercommunities SET role ="member" WHERE userId = ? AND communityId = ?`, {
                replacements: [userId, communityId],
                type: sequelize.QueryTypes.UPDATE,
})      
        res.json({demote: demoteMember});
    }catch (error) {
        console.error('Error Demoting Community Member', error);
        res.status(500).json({ error: 'Failed to fetch community posts' });
    }
}

export const getCommunityPosts = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const currentUserId = req.user ? req.user.userId : null;

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

//Promote Community Member 

export const PromoteCommunityMember = async (req, res) => {
    try {
        const requesterId = req.user.userId; // Person making the request
        const { userId, communityId } = req.params; // Target user and community
        
        if(!requesterId || !userId || !communityId) {
            return res.status(400).json({ error: "Missing required parameters" });
        }
        
        const PromoteMember = await sequelize.query(`
            UPDATE dev_connect.usercommunities 
            SET role = "admin" 
            WHERE userId = ? AND communityId = ?
        `, {
            replacements: [userId, communityId], // Target userId, not requester
            type: sequelize.QueryTypes.UPDATE,
        });

        res.json({ message: "User promoted successfully", PromoteMember });
        
    } catch(error) {
        console.log(error, "Problem Promoting User In community");
        res.status(500).json({ error: "Failed to promote user" });
    }
}


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
    const transaction = await sequelize.transaction();
    try {
        const { communityId } = req.params;
        const userId = req.user.userId;
        const user = await User.findByPk(userId);

        if (!user) {
            console.error('User not found:', userId);
        }

        const existingMembership = await UserCommunity.findOne({
            where: { userId: userId, communityId: communityId},
        });

        if (existingMembership) {
            return res
                .status(400)
                .json({ error: 'Already a member of this community' });
        }

        await UserCommunity.create({
            userId: userId,
            communityId: communityId,
            role: 'member',
            transaction
        });
        await sequelize.query(`
            UPDATE dev_connect.communities
            SET memberCount = GREATEST(memberCount + 1, 0)
            WHERE id = ?
        `, {
            replacements: [communityId],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });
        await transaction.commit();
        res.json({ success: true });
    } catch (error) {
        await transaction.rollback();
        console.error('Error joining community:', error);
        res.status(500).json({ error: 'Failed to join community' });
    }
};

//Ban Member

export const BanCommunityMember = async (req,res) => {
     const transaction = await sequelize.transaction();
    try {
        const {userId, communityId} = req.params;  
        
        if(!userId || !communityId) {
            return res.status(400).json({error: "need user and communityId to kick member"});
        }

        // First, find the record to get the primary key (id)
        const memberRecord = await sequelize.query(`
            SELECT id FROM dev_connect.usercommunities 
            WHERE userId = ? AND communityId = ? AND role = "member"
        `, {
            replacements: [userId, communityId],
            type: sequelize.QueryTypes.SELECT,
             transaction
        });

        if (!memberRecord || memberRecord.length === 0) {
            return res.status(404).json({error: "Member not found or not a member"});
        }
        const primaryKeyId = memberRecord[0].id;

        // Now delete using the primary key
        const BanMember = await sequelize.query(`
                        UPDATE dev_connect.usercommunities SET BanStatus = true, role='banned' WHERE id=?; 
        `, {
            replacements: [primaryKeyId],
            type: sequelize.QueryTypes.DELETE,
            transaction
        });
              await sequelize.query(`
            UPDATE dev_connect.communities
            SET memberCount = GREATEST(memberCount - 1, 0)
            WHERE id = ?
        `, {
            replacements: [communityId],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });
        
        await transaction.commit();
        res.json({message: "Member Banned successfully", Banned: true});
        
    } catch(error) {
        await transaction.rollback();
        console.log(error, "Can't kick member from community");
        res.status(500).json({error: "Failed to kick member"});
    }       
}


//Unban Community Member

export const UnBanCommunityMember = async (req,res) => {
     const transaction = await sequelize.transaction();
    try {
        const {userId, communityId} = req.params;  
        
        if(!userId || !communityId) {
            return res.status(400).json({error: "need user and communityId to kick member"});
        }

        // First, find the record to get the primary key (id)
        const memberRecord = await sequelize.query(`
            SELECT id FROM dev_connect.usercommunities 
            WHERE userId = ? AND communityId = ? AND role = "banned"
        `, {
            replacements: [userId, communityId],
            type: sequelize.QueryTypes.SELECT,
             transaction
        });

        if (!memberRecord || memberRecord.length === 0) {
            return res.status(404).json({error: "Member not found or not a member"});
        }
        const primaryKeyId = memberRecord[0].id;

        // Now delete using the primary key
        const BanMember = await sequelize.query(`
                        UPDATE dev_connect.usercommunities SET BanStatus = false, role='member' WHERE id=?; 
        `, {
            replacements: [primaryKeyId],
            type: sequelize.QueryTypes.DELETE,
            transaction
        });
              await sequelize.query(`
            UPDATE dev_connect.communities
            SET memberCount = GREATEST(memberCount + 1, 0)
            WHERE id = ?
        `, {
            replacements: [communityId],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });
        
        await transaction.commit();
        res.json({message: "Member Banned successfully", Banned: true});
        
    } catch(error) {
        await transaction.rollback();
        console.log(error, "Can't kick member from community");
        res.status(500).json({error: "Failed to kick member"});
    }       
}




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
            where: { postId: postId, userId: userId },
        });

        if (existingLike) {
            await existingLike.destroy();
            res.json({ liked: false });
        } else {
            await PostLike.create({ postId: postId, userId: userId});
            res.json({ liked: true });
        }
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
};
    //get Post likes
export const getLikes = async (req, res) => {
    try{ 
        const postId = req.params.postId; //Post id on render will determine with a search for 
        //each how many likes a post has.
       
        if(!postId) {   
            return res.status(400).json({ error: 'Post ID is required' });
        }
        const like = await sequelize.query(
            'SELECT COUNT(*) FROM dev_connect.postlikes WHERE postId=?;'
           ,{
                replacements: [postId],
                type: sequelize.QueryTypes.SELECT,
                plain: true
            }
        )
        res.json({like}); //return like count
    } catch(error) {
        console.error('Error fetching likes:', error);
        res.status(500).json({ error: 'Failed to fetch likes' });
    }
}

export const getLikeStatus = async (req, res) => {
    try{
        const postId = req.params.postId; 
        const userId = req.user.userId;
        if(!postId || !userId) {
            return res.status(400).json({error: "post Id is not found or not logged in"});
        }

        const result = await sequelize.query(
            'SELECT * FROM dev_connect.postlikes WHERE postId=? && userId=?;'
        ,{
                replacements: [postId, userId],
                type: sequelize.QueryTypes.SELECT,
                plain: true
        })
            if(!result || result.length === 0) {
            console.log("No Like on the post");
            return res.json({postLiked: false});
        }
        
         res.json({postLiked: true});
    } catch(error) {
        res.json("Error fetching user like status:", error);
    }
}

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
