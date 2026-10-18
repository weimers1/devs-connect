import Community from '../Models/Communites.js';
import UserCommunity from '../Models/UserCommunity.js';
import Post from '../Models/Post.js';
import PostLike from '../Models/PostLike.js';
import PostComment from '../Models/PostComment.js';
import SavedPost from '../Models/SavedPost.js';
import sequelize from '../config/database.js';
import { getFeedProjects } from './projectController.js';
import User from '../models/User.js';
import { json } from 'sequelize';
import { randomUUID } from 'crypto';
import {
    canViewUserSetting,
    isBlockedBetweenUsers,
} from '../utils/userVisibility.js';

const getCommunityViewerAccess = async (communityId, userId) => {
    const community = await Community.findByPk(communityId, {
        attributes: ['id', 'createdBy', 'isPrivate'],
    });
    if (!community) {
        return { community: null, isOwner: false, isMember: false };
    }

    const membership = userId
        ? await UserCommunity.findOne({ where: { communityId, userId } })
        : null;
    const isOwner = String(community.createdBy) === String(userId);
    const isMember =
        isOwner ||
        (!!membership &&
            membership.BanStatus !== true &&
            membership.role !== 'banned');

    return { community, isOwner, isMember };
};

const getCommunityModeratorRole = async (communityId, userId) => {
    const access = await getCommunityViewerAccess(communityId, userId);
    if (!access.community) return null;
    if (access.isOwner) return 'owner';

    const membership = await UserCommunity.findOne({
        where: { communityId, userId, role: 'admin', BanStatus: false },
        attributes: ['role'],
    });
    return membership ? 'admin' : null;
};

const getPostCommunityAccess = async (postId, userId) => {
    const post = await Post.findByPk(postId, {
        attributes: ['id', 'communityId'],
    });
    if (!post) return { post: null, community: null, isMember: false };

    const access = await getCommunityViewerAccess(post.communityId, userId);
    return { post, ...access };
};

export const createCommunity = async (req, res) => {
    try {
        const { name, description, icon, color, image, isPrivate } = req.body;

        if (!name || !description) {
            return res
                .status(400)
                .json({ error: 'Name and description are required' });
        }

        const community = await sequelize.transaction(async (transaction) => {
            const createdCommunity = await Community.create({
                name: name.trim(),
                description: description.trim(),
                createdBy: req.user.userId,
                icon: icon || null,
                color: color || null,
                image: image || null,
                isPrivate: isPrivate || false,
                isOwner: true,
                isMember: true,
                id: randomUUID(),
            }, { transaction });

            await UserCommunity.create({
                userId: req.user.userId,
                communityId: createdCommunity.id,
                role: 'owner',
                joinedAt: new Date(),
            }, { transaction });

            return createdCommunity;
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
        const userId = req.user?.userId || null;
        const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 12);
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

        if (
            hasPagination &&
            (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50)
        ) {
            return res.status(400).json({ error: 'Invalid community page or page size' });
        }

        const visibilityClause = userId
            ? `NOT EXISTS (
                   SELECT 1 FROM UserCommunities banned
                   WHERE banned.communityId = c.id
                   AND banned.userId = ?
                   AND banned.role = 'banned'
               )
               AND (
                   c.isPrivate = false
                   OR EXISTS (
                       SELECT 1 FROM UserCommunities member
                       WHERE member.communityId = c.id
                       AND member.userId = ?
                       AND member.role != 'banned'
                   )
               )`
            : 'c.isPrivate = false';
        const visibilityReplacements = userId ? [userId, userId] : [];
        const searchClause = search ? ' AND (c.name LIKE ? OR c.description LIKE ?)' : '';
        const searchReplacements = search ? [`%${search}%`, `%${search}%`] : [];
        const whereClause = `WHERE ${visibilityClause}${searchClause}`;
        const queryReplacements = [...visibilityReplacements, ...searchReplacements];

        const [communities, countResult] = await Promise.all([
            sequelize.query(
                `SELECT c.id, c.name, c.icon, c.memberCount, c.description, c.color, c.image, c.isPrivate
                 FROM communities c
                 ${whereClause}
                 ORDER BY c.createdAt DESC, c.id ASC
                 ${hasPagination ? 'LIMIT ? OFFSET ?' : ''}`,
                {
                    replacements: hasPagination
                        ? [...queryReplacements, limit, (page - 1) * limit]
                        : queryReplacements,
                    type: sequelize.QueryTypes.SELECT,
                },
            ),
            hasPagination
                ? sequelize.query(
                      `SELECT COUNT(*) AS total FROM communities c ${whereClause}`,
                      {
                          replacements: queryReplacements,
                          type: sequelize.QueryTypes.SELECT,
                      },
                  )
                : Promise.resolve(null),
        ]);

        if (!hasPagination) {
            return res.json(communities);
        }

        const total = Number(countResult?.[0]?.total ?? 0);
        return res.json({
            communities,
            page,
            hasMore: page * limit < total,
            total,
        });
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({ error: 'Failed to fetch communities' });
    }
};

export const getCommunityById = async (req, res) => {
    try {
        const { id } = req.params;
        const { community, isOwner, isMember } =
            await getCommunityViewerAccess(id, req.user?.userId);
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }
        if (community.isPrivate && !isMember) {
            return res.status(403).json({ error: 'Private community' });
        }

        const [memberCount, userMembership] = await Promise.all([
            UserCommunity.count({ where: { communityId: id } }),
            req.user?.userId
                ? UserCommunity.findOne({
                      where: { communityId: id, userId: req.user.userId },
                  })
                : null,
        ]);

        res.json({
            ...community.toJSON(),
            memberCount,
            isOwner,
            isMember,
            userRole: userMembership ? userMembership.role : null,
        });
    } catch (error) {
        // Check your backend terminal logs to read exact validation strings if this trips
        console.error('Error in getCommunityById:', error);
        res.status(500).json({
            error: 'Failed to fetch community metadata payload',
        });
    }
};

