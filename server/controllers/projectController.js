import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import Project, { PROJECT_STATUSES } from '../models/Project.js';
import ProjectCollaborator from '../models/ProjectCollaborator.js';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 20;
const MAX_COLLABORATORS = 10;

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

// Communities the viewer belongs to (or created) and is not banned from.
const getPostableCommunities = (viewerId) =>
    sequelize.query(
        `SELECT c.id, c.name, c.icon, c.color
         FROM communities c
         WHERE (
             c.createdBy = :viewerId
             OR EXISTS (
                 SELECT 1 FROM UserCommunities m
                 WHERE m.communityId = c.id AND m.userId = :viewerId
                   AND m.role != 'banned' AND m.BanStatus = false
             )
         )
         AND NOT EXISTS (
             SELECT 1 FROM UserCommunities b
             WHERE b.communityId = c.id AND b.userId = :viewerId
               AND (b.role = 'banned' OR b.BanStatus = true)
         )
         ORDER BY c.name ASC`,
        { replacements: { viewerId: String(viewerId) }, type: sequelize.QueryTypes.SELECT },
    );

// Returns the community plus whether the viewer may see its content.
const getCommunityAccess = async (communityId, viewerId) => {
    const [community] = await sequelize.query(
        `SELECT id, name, isPrivate, createdBy FROM communities WHERE id = :communityId LIMIT 1`,
        { replacements: { communityId }, type: sequelize.QueryTypes.SELECT },
    );
    if (!community) return { community: null, isMember: false, isBanned: false };
    const [membership] = await sequelize.query(
        `SELECT role, BanStatus FROM UserCommunities
         WHERE communityId = :communityId AND userId = :viewerId LIMIT 1`,
        { replacements: { communityId, viewerId }, type: sequelize.QueryTypes.SELECT },
    );
    const isBanned = Boolean(membership) && (membership.role === 'banned' || Boolean(membership.BanStatus));
    const isMember =
        !isBanned && (Boolean(membership) || String(community.createdBy) === String(viewerId));
    return { community, isMember, isBanned };
};

// Private communities the viewer cannot see into, used to hide their projects elsewhere.
const getHiddenCommunityIds = async (viewerId) => {
    const rows = await sequelize.query(
        `SELECT c.id FROM communities c
         WHERE c.isPrivate = true
           AND c.createdBy != :viewerId
           AND NOT EXISTS (
               SELECT 1 FROM UserCommunities m
               WHERE m.communityId = c.id AND m.userId = :viewerId
                 AND m.role != 'banned' AND m.BanStatus = false
           )`,
        { replacements: { viewerId: String(viewerId) }, type: sequelize.QueryTypes.SELECT },
    );
    return rows.map((row) => row.id);
};

// Validates the optional community link: only members can attach a project to it.
const resolveCommunity = async (value, ownerId) => {
    if (value === undefined || value === null || value === '') return { value: null };
    const communityId = cleanText(value).toLowerCase();
    if (!UUID_PATTERN.test(communityId)) return { error: 'Invalid community' };
    const { community, isMember } = await getCommunityAccess(communityId, ownerId);
    if (!community || !isMember) {
        return { error: 'You can only link communities you are a member of' };
    }
    return { value: community.id };
};

// IDs of users blocked by, or blocking, the viewer.
const getBlockedUserIds = async (viewerId) => {
    const rows = await sequelize.query(
        `SELECT blockerId, blockedUserId FROM BlockedUsers
         WHERE blockerId = :viewerId OR blockedUserId = :viewerId`,
        { replacements: { viewerId }, type: sequelize.QueryTypes.SELECT },
    );
    return rows.map((row) =>
        Number(row.blockerId) === Number(viewerId) ? row.blockedUserId : row.blockerId,
    );
};

// Turns a list of public IDs into internal user IDs the owner is allowed to tag.
const resolveCollaborators = async (value, ownerId) => {
    if (value === undefined || value === null) return { value: [] };
    if (!Array.isArray(value)) return { error: 'Tagged people must be a list' };
    const publicIds = [
        ...new Set(value.map((item) => cleanText(item).toLowerCase()).filter(Boolean)),
    ];
    if (publicIds.length > MAX_COLLABORATORS) {
        return { error: `You can tag at most ${MAX_COLLABORATORS} people` };
    }
    if (publicIds.some((id) => !UUID_PATTERN.test(id))) {
        return { error: 'Invalid tagged user' };
    }
    if (publicIds.length === 0) return { value: [] };

    const users = await User.findAll({
        where: { publicId: { [Op.in]: publicIds } },
        attributes: ['id'],
    });
    if (users.length !== publicIds.length) {
        return { error: 'One or more tagged people could not be found' };
    }
    const blocked = new Set((await getBlockedUserIds(ownerId)).map(Number));
    const ids = users.map((user) => user.id).filter((id) => Number(id) !== Number(ownerId));
    if (ids.some((id) => blocked.has(Number(id)))) {
        return { error: 'One or more tagged people could not be found' };
    }
    return { value: ids };
};

