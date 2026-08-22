import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert } from 'firebase-admin/app'; // Import the modular cert directly
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolves relative location path out of scripts/ into server/
const keyPath = path.resolve(__dirname, '../firebase-admin-key.json');
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

// Call the imported modular functions directly to bypass the undefined namespace bug
initializeApp({
    credential: cert(serviceAccount),
});

const setAdmin = async (email) => {
    if (!email) {
        console.error(
            'ERROR: EMAIL_ADMIN is missing from your environment configuration.',
        );
        process.exit(1);
    }
    try {
        const user = await getAuth().getUserByEmail(email);
        await getAuth().setCustomUserClaims(user.uid, { admin: true });
        console.log(
            `SUCCESS: Custom claim 'admin: true' has been set on account: ${email}`,
        );
        process.exit(0);
    } catch (error) {
        console.error('ERROR setting admin claims:', error.message);
        process.exit(1);
    }
};

setAdmin(process.env.EMAIL_ADMIN);
