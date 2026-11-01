# Security Review

Full-codebase audit. One high-confidence finding.

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | HIGH | server/Dockerfile | 13 | `server/.env` (real secrets) is copied into the image; `server/.dockerignore` is empty | 9/10 |

## 1. Secrets baked into the server Docker image

- `docker-compose.yml:7-8` uses `./server` as the build context.
- `server/Dockerfile:13` runs `COPY . .`, which includes `server/.env`.
- Anyone who can pull or inspect the image can extract the secrets from a layer.

**Suggested fix:** add `.env` (and other secret files) to `server/.dockerignore`; supply secrets only at runtime via `env_file` in Compose. Rotate any secrets if an image was ever pushed to a registry.

**Status:** fixed. `server/.dockerignore` now excludes `.env`, `.env.*`, `node_modules` and `.git`. Verified the rebuilt image has no `/app/.env` while the server still gets its variables via `env_file`.
