# Project Reference

> **Last updated:** 2026-08-13 00:52  
> **Project name:** project-name-backend

---

## Project Overview

A **NestJS v11 authentication API** that provides a complete, production-ready auth system. The application is a standalone REST API (not a monorepo) with the global route prefix `/api`.

### Business Domain

User identity and access management — registration, login, email verification, password management, session management, role-based access control, explicit authorization versioning (`authz_version`), Google OAuth 2.0 (with account linking and unlinking), admin user management, admin audit logging, Redis-backed API idempotency, and Redis-backed rate limiting.

### Main Features

| Feature | Description |
|---|---|
| Email/password sign-up | With email verification via one-time token |
| Email/password sign-in | JWT-based with access + refresh tokens |
| Google OAuth 2.0 | OpenID Connect with PKCE, automatic account linking, manual linking/unlinking, and frontend redirect handling for validation errors and banned users |
| Email verification | Token-based with cooldown-protected resend |
| Password reset | Token-based forgot/reset flow with email delivery |
| Password change | Authenticated change with old-password verification |
| Set password | For OAuth-only accounts to add a password (optional `revokeOtherSessions`) |
| Session management | List, revoke individual, revoke all other sessions |
| User management | Self-service profile update/delete, admin CRUD |
| Admin user listing | Paginated list with search, filter (status/role), sort |
| Admin user detail | Get user with ban data and ban history |
| Admin role change | Admin endpoint (`POST /api/users/:id/role`) with `authz_version` increment |
| Admin session management | List all sessions (active/revoked/expired) for a user, revoke individual sessions |
| Admin audit logging | Tracks admin actions (ban, unban, role change, session revoke) with `admin_audit_logs` table |
| Authorization Versioning | Explicit `authz_version` in DB & Redis (`authz:version:{userId}`) replacing session blacklisting |
| Role-based access | `user` / `admin` roles with `RolesGuard` |
| User banning | Admin-only ban/unban with reason tracking, ban history, and `unbannedAt` timestamps |
| Mandatory Session ID | `sessionId` is a required claim in `JwtPayload` and `AuthUser`, validated by `AuthGuard` |
| API Idempotency | Redis-backed header lock (`X-Idempotency-Key`) for safe request retries |
| API Rate Limiting | Redis-backed rate limiting (`@nestjs/throttler` + `RedisThrottlerStorageService` + `CustomThrottlerGuard`) with per-route overrides on sensitive auth endpoints |
| HTTP Logging | Global `LoggingInterceptor` tracking request duration, HTTP status code, client IP, User ID, and User Agent |
| Health Check | Public status endpoint at `/api/health` |
| Swagger API docs | Auto-generated at `/api/docs` |

### Application Flow

1. User registers → receives verification email → confirms email → auto-signed-in with JWT session
2. User signs in → receives `accessToken` in body + `refresh_token` as httpOnly cookie (both embedding required `sessionId` and `av` claims)
3. Authenticated request → `AuthGuard` validates JWT signature, verifies required `userId` and `sessionId` claims exist, and compares `av` against Redis `authz:version:{userId}` (sub-millisecond evaluation with 0 DB entity queries)
4. State change (individual session revoke, ban, unban, role change, password change/reset) → DB transaction increments `users.authz_version` → post-commit updates Redis `authz:version:{userId}` → all existing Access JWTs become stale
5. Stale Access JWT → `AuthGuard` throws 401 with `code: "STALE_AUTHORIZATION"` → client triggers silent refresh via `POST /api/auth/refresh` (deduplicated across browser tabs via Web Locks API `auth-refresh` lock) → `RefreshService` validates current session status and issues new tokens with current DB state & `av`
6. Access token expires → client calls `POST /api/auth/refresh` → new access token + rotated refresh token
7. Banned user refresh → `RefreshService` validates ban status via `assertUserNotBanned` and clears refresh cookie (relying on `BanUserService` transaction for session DB revocation)
8. OAuth users → redirected to Google → callback creates/links account → auto-signed-in with JWT session. If the user is banned or callback validation fails, `googleCallback` catches the error and redirects the browser to `${frontendUrl}/oauth/callback?error=account_banned&reason=...` or `error=oauth_validation_failed`.
9. OAuth account management → logged-in user can initiate linking (`GET /api/auth/google/link`), list linked accounts (`GET /api/auth/accounts`), or unlink an account (`POST /api/auth/accounts/unlink`)
10. Idempotent requests → client passes `X-Idempotency-Key` header → `IdempotencyInterceptor` locks & caches response in Redis to prevent duplicate processing
11. Rate limiting → `CustomThrottlerGuard` (global APP_GUARD) throttles by IP + userId, with per-route `@Throttle()` overrides on sensitive endpoints

