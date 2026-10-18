# devs-connect
Developer Connect platform for SWEs to connect, code, and create projects.

## Best Practices We Implement:
- [Follow standard design process](https://designlab.com/blog/what-is-the-ux-design-process)
- [Utilize Figma for prototyping](https://www.figma.com/proto/FQLpjndPuegrrrM0mxsac9/build-hub-idea-0?node-id=0-1&p=f&t=ceibQ1wFeqEAoT2W-0&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=11%3A11&show-proto-sidebar=1)
- [Standardized commit messages](https://www.conventionalcommits.org/en/v1.0.0/)
- Track tickets in Trello for project management

## Server database updates

Before deploying the message status/read-receipt changes to an existing database, run `npm run migrate:message-metadata` from the `server` directory with the target database environment configured. This adds any missing message metadata columns; the migration is safe to rerun.

Before deploying UUID profile URLs to an existing database, run `npm run migrate:user-public-ids` from the `server` directory with the target database environment configured. This adds a unique public UUID to each user and backfills existing accounts; the migration is safe to rerun. Profile routes use these UUIDs, while numeric user IDs remain internal for database relationships and messaging.

Before deploying saved-post support to an existing production database, run `npm run migrate:saved-posts` from the `server` directory with the target database environment configured. This creates the `SavedPosts` table; the migration is safe to rerun.

## Feedback email

The public Help & Support page sends feedback directly through Gmail SMTP and does not require an account. Configure these values in `server/.env`:

- `SUPPORT_EMAILS`: comma-separated feedback recipients.
- `SMTP_USER`: the Gmail account that will send the feedback.
- `SMTP_APP_PASSWORD`: an app password generated for that Gmail account (not its normal sign-in password).

The sender account must have Google 2-Step Verification enabled to create an app password. Restart the server after setting these values. Feedback submissions are rate-limited.

## Production security configuration

Copy `server/.env.example` to `server/.env` for local setup. Production must use a high-entropy `SESSION_SECRET` (at least 32 characters), a TLS-enabled `REDIS_URL` (`rediss://`) for shared OAuth sessions and rate-limit counters, HTTPS origins for `CLIENT_URL`, `URL_CLIENT`, `SERVER_URL`, and `BASE_URL`, a correctly sized `TRUST_PROXY` value for the trusted reverse-proxy chain, and a trusted PEM CA in `DB_SSL_CA`. Never commit `.env` files or service-account credentials. Local development uses in-memory rate limiting and OAuth sessions and does not require Redis.

The API adds security headers and redirects insecure requests, but TLS termination and the first HTTP-to-HTTPS redirect must be configured at the hosting edge. Configure TLS 1.2 or newer, strong cipher suites, HSTS, CSP and other response headers on the frontend's static host as well as the API host, and use a WAF if required by the deployment. Those hosting controls cannot be verified from this repository.

Browser API authentication and Socket.IO authentication use the HttpOnly session cookie; bearer-token authentication is not supported. Administrative routes are disabled; if they are re-enabled, add enforced MFA before granting privileged access.
