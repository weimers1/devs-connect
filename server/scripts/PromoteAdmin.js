import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert } from 'firebase-admin/app';
import 'dotenv/config.js';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is required');
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(serviceAccountJson);
} catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON');
}

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