> **Visual API Flow Diagrams:** Interactive Excalidraw diagrams for all request pipelines, auth flows, and admin actions can be found at [Excalidraw API Flow Diagrams](https://excalidraw.com/#json=MEMfRc34JjCGUG4TFJS5Y,bAY_QrVDfq8AyyGucGMN0w).

---

## Architecture

| Property | Value |
|---|---|
| Framework | NestJS v11.0.1 |
| Node.js | v24.18.0 |
| TypeScript | v5.7.3 (target: ES2023) |
| Module system | `nodenext` (module + moduleResolution) |
| Application type | Standalone REST API |
| Architecture style | Modular / Layered (Controller → Service → Repository) |
| ORM | Drizzle ORM v1.0.0-rc.4 |
| Database | PostgreSQL (Local Docker `project_name_postgres` ) |
| Version State & Rate Limiting | Redis 7 (`ioredis` v6.0.0, Local Docker `project_name_redis`) |
| Rate Limiting | `@nestjs/throttler` v6.5.0 + `RedisThrottlerStorageService` |
| API prefix | `/api` |
| Swagger docs | `/api/docs` |

### Module Organization

The app follows a **domain-driven modular** structure. Each domain has its own NestJS module with co-located controllers, services, repositories, DTOs, and utilities. Cross-cutting infrastructure concerns (Redis, AuthzVersion, Exception Filters, Idempotency, Throttling, Logging) live in `src/common/`.

### Module Dependency Graph

```
AppModule
├── ConfigModule (global)
├── RedisModule (global, exports RedisService & AuthzVersionService)
├── ThrottlerModule (global, Redis-backed)
├── AuthModule
│   ├── HashingModule
│   ├── TokensModule
│   │   ├── JwtModule
│   │   └── UsersRepositoriesModule
│   ├── UsersModule
│   │   ├── UsersRepositoriesModule
│   │   └── TokensModule
│   ├── EmailModule
│   └── ConfigModule
├── UsersModule
│   ├── UsersRepositoriesModule
│   └── TokensModule
├── EmailModule
├── HashingModule
└── TokensModule
```

> **Acyclic Module Graph:** Circular module dependencies have been eliminated by extracting repository providers into `UsersRepositoriesModule`.

---

## Folder Structure

```
back-end/
├── drizzle/                          # Drizzle-generated migration SQL files
├── docker-compose.yml                # Docker compose for PostgreSQL & Redis
├── src/
│   ├── main.ts                       # Application bootstrap & global setup
│   ├── swagger-setup.ts              # Swagger/OpenAPI configuration
│   ├── app.module.ts                 # Root module (ThrottlerModule, CustomThrottlerGuard, LoggingInterceptor)
│   ├── app.controller.ts             # Health-check controller (`/api/health`)
│   ├── app.service.ts                # Health-check service
│   ├── auth/                         # Authentication domain
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── services/                 # Auth services grouped by sub-domain
│   │   │   ├── index.ts
│   │   │   ├── authentication/
│   │   │   │   ├── sign-up.service.ts
│   │   │   │   ├── sign-in.service.ts
│   │   │   │   ├── refresh.service.ts
│   │   │   │   └── logout.service.ts
│   │   │   ├── password/
│   │   │   │   ├── forgot-password.service.ts
│   │   │   │   ├── reset-password.service.ts
│   │   │   │   ├── change-password.service.ts
│   │   │   │   └── set-password.service.ts
│   │   │   ├── verification/
│   │   │   │   ├── verify-email.service.ts
│   │   │   │   └── resend-verification-email.service.ts
│   │   │   ├── sessions/
│   │   │   │   ├── list-sessions.service.ts
│   │   │   │   ├── revoke-session.service.ts
│   │   │   │   └── revoke-all-other-sessions.service.ts
│   │   │   └── oauth/
│   │   │       ├── google-oauth-login.service.ts
│   │   │       ├── google-oauth-callback.service.ts
│   │   │       ├── list-oauth-accounts.service.ts
│   │   │       └── unlink-oauth-account.service.ts
│   │   ├── dtos/                     # Auth-related DTOs
│   │   └── utils/                    # Auth utilities
│   ├── common/                       # Shared / cross-cutting concerns
│   │   ├── constants/                # Centralized constants & domain messages
│   │   ├── decorators/               # Shared decorators (@User, @Roles, @NormalizedEmail)
│   │   ├── filters/                  # Global HttpExceptionFilter
│   │   ├── guards/                   # AuthGuard, RolesGuard, CustomThrottlerGuard
│   │   ├── interceptors/             # IdempotencyInterceptor, LoggingInterceptor
│   │   ├── redis/                    # RedisModule, RedisService, AuthzVersionService
│   │   ├── throttler/                # RedisThrottlerStorageService
│   │   ├── types/                    # Shared TypeScript interfaces & types (AuthUser, JwtPayload)
│   │   └── utils/                    # Utility functions (sha256, email, ban, request)
│   ├── db/                           # Database layer (Drizzle instance, schema, relations)
│   ├── email/                        # Resend email delivery service & HTML templates
│   ├── hashing/                      # Password hashing abstraction (BcryptService)
│   ├── tokens/                       # TokensModule & TokensService (JWT issuance & session creation)
│   └── users/                        # User domain (CRUD, Admin management, Repository isolation)
├── drizzle.config.ts                 # Drizzle Kit configuration
├── nest-cli.json                     # NestJS CLI configuration
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.build.json               # Build-specific TS config
├── eslint.config.mjs                 # ESLint flat config
├── .prettierrc                       # Prettier configuration
├── .env.example                      # Environment variable template
└── package.json                      # Dependencies & scripts
```

---

## Modules

### AppModule

- **Purpose:** Root application module
- **Imports:** `ConfigModule.forRoot({ isGlobal: true })`, `RedisModule` (global), `ThrottlerModule.forRootAsync(...)` (global, Redis-backed via `RedisThrottlerStorageService`), `UsersModule`, `EmailModule`, `AuthModule`, `HashingModule`, `TokensModule`
- **Controllers:** `AppController`
- **Providers:** `AppService`, `CustomThrottlerGuard` (registered as global `APP_GUARD`), `LoggingInterceptor` (registered as global `APP_INTERCEPTOR`)
- **Global Rate Limit:** 60 requests per 60 seconds (default throttler)

### RedisModule (Global)

- **Purpose:** Centralized Redis client wrapper via `ioredis` for idempotency locks, throttler storage, and authorization version state counter
- **Providers:** `RedisService`, `AuthzVersionService`
- **Exports:** `RedisService`, `AuthzVersionService`

### AuthModule

- **Purpose:** All authentication & authorization endpoints
- **Imports:** `HashingModule`, `TokensModule`, `UsersModule`, `EmailModule`, `ConfigModule`
- **Controllers:** `AuthController`
- **Providers:** 17 individual services (grouped into `authentication`, `password`, `verification`, `sessions`, `oauth`) + `AuthGuard`
- **Exports:** None (leaf module)

### UsersRepositoriesModule

- **Purpose:** Encapsulates all user domain repository providers (`UsersRepository`, `RefreshSessionsRepository`, `AdminAuditLogRepository`, `AuthTokensRepository`, `OauthAccountsRepository`) to prevent circular module dependencies between `UsersModule` and `TokensModule`
- **Providers:** `UsersRepository`, `RefreshSessionsRepository`, `AdminAuditLogRepository`, `AuthTokensRepository`, `OauthAccountsRepository`
- **Exports:** `UsersRepository`, `RefreshSessionsRepository`, `AdminAuditLogRepository`, `AuthTokensRepository`, `OauthAccountsRepository`

### UsersModule

- **Purpose:** User CRUD, profile management, banning, role change, admin user/session management
- **Imports:** `UsersRepositoriesModule`, `TokensModule`
- **Controllers:** `UsersController`
- **Providers:** `DeleteUserService`, `DeleteMeService`, `UpdateUserService`, `UpdateMeService`, `BanUserService`, `UnbanUserService`, `ChangeRoleService`, `ListUsersService`, `GetUserService`, `AdminListUserSessionsService`, `AdminRevokeSessionService`, `AuthGuard`, `RolesGuard`
- **Exports:** `UsersRepositoriesModule`

### TokensModule

- **Purpose:** JWT generation, refresh token lifecycle, session issuance
- **Imports:** `JwtModule`, `ConfigModule`, `UsersRepositoriesModule`
- **Providers:** `TokensService`
- **Exports:** `TokensService`, `JwtModule`

### HashingModule

- **Purpose:** Password hashing abstraction (strategy pattern)
- **Providers:** `HashingService` → `BcryptService` (via `useClass`)
- **Exports:** `HashingService`

### EmailModule

- **Purpose:** Email delivery via Resend
- **Providers:** `EmailService`
- **Exports:** `EmailService`

---

## Controllers

### AppController

| Method | Route | Auth | Rate Limit / Interceptors | Description |
|---|---|---|---|---|
| `GET` | `/api/health` | Public | `@SkipThrottle()` | Returns health check status (`{ status: 'ok', timestamp: string }`) |

### AuthController (`/api/auth`)

| Method | Route | Auth | Rate Limit | Interceptors | Description |
|---|---|---|---|---|---|
| `POST` | `/sign-up` | Public | 3/60s | — | Register new account |
| `POST` | `/sign-in` | Public | 5/60s | — | Email/password login |
| `POST` | `/verify-email` | Public | — | `IdempotencyInterceptor` | Verify email via token |
| `POST` | `/resend-verification-email` | Public | 3/900s | — | Resend verification email |
| `POST` | `/refresh` | Cookie | 20/60s | `IdempotencyInterceptor` | Refresh access token using refresh cookie |
| `POST` | `/logout` | Bearer + Cookie | — | — | Logout & revoke session |
| `GET` | `/sessions` | Bearer + Cookie | — | — | List active sessions |
| `POST` | `/sessions/revoke` | Bearer + Cookie | — | — | Revoke specific session |
| `POST` | `/sessions/revoke-all` | Bearer + Cookie | — | — | Revoke all other sessions |
| `POST` | `/forgot-password` | Public | 3/900s | — | Request password reset email |
| `POST` | `/reset-password` | Public | 5/900s | — | Reset password with token |
| `POST` | `/change-password` | Bearer | 5/900s | — | Change password (authenticated) |
| `POST` | `/set-password` | Bearer | — | — | Set password for OAuth-only accounts |
| `GET` | `/google` | Public | — | — | Initiate Google OAuth login flow |
| `GET` | `/google/link` | Bearer | — | — | Initiate Google OAuth account linking flow |
| `GET` | `/google/callback` | Public | — | — | Google OAuth callback (handles login and linking flows) |
| `GET` | `/accounts` | Bearer | — | — | List linked OAuth accounts for current user |
| `POST` | `/accounts/unlink` | Bearer | — | — | Unlink an OAuth account |

### UsersController (`/api/users`)

| Method | Route | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/` | Bearer | Admin | List all users (paginated, searchable, filterable, sortable) |
| `GET` | `/me` | Bearer | Any | Get current user profile (includes `hasPassword`) |
| `GET` | `/:id` | Bearer | Admin | Get user details with ban data |
| `GET` | `/:id/sessions` | Bearer | Admin | List all sessions for a user (active/revoked/expired, paginated) |
| `POST` | `/:id/sessions/:sessionId/revoke` | Bearer | Admin | Revoke a specific session for a user (with audit log, `authz_version` increment) |
| `PATCH` | `/me` | Bearer | Any | Update own name/avatar |
| `PATCH` | `/:id` | Bearer | Admin | Update any user |
| `DELETE` | `/me` | Bearer | Any | Delete own account |
| `DELETE` | `/:id` | Bearer | Admin | Delete any user |
| `POST` | `/:id/ban` | Bearer | Admin | Ban a user (with audit log, `authz_version` increment) |
| `POST` | `/:id/unban` | Bearer | Admin | Unban a user (with audit log, `authz_version` increment) |
| `GET` | `/audit-logs` | Bearer | Admin | List admin audit logs (paginated with action/admin/target filters) |
| `POST` | `/:id/role` | Bearer | Admin | Change user role (with audit log, `authz_version` increment) |

---

## Services

### Auth Services (`src/auth/services/`)

| Service | Sub-directory | Responsibilities |
|---|---|---|
| `SignUpService` | `authentication/` | Create user, hash password, issue verification token, send email. Handles race conditions on duplicate email with idempotent re-send. |
| `SignInService` | `authentication/` | Validate credentials (constant-time via dummy hash), check verification status, issue auth session. |
| `RefreshService` | `authentication/` | Verify refresh JWT, validate session hash against DB JOIN (fetching `user.authzVersion`), check ban status (clears cookie & asserts not banned; DB revocation handled at ban-time by `BanUserService`), rotate refresh token with current `authzVersion`. If token hash mismatch occurs (reuse detection), session is marked revoked and cookie cleared. |
| `LogoutService` | `authentication/` | Revoke current session in DB (`revokedAt`), clear refresh cookie. |
| `VerifyEmailService` | `verification/` | Parse & validate verification token (SHA-256 comparison), mark user verified, auto-issue auth session. |
| `ResendVerificationEmailService` | `verification/` | Cooldown-protected re-issuance of verification tokens + email delivery. |
| `ForgotPasswordService` | `password/` | Cooldown-protected password reset token issuance + email delivery. Silent success for non-existent users. |
| `ResetPasswordService` | `password/` | Validate reset token, hash new password, increment `authz_version`, DB bulk revoke all refresh sessions, update Redis post-commit. |
| `ChangePasswordService` | `password/` | Verify old password, hash new password, increment `authz_version`, DB bulk revoke other sessions (using `user.sessionId`), update Redis post-commit. |
| `SetPasswordService` | `password/` | For OAuth-only accounts without a password. Sets password, increments `authz_version`, DB bulk revokes other sessions (using `user.sessionId`), updates Redis post-commit. |
| `ListSessionsService` | `sessions/` | Fetch active sessions, identify current session, parse user-agent. |
| `RevokeSessionService` | `sessions/` | Revoke a single session by ID (`revokedAt` in DB), clear cookie if current, increment user `authz_version` and update Redis. |
| `RevokeAllOtherSessionsService` | `sessions/` | Verify current session, revoke all others in DB, increment authz_version in transaction, update Redis post-commit. |
| `GoogleOauthLoginService` | `oauth/` | Generate PKCE-protected Google OAuth authorization URL. Lazy-initializes OpenID Connect configuration. |
| `GoogleOauthCallbackService` | `oauth/` | Exchange auth code for tokens, extract claims, create/link user + OAuth account, issue auth session or link account. |
| `ListOauthAccountsService` | `oauth/` | List all linked OAuth accounts (`id`, `provider`, `providerUserId`) for authenticated user. |
| `UnlinkOauthAccountService` | `oauth/` | Unlink an OAuth provider, ensuring user has at least one remaining auth method (password or another provider). |

### User Services (`src/users/services/`)

| Service | Sub-directory | Responsibilities |
|---|---|---|
| `BanUserService` | `admin/` | Validate ban request (self-ban check), create ban record + set flag + increment `authz_version` + DB bulk revoke refresh sessions in transaction, update Redis post-commit, create audit log. |
| `UnbanUserService` | `admin/` | Set `unbannedAt` on active ban + clear `isBanned` flag + increment `authz_version` in transaction, update Redis post-commit, create audit log. |
| `ChangeRoleService` | `admin/` | Update user role + increment `authz_version` in transaction, update Redis post-commit, create audit log (`change_role`). |
| `DeleteUserService` | `admin/` | Admin delete of any user. |
| `UpdateUserService` | `admin/` | Admin update of any user's name/avatar. |
| `ListUsersService` | `admin/` | Paginated user listing with search (name/email), filter (status/role), sort. Uses `findAllPaginated()` and `toPublicUser()` mapper. |
| `GetUserService` | `admin/` | Get single user with ban data and ban history via `findByIdWithBan()`. Returns `toPublicUser()`. |
| `AdminListUserSessionsService` | `admin/` | List all sessions (active/revoked/expired) for a user. Paginated, with computed status field. |
| `ListAuditLogsService` | `admin/` | Paginated listing of admin audit logs with action and user filters. |
| `AdminRevokeSessionService` | `admin/` | Revoke a specific session for a user (validates ownership, checks not already revoked). Increments user `authz_version` and updates Redis, creates audit log entry within transaction. |
| `DeleteMeService` | `profile/` | Self-deletion with cookie cleanup. |
| `UpdateMeService` | `profile/` | Self-update of own name/avatar. |

### Infrastructure Services

| Service | Location | Responsibilities |
|---|---|---|
| `RedisService` | `src/common/redis/` | `ioredis` client wrapper (`get`, `set`, `setNxEx`, `del`, `getClient()`) with graceful connection/disconnection lifecycle handlers. |
| `AuthzVersionService` | `src/common/redis/` | Redis authorization version manager (`getVersion`, `setVersion`, `deleteVersion`). Keys: `authz:version:${userId}` (no TTL). |
| `RedisThrottlerStorageService` | `src/common/throttler/` | Implements `ThrottlerStorage` interface using Redis for distributed rate limiting. Handles hit counting, TTL management, and block duration. |
| `TokensService` | `src/tokens/` | Generate access/refresh JWTs (embedding required `sessionId` and `av`), manage refresh cookies, issue full auth sessions, revoke sessions in DB, extract session ID from refresh token. |
| `HashingService` | `src/hashing/` | Abstract hashing interface (`hash`, `compare`). |
| `BcryptService` | `src/hashing/` | `@node-rs/bcrypt` implementation (cost factor 10). |
| `EmailService` | `src/email/` | Resend SDK wrapper for email delivery. Gracefully handles missing API key (returns `false`). |
| `AppService` | `src/` | Health check logic returning application status and current ISO timestamp. |

---

## Shared Types & Models

### `JwtPayload` (`src/common/types/jwt-payload.type.ts`)

```typescript
export type JwtPayload = {
  userId: string;
  role: UserRole;
  av: number;
  sessionId: string; // Required claim in all access & refresh JWTs
};

export type RefreshJwtPayload = JwtPayload;
```

### `AuthUser` (`src/common/types/auth-user.type.ts`)

```typescript
export type AuthUser = {
  id: string;
  role: UserRole;
  sessionId: string; // Guaranteed string attached by AuthGuard
};
```

---

## Authentication & Security

### JWT Strategy

- **Access tokens:** Short-lived (default 15m), sent in response body, client stores in memory
  - Payload: `{ userId, role, sessionId, av }` (all claims strictly required)
  - Verified via `Authorization: Bearer <token>` header
- **Refresh tokens:** Long-lived (default 7d), sent as `httpOnly` cookie named `refresh_token`
  - Payload: `{ userId, role, sessionId, av }`
  - Cookie: `httpOnly`, `sameSite: lax`, `secure` in production

### Token Security & Session Invalidation

- Refresh tokens are **hashed with SHA-256** before storage in the database
- Comparison uses **timing-safe** `timingSafeEqual`
- Refresh tokens are **rotated** on each refresh (same session ID, new token hash)
- Sign-in uses a **dummy password hash** for constant-time comparison when user doesn't exist
- **Unified Authorization Invalidation (`authz_version`):** The Redis session blacklist has been completely removed. All authorization invalidations (individual session revocation, ban, unban, role change, password change/reset) rely entirely on the user's `authz_version` (`av`). State-changing operations atomically increment `users.authz_version` in PostgreSQL inside the DB transaction and update Redis (`authz:version:{userId}`). Existing Access JWTs carrying an older `av` are rejected by `AuthGuard` with `401 Unauthorized` (`STALE_AUTHORIZATION`), causing the client to trigger a silent token refresh.

### Session Model

- Each refresh token maps to a `refresh_session` row with device metadata (IP, user agent)
- Sessions are revoked individually by setting `revokedAt` (soft revocation) in DB and incrementing `authz_version` to invalidate outstanding access tokens
- Password resets, bans, role changes, and password changes bulk revoke refresh sessions in DB and increment `authz_version`
- Banned user checks in `RefreshService` do not issue redundant DB `revokeAll` calls, as `BanUserService` handles full session revocation inside its atomic transaction upon banning.

### AuthGuard Validation Logic

- Extracts Bearer token from `Authorization` header
- Verifies JWT signature and expiry using `JWT_ACCESS_SECRET`
- **Mandatory Claims Validation:** Checks that both `userId` and `sessionId` exist in `payload` (throws `401 Unauthorized` with `INVALID_ACCESS_TOKEN` if missing)
- Reads `currentVersion` via `AuthzVersionService.getVersion(userId)`
- **Redis Key Miss Fallback:** Queries `users.authz_version` via `UsersRepository.getAuthzVersion(userId)` and backfills Redis best-effort
- **Version Check:** Compares `payload.av === currentVersion`. If mismatch, throws `401 Unauthorized` with `message: AUTH_MESSAGES.STALE_AUTHORIZATION` and `code: "STALE_AUTHORIZATION"`
- **Redis Outage Behavior (Fail Closed):** On Redis connection failure, catches exception and throws `503 Service Unavailable` with `code: "AUTHORIZATION_SERVICE_UNAVAILABLE"`
- Attaches `AuthUser` directly from JWT payload claims (0 entity DB queries)

### Frontend Multi-Tab Refresh Synchronization (Web Locks API)

- Uses native **Web Locks API** (`navigator.locks.request('auth-refresh', ...)`) to prevent race conditions when multiple browser tabs trigger refresh requests simultaneously
- Only one tab performs `POST /api/auth/refresh` at a time while other tabs wait
- After acquiring the lock, waiting tabs re-check authentication state and timestamp to avoid redundant refresh calls
- `BroadcastChannel('project_name_auth_refresh')` broadcasts refresh success events across active browser tabs

---

## Authorization

### Roles

- `user` — Default role, standard permissions
- `admin` — Full access to user management endpoints

### Guard Stack

1. **`CustomThrottlerGuard`** — Global `APP_GUARD`, rate limits by IP + userId. Custom tracker generates keys like `user:{userId}:{ip}` or `ip:{ip}`. Throws `429 Too Many Requests` with message from `COMMON_MESSAGES.TOO_MANY_REQUESTS`.
2. **`AuthGuard`** — Validates access token signature, enforces `userId` & `sessionId` presence, verifies `authz_version` (`av`) against Redis/DB fallback, attaches `AuthUser` to request (0 entity DB queries)
3. **`RolesGuard`** — Reads `@Roles()` metadata, checks `user.role` against required roles

---

## Important Files

| File | Purpose |
|---|---|
| `docker-compose.yml` | Container definitions for PostgreSQL and Redis services |
| `src/main.ts` | Bootstrap, global pipes/filters/prefix, helmet middleware, enableShutdownHooks, Swagger setup |
| `src/app.module.ts` | Root module with global ConfigModule, RedisModule, ThrottlerModule, CustomThrottlerGuard, LoggingInterceptor |
| `src/app.controller.ts` | Health-check endpoint (`GET /api/health`) |
| `src/db/schema.ts` | All database table definitions and type exports (7 tables, including `authz_version`) |
| `src/db/index.ts` | Drizzle DB singleton instance |
| `src/common/redis/redis.service.ts` | ioredis service wrapper |
| `src/common/redis/authz-version.service.ts` | Redis authorization version manager (`authz:version:${userId}`) |
| `src/common/throttler/redis-throttler-storage.service.ts` | Redis-backed ThrottlerStorage implementation |
| `src/common/guards/custom-throttler.guard.ts` | Custom rate limiting guard (global APP_GUARD) |
| `src/common/interceptors/idempotency.interceptor.ts` | Redis idempotency interceptor |
| `src/common/interceptors/logging.interceptor.ts` | Global HTTP logging interceptor (global APP_INTERCEPTOR) |
| `src/common/guards/auth.guard.ts` | Stateless JWT authentication guard (validates `av` claim against Redis/DB fallback, requires `sessionId`) |
| `src/common/guards/roles.guard.ts` | Role-based authorization guard |
| `src/common/filters/http-exception.filter.ts` | Global exception handler (forwards custom `code` field) |
| `src/email/templates/layout.email.ts` | HTML email layout wrapper |
| `src/tokens/tokens.service.ts` | Central JWT & session management (embeds required `sessionId` and `av`, session issuance & DB revocation) |
| `src/common/types/jwt-payload.type.ts` | Defines `JwtPayload` & `RefreshJwtPayload` with required `sessionId: string` |
| `src/common/types/auth-user.type.ts` | Defines `AuthUser` with required `sessionId: string` |
| `src/common/constants/messages.constant/index.ts` | All user-facing messages |
| `src/users/repositories/admin-audit-log.repository.ts` | Admin audit log repository |
| `drizzle.config.ts` | Drizzle Kit configuration |

---

## AI Working Guidelines

1. **Always read this file first** before making any changes
2. **Follow the one-service-per-use-case pattern** for auth and user features (in sub-domain folders `authentication/`, `password/`, `verification/`, `sessions/`, `oauth/`, `admin/`, `profile/`)
3. **Use centralized message constants** — never hardcode user-facing strings
4. **Normalize emails** at both DTO and repository levels
5. **Pass `executor` parameter** to repository methods when working within transactions
6. **Keep module dependencies acyclic** — use `UsersRepositoriesModule` to prevent circular dependencies between `UsersModule` and `TokensModule`
7. **Keep controllers thin** — delegate to services immediately
8. **Use Swagger decorators** on all endpoints (`@ApiOperation`, `@ApiTags`, `@ApiBearerAuth`, etc.)
9. **Hash tokens with SHA-256** and use timing-safe comparison for verification/reset tokens
10. **Atomically increment `authz_version`** in PostgreSQL inside the DB transaction on authorization-changing operations (individual session revocation, ban, unban, role change, password change/reset) and set Redis version post-commit
11. **Background email logging** — log background email dispatches with explicit `this.logger.error(...)` catches instead of silent swallowing
12. **Create audit log entries** for admin actions within the same transaction
13. **Use `@Throttle()` decorator** for per-route rate limit overrides on sensitive endpoints
14. **Enable shutdown hooks in `main.ts`** (`app.enableShutdownHooks()`) for graceful resource termination during container shutdowns
15. **Update this file** after every code change