export const updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, color, isPrivate, rules, image } =
            req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const community = await Community.findByPk(id);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        const isOwner =
            String(community.createdBy) === String(req.user.userId);
        const adminMembership = isOwner
            ? null
            : await UserCommunity.findOne({
                  where: {
                      communityId: id,
                      userId: req.user.userId,
                      role: 'admin',
                      BanStatus: false,
                  },
              });
        if (!isOwner && !adminMembership) {
            return res
                .status(403)
                .json({ error: 'Only community owners and admins can edit' });
        }

        await community.update({
            name: name?.trim() || community.name,
            rules: rules.trim() || community.rules,
            description: description?.trim() || community.description,
            icon: icon !== undefined ? icon : community.icon,
            color: color !== undefined ? color : community.color,
            image: image !== undefined ? image : community.image,
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

export const isCommunityOwner = async (req, res) => {
    try {
        //    const createdBy = req.user.userId;
        const { createdBy, id } = req.params;
        if (!createdBy || !id) {
            console.log('no user or no community');
            return;
        }

        const owner = await sequelize.query(
            `
           SELECT * FROM communities WHERE createdBy = ? AND id = ?;
            `,
            {
                replacements: [createdBy, id],
                type: sequelize.QueryTypes.SELECT,
            },
        );
        if (owner.length === 0) {
            console.log('Not the owner no return');
            return res.json({ owner: false });
        }
        return res.json({ owner: true });
    } catch (error) {
        console.log(error, 'error getting community Owner');
        res.json({ error });
    }
};

//Retrieving Community Membership
export const getCommunityMemberShip = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user.userId;

        const [community, membership] = await Promise.all([
            Community.findByPk(communityId, { attributes: ['createdBy'] }),
            UserCommunity.findOne({ where: { communityId, userId } }),
        ]);
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        const isOwner = String(community.createdBy) === String(userId);
        const isMember =
            isOwner ||
            (!!membership &&
                membership.BanStatus !== true &&
                membership.role !== 'banned');

        return res.json({ isMember, isOwner });
    } catch (error) {
        console.log('Error fetching community membership:', error);
        res.status(500).json({
            error: 'Failed to fetch membership: ' + error.message,
        });
    }
};

//Getting all the communities a user is in
export const getCommunitiesFromUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (String(userId) !== String(req.user.userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const communitiesfromuser = await sequelize.query(
            `SELECT communityId FROM usercommunities
             WHERE userId = ? AND role != 'banned' AND BanStatus = false`,
            {
                replacements: [userId],
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.json(communitiesfromuser);
    } catch (queryError) {
        console.log('No Communities found for user:', queryError);
        res.status(500).json({
            error: 'Failed to fetch communities: ' + queryError.message,
        });
    }
};

//Getting all of the communities a user is in but obtaining the data.
export const getCommunitiesDataFromUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        if (
            !(await canViewUserSetting(
                userId,
                req.user.userId,
                'communitiesVisibility',
            ))
        ) {
            return res.status(404).json({ error: 'Communities not found' });
        }

        const communitiesDatafromuser = await sequelize.query(
            `SELECT
                c.id,
                c.name,
                c.icon,
                c.memberCount,
                c.description,
                c.color,
                c.image,
                (
                    SELECT targetMembership.role
                    FROM UserCommunities targetMembership
                    WHERE targetMembership.communityId = c.id
                    AND targetMembership.userId = ?
                    AND targetMembership.role != 'banned'
                    AND targetMembership.BanStatus = false
                    ORDER BY CASE targetMembership.role
                        WHEN 'owner' THEN 1
                        WHEN 'admin' THEN 2
                        ELSE 3
                    END
                    LIMIT 1
                ) AS role
             FROM communities c
             WHERE EXISTS (
                    SELECT 1
                    FROM UserCommunities membership
                    WHERE membership.communityId = c.id
                    AND membership.userId = ?
                    AND membership.role != 'banned'
                    AND membership.BanStatus = false
                )
                AND (
                    c.isPrivate = false
                    OR ? = ?
                    OR EXISTS (
                    SELECT 1
                    FROM UserCommunities viewerMembership
                    WHERE viewerMembership.communityId = c.id
                    AND viewerMembership.userId = ?
                    AND viewerMembership.role != 'banned'
                    AND viewerMembership.BanStatus = false
                    )
                )
             ORDER BY c.name ASC`,
            {
                replacements: [
                    userId,
                    userId,
                    userId,
                    req.user.userId,
                    req.user.userId,
                ],
                type: sequelize.QueryTypes.SELECT,
            },
        );

        return res.json(communitiesDatafromuser);
    } catch (queryError) {
        console.log('No Communities found for user:', queryError);
        res.status(500).json({
            error: 'Failed to fetch communities: ' + queryError.message,
        });
    }
};

export const getCommunityMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const { community, isMember } = await getCommunityViewerAccess(
            id,
            req.user?.userId,
        );
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }
        if (community.isPrivate && !isMember) {
            return res.status(403).json({ error: 'Private community' });
        }

        if (!UserCommunity) {
            console.error('UserCommunity model not found');
            return res.json([]);
        }

        let members = [];
        try {
            members = await sequelize.query(
                `
                SELECT uc.userId, u.publicId, uc.role, uc.joinedAt, u.firstName, u.lastName, up.profileImageUrl, uc.BanStatus
                FROM UserCommunities uc
                LEFT JOIN Users u ON uc.userId = u.id
                LEFT JOIN UserProfiles up ON u.id = up.userId
                WHERE uc.communityId = ?
                ORDER BY uc.joinedAt ASC
            `,
                {
                    replacements: [id],
                    type: sequelize.QueryTypes.SELECT,
                },
            );
        } catch (queryError) {
            console.error(
                'SQL query failed, falling back to simple query:',
                queryError,
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
                BanStatus: m.BanStatus,
            }));
        }

        if (req.user?.userId) {
            const visibleMembers = await Promise.all(
                members.map(async (member) => ({
                    member,
                    blocked: await isBlockedBetweenUsers(
                        req.user.userId,
                        member.userId,
                    ),
                })),
            );
            members = visibleMembers
                .filter(({ blocked }) => !blocked)
                .map(({ member }) => member);
        }

        console.log('Raw members found:', members.length, members);

        const formattedMembers = Array.isArray(members)
            ? members.map((member) => ({
                  id: member.userId,
                  publicId: member.publicId,
                  firstName: member.firstName || 'User',
                  lastName: member.lastName || '',
                  profileImageUrl: member.profileImageUrl,
                  role: member.role || 'member',
                  joinedAt: member.joinedAt,
                  isOnline: Math.random() > 0.5,
                  BanStatus: member.BanStatus || false,
              }))
            : [];

        res.json(
            formattedMembers.map((member) => ({
                ...member,
                role:
                    String(member.userId) === String(community.createdBy)
                        ? 'owner'
                        : member.role,
            })),
        );
    } catch (error) {
        console.error(
            'Error fetching community members:',
            error.message,
            error.stack,
        );
        res.json([]);
    }
};
//kick CommunityMember
export const kickCommunityMember = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { userId, communityId } = req.params;
        if (!userId || !communityId) {
            await transaction.rollback();
            return res
                .status(400)
                .json({ error: 'need user and communityId to kick member' });
        }
        const actingRole = await getCommunityModeratorRole(
            communityId,
            req.user.userId,
        );
        if (!actingRole) {
            await transaction.rollback();
            return res
                .status(403)
                .json({ error: 'User is not an admin of this community' });
        }
        // First, find the record to get the primary key (id)
        const memberRecord = await sequelize.query(
            `
            SELECT id FROM UserCommunities 
             WHERE userId = ? AND communityId = ?
               AND (role = "member" OR (role = "admin" AND ? = 'owner'))
               AND userId != (
                   SELECT createdBy FROM communities WHERE id = ?
               )
        `,
            {
                replacements: [userId, communityId, actingRole, communityId],
                type: sequelize.QueryTypes.SELECT,
                transaction,
            },
        );

        if (!memberRecord || memberRecord.length === 0) {
            await transaction.rollback();
            return res
                .status(404)
                .json({ error: 'Member not found or not a member' });
        }
        const primaryKeyId = memberRecord[0].id;

        // Now delete using the primary key
        const kickMember = await sequelize.query(
            `
            DELETE FROM UserCommunities 
            WHERE id = ?
        `,
            {
                replacements: [primaryKeyId],
                type: sequelize.QueryTypes.DELETE,
                transaction,
            },
        );
        await sequelize.query(
            `
            UPDATE communities
            SET memberCount = GREATEST(memberCount - 1, 0)
            WHERE id = ?
        `,
            {
                replacements: [communityId],
                type: sequelize.QueryTypes.UPDATE,
                transaction,
            },
        );

        await transaction.commit();
        res.json({ message: 'Member kicked successfully', kick: kickMember });
    } catch (error) {
        await transaction.rollback();
        console.log(error, "Can't kick member from community");
        res.status(500).json({ error: 'Failed to kick member' });
    }
};

