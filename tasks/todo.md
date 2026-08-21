# Session 4 implementation plan

## Authentication

- [x] Extend validated configuration and the example environment with the access-token secret and trusted web origin.
- [x] Add password hashes to users, seed two organizers, and expose only allowlisted user fields.
- [x] Issue 15-minute HS256 access JWTs and hashed, seven-day opaque refresh tokens at login.
- [x] Rotate refresh tokens atomically, reject every invalid refresh with the same 401, and revoke active tokens for an account when a rotated token is replayed.

## Authorization

- [x] Keep health and event discovery public while requiring a valid access token everywhere else.
- [x] Restrict event creation to ORGANIZER/ADMIN and derive `organizerId` from the access token.
- [x] Enforce event ownership for organizer updates/deletes with an ADMIN bypass.
- [x] Enforce booking ownership for reads/cancellation and derive booking `userId` from the access token.
- [x] Protect venue reads and restrict venue mutations to ORGANIZER/ADMIN.

## Proof and documentation

- [x] Add Supertest coverage for the policy matrix, two-organizer BOLA denial, refresh rotation, replay denial, and cookie attributes.
- [x] Document the public-route rationale, security-audit prompt and triage, compatibility choices, verification commands, and exit ticket.
- [x] Run Prisma validation/generation, typecheck, lint, and tests; review the final diff.
