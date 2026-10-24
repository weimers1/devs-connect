import { CURRENT_TERMS_VERSION } from '../constants/terms.js';
import { createClient } from 'redis';

const CONSENT_PREFIX = 'devs-connect:consent:';
const TTL_SECONDS = 10 * 60; // 10 minutes

// In-memory fallback for local dev/testing if Redis is unavailable
const memoryStore = new Map();

let redisClient = null;
let redisPromise = null;

export const getRedisClient = async () => {
    if (process.env.NODE_ENV === 'production' || process.env.REDIS_URL) {
        if (!redisClient && process.env.REDIS_URL) {
            try {
                redisClient = createClient({
                    url: process.env.REDIS_URL,
                });
                redisClient.on('error', (err) => {
                    console.error('Consent Redis Error:', err.message);
                });
                redisPromise = redisClient.connect().catch((err) => {
                    redisClient = null;
                    if (process.env.NODE_ENV === 'production') {
                        throw err;
                    }
                    return null;
                });
            } catch (err) {
                if (process.env.NODE_ENV === 'production') {
                    throw err;
                }
            }
        }
        if (redisPromise) {
            await redisPromise;
        }
        return redisClient;
    }
    return null;
};

export const storeConsent = async (stateOrNonce) => {
    if (!stateOrNonce || typeof stateOrNonce !== 'string') {
        throw new Error('Valid state or nonce required for consent record');
    }
    const data = {
        accepted: true,
        terms_version: CURRENT_TERMS_VERSION,
        timestamp: Date.now(),
    };
    const key = `${CONSENT_PREFIX}${stateOrNonce}`;

    try {
        const client = await getRedisClient();
        if (client?.isOpen) {
            await client.set(key, JSON.stringify(data), { EX: TTL_SECONDS });
            return data;
        }
    } catch (err) {
        if (process.env.NODE_ENV === 'production') {
            throw err;
        }
    }

    // Dev/Test memory fallback with 10-minute TTL
    memoryStore.set(key, {
        ...data,
        expiresAt: Date.now() + TTL_SECONDS * 1000,
    });
    return data;
};

export const verifyAndConsumeConsent = async (stateOrNonce) => {
    if (!stateOrNonce || typeof stateOrNonce !== 'string') {
        return null;
    }
    const key = `${CONSENT_PREFIX}${stateOrNonce}`;

    try {
        const client = await getRedisClient();
        if (client?.isOpen) {
            const raw = await client.get(key);
            if (!raw) return null;
            await client.del(key);
            const parsed = JSON.parse(raw);
            if (
                parsed?.accepted === true &&
                parsed?.terms_version === CURRENT_TERMS_VERSION
            ) {
                return parsed;
            }
            return null;
        }
    } catch (err) {
        if (process.env.NODE_ENV === 'production') {
            throw err;
        }
    }

    // Dev/Test memory fallback
    const record = memoryStore.get(key);
    if (!record) return null;
    memoryStore.delete(key);
    if (record.expiresAt < Date.now()) return null;
    if (
        record.accepted === true &&
        record.terms_version === CURRENT_TERMS_VERSION
    ) {
        return record;
    }
    return null;
};

// Helper for test cleanup
export const _clearMemoryStore = () => {
    memoryStore.clear();
};

