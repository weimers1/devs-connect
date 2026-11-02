import express from 'express';
import getSearchResults from '../utils/typeahead.js';

const router = express.Router();

/**
 * @route GET /careers/search
 * @description Search for careers using typeahead functionality
 * @access Public
 * @param {string} q - Search query parameter
 * @returns {Object} JSON response with search results
 */
router.get('/careers/search', getSearchResults);

export default router;
