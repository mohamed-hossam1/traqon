# ⚡ Enterprise Distributed Auth & Identity Engine Template

[![NestJS](https://img.shields.io/badge/NestJS-v11.0.1-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-v16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://orm.drizzle.team/)
[![Redis](https://img.shields.io/badge/Redis-v7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)](LICENSE)

> This project template is an enterprise-grade identity control system designed for high-throughput distributed applications. It solves the stateless vs stateful auth dilemma with an explicit **Authorization Versioning Engine (`authz_version`)**, giving you **sub-millisecond token verification** with **zero DB queries** on protected routes and **immediate global session invalidation**.

---

## 🚀 Key Features

- **⚡ Sub-Millisecond Authorization Check:** Evaluates access tokens against Redis `authz:version:{userId}` in `< 1ms`.
- **💥 Instant Global Revocation:** Role updates, user bans, password changes, or session terminations immediately increment `authz_version` and revoke all issued tokens across devices.
- **🔒 Web Locks & Multi-Tab Synchronization:** Prevents race conditions during token refresh across multiple open tabs using `navigator.locks` and `BroadcastChannel`.
- **🔑 Google OAuth 2.0 PKCE:** OpenID Connect integration with automatic profile linking, unlinking, and failure redirect handling.
- **🛡️ Enterprise Idempotency & Rate-Limiting:** Redis-backed `X-Idempotency-Key` handling and customizable endpoint throttling.
- **📊 Admin Control Center & Audit Logs:** User directory with search, ban management, role assignment, and granular audit trail.

---

## 🏛️ System Architecture Overview

```mermaid
graph LR
    Client["Client (Next.js 16)"] -->|Bearer JWT + av| Guard["AuthGuard (NestJS 11)"]
    Guard -->|1. Sub-ms Redis Check| Redis[("Redis 7 (authz:version)")]
    Guard -->|2. Valid av| Controller["API Controller"]
    
    SecurityEvent["Security Event (Ban/Role Update)"] -->|Increment av| DB[("PostgreSQL (Drizzle)")]
    DB -->|Post-Commit Update| Redis
```

---

## 📂 Repository Structure

```text
project-template/
├── apps/
│   ├── backend/            # NestJS 11 REST API Service
│   │   ├── src/
│   │   │   ├── auth/       # Login, Register, OAuth, Refresh, Verification
│   │   │   ├── users/      # Profile management & Admin User CRUD
│   │   │   ├── common/     # AuthzVersionService, Idempotency, Throttling, Guards
│   │   │   ├── db/         # Drizzle Schema & PostgreSQL Connection
│   │   │   └── email/      # Transactional Email Templates (Resend)
│   │   └── PROJECT_REFERENCE.md # Technical Backend Architecture Reference
│   └── frontend/           # Next.js 16 App Router Client
│       ├── app/            # React Server Components & Action Handlers
│       ├── components/     # Radix UI & Modern Tailwind Components
│       └── PROJECT_REFERENCE.md # Technical Frontend Architecture Reference
├── pnpm-workspace.yaml     # Workspace declaration
├── PROJECT.md              # 📖 Master Project Specification & Deep-Dive
└── README.md               # 📌 Root Portal & Overview Guide
```

---

## ⚡ Quickstart

### 1. Launch Infrastructure & Install Dependencies
```bash
pnpm install
cd apps/backend && docker-compose up -d
```

### 2. Start Backend API
```bash
pnpm dev:back
# OR: cd apps/backend && pnpm start:dev
```
> Interactive API Docs: `http://localhost:4000/api/docs`

### 3. Start Frontend Client
```bash
pnpm dev:front
# OR: cd apps/frontend && pnpm dev
```
> Frontend Application: `http://localhost:3000`

---

## 📑 Full Documentation

For deep technical specifications, sequence diagrams, database schemas, performance benchmarks, and endpoint matrices, consult the master project file:

👉 **[PROJECT.md](file:///home/mohamed/Documents/traqon/PROJECT.md)**

---

## 📜 License

Distributed under the MIT License.
