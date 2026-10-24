import sequelize from '../config/database.js';
import '../models/User.js';
import TermsAcceptance from '../models/TermsAcceptance.js';

try {
    await sequelize.authenticate();
    await TermsAcceptance.sync();
    console.log('terms_acceptances table is ready.');
} catch (error) {
    console.error('Failed to create terms_acceptances table:', error);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}

