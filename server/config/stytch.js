import { Client } from 'stytch';
import 'dotenv/config.js';

const stytch = new Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
    env: process.env.STYTCH_ENV === 'test' ? 'test' : 'live',
});

export default stytch;
