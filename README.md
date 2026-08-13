# 🛡️ Traqon - Back-End (NestJS IAM API)

> **Enterprise-Grade Identity & Access Management (IAM), Security Platform, and Authorization API built with NestJS 11, PostgreSQL, Drizzle ORM, and Redis.**

---

## 📌 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Technical Features](#-key-technical-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Database & Migrations](#-database--migrations)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Security & Architecture Deep-Dive](#-security--architecture-deep-dive)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🚀 Overview

**Traqon Back-End** is a production-ready, standalone RESTful API designed to provide robust user identity, authentication, session lifecycle management, and role-based access control (RBAC). It introduces novel engineering solutions to common distributed auth problems—such as sub-millisecond JWT invalidation without per-request DB hits, multi-tab session synchronization, timing-attack mitigation, and Redis-backed idempotency & rate-limiting.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[Client App / Next.js] -->|HTTPS Requests| NestAPI[NestJS API /api]
    
    subgraph NestJS App
        AuthGuard[AuthGuard - JWT & av Validation]
        ThrottlerGuard[CustomThrottlerGuard - Redis Throttler]
        Idempotency[IdempotencyInterceptor]
        Controllers[Auth / User Controllers]
        Services[17+ Single-Purpose Services]
    end
    
    NestAPI --> ThrottlerGuard
    ThrottlerGuard --> AuthGuard
    AuthGuard --> Idempotency
    Idempotency --> Controllers
    Controllers --> Services
    
    Services -->|Sub-ms av Check & Caching| Redis[(Redis 7)]
    Services -->|ACID Transactions| Postgres[(PostgreSQL DB)]
```

### 📊 Interactive API Flow Diagram

Explore the comprehensive visual step-by-step logic for all Guards, Interceptors, Auth APIs, and Admin actions:

👉 **[View Interactive API Flow Diagram on Excalidraw](https://excalidraw.com/#json=MEMfRc34JjCGUG4TFJS5Y,bAY_QrVDfq8AyyGucGMN0w)**


---

## 💡 Key Technical Features

### 1. Sub-Millisecond Authorization Versioning (`authz_version`)
- **Zero-DB-Query Auth Guard:** Replaced heavy database session blacklists with a Redis-backed `authz_version` pattern (`authz:version:{userId}`).
- **Atomic Invalidation:** Any security-sensitive operation (password change, user ban, role elevation, session revocation) atomically increments `users.authz_version` in PostgreSQL inside a DB transaction and updates Redis post-commit.
- **Fail-Closed Resilience:** Catches Redis misses with DB fallbacks; fails closed with `503 Service Unavailable` on Redis connection failure to prevent security bypass.

### 2. Hardened Security & Anti-Timing Protections
- **Constant-Time Verification:** Dummy bcrypt hash calculation on missing users during sign-in to eliminate side-channel timing attacks and account enumeration.
- **SHA-256 Hashed Refresh Tokens:** Stored securely in DB with timing-safe comparison (`timingSafeEqual`) and strict single-use token rotation.
- **Google OAuth 2.0 + PKCE:** OpenID Connect integration with lazy config initialization, automatic & manual account linking/unlinking, and graceful error redirects.

### 3. Distributed Infrastructure & Resilience
- **API Idempotency:** Redis-backed `X-Idempotency-Key` interceptor preventing duplicate processing during network retries.
- **Distributed Rate Limiting:** Custom `@nestjs/throttler` storage tracking IP + User ID keys with per-route overrides.
- **Acyclic Modular Design:** Extracted repository providers into `UsersRepositoriesModule` to strictly prevent NestJS circular dependencies.
- **Admin Audit Trail:** Immutable logging (`admin_audit_logs`) tracking administrative actions (bans, unbans, role changes, session revocations) executed within the same database transaction.

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Framework** | NestJS v11.0.1 |
| **Runtime** | Node.js v24.18.0 |
| **Language** | TypeScript v5.7.3 (ES2023) |
| **Database** | PostgreSQL (Docker) |
| **ORM** | Drizzle ORM v1.0.0-rc.4 |
| **Cache & State** | Redis 7 (`ioredis` v6.0.0) |
| **Rate Limiting** | `@nestjs/throttler` v6.5.0 + RedisThrottlerStorageService |
| **Documentation** | Swagger / OpenAPI (`/api/docs`) |
| **Email Delivery** | Resend SDK |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v24+`
- **Docker & Docker Compose**: For running PostgreSQL and Redis containers locally.
- **Bun** or **npm**

### 1. Environment Setup

Copy `.env.example` to `.env` and fill in the required configuration:

```bash
cp .env.example .env
```

Key environment variables template (`.env.example`):
```env
# APPLICATION
APP_URL=http://localhost:5000
PORT=5000
NODE_ENV=development

# DATABASE
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5433/traqon_db

# RESEND
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=onboarding@resend.dev

# JWT
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# REDIS
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OAUTH - GOOGLE
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### 2. Start Services via Docker

Start PostgreSQL and Redis:

```bash
docker compose up -d
```

### 3. Install Dependencies & Run Server

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:5000/api`.
Interactive Swagger API documentation is available at `http://localhost:5000/api/docs`.