//Leave Community
export const LeaveCommunity = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { communityId } = req.params;
        const userId = req.user.userId;

        if (!userId || !communityId) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'need user and communityId to leave community',
            });
        }

        const community = await Community.findByPk(communityId, {
            attributes: ['id', 'createdBy'],
            transaction,
        });
        if (!community) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Community not found' });
        }

        if (String(community.createdBy) === String(userId)) {
            await transaction.rollback();
            return res.status(409).json({
                error: 'The community owner cannot leave their own community',
            });
        }

        const membership = await UserCommunity.findOne({
            where: { userId, communityId },
            transaction,
        });
        if (!membership) {
            await transaction.rollback();
            return res
                .status(404)
                .json({ error: 'You are not a member of this community' });
        }

        await membership.destroy({ transaction });
        await Community.decrement('memberCount', {
            by: 1,
            where: { id: communityId },
            transaction,
        });

        await transaction.commit();
        res.json({ message: 'Successfully left the community', success: true });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.log(error, "Can't leave community");
        res.status(500).json({ error: 'Failed to leave community' });
    }
};

//Getting Community to determine OwnerShip.
export const getCommunityAdmins = async (req, res) => {
    try {
        const { communityId, userId } = req.params;
        if (!userId || !communityId) {
            console.log('need user and communityId to fetch admins');
            return res
                .status(400)
                .json({ error: 'Missing userId or communityId' });
        }

        const admins = await sequelize.query(
            `
                
            SELECT * from UserCommunities WHERE userId = ? AND communityId = ? AND role='admin'
            OR userId = ? AND communityId = ? AND role='owner';`,
            {
                replacements: [userId, communityId, userId, communityId],
                type: sequelize.QueryTypes.SELECT,
            },
        );
        if (admins.length === 0) {
            return res
                .status(403)
                .json({ error: 'User is not an admin of this community' });
        }
        res.json({ admin: true });
    } catch (error) {
        console.log(
            error,
            'Something Went Wrong Trying to fetch the communityAdmins',
        );
        res.json({ error: 'Failed to fetch community admins' });
    }
};

export const demoteCommunityMember = async (req, res) => {
    try {
        const { userId, communityId } = req.params;
        if (!userId || !communityId) {
            return res
                .status(400)
                .json({ error: 'Missing required parameters' });
        }
        const actingRole = await getCommunityModeratorRole(
            communityId,
            req.user.userId,
        );
        if (actingRole !== 'owner') {
            return res
                .status(403)
                .json({ error: 'User is not an admin of this community' });
        }
        const demoteMember = await sequelize.query(
            `
        UPDATE UserCommunities
        SET role = "member"
        WHERE userId = ? AND communityId = ? AND role = 'admin'
          AND userId != (
              SELECT createdBy FROM communities WHERE id = ?
          )`,
            {
                replacements: [userId, communityId, communityId],
                type: sequelize.QueryTypes.UPDATE,
            },
        );

        res.json({ demote: demoteMember });
    } catch (error) {
        console.error('Error Demoting Community Member', error);
        res.status(500).json({ error: 'Failed to fetch community posts' });
    }
};

export const getCommunityPosts = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const currentUserId = req.user ? req.user.userId : null;
        const { community, isMember } = await getCommunityViewerAccess(
            id,
            currentUserId,
        );
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }
        if (community.isPrivate && !isMember) {
            return res.status(403).json({ error: 'Private community' });
        }

        const posts = await sequelize.query(
            `
            SELECT 
                p.*,
                p.Time as eventTime,
                u.firstName,
                u.lastName,
                u.publicId,
                up.profileImageUrl,
                EXISTS(
                    SELECT 1 FROM SavedPosts saved
                    WHERE saved.postId = p.id AND saved.userId = :currentUserId
                ) AS isSaved
            FROM Posts p
            LEFT JOIN Users u ON p.userId = u.id
            LEFT JOIN UserProfiles up ON u.id = up.userId
            WHERE p.communityId = :communityId
            ${type ? 'AND p.type = :type' : ''}
            ORDER BY p.createdAt DESC
            LIMIT 20
        `,
            {
                replacements: {
                    communityId: id,
                    currentUserId,
                    ...(type && { type }),
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        const visiblePosts = currentUserId
            ? (
                  await Promise.all(
                      posts.map(async (post) => ({
                          post,
                          blocked: await isBlockedBetweenUsers(
                              currentUserId,
                              post.userId,
                          ),
                      })),
                  )
              )
                  .filter(({ blocked }) => !blocked)
                  .map(({ post }) => post)
            : posts;

        const formattedPosts = visiblePosts.map((post) => ({
            id: post.id,
            userId: post.userId,
            publicId: post.publicId,
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
            canInteract: isMember,
            isSaved: post.isSaved === true || Number(post.isSaved) === 1,
            Time: post.Time,
            DateOfEvent: post.DateOfEvent,
        }));

        res.json(formattedPosts);
    } catch (error) {
        console.error('Error fetching community posts:', error);
        res.status(500).json({ error: 'Failed to fetch community posts' });
    }
};

//Promote Community Member (Only Owner Can Promote)

export const PromoteCommunityMember = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { userId, communityId } = req.params;
        if (!userId || !communityId) {
            await transaction.rollback();
            return res
                .status(400)
                .json({ error: 'Missing required parameters' });
        }
        const actingRole = await getCommunityModeratorRole(
            communityId,
            req.user.userId,
        );
        if (actingRole !== 'owner') {
            await transaction.rollback();
            return res
                .status(403)
                .json({ error: 'User is not an admin of this community' });
        }
        const PromoteMember = await sequelize.query(
            `
            UPDATE UserCommunities 
            SET role = "admin" 
            WHERE userId = ? AND communityId = ? AND role = 'member'
              AND userId != (
                  SELECT createdBy FROM communities WHERE id = ?
              )
        `,
            {
                replacements: [userId, communityId, communityId],
                type: sequelize.QueryTypes.UPDATE,
                transaction,
            },
        );
        await transaction.commit();
        res.json({ message: 'User promoted successfully', PromoteMember });
    } catch (error) {
        await transaction.rollback();
        console.log(error, 'Problem Promoting User In community');
        res.status(500).json({ error: 'Failed to promote user' });
    }
};