const parseGithubUrl = (value) => {
    const raw = cleanText(value);
    if (!raw) return { value: null };
    try {
        const url = new URL(raw);
        const segments = url.pathname.split('/').filter(Boolean);
        if (
            url.protocol !== 'https:' ||
            !['github.com', 'www.github.com'].includes(url.hostname) ||
            segments.length < 2 ||
            !/^[A-Za-z0-9._-]+$/.test(segments[0]) ||
            !/^[A-Za-z0-9._-]+$/.test(segments[1])
        ) {
            return { error: 'GitHub link must look like https://github.com/owner/repo' };
        }
        return { value: `https://github.com/${segments[0]}/${segments[1]}` };
    } catch {
        return { error: 'GitHub link must look like https://github.com/owner/repo' };
    }
};

const parseDemoUrl = (value) => {
    const raw = cleanText(value);
    if (!raw) return { value: null };
    try {
        const url = new URL(raw);
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
            return { error: 'Demo link must be a valid http(s) URL' };
        }
        return { value: url.toString() };
    } catch {
        return { error: 'Demo link must be a valid http(s) URL' };
    }
};

const parseTags = (value) => {
    if (value === undefined || value === null) return { value: [] };
    if (!Array.isArray(value)) return { error: 'Tags must be a list' };
    const tags = [];
    for (const item of value) {
        const tag = cleanText(item);
        if (!tag) continue;
        if (tag.length > 30) return { error: 'Each tag must be 30 characters or fewer' };
        if (!tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
            tags.push(tag);
        }
    }
    if (tags.length > 8) return { error: 'Use at most 8 tags' };
    return { value: tags };
};

// Validates a create/update body; only fields present in a partial update are returned.
const buildFields = (body, { partial }) => {
    const fields = {};
    const has = (key) => !partial || body[key] !== undefined;

    if (has('title')) {
        const title = cleanText(body.title);
        if (title.length < 3 || title.length > 120) {
            return { error: 'Title must be between 3 and 120 characters' };
        }
        fields.title = title;
    }
    if (has('description')) {
        const description = cleanText(body.description);
        if (description.length < 10 || description.length > 5000) {
            return { error: 'Description must be between 10 and 5000 characters' };
        }
        fields.description = description;
    }
    if (has('githubUrl')) {
        const github = parseGithubUrl(body.githubUrl);
        if (github.error) return { error: github.error };
        fields.githubUrl = github.value;
    }
    if (has('demoUrl')) {
        const demo = parseDemoUrl(body.demoUrl);
        if (demo.error) return { error: demo.error };
        fields.demoUrl = demo.value;
    }
    if (has('tags')) {
        const tags = parseTags(body.tags);
        if (tags.error) return { error: tags.error };
        fields.tags = tags.value;
    }
    if (has('status')) {
        const status = body.status === undefined ? 'in_progress' : body.status;
        if (!PROJECT_STATUSES.includes(status)) {
            return { error: 'Invalid project status' };
        }
        fields.status = status;
    }
    return { fields };
};

const serializeProjects = async (projects, viewerId) => {
    const projectIds = projects.map((project) => project.id);
    const communityIds = [...new Set(projects.map((p) => p.communityId).filter(Boolean))];
    const communityRows = communityIds.length
        ? await sequelize.query(
              `SELECT id, name, isPrivate FROM communities WHERE id IN (:communityIds)`,
              { replacements: { communityIds }, type: sequelize.QueryTypes.SELECT },
          )
        : [];
    const communityMap = new Map(communityRows.map((row) => [row.id, row]));
    const links = projectIds.length
        ? await ProjectCollaborator.findAll({
              where: { projectId: { [Op.in]: projectIds } },
              attributes: ['projectId', 'userId'],
          })
        : [];
    const userIds = [
        ...new Set([
            ...projects.map((project) => project.userId),
            ...links.map((link) => link.userId),
        ]),
    ];
    const [users, profiles] = await Promise.all([
        User.findAll({
            where: { id: { [Op.in]: userIds } },
            attributes: ['id', 'publicId', 'firstName', 'lastName'],
        }),
        UserProfile.findAll({
            where: { userId: { [Op.in]: userIds } },
            attributes: ['userId', 'profileImageUrl'],
        }),
    ]);
    const userMap = new Map(users.map((user) => [user.id, user]));
    const profileMap = new Map(profiles.map((profile) => [profile.userId, profile]));
    const toPerson = (userId) => {
        const user = userMap.get(userId);
        return user
            ? {
                  publicId: user.publicId,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  pfp: profileMap.get(userId)?.profileImageUrl || '',
              }
            : null;
    };

    return projects.map((project) => {
        const owner = toPerson(project.userId);
        return {
            id: project.id,
            title: project.title,
            description: project.description,
            githubUrl: project.githubUrl || '',
            demoUrl: project.demoUrl || '',
            tags: project.tags || [],
            status: project.status,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            isOwner: viewerId !== undefined && String(viewerId) === String(project.userId),
            owner,
            community: communityMap.has(project.communityId)
                ? {
                      id: project.communityId,
                      name: communityMap.get(project.communityId).name,
                  }
                : null,
            collaborators: links
                .filter((link) => link.projectId === project.id)
                .map((link) => toPerson(link.userId))
                .filter(Boolean),
        };
    });
};

