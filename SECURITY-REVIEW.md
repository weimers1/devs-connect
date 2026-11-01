# Security Review

Review date: 2026-11-01

## Finding

### Medium: Unverified email changes can enable account takeover

- **Location:** `server/controllers/settingsController.js:167` (email update); `server/Routes/settingsRoutes.js:27-31` (authenticated profile route); `server/controllers/authController.js:202, 274-276` (email-based account lookup and Stytch user ID update)
- **Confidence:** 9/10
- **Impact:** The authenticated profile update stores a new email address without verifying that the account owner controls it. If an attacker obtains temporary access to a user's session, they can change the email to one they control. The email-based login flow may then associate the attacker's Stytch identity with the existing account, potentially preserving access after the original session ends.
- **Recommendation:** Do not allow email changes through the generic profile update. Implement a dedicated email-change flow that verifies the new address and binds it to the authenticated user before replacing the current email.

## Scope and limitations

This was a static review of application source and non-secret configuration. No runtime validation was performed. Secret-bearing files, including `.env` files, were excluded from inspection. This report documents the finding identified during that review; it is not a guarantee that the repository is free of other vulnerabilities.
