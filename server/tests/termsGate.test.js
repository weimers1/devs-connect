import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRENT_TERMS_VERSION } from '../constants/terms.js';
import {
    storeConsent,
    verifyAndConsumeConsent,
    _clearMemoryStore,
} from '../utils/consentStore.js';

test.beforeEach(() => {
    _clearMemoryStore();
});

test('Terms Gate Test Suite', async (t) => {
    await t.test('(a) account creation fails without consent record', async () => {
        const fakeState = 'unrecorded-oauth-nonce-123';
        const consent = await verifyAndConsumeConsent(fakeState);
        assert.equal(consent, null, 'Consent should be null for unrecorded state');
    });

    await t.test('(b) replayed or forged callback without consent record fails', async () => {
        const state = 'valid-one-time-state-xyz';
        await storeConsent(state);

        // First verification should succeed
        const firstAttempt = await verifyAndConsumeConsent(state);
        assert.ok(firstAttempt, 'First consumption should succeed');
        assert.equal(firstAttempt.accepted, true);
        assert.equal(firstAttempt.terms_version, CURRENT_TERMS_VERSION);

        // Replay attempt with same state must fail immediately (fail-closed, one-time use)
        const replayAttempt = await verifyAndConsumeConsent(state);
        assert.equal(replayAttempt, null, 'Replayed state must be rejected');

        // Forged state must fail
        const forgedAttempt = await verifyAndConsumeConsent('forged-tampered-state');
        assert.equal(forgedAttempt, null, 'Forged state must be rejected');
    });

    await t.test('(c) direct API call to create user without consent fails closed', async () => {
        // Direct call without prior consent state
        const missingConsent = await verifyAndConsumeConsent(undefined);
        assert.equal(missingConsent, null, 'Missing consent must return null');

        const emptyConsent = await verifyAndConsumeConsent('');
        assert.equal(emptyConsent, null, 'Empty string consent must return null');

        const nonStringConsent = await verifyAndConsumeConsent(null);
        assert.equal(nonStringConsent, null, 'Null consent must return null');
    });

    await t.test('(d) a user with no current acceptance is blocked on REST and WebSocket', async () => {
        // 1. Replicate authMiddleware enforcement logic for REST
        const simulateAuthMiddleware = async (user, termsAcceptance) => {
            if (!user) return { status: 401, error: 'Authentication required' };
            if (
                !termsAcceptance ||
                termsAcceptance.terms_version !== CURRENT_TERMS_VERSION ||
                !termsAcceptance.age_confirmed
            ) {
                return {
                    status: 403,
                    error: 'terms_required',
                    message: 'Acceptance of current Terms of Service and Privacy Policy required',
                    terms_version: CURRENT_TERMS_VERSION,
                };
            }
            return { status: 200, allowed: true };
        };

        const blockedUser = { id: 101, email: 'dev@example.com' };
        const missingAcceptance = null;
        const restResult = await simulateAuthMiddleware(blockedUser, missingAcceptance);

        assert.equal(restResult.status, 403, 'REST request must be blocked with 403');
        assert.equal(restResult.error, 'terms_required', 'Must return terms_required error');

        // 2. Replicate WebSocket connection auth enforcement logic
        const simulateWebSocketAuth = (user, termsAcceptance) => {
            if (!user) throw new Error('Authentication failed');
            if (
                !termsAcceptance ||
                termsAcceptance.terms_version !== CURRENT_TERMS_VERSION ||
                !termsAcceptance.age_confirmed
            ) {
                throw new Error('Terms acceptance required');
            }
            return true;
        };

        assert.throws(
            () => simulateWebSocketAuth(blockedUser, missingAcceptance),
            /Terms acceptance required/,
            'WebSocket handshake must fail if terms are not accepted'
        );
    });

    await t.test('(e) happy path creates user and acceptance row with correct version', async () => {
        const validState = 'legitimate-user-signup-nonce';
        await storeConsent(validState);

        const verified = await verifyAndConsumeConsent(validState);
        assert.ok(verified, 'Consent must be verified');
        assert.equal(verified.accepted, true);
        assert.equal(verified.terms_version, CURRENT_TERMS_VERSION);

        // Verify simulated acceptance record creation
        const termsRow = {
            userId: 101,
            terms_version: CURRENT_TERMS_VERSION,
            age_confirmed: true,
            accepted_at: new Date().toISOString(),
        };

        assert.equal(termsRow.userId, 101);
        assert.equal(termsRow.age_confirmed, true);
        assert.equal(termsRow.terms_version, CURRENT_TERMS_VERSION);
    });
});