export const listProjects = async (req, res) => {
    try {
        const where = {};
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

        if (req.query.owner !== undefined) {
            const owner = String(req.query.owner);
            if (!UUID_PATTERN.test(owner)) {
                return res.status(400).json({ error: 'Invalid owner ID' });
            }
            const user = await User.findOne({
                where: { publicId: owner.toLowerCase() },
                attributes: ['id'],
            });
            if (!user) return res.json({ projects: [], hasMore: false });
            where.userId = user.id;
        }

        if (req.query.mine === 'true') {
            where.userId = req.user.userId;
        }

        const blocked = await getBlockedUserIds(req.user.userId);
        if (blocked.length > 0) {
            if (where.userId !== undefined) {
                if (blocked.map(Number).includes(Number(where.userId))) {
                    return res.json({ projects: [], hasMore: false });
                }
            } else {
                where.userId = { [Op.notIn]: blocked };
            }
        }

        if (req.query.community !== undefined) {
            const communityId = String(req.query.community).toLowerCase();
            if (!UUID_PATTERN.test(communityId)) {
                return res.status(400).json({ error: 'Invalid community' });
            }
            const { community, isMember } = await getCommunityAccess(
                communityId,
                req.user.userId,
            );
            if (!community) return res.status(404).json({ error: 'Community not found' });
            if (community.isPrivate && !isMember) {
                return res.status(403).json({ error: 'Private community' });
            }
            where.communityId = communityId;
        } else {
            const hidden = await getHiddenCommunityIds(req.user.userId);
            if (hidden.length > 0) {
                where.communityId = { [Op.or]: [null, { [Op.notIn]: hidden }] };
            }
        }

        if (typeof req.query.status === 'string' && req.query.status) {
            if (!PROJECT_STATUSES.includes(req.query.status)) {
                return res.status(400).json({ error: 'Invalid project status' });
            }
            where.status = req.query.status;
        }

        const search = cleanText(req.query.q).slice(0, 100);
        if (search) {
            const escaped = search.replace(/[\\%_]/g, '\\$&');
            where[Op.or] = [
                { title: { [Op.like]: `%${escaped}%` } },
                { description: { [Op.like]: `%${escaped}%` } },
            ];
        }

        const rows = await Project.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: PAGE_SIZE + 1,
            offset: (page - 1) * PAGE_SIZE,
        });
        const hasMore = rows.length > PAGE_SIZE;
        const projects = await serializeProjects(rows.slice(0, PAGE_SIZE), req.user.userId);
        res.json({ projects, hasMore });
    } catch (error) {
        console.error('Error listing projects:', error);
        res.status(500).json({ error: 'Failed to load projects' });
    }
};

export const listMyCommunities = async (req, res) => {
    try {
        res.json(await getPostableCommunities(req.user.userId));
    } catch (error) {
        console.error('Error listing communities for projects:', error);
        res.status(500).json({ error: 'Failed to load communities' });
    }
};

export const getProject = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid project ID' });
        }
        const project = await Project.findByPk(id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const blocked = await getBlockedUserIds(req.user.userId);
        if (blocked.map(Number).includes(Number(project.userId))) {
            return res.status(404).json({ error: 'Project not found' });
        }
        if (project.communityId && project.userId !== req.user.userId) {
            const { community, isMember } = await getCommunityAccess(
                project.communityId,
                req.user.userId,
            );
            if (community?.isPrivate && !isMember) {
                return res.status(404).json({ error: 'Project not found' });
            }
        }
        const [serialized] = await serializeProjects([project], req.user.userId);
        res.json(serialized);
    } catch (error) {
        console.error('Error loading project:', error);
        res.status(500).json({ error: 'Failed to load project' });
    }
};