export const createCommunityPost = async (req, res) => {
    try {
        const { id } = req.params;
        const community = await Community.findByPk(id, {
            attributes: ['id', 'createdBy'],
        });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        const isOwner =
            String(community.createdBy) === String(req.user.userId);
        const membership = isOwner
            ? null
            : await UserCommunity.findOne({
                  where: { communityId: id, userId: req.user.userId },
              });
        if (
            !isOwner &&
            (!membership ||
                membership.BanStatus === true ||
                membership.role === 'banned')
        ) {
            return res
                .status(403)
                .json({ error: 'You must be an active community member to post' });
        }

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
            Time,
            DateOfEvent,
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
            Time,
            DateOfEvent,
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

//Event POst
export const createEventPost = async (req, res) => {
    try {
        //Need to check for only admins/Owners creating Event posts
        const { communityId } = req.params;
        const currentUserId = req.user.userId;

        //Check for Admin
        const isadmin = await sequelize.query(
            `    
            SELECT id from UserCommunities WHERE userId = ? AND communityId = ? AND role='admin'
             OR  userId = ? AND communityId = ? AND role='owner';
            `,
            {
                replacements: [
                    currentUserId,
                    communityId,
                    currentUserId,
                    communityId,
                ],
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (isadmin.length === 0) {
            res.status(403).json({ error: 'Not Allowed to Create Event' });
            return;
        }

        const { type, content, Time, DateOfEvent } = req.body;

        if (!content || !type) {
            return res
                .status(400)
                .json({ error: 'Content and type are required' });
        }

        const post = await Post.create({
            communityId: communityId,
            userId: req.user.userId,
            type,
            content,
            Time,
            DateOfEvent,
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
        const community = await Community.findByPk(communityId, {
            attributes: ['id', 'isPrivate'],
            transaction,
        });
        if (!community) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Community not found' });
        }
        const existingMembership = await UserCommunity.findOne({
            where: { userId: userId, communityId: communityId },
            transaction,
        });

        if (existingMembership) {
            await transaction.rollback();
            if (
                existingMembership.BanStatus === true ||
                existingMembership.role === 'banned'
            ) {
                return res.status(403).json({
                    error: 'You cannot join this community',
                });
            }
            return res.json({ success: true, alreadyMember: true });
        }

        if (community.isPrivate) {
            await transaction.rollback();
            return res.status(403).json({
                error: 'Private communities require an invitation to join',
            });
        }

        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        await UserCommunity.create(
            {
                userId,
                communityId,
                role: 'member',
            },
            { transaction },
        );
        await Community.increment('memberCount', {
            by: 1,
            where: { id: communityId },
            transaction,
        });
        await transaction.commit();
        res.json({ success: true });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Error joining community:', error);
        res.status(500).json({ error: 'Failed to join community' });
    }
};

//Check banstatus
export const checkBanStatus = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.json({ banned: false });
        }

        const result = await sequelize.query(
            `SELECT BanStatus 
             FROM UserCommunities
             WHERE userId = ? AND communityId = ?
             LIMIT 1
             ;`,
            {
                replacements: [userId, communityId],
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (!result.length) {
            return res.json({ banned: false });
        }

        return res.json({
            banned: Boolean(result[0].BanStatus),
        });
    } catch (error) {
        console.log('Unable to check ban status:', error);
        return res.status(500).json({
            error: 'Internal server error',
        });
    }
};
//Ban Member

export const BanCommunityMember = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { userId, communityId } = req.params;

        if (!userId || !communityId) {
            await transaction.rollback();
            return res
                .status(400)
                .json({ error: 'need user and communityId to ban member' });
        }
        const actingRole = await getCommunityModeratorRole(
            communityId,
            req.user.userId,
        );
        if (!actingRole) {
            await transaction.rollback();
            return res
                .status(403)
                .json({ error: 'User is not an admin of this community' });
        }

        // First, find the record to get the primary key (id)
        const memberRecord = await sequelize.query(
            `
            SELECT id FROM UserCommunities 
            WHERE userId = ? AND communityId = ?
              AND (role = "member" OR (role = "admin" AND ? = 'owner'))
              AND userId != (
                  SELECT createdBy FROM communities WHERE id = ?
              )
        `,
            {
                replacements: [userId, communityId, actingRole, communityId],
                type: sequelize.QueryTypes.SELECT,
                transaction,
            },
        );

        if (!memberRecord || memberRecord.length === 0) {
            await transaction.rollback();
            return res
                .status(404)
                .json({ error: 'Member not found or not a member' });
        }
        const primaryKeyId = memberRecord[0].id;

        // Now delete using the primary key
        const BanMember = await sequelize.query(
            `
           UPDATE UserCommunities SET BanStatus = true, role='banned' WHERE id=?; 
        `,
            {
                replacements: [primaryKeyId],
                type: sequelize.QueryTypes.UPDATE,
                transaction,
            },
        );
        await sequelize.query(
            `
            UPDATE communities
            SET memberCount = GREATEST(memberCount - 1, 0)
            WHERE id = ?
        `,
            {
                replacements: [communityId],
                type: sequelize.QueryTypes.UPDATE,
                transaction,
            },
        );
        await transaction.commit();
        res.json({ message: 'Member Banned successfully', Banned: true });
    } catch (error) {
        await transaction.rollback();
        console.log(error, "Can't kick member from community");
        res.status(500).json({ error: 'Failed to kick member' });
    }
};

//Unban Community Member

export const UnBanCommunityMember = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { userId, communityId } = req.params;

        if (!userId || !communityId) {
            await transaction.rollback();
            return res
                .status(400)
                .json({ error: 'need user and communityId to kick member' });
        }
        if (
            !(await getCommunityModeratorRole(communityId, req.user.userId))
        ) {
            await transaction.rollback();
            return res
                .status(403)
                .json({ error: 'User is not an admin of this community' });
        }

        // First, find the record to get the primary key (id)
        const memberRecord = await sequelize.query(
            `
            SELECT id FROM UserCommunities 
            WHERE userId = ? AND communityId = ? AND role = "banned"
        `,
            {
                replacements: [userId, communityId],
                type: sequelize.QueryTypes.SELECT,
                transaction,
            },
        );

        if (!memberRecord || memberRecord.length === 0) {
            await transaction.rollback();
            return res
                .status(404)
                .json({ error: 'Member not found or not a member' });
        }
        const primaryKeyId = memberRecord[0].id;

        // Now delete using the primary key
        const UnBanMember = await sequelize.query(
            `
                        UPDATE UserCommunities SET BanStatus = false, role='member' WHERE id=?; 
        `,
            {
                replacements: [primaryKeyId],
                type: sequelize.QueryTypes.UPDATE,
                transaction,
            },
        );
        await sequelize.query(
            `
            UPDATE communities
            SET memberCount = GREATEST(memberCount + 1, 0)
            WHERE id = ?
        `,
            {
                replacements: [communityId],
                type: sequelize.QueryTypes.UPDATE,
                transaction,
            },
        );

        await transaction.commit();
        res.json({ message: 'Member Banned successfully', Banned: true });
    } catch (error) {
        await transaction.rollback();
        console.log(error, "Can't kick member from community");
        res.status(500).json({ error: 'Failed to kick member' });
    }
};

