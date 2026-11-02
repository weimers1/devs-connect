import express from 'express';
import { rateLimit } from 'express-rate-limit';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    listProjects,
    listMyCommunities,
    getProject,
    createProject,
    updateProject,
    deleteProject,
} from '../controllers/projectController.js';

const router = express.Router();

const projectWriteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many project changes. Please try again later.' },
});

// Every project endpoint requires a signed-in user.
router.use(authMiddleware);

router.get('/', listProjects);
router.get('/communities', listMyCommunities);
router.get('/:id', getProject);
router.post('/', projectWriteLimiter, createProject);
router.put('/:id', projectWriteLimiter, updateProject);
router.delete('/:id', projectWriteLimiter, deleteProject);

export default router;
