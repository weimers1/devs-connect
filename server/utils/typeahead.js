import { Op } from 'sequelize';
import Career from '../models/Career.js';

const getSearchResults = async (req, res) => {
    try {
        // grab the query term
        const { q } = req.query;
        const searchTerm = typeof q === 'string' ? q.trim() : '';

        // idk how but if there isn't a query term, that's a problem
        if (!searchTerm) {
            throw Object.assign(new Error('Query term required'), {
                status: 400,
                message:
                    'Search term must contain at least one non-whitespace character',
            });
        }

        // Search careers with description matching the query term
        const results = await Career.findAll({
            where: {
                description: {
                    [Op.like]: `%${searchTerm}%`, // Case-insensitive partial match
                },
                isActive: 1,
            },
            attributes: ['id', 'description'], // Only select needed columns
            limit: 10, // Limit results for performance
        });

        // Map results to the required format
        const formattedResults = results.map((career) => ({
            id: career.id,
            text: career.description,
        }));

        res.status(200).json({
            status: 200,
            message: 'Success',
            data: formattedResults,
        });
    } catch (error) {
        // general error catch
        res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || 'Typeahead search failed',
        });
    }
};

export default getSearchResults;