export const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const { post, community, isMember } = await getPostCommunityAccess(
            postId,
            userId,
        );
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (!isMember && community?.isPrivate) {
            return res
                .status(403)
                .json({ error: 'Join this private community to like posts' });
        }

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
            await PostLike.create({ postId: postId, userId: userId });
            res.json({ liked: true });
        }
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
};
//get Post likes
export const getLikes = async (req, res) => {
    try {
        const postId = req.params.postId; //Post id on render will determine with a search for
        //each how many likes a post has.

        if (!postId) {
            return res.status(400).json({ error: 'Post ID is required' });
        }
        const { post, community, isMember } = await getPostCommunityAccess(
            postId,
            req.user.userId,
        );
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (community?.isPrivate && !isMember) {
            return res.status(403).json({ error: 'Private community' });
        }
        const like = await sequelize.query(
            'SELECT COUNT(*) FROM PostLikes WHERE postId=?;',
            {
                replacements: [postId],
                type: sequelize.QueryTypes.SELECT,
                plain: true,
            },
        );
        res.json({ like }); //return like count
    } catch (error) {
        console.error('Error fetching likes:', error);
        res.status(500).json({ error: 'Failed to fetch likes' });
    }
};

export const getLikeStatus = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.userId;
        if (!postId || !userId) {
            return res
                .status(400)
                .json({ error: 'post Id is not found or not logged in' });
        }
        const { post, community, isMember } = await getPostCommunityAccess(
            postId,
            userId,
        );
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (community?.isPrivate && !isMember) {
            return res.status(403).json({ error: 'Private community' });
        }

        const result = await sequelize.query(
            'SELECT * FROM PostLikes WHERE postId=? && userId=?;',
            {
                replacements: [postId, userId],
                type: sequelize.QueryTypes.SELECT,
                plain: true,
            },
        );
        if (!result || result.length === 0) {
            console.log('No Like on the post');
            return res.json({ postLiked: false });
        }

        res.json({ postLiked: true });
    } catch (error) {
        console.error('Error fetching user like status:', error);
        res.status(500).json({ error: 'Failed to fetch like status' });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;
        const { post, community, isMember } = await getPostCommunityAccess(
            postId,
            userId,
        );
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (community?.isPrivate && !isMember) {
            return res.status(403).json({ error: 'Private community' });
        }

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

export const toggleSavedPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const { post, community, isMember } = await getPostCommunityAccess(
            postId,
            userId,
        );
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (!isMember && community?.isPrivate) {
            return res.status(403).json({ error: 'Private community' });
        }

        const existingSave = await SavedPost.findOne({
            where: { postId, userId },
        });
        if (existingSave) {
            await existingSave.destroy();
            return res.json({ saved: false });
        }

        await SavedPost.create({ postId, userId });
        return res.json({ saved: true });
    } catch (error) {
        console.error('Error saving post:', error);
        return res.status(500).json({ error: 'Failed to save post' });
    }
};

export const getSavedPosts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const posts = await sequelize.query(
            `
            SELECT
                p.*,
                u.firstName,
                u.lastName,
                u.publicId,
                up.profileImageUrl,
                c.name AS communityName,
                s.createdAt AS savedAt,
                EXISTS(
                    SELECT 1 FROM PostLikes liked
                    WHERE liked.postId = p.id AND liked.userId = :userId
                ) AS isLiked,
                (
                    SELECT COUNT(*) FROM PostLikes
                    WHERE postId = p.id
                ) AS likeCount,
                (
                    SELECT COUNT(*) FROM PostComments
                    WHERE postId = p.id
                ) AS commentCount,
                (
                    c.createdBy = :userId OR EXISTS(
                        SELECT 1 FROM UserCommunities membership
                        WHERE membership.communityId = c.id
                          AND membership.userId = :userId
                          AND membership.role != 'banned'
                          AND membership.BanStatus = false
                    )
                ) AS canInteract
            FROM SavedPosts s
            JOIN Posts p ON p.id = s.postId
            JOIN communities c ON c.id = p.communityId
            LEFT JOIN Users u ON u.id = p.userId
            LEFT JOIN UserProfiles up ON up.userId = u.id
            WHERE s.userId = :userId
              AND (
                    c.isPrivate = false OR c.createdBy = :userId OR EXISTS(
                        SELECT 1 FROM UserCommunities membership
                        WHERE membership.communityId = c.id
                          AND membership.userId = :userId
                          AND membership.role != 'banned'
                          AND membership.BanStatus = false
                    )
              )
              AND NOT EXISTS (
                    SELECT 1 FROM BlockedUsers blocked
                    WHERE (blocked.blockerId = :userId
                           AND blocked.blockedUserId = p.userId)
                       OR (blocked.blockerId = p.userId
                           AND blocked.blockedUserId = :userId)
              )
            ORDER BY s.createdAt DESC
            LIMIT 100
            `,
            {
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.json(
            posts.map((post) => ({
                id: post.id,
                userId: post.userId,
                publicId: post.publicId,
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
                likes: Number(post.likeCount) || 0,
                comments: Number(post.commentCount) || 0,
                communityId: post.communityId,
                communityName: post.communityName,
                isLiked: post.isLiked === true || Number(post.isLiked) === 1,
                isSaved: true,
                canInteract: post.canInteract === true || Number(post.canInteract) === 1,
                Time: post.Time,
                DateOfEvent: post.DateOfEvent,
            })),
        );
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        res.status(500).json({ error: 'Failed to fetch saved posts' });
    }
};