---

## 🗄️ Database & Migrations

Drizzle ORM handles database operations and schema management.

```bash
# Generate migrations from schema changes
npm run drizzle:generate

# Apply migrations to database
npm run drizzle:migrate

# Open Drizzle Studio UI
npm run drizzle:studio
```

---

## 🔑 API Endpoints Reference

### Public & Authentication (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/sign-up` | Register new user account |
| `POST` | `/api/auth/sign-in` | Authenticate with email/password |
| `POST` | `/api/auth/verify-email` | Confirm email via token |
| `POST` | `/api/auth/resend-verification-email` | Resend verification email |
| `POST` | `/api/auth/refresh` | Silent access token refresh using httpOnly cookie |
| `POST` | `/api/auth/logout` | Revoke current refresh session & clear cookie |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Reset password using reset token |
| `GET` | `/api/auth/google` | Initiate Google OAuth 2.0 login |
| `GET` | `/api/auth/google/callback` | Google OAuth callback handler |

### User Profile & Sessions (`/api/auth` & `/api/users`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/me` | Fetch authenticated user profile |
| `PATCH` | `/api/users/me` | Update name / profile |
| `DELETE` | `/api/users/me` | Self-service account deletion |
| `POST` | `/api/auth/change-password` | Change password (authenticated) |
| `POST` | `/api/auth/set-password` | Set password for OAuth-only accounts |
| `GET` | `/api/auth/sessions` | List active sessions |
| `POST` | `/api/auth/sessions/revoke` | Revoke single active session |
| `POST` | `/api/auth/sessions/revoke-all` | Revoke all other active sessions |
| `GET` | `/api/auth/accounts` | List linked OAuth accounts |
| `POST` | `/api/auth/accounts/unlink` | Unlink an OAuth account |

### Admin Management (`/api/users`)

| Method | Endpoint | Guard | Description |
|---|---|---|---|
| `GET` | `/api/users` | `@Roles('admin')` | Paginated user listing (search, filter, sort) |
| `GET` | `/api/users/:id` | `@Roles('admin')` | User details with ban history |
| `POST` | `/api/users/:id/ban` | `@Roles('admin')` | Ban user with reason |
| `POST` | `/api/users/:id/unban` | `@Roles('admin')` | Unban user |
| `POST` | `/api/users/:id/role` | `@Roles('admin')` | Grant/revoke admin role |
| `GET` | `/api/users/:id/sessions` | `@Roles('admin')` | View all active/revoked user sessions |
| `POST` | `/api/users/:id/sessions/:sessionId/revoke` | `@Roles('admin')` | Admin revoke specific user session |
| `GET` | `/api/users/audit-logs` | `@Roles('admin')` | Paginated admin audit log table |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Public status endpoint (`{ status: 'ok', timestamp: string }`) |

---

## 🔒 Security & Architecture Deep-Dive

### Stateless JWT & Redis Authorization Version (`authz_version`)

```
[ Incoming Request ] 
       │
       ▼
 [ AuthGuard ] ──► Extract Bearer Access Token ──► Verify Signature & Expiry
       │
       ├─► Read `av` from JWT Payload
       ├─► Fetch current `authz_version` from Redis (`authz:version:${userId}`)
       │
       ▼
[ Is JWT av == Redis av? ]
       ├── YES ──► Pass (0 DB Queries) ──► Attach AuthUser ──► Route Handler
       └── NO  ──► Throws 401 STALE_AUTHORIZATION ──► Triggers Silent Token Refresh
```

---

## 📂 Project Structure

```
back-end/
├── drizzle/                          # Database migration SQL files
├── docker-compose.yml                # PostgreSQL & Redis container config
├── src/
│   ├── main.ts                       # App entry point & global interceptors/pipes
│   ├── app.module.ts                 # Root module configuration
│   ├── auth/                         # Authentication domain
│   │   ├── auth.controller.ts
│   │   └── services/                 # 17 single-purpose services (auth, password, verification, sessions, oauth)
│   ├── users/                        # User domain & Admin management
│   │   ├── users.controller.ts
│   │   └── services/                 # Admin, profile, and user services
│   ├── common/                       # Infrastructure & shared modules
│   │   ├── guards/                   # AuthGuard, RolesGuard, CustomThrottlerGuard
│   │   ├── interceptors/             # IdempotencyInterceptor, LoggingInterceptor
│   │   ├── redis/                    # RedisModule, RedisService, AuthzVersionService
│   │   └── throttler/                # RedisThrottlerStorageService
│   ├── db/                           # Drizzle schema & database singleton
│   ├── email/                        # Resend service & HTML email templates
│   ├── hashing/                      # BcryptService abstraction
│   └── tokens/                       # JWT issuance & session management
├── drizzle.config.ts                 # Drizzle Kit configuration
└── package.json
```

---

## 📄 License

This project is licensed under the MIT License.