export const createProject = async (req, res) => {
    try {
        const { fields, error } = buildFields(req.body || {}, { partial: false });
        if (error) return res.status(400).json({ error });
        const collaborators = await resolveCollaborators(
            req.body?.collaborators,
            req.user.userId,
        );
        if (collaborators.error) return res.status(400).json({ error: collaborators.error });
        const community = await resolveCommunity(req.body?.communityId, req.user.userId);
        if (community.error) return res.status(400).json({ error: community.error });

        const project = await Project.create({
            ...fields,
            communityId: community.value,
            userId: req.user.userId,
        });
        if (collaborators.value.length > 0) {
            await ProjectCollaborator.bulkCreate(
                collaborators.value.map((userId) => ({ projectId: project.id, userId })),
            );
        }
        const [serialized] = await serializeProjects([project], req.user.userId);
        res.status(201).json(serialized);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};

export const updateProject = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid project ID' });
        }
        const project = await Project.findOne({
            where: { id, userId: req.user.userId },
        });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const { fields, error } = buildFields(req.body || {}, { partial: true });
        if (error) return res.status(400).json({ error });
        let collaborators = null;
        if (req.body?.collaborators !== undefined) {
            collaborators = await resolveCollaborators(req.body.collaborators, req.user.userId);
            if (collaborators.error) return res.status(400).json({ error: collaborators.error });
        }
        let communityUpdate = null;
        if (req.body?.communityId !== undefined) {
            // Keeping the current community is always allowed, even if membership lapsed.
            const unchanged = project.communityId && req.body.communityId === project.communityId;
            if (!unchanged) {
                communityUpdate = await resolveCommunity(req.body.communityId, req.user.userId);
                if (communityUpdate.error) {
                    return res.status(400).json({ error: communityUpdate.error });
                }
            }
        }

        await project.update(
            communityUpdate ? { ...fields, communityId: communityUpdate.value } : fields,
        );
        if (collaborators) {
            await ProjectCollaborator.destroy({ where: { projectId: project.id } });
            if (collaborators.value.length > 0) {
                await ProjectCollaborator.bulkCreate(
                    collaborators.value.map((userId) => ({ projectId: project.id, userId })),
                );
            }
        }
        const [serialized] = await serializeProjects([project], req.user.userId);
        res.json(serialized);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid project ID' });
        }
        const deleted = await Project.destroy({
            where: { id, userId: req.user.userId },
        });
        if (!deleted) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
};

// Candidate projects for the home feed, scored on the same scale as community posts.
export const getFeedProjects = async (viewerId, limit = 4) => {
    const hidden = await getHiddenCommunityIds(viewerId);
    const candidates = await sequelize.query(
        `SELECT
            p.id, p.userId, p.status, p.createdAt,
            EXISTS(
                SELECT 1 FROM connections conn
                WHERE (conn.user1_id = :viewerId AND conn.user2_id = p.userId)
                   OR (conn.user2_id = :viewerId AND conn.user1_id = p.userId)
            ) AS isConnectedOwner,
            EXISTS(
                SELECT 1 FROM ProjectCollaborators pc
                WHERE pc.projectId = p.id AND pc.userId = :viewerId
            ) AS isTagged
         FROM Projects p
         WHERE NOT EXISTS (
             SELECT 1 FROM BlockedUsers b
             WHERE (b.blockerId = :viewerId AND b.blockedUserId = p.userId)
                OR (b.blockerId = p.userId AND b.blockedUserId = :viewerId)
         )
         ${hidden.length ? 'AND (p.communityId IS NULL OR p.communityId NOT IN (:hidden))' : ''}
         ORDER BY p.createdAt DESC
         LIMIT 30`,
        { replacements: { viewerId, hidden }, type: sequelize.QueryTypes.SELECT },
    );
    if (candidates.length === 0) return [];

    const now = Date.now();
    const scores = new Map();
    for (const row of candidates) {
        const ageHours = Math.max(0, (now - new Date(row.createdAt).getTime()) / 3600000);
        const score =
            8 * Math.exp(-ageHours / 48) +
            (Number(row.isConnectedOwner) ? 2.5 : 0) +
            (Number(row.isTagged) ? 3 : 0) +
            (row.status === 'looking_for_contributors' ? 1.5 : 0) +
            (String(row.userId) === String(viewerId) ? 0.5 : 0);
        scores.set(row.id, score);
    }

    const topIds = [...scores.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, limit)
        .map(([id]) => id);
    const projects = await Project.findAll({ where: { id: { [Op.in]: topIds } } });
    const serialized = await serializeProjects(projects, viewerId);
    return serialized
        .map((project) => ({ ...project, feedScore: scores.get(project.id) }))
        .sort((left, right) => right.feedScore - left.feedScore);
};