export const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const { post, community, isMember } = await getPostCommunityAccess(
            postId,
            req.user.userId,
        );
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (community?.isPrivate && !isMember) {
            return res.status(403).json({ error: 'Private community' });
        }

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
              AND NOT EXISTS (
                    SELECT 1 FROM BlockedUsers blocked
                    WHERE (blocked.blockerId = :viewerId
                           AND blocked.blockedUserId = pc.userId)
                       OR (blocked.blockerId = pc.userId
                           AND blocked.blockedUserId = :viewerId)
              )
            ORDER BY pc.createdAt ASC
        `,
            {
                replacements: { postId, viewerId: req.user.userId },
                type: sequelize.QueryTypes.SELECT,
            },
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

const ensureInterestTable = () =>
    sequelize.query(`CREATE TABLE IF NOT EXISTS PostInterests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        postId INT NOT NULL,
        userId INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_post_interest (postId, userId)
    )`);

export const expressInterest = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const { post, community, isMember } = await getPostCommunityAccess(
            postId,
            userId,
        );
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (community?.isPrivate && !isMember) {
            return res.status(403).json({ error: 'Private community' });
        }
        const fullPost = await Post.findByPk(postId, {
            attributes: ['id', 'userId', 'type'],
        });
        if (fullPost.type !== 'lfg') {
            return res.status(400).json({ error: 'Post is not an LFG post' });
        }
        if (fullPost.userId === userId) {
            return res
                .status(400)
                .json({ error: 'You cannot show interest in your own post' });
        }

        await ensureInterestTable();
        await sequelize.query(
            'INSERT IGNORE INTO PostInterests (postId, userId) VALUES (:postId, :userId)',
            { replacements: { postId, userId } },
        );

        res.json({ message: 'Interest expressed successfully' });
    } catch (error) {
        console.error('Error expressing interest:', error);
        res.status(500).json({ error: 'Failed to express interest' });
    }
};

export const getPostInterests = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.userId !== userId) {
            return res
                .status(403)
                .json({ error: 'Only the post author can see interested users' });
        }

        await ensureInterestTable();
        const rows = await sequelize.query(
            `
            SELECT u.id AS userId, u.publicId, u.firstName, u.lastName, up.profileImageUrl, pi.createdAt
            FROM PostInterests pi
            JOIN Users u ON pi.userId = u.id
            LEFT JOIN UserProfiles up ON u.id = up.userId
            WHERE pi.postId = :postId
              AND NOT EXISTS (
                    SELECT 1 FROM BlockedUsers blocked
                    WHERE (blocked.blockerId = :viewerId
                           AND blocked.blockedUserId = pi.userId)
                       OR (blocked.blockerId = pi.userId
                           AND blocked.blockedUserId = :viewerId)
              )
            ORDER BY pi.createdAt DESC
            `,
            {
                replacements: { postId, viewerId: userId },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        const ids = rows.map((row) => row.userId);
        const hidden = new Set();
        const connected = new Set();
        const pending = new Set();
        if (ids.length) {
            const visibility = await sequelize.query(
                "SELECT userId FROM VisibilitySettings WHERE userId IN (:ids) AND profileVisibility <> 'Everyone'",
                { replacements: { ids }, type: sequelize.QueryTypes.SELECT },
            );
            visibility.forEach((v) => hidden.add(v.userId));
            const connectionIds = ids.map((id) => [userId, id].sort((a, b) => a - b).join('-'));
            const links = await sequelize.query(
                'SELECT connection_id FROM connections WHERE connection_id IN (:connectionIds)',
                { replacements: { connectionIds }, type: sequelize.QueryTypes.SELECT },
            );
            links.forEach((l) => connected.add(l.connection_id));
            await sequelize.query(`CREATE TABLE IF NOT EXISTS ConnectionRequests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                senderId INT NOT NULL,
                receiverId INT NOT NULL,
                postId INT NULL,
                status VARCHAR(16) NOT NULL DEFAULT 'pending',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_connection_request (senderId, receiverId)
            )`);
            const requests = await sequelize.query(
                "SELECT receiverId FROM ConnectionRequests WHERE senderId = :userId AND status = 'pending' AND receiverId IN (:ids)",
                { replacements: { userId, ids }, type: sequelize.QueryTypes.SELECT },
            );
            requests.forEach((r) => pending.add(r.receiverId));
        }

        res.json(
            rows.map((row) => ({
                publicId: row.publicId,
                isPrivate: hidden.has(row.userId),
                connectionStatus: connected.has(
                    [userId, row.userId].sort((a, b) => a - b).join('-'),
                )
                    ? 'connected'
                    : pending.has(row.userId)
                      ? 'pending'
                      : 'none',
                name: `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unknown User',
                avatar: row.profileImageUrl || null,
                timestamp: new Date(row.createdAt).toLocaleDateString(),
            })),
        );
    } catch (error) {
        console.error('Error fetching interested users:', error);
        res.status(500).json({ error: 'Failed to fetch interested users' });
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
        await SavedPost.destroy({ where: { postId } });

        // Then delete the post
        await post.destroy();

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

const rankHomeFeedPosts = (posts, userId, limit) => {
    const now = Date.now();
    const rankedPosts = posts.map((post) => {
        const createdAt = new Date(post.createdAt).getTime();
        const ageHours = Number.isFinite(createdAt)
            ? Math.max(0, (now - createdAt) / (60 * 60 * 1000))
            : Number.POSITIVE_INFINITY;
        const likes = Number(post.likeCount) || 0;
        const comments = Number(post.commentCount) || 0;
        const isConnectedAuthor = Boolean(Number(post.isConnectedAuthor));
        const isOwnPost = String(post.userId) === String(userId);

        const score =
            8 * Math.exp(-ageHours / 30) +
            2 * Math.log1p(likes) +
            3 * Math.log1p(comments) +
            (isConnectedAuthor ? 2.5 : 0) +
            (isOwnPost ? 0.5 : 0);

        return { post, score, createdAt };
    });

    return rankedPosts
        .sort(
            (left, right) =>
                right.score - left.score || right.createdAt - left.createdAt,
        )
        .slice(0, limit)
        .map(({ post, score }) => ({ ...post, feedScore: score }));
};

// Rank community and public discovery posts by freshness, discussion, and network relevance.
export const getHomeFeed = async (req, res) => {
    try {
        const isGuest = !req.user?.userId;
        // No user has ID 0, so guests only match public-community discovery posts.
        const userId = isGuest ? 0 : req.user.userId;

        const selectFeedPosts = `
            SELECT
                p.id, p.content, p.title, p.type, p.createdAt, p.userId, p.tags,
                p.codeSnippet, p.language, p.projectType, p.skillsNeeded, p.duration,
                c.name AS communityName, c.id AS communityId,
                u.publicId, u.firstName, u.lastName, up.profileImageUrl,
                (SELECT COUNT(*) FROM PostLikes WHERE postId = p.id) AS likeCount,
                (SELECT COUNT(*) FROM PostComments WHERE postId = p.id) AS commentCount,
                EXISTS(
                    SELECT 1 FROM PostLikes
                    WHERE postId = p.id AND userId = :userId
                ) AS isLiked,
                EXISTS(
                    SELECT 1 FROM SavedPosts
                    WHERE postId = p.id AND userId = :userId
                ) AS isSaved,
                EXISTS(
                    SELECT 1 FROM connections conn
                    WHERE (
                        conn.user1_id = :userId
                        AND conn.user2_id = p.userId
                    ) OR (
                        conn.user2_id = :userId
                        AND conn.user1_id = p.userId
                    )
                ) AS isConnectedAuthor
            FROM Posts p
            JOIN communities c ON p.communityId = c.id
            JOIN Users u ON p.userId = u.id
            LEFT JOIN UserProfiles up ON u.id = up.userId
        `;

        const [communityPostCandidates, discoveryPostCandidates] =
            await Promise.all([
                sequelize.query(
                    `${selectFeedPosts}
                    WHERE (
                        c.createdBy = :userId
                        OR EXISTS (
                            SELECT 1 FROM UserCommunities membership
                            WHERE membership.communityId = c.id
                              AND membership.userId = :userId
                              AND membership.role != 'banned'
                              AND membership.BanStatus = false
                        )
                    )
                    AND NOT EXISTS (
                        SELECT 1 FROM BlockedUsers blocked
                        WHERE (blocked.blockerId = :userId
                               AND blocked.blockedUserId = p.userId)
                           OR (blocked.blockerId = p.userId
                               AND blocked.blockedUserId = :userId)
                    )
                    ORDER BY p.createdAt DESC, p.id DESC
                    LIMIT 64`,
                    {
                        replacements: { userId },
                        type: sequelize.QueryTypes.SELECT,
                    },
                ),
                sequelize.query(
                    `${selectFeedPosts}
                    WHERE c.isPrivate = false
                      AND c.createdBy != :userId
                      AND NOT EXISTS (
                          SELECT 1 FROM UserCommunities membership
                          WHERE membership.communityId = c.id
                            AND membership.userId = :userId
                            AND membership.role != 'banned'
                            AND membership.BanStatus = false
                      )
                      AND NOT EXISTS (
                          SELECT 1 FROM UserCommunities banned
                          WHERE banned.communityId = c.id
                            AND banned.userId = :userId
                            AND (
                                banned.role = 'banned'
                                OR banned.BanStatus = true
                            )
                      )
                      AND NOT EXISTS (
                          SELECT 1 FROM BlockedUsers blocked
                          WHERE (blocked.blockerId = :userId
                                 AND blocked.blockedUserId = p.userId)
                             OR (blocked.blockerId = p.userId
                                 AND blocked.blockedUserId = :userId)
                      )
                    ORDER BY p.createdAt DESC, p.id DESC
                    LIMIT 32`,
                    {
                        replacements: { userId },
                        type: sequelize.QueryTypes.SELECT,
                    },
                ),
            ]);

        const userPosts = rankHomeFeedPosts(
            isGuest ? discoveryPostCandidates : communityPostCandidates,
            userId,
            16,
        );
        const suggestedPosts = isGuest
            ? []
            : rankHomeFeedPosts(discoveryPostCandidates, userId, 4);

        const formatPost = (post) => ({
            id: post.id,
            userId: post.userId,
            publicId: post.publicId,
            type: post.type,
            author: `${post.firstName} ${post.lastName}`,
            avatar: post.profileImageUrl || null,
            timestamp: new Date(post.createdAt).toLocaleDateString(),
            content: post.content,
            title: post.title,
            codeSnippet: post.codeSnippet,
            language: post.language,
            projectType: post.projectType,
            skillsNeeded: post.skillsNeeded,
            duration: post.duration,
            tags: post.tags || [],
            communityName: post.communityName,
            communityId: post.communityId,
            likes: Number(post.likeCount) || 0,
            comments: Number(post.commentCount) || 0,
            isLiked: post.isLiked === true || Number(post.isLiked) === 1,
            isSaved: post.isSaved === true || Number(post.isSaved) === 1,
        });

        let projectCandidates = [];
        if (!isGuest) {
            try {
                projectCandidates = await getFeedProjects(userId, 4);
            } catch (projectError) {
                console.error('Error loading feed projects:', projectError);
            }
        }
        const feed = [
            ...userPosts.map((post) => ({
                kind: 'post',
                score: post.feedScore,
                post: formatPost(post),
            })),
            ...projectCandidates.map((project) => ({
                kind: 'project',
                score: project.feedScore,
                project,
            })),
        ].sort((left, right) => right.score - left.score);

        res.json({
            userPosts: userPosts.map(formatPost),
            suggestedPosts: suggestedPosts.map(formatPost),
            feed,
        });
    } catch (error) {
        console.error('Error fetching home feed:', error);
        res.status(500).json({ error: 'Failed to fetch home feed' });
    }
};
export const getSideBarRecommendations = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const UserRecommendations = await sequelize.query(
            `
            SELECT
                u.publicId,
                u.firstName,
                u.lastName,
                u.id,
                up.age,
                up.profileImageUrl,
                up.career,
                up.school,
                CASE
                    WHEN NULLIF(TRIM(viewerProfile.career), '') IS NOT NULL
                         AND LOWER(TRIM(up.career)) = LOWER(TRIM(viewerProfile.career))
                        THEN 'Same career goal'
                    WHEN NULLIF(TRIM(viewerProfile.career), '') IS NOT NULL
                         AND (
                             LOWER(TRIM(up.career)) LIKE
                                 CONCAT('%', LOWER(TRIM(viewerProfile.career)), '%')
                             OR LOWER(TRIM(viewerProfile.career)) LIKE
                                 CONCAT('%', LOWER(TRIM(up.career)), '%')
                         )
                        THEN 'Related career goal'
                    ELSE NULL
                END AS recommendationReason
            FROM Users u
            LEFT JOIN UserProfiles up ON u.id = up.userId
            LEFT JOIN UserProfiles viewerProfile ON viewerProfile.userId = ?
            LEFT JOIN VisibilitySettings visibility ON visibility.userId = u.id
            WHERE u.id <> ?
              AND u.isActive = true
              AND COALESCE(u.isDeleted, false) = false
              AND (
                    COALESCE(visibility.profileVisibility, 'Everyone') = 'Everyone'
                    OR (
                        COALESCE(visibility.profileVisibility, 'Everyone') = 'ConnectionsOnly'
                        AND EXISTS (
                            SELECT 1 FROM connections c
                            WHERE (c.user1_id = ? AND c.user2_id = u.id)
                               OR (c.user2_id = ? AND c.user1_id = u.id)
                        )
                    )
              )
              AND NOT EXISTS (
                    SELECT 1 FROM connections c
                    WHERE (c.user1_id = ? AND c.user2_id = u.id)
                       OR (c.user1_id = u.id AND c.user2_id = ?)
              )
              AND NOT EXISTS (
                    SELECT 1 FROM BlockedUsers b
                    WHERE (b.blockerId = ? AND b.blockedUserId = u.id)
                       OR (b.blockerId = u.id AND b.blockedUserId = ?)
              )
            ORDER BY
                CASE
                    WHEN NULLIF(TRIM(viewerProfile.career), '') IS NOT NULL
                         AND LOWER(TRIM(up.career)) = LOWER(TRIM(viewerProfile.career))
                        THEN 0
                    WHEN NULLIF(TRIM(viewerProfile.career), '') IS NOT NULL
                         AND (
                             LOWER(TRIM(up.career)) LIKE
                                 CONCAT('%', LOWER(TRIM(viewerProfile.career)), '%')
                             OR LOWER(TRIM(viewerProfile.career)) LIKE
                                 CONCAT('%', LOWER(TRIM(up.career)), '%')
                         )
                        THEN 1
                    WHEN NULLIF(TRIM(up.career), '') IS NOT NULL THEN 2
                    ELSE 3
                END,
                u.id DESC
            LIMIT 12
            `,
            {
                replacements: [
                    userId,
                    userId,
                    userId,
                    userId,
                    userId,
                    userId,
                    userId,
                    userId,
                ],
                type: sequelize.QueryTypes.SELECT,
            },
        );

        const SuggestiveUser = (user) => ({
            isActive: user.isActive,
            author: `${user.firstName} ${user.lastName}`,
            userId: user.id,
            publicId: user.publicId,
            age: user.age,
            profileImageUrl: user.profileImageUrl,
            career: user.career,
            school: user.school,
            recommendationReason: user.recommendationReason,
        });

        res.json({
            UserRecommendations: UserRecommendations.map(SuggestiveUser),
        });
    } catch (error) {
        console.error('Error fetching sidebar recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch sidebar recommendations' });
    }
};

