import { Client } from 'stytch';
import 'dotenv/config.js';

// Validate required environment variables
if (!process.env.STYTCH_PROJECT_ID || !process.env.STYTCH_SECRET) {
    throw new Error(
        'Missing required Stytch environment variables: STYTCH_PROJECT_ID and STYTCH_SECRET'
    );
}

let stytchClient;
try {
    stytchClient = new Client({
        project_id: process.env.STYTCH_PROJECT_ID,
        secret: process.env.STYTCH_SECRET,
        envs: process.env.STYTCH_ENV === 'test' ? 'test' : 'live',
    });
} catch (error) {
    console.error('Failed to initialize Stytch client:', error?.message || 'Unknown error');
    throw new Error('Stytch client initialization failed');
}

export default stytchClient;
