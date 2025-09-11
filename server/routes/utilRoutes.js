import express from 'express';
import getSearchResults from '../utils/typeahead.js';

const router = express.Router();

// ensure auth protection when getting and updating profile; ensure csrf protection when updating profile
router.get('/careers/search', getSearchResults);

export default router;