export const getSidebarCommunityRecommendations = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const recommendations = await sequelize.query(
            `
            SELECT
                c.id,
                c.name,
                c.description,
                c.image,
                c.icon,
                c.color,
                c.memberCount,
                CASE
                    WHEN NULLIF(TRIM(profile.career), '') IS NOT NULL
                         AND LOWER(CONCAT(' ', c.name, ' ', COALESCE(c.description, ''), ' '))
                             LIKE CONCAT('%', LOWER(TRIM(profile.career)), '%')
                        THEN 'Matches your career goal'
                    ELSE NULL
                END AS recommendationReason
            FROM communities c
            LEFT JOIN UserProfiles profile ON profile.userId = ?
            WHERE COALESCE(c.isPrivate, false) = false
              AND NOT EXISTS (
                    SELECT 1
                    FROM UserCommunities membership
                    WHERE membership.communityId = c.id
                      AND membership.userId = ?
              )
            ORDER BY
                CASE
                    WHEN NULLIF(TRIM(profile.career), '') IS NOT NULL
                         AND LOWER(CONCAT(' ', c.name, ' ', COALESCE(c.description, ''), ' '))
                             LIKE CONCAT('%', LOWER(TRIM(profile.career)), '%')
                        THEN 0
                    ELSE 1
                END,
                COALESCE(c.memberCount, 0) DESC,
                c.createdAt DESC
            LIMIT 6
            `,
            {
                replacements: [userId, userId],
                type: sequelize.QueryTypes.SELECT,
            },
        );

        return res.json({ CommunityRecommendations: recommendations });
    } catch (error) {
        console.error('Error fetching sidebar community recommendations:', error);
        return res.status(500).json({
            error: 'Failed to fetch sidebar community recommendations',
        });
    }
};

export const handleReviewSubmit = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { communityId, Review } = req.params;
        if (!userId) {
            res.json('There is not user currently logged in');
            return;
        }

        const review = await sequelize.query(
            `
            UPDATE UserCommunities SET Review = ? where userId = ? AND communityId = ?;
            
            `,
            {
                replacements: [Review, userId, communityId],
                type: sequelize.QueryTypes.UPDATE,
            },
        );
        res.json({
            review: review,
            message: 'Updated Successfully',
        });
    } catch (error) {
        console.log('There was an error trying to submit a review', error);
        res.status(500).error({ error: 'Error Updating communtiy' });
    }
};

//Obtaining The Review Number
export const getReview = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user.userId;

        const reviewValued = await sequelize.query(
            `SELECT Review FROM UserCommunities WHERE communityId = ? AND userId = ?;`,
            {
                replacements: [communityId, userId],
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (!reviewValued || reviewValued.length === 0) {
            return res.json({ Review: 0 });
        }

        return res.json({ Review: reviewValued });
    } catch (error) {
        console.log('Error fetching community membership:', error);
        res.status(500).json({
            error: 'Failed to fetch membership: ' + error.message,
        });
    }
};
