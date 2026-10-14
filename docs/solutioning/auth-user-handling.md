# Authentication and user handling

## Identity model

- Customer identities use `UserAccount`; admin identities use `AdminAccount`. Never cross-authenticate the two account types.
- Username and email are unique identifiers, normalized to lowercase before registration, lookup, and persistence. WhatsApp remains optional contact data and is never a login identifier.
- Passwords are bcrypt hashes (cost 12). Never return hashes, accept hashes, log passwords, or store plaintext credentials.
- Login accepts `identifier` (username or email), `username`, or `email` plus password. Invalid account and password share one generic response.
- Customer JWT uses HS256, issuer `jokihub-api`, audience `jokihub-customer`, role `CUSTOMER`, and 15 minute expiry. Admin JWT uses audience `jokihub-admin`, role `ADMIN` or `SUPER_ADMIN`, a permission-code snapshot, and 15 minute expiry. Both require `JWT_SECRET` of at least 32 characters.

## Customer registration and login

- `POST /api/auth/v1/register`: accepts name, username, email, password, accepted terms, and optional WhatsApp. Username syntax is 3–30 ASCII letters/digits/dot/underscore/hyphen. Password is 8–128 characters.
- Registration checks unique username/email, writes active user and BRONZE member profile, hashes password, and starts customer session. If member profile persistence fails, the newly created account is removed.
- `POST /api/auth/v1/login`: resolves username then email, checks customer credentials first and admin credentials second, compares bcrypt hash, and issues role-isolated cookie. Response identifies `CUSTOMER` or `ADMIN` only after successful authentication.
- Existing `/login` page is shared for customer and admin login and accepts username or email. Admin success redirects to `/admin`; customer success redirects to storefront. `/admin/login` redirects to `/login`. WhatsApp is not part of authentication UI or request.
- `POST /api/auth/v1/logout` clears the customer cookie and validates a supplied Origin against request origin. `POST /api/admin/auth/v1/logout` clears the admin cookie using the same origin check.
- Customer and admin login/register issue opaque 256-bit refresh tokens in separate HttpOnly cookies. Only SHA-256 hashes are stored in `AuthRefreshSession`; refresh tokens expire after 30 days and rotate on use. Reuse of a revoked token revokes active sessions for that account.
- `POST /api/auth/v1/refresh-token` rotates a customer session. `POST /api/admin/auth/v1/refresh-token` rotates an admin session and reloads current role permissions before issuing the next access token. The existing app shell refreshes an established session every 8 minutes; an expired protected route returns to the shared login page and attempts refresh there.
- Login requests are limited to 100 per IP and 10 per IP+identifier per 15 minutes. Registration is limited to 20 per IP and 3 per IP+email per hour. Counters are atomic MongoDB upserts with HMAC-derived keys; over-limit responses return 429 and `Retry-After`.
- Registration activates the account immediately and issues a session; it must not be described as email-verified. Verification and resend remain unavailable until provider configuration and lifecycle policy are approved.
- `POST /api/auth/v1/forgot-password` sends a generic recovery request response to avoid account enumeration. It returns 503 when SMTP/base URL settings are absent. `POST /api/auth/v1/reset-password` accepts a 256-bit token and an 8–128 character password. Tokens are stored as SHA-256 hashes, expire after 30 minutes, and can be consumed once. Password reset revokes all customer refresh sessions.
- Recovery requests are limited to 20 per IP and 5 per IP+email per hour; reset attempts use the same rate bucket limits. `pnpm init:auth-action-token` ensures the expiry lookup index. Expired tokens are rejected by the API and pruned for an account on its next recovery request.
- A generic SMTP transport is available in `src/backend/notifications/email-delivery.service.ts`. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, optional paired `SMTP_USER`/`SMTP_PASSWORD`, and `SMTP_FROM`; `APP_BASE_URL` supplies action links. Empty SMTP settings mean unavailable, never simulated success. Do not add provider credentials to source control.

## Admin bootstrap and login

- Admin account schema includes unique username and email plus bcrypt `password_hash`.
- Apply `pnpm migrate-dev:db` before seeding so MongoDB validators accept the auth fields; the database principal needs `createIndex` and `collMod` rights on the target database (MongoDB `dbAdmin` is sufficient).
- `pnpm seed:superadmin` upserts `SUPERADMIN_USERNAME`, `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, sets account active, assigns the `SUPER_ADMIN` role, and attaches all built-in permissions. Local defaults are `superadmin`, `superadmin@jokihub.local`, and `superadmin`; production requires explicit strong password.
- `POST /api/admin/auth/v1/login` remains an admin-specific API; shared `/api/auth/v1/login` also supports admin credentials. Admin access token is stored in HttpOnly `jokihub-admin` cookie for 15 minutes; its refresh token uses HttpOnly `jokihub-admin-refresh` for up to 30 days. `/admin/*` requires a valid access token or redirects through shared login to refresh.
- Seed refuses production passwords under 16 characters or using fewer than 3 character classes. Requested `superadmin` password is for local development only.
- Seed needs a configured MongoDB `MONGODB_URL` and random 32+ character `JWT_SECRET`. Never commit `.env`.
- After applying migrations, run `pnpm init:auth-rate-limit` with a database principal allowed to create indexes. It provisions a TTL index so expired rate-limit buckets are removed automatically; web runtime does not need DDL privileges.

## Admin user management

- Admin member list, detail, update, and delete APIs operate on customer `UserAccount` only, exclude soft-deleted records, and require `users-manage` permission.
- List supports `search`, `status=ACTIVE|BLOCKED`, `page`, and `pageSize` (max 100); results omit WhatsApp and credentials.
- Detail returns member tier and order metrics derived from order data. `totalSpend` sums paid orders in stored currency; multi-currency conversion and refunds need a defined policy before metric is treated as financial truth.
- Update allows name, username, email, optional WhatsApp, and status only. Unique identity conflicts return 409. Status changes write `UserStatusHistory`.
- Delete is soft delete and blocks sign-in; orders and payments remain intact.
- Admin create-member and create-admin invitations remain unavailable because no email/identity provider is configured and approved contracts prohibit accepting passwords from the dashboard. Endpoints validate payload, role and duplicate identity, then return an explicit provider-unavailable response without creating unusable accounts. Customer self-registration is available.
- Admin role CRUD writes `AdminRole`, `Permission`, `RolePermission`, and audit records. Admin routes enforce permission-code claims from the role assignments loaded at login. Role changes take effect in newly issued tokens; current access tokens expire after 15 minutes.
- Admin account list/detail/update/soft-delete routes use `AdminAccount` and role assignments separately from customer members. Super Admin is required to assign admin roles; the last active Super Admin cannot be disabled, demoted, or removed.
- Admin Games, Services, Service Categories, Orders, Transactions, Activity Logs, Dashboard Overview, and General Settings pages use database-backed API handlers. The existing login page is shared for customer/admin and `/admin/login` redirects to `/login`.

## Open implementation scope

- Configure a real random secret and secure MongoDB URL. Do not deploy with `superadmin` / `superadmin`.
- Wire SMTP to email verification and resend after account lifecycle policy is approved. Admin invitation endpoints remain unavailable until the identity/role invitation contract and SMTP credentials are provided. Never claim verification or email delivery succeeded.
