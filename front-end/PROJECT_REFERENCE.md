# Project Reference

> **Last updated:** 2026-08-12 08:50  
> **Project name:** project-name-frontend

---

## Project Overview

A **Next.js 16 front-end application** that provides the complete user-facing interface for the authentication platform. The application is a standalone SPA-style client (not a monorepo) that communicates with the NestJS back-end REST API via server actions and an Axios-based API client.

### Business Domain

User-facing authentication, profile management, session management, OAuth account linking, admin user management, admin role assignment, admin audit log monitoring — all backed by the NestJS API.

### Main Features

| Feature | Description |
|---|---|
| Email/password sign-up | With redirect to email verification pending page |
| Email/password sign-in | JWT-based with automatic access token refresh |
| Google OAuth sign-in | Redirect to backend OAuth flow, callback handling |
| Email verification | Token-based auto-verification via URL, resend with cooldown |
| Password reset | Forgot → email link → reset form flow |
| Profile management | Dialog with tabbed panels (profile, security, sessions, links) |
| Profile editing | Name update via editable profile tab |
| Password change | Change existing password or set password for OAuth-only accounts |
| Session management | List active sessions, revoke individual/all other sessions |
| OAuth account linking | Link/unlink Google accounts via profile Links tab |
| Account deletion | Self-service account deletion with confirmation dialog |
| Admin user management | Paginated user listing with search, filter, sort |
| Admin user detail | View user details with ban data and ban history |
| Admin ban/unban | Ban users with reason, unban users |
| Admin role change | Grant or revoke admin role (`user` / `admin`) with real-time token invalidation |
| Admin session management | View all sessions (active/revoked/expired) for a user, revoke individual sessions |
| Admin audit logs | Paginated audit log table tracking admin actions (bans, unbans, role changes, session revocations) |
| Multi-tab refresh sync | Native Web Locks API (`auth-refresh`) and BroadcastChannel sync across browser tabs |
| Dark/light theme | System-aware theme toggle with `next-themes` |
| Banned user flow | Auto-redirect to ban page with reason display and support contact |

### Application Flow

1. User visits auth page → registers → redirected to verify page → clicks email link → auto-verified and signed in → redirected to dashboard
2. User signs in → access token stored in memory, refresh token in httpOnly cookie (embedding required `sessionId` and `av` claims) → redirected to dashboard
3. Access token expires or returns `401 STALE_AUTHORIZATION` → API client acquires Web Locks API lock (`auth-refresh`) → calls `POST /api/auth/refresh` → new access token → original request retried (waiting tabs reuse fresh token)
4. Session revocation / Token invalidate → `RevocationListener` receives BroadcastChannel event or storage event → clears QueryClient cache → redirects client to login page
5. OAuth users → redirected to Google via backend → callback page handles success/error toasts → redirected to dashboard
6. Profile dialog → opened via avatar button → 4 tab panels (profile, security, sessions, links) → URL state synced via `?open=` query param
7. Admin users → login redirects admin role to `/admin` → sidebar + navbar layout → user listing with CRUD operations
8. Admin Audit Logs → navigated via sidebar link (`/admin/audit-logs`) → paginated list with action filters (`ban_user`, `unban_user`, `change_role`, `revoke_session`), admin/target filters, and inspection modal
9. Banned users → `BannedGuard` detects ban status → redirects to `/banned` page with reason and support contact

---

## Architecture

| Property | Value |
|---|---|
| Framework | Next.js 16.3.0 (App Router, Turbopack) |
| React | 19.2.4 |
| TypeScript | v5 (target: ES2017) |
| Module system | ESNext (moduleResolution: bundler) |
| Package manager | Bun (bun.lock) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Component library | Radix UI v1.4.3 (custom-styled, warm editorial aesthetic) |
| Icons | Lucide React v1.16.0 |
| State management | TanStack React Query v5 |
| Form management | React Hook Form v7 + Zod v4 |
| Server actions | `next-safe-action` v8.5.3 |
| HTTP client | Axios v1.19.0 |
| Theme | `next-themes` v0.4.6 |
| Toast notifications | Sonner v2.0.7 |
| Logging | Pino v10.3.1 (`pino-pretty` for dev) |
| Path alias | `@/*` → `./*` |

### Design Aesthetic

Warm, editorial aesthetic inspired by print newspapers and financial dashboards. Key principles:
- **Serif typography** for headlines (DM Serif Display) and body (DM Serif Text)
- **Monospace** (IBM Plex Mono) for all labels, metadata, badges — always uppercase with wide tracking
- **No border radius** on auth/profile surfaces (`rounded-none` is intentional)
- **No box shadows** — depth comes from border weight hierarchy
- Color palette: warm cream (light) / near-black (dark) with terracotta accent (`#c14a2b` / `#e05a3a`)

### Data Flow Architecture

```
Pages (Server/Client Components)
  └── Server Actions (actions/*.ts)
        └── API Client (lib/api/client.ts)
              └── Axios → NestJS Backend API (/api/*)
                    └── Response → React Query Cache
```

> **Key pattern:** All backend communication goes through server actions → Axios API client. React Query manages client-side caching and invalidation. The API client handles token refresh (via Web Locks API), cookie forwarding, and idempotency headers automatically.

---

## Folder Structure

```
front-end/
├── app/                                # Next.js App Router
│   ├── (admin)/                        # Admin layout group
│   │   ├── admin/
│   │   │   ├── audit-logs/page.tsx     # Admin Audit Logs page (/admin/audit-logs)
│   │   │   ├── users/[id]/page.tsx     # Admin user detail page (/admin/users/:id)
│   │   │   ├── users/page.tsx          # Admin users listing page (/admin/users)
│   │   │   └── page.tsx                # Admin overview redirect
│   │   └── layout.tsx                  # Admin layout wrapper (AdminGuard, AdminSidebar, AdminNavbar)
│   ├── (auth)/                         # Auth layout group
│   │   ├── banned/page.tsx             # Banned user page (/banned)
│   │   ├── forgot-password/page.tsx    # Forgot password page (/forgot-password)
│   │   ├── login/page.tsx              # Sign-in page (/login)
│   │   ├── register/page.tsx           # Sign-up page (/register)
│   │   ├── reset-password/page.tsx     # Reset password page (/reset-password)
│   │   └── verify/page.tsx             # Email verification pending/confirm page (/verify)
│   ├── (root)/
│   │   └── dashboard/page.tsx          # User dashboard page (/dashboard)
│   ├── oauth/callback/page.tsx         # Google OAuth callback handler (/oauth/callback)
│   ├── global-error.tsx                # Global error boundary
│   ├── globals.css                     # Tailwind CSS & theme variables
│   ├── layout.tsx                      # Root layout (fonts, providers, BannedGuard, RevocationListener)
│   ├── loading.tsx                     # Global loading spinner
│   └── page.tsx                        # Home page (redirects based on auth state)
├── actions/                            # Next.js Server Actions (next-safe-action)
│   ├── admin.ts                        # Admin actions (listUsers, getUserById, banUser, unbanUser, changeUserRole, listUserSessions, adminRevokeSession, listAuditLogs)
│   ├── auth.ts                         # Auth actions (signUp, signIn, logout, verifyEmail, resendVerification, forgotPassword, resetPassword)
│   └── profile.ts                      # Profile actions (updateMe, deleteMe, changePassword, setPassword, listSessions, revokeSession, revokeAllOtherSessions, listOAuthAccounts, unlinkOAuthAccount, getGoogleLinkUrl)
├── components/                         # React components
│   ├── admin/                          # Admin dashboard components
│   │   ├── AdminGuard.tsx              # Role check wrapper (redirects non-admins)
│   │   ├── AdminNavbar.tsx             # Top navigation bar
│   │   ├── AdminSidebar.tsx            # Side navigation drawer (Users, Audit Logs)
│   │   ├── AuditLogsTable.tsx          # Admin audit logs table with filters & JSON inspection modal
│   │   ├── BanHistoryTable.tsx         # User ban history table
│   │   ├── FilterDropdown.tsx          # Reusable filter select
│   │   ├── RoleBadge.tsx               # Admin/user role badge
│   │   ├── SearchInput.tsx             # Debounced search input
│   │   ├── StatusBadge.tsx             # Active/banned status badge
│   │   ├── TablePagination.tsx         # Reusable pagination controls
│   │   ├── TableSkeleton.tsx           # Table loading skeleton
│   │   ├── UserActions.tsx             # Ban/unban/role dropdown menu
│   │   ├── UserDetailsCard.tsx         # User info card
│   │   ├── UserSessionsTable.tsx       # User active sessions table
│   │   └── UsersTable.tsx              # Paginated users list table
│   ├── auth/                           # Authentication wrappers & listeners
│   │   ├── BannedGuard.tsx             # Detects banned status & redirects to /banned
│   │   ├── RevocationListener.tsx      # Global BroadcastChannel/storage revocation listener
│   │   └── TokenVerifier.tsx           # Validates token on route changes
│   ├── button/                         # Reusable button components
│   ├── form/                           # Auth forms & inputs
│   ├── profile/                        # Profile dialog & tabbed panels (Profile, Security, Sessions, Links)
│   ├── skeletons/                      # Loading skeletons
│   └── ui/                             # Radix UI primitive wrappers
├── constants/                          # Application constants
│   └── routes.ts                       # Route paths (HOME, LOGIN, REGISTER, DASHBOARD, ADMIN, ADMIN_USERS, ADMIN_AUDIT_LOGS, etc.)
├── hooks/                              # Custom React hooks
│   ├── profile-dialog-url-state.tsx    # Syncs profile dialog tab state with URL ?open= parameter
│   ├── session.tsx                     # Query hook for session/auth state
│   ├── use-countdown.ts                # Cooldown timer hook for email resend buttons
│   └── use-is-mounted.ts               # SSR hydration guard hook
├── lib/                                # Core utilities & API client
│   ├── api/client.ts                   # Axios client with Web Locks token refresh, cookie forwarding, idempotency
│   ├── auth/revocation.ts              # Global session revocation event emitter & BroadcastChannel helper
│   ├── next-action-handler/            # Safe action logging, error handling, and unwrap utilities
│   ├── reactQuery/query-keys.ts        # TanStack Query key factory (sessionQueryKey, adminUsersQueryKey, adminAuditLogsQueryKey)
│   ├── visitorInfo/                    # Device & browser detection helpers
│   └── zodSchema/                      # Zod validation schemas (admin-schema, auth-schema, profile-schema)
├── providers/                          # React context providers (QueryProvider, ThemeProvider)
├── types/                              # TypeScript type definitions (admin.ts, auth.ts)
├── middleware.ts                       # Next.js middleware (route protection & auth redirects)
└── next.config.ts                      # Next.js configuration
```

---

## Routes & Pages

| Path | Layout Group | Auth Required | Role | Description |
|---|---|---|---|---|
| `/` | Root | Optional | Any | Home page (redirects to `/dashboard` if authenticated, `/login` if guest) |
| `/login` | `(auth)` | Guest | Any | Sign-in page with email/password and Google OAuth |
| `/register` | `(auth)` | Guest | Any | Sign-up page |
| `/forgot-password` | `(auth)` | Guest | Any | Password reset request page |
| `/reset-password` | `(auth)` | Guest | Any | Password reset confirmation page (token in URL) |
| `/verify` | `(auth)` | Guest | Any | Email verification confirmation page (token in URL) |
| `/dashboard` | `(root)` | Yes | Any | User dashboard page with profile trigger button |
| `/admin` | `(admin)` | Yes | Admin | Admin overview (redirects to `/admin/users`) |
| `/admin/users` | `(admin)` | Yes | Admin | Admin users listing with search, filters, pagination |
| `/admin/users/:id` | `(admin)` | Yes | Admin | Admin user detail page with ban history & session management |
| `/admin/audit-logs` | `(admin)` | Yes | Admin | Admin Audit Logs page with action filters and JSON inspection modal |
| `/banned` | `(auth)` | Banned | Any | Banned user notice page |
| `/oauth/callback` | OAuth | Guest | Any | Google OAuth callback handler |

---

## Server Actions (`actions/`)

### `actions/admin.ts`

- `listUsers(input: ListUsersQuerySchema)` — Fetch paginated users list with search, filter, sort
- `getUserById(input: GetUserSchema)` — Fetch single user with ban data & ban history
- `banUser(input: BanUserSchema)` — Ban a user with reason
- `unbanUser(input: UnbanUserSchema)` — Unban a user
- `changeUserRole(input: ChangeRoleSchema)` — Update user role (`user` / `admin`)
- `listUserSessions(input: ListUserSessionsSchema)` — Fetch active/revoked sessions for a user
- `adminRevokeSession(input: RevokeSessionSchema)` — Revoke a user session
- `listAuditLogs(input: ListAuditLogsQuerySchema)` — Fetch paginated admin audit logs with action, admin, and target filters

### `actions/auth.ts`

- `signUp(input: SignUpSchema)` — Register new account
- `signIn(input: SignInSchema)` — Authenticate with email/password
- `logout()` — Sign out current session and clear tokens
- `verifyEmail(input: VerifyEmailSchema)` — Verify email via token
- `resendVerification(input: ResendVerificationSchema)` — Resend verification email
- `forgotPassword(input: ForgotPasswordSchema)` — Request password reset email
- `resetPassword(input: ResetPasswordSchema)` — Reset password with token

### `actions/profile.ts`

- `updateMe(input: UpdateMeSchema)` — Update user name
- `deleteMe()` — Delete own account
- `changePassword(input: ChangePasswordSchema)` — Change current password
- `setPassword(input: SetPasswordSchema)` — Set password for OAuth-only account
- `listSessions()` — Fetch user's own active sessions
- `revokeSession(input: RevokeSessionSchema)` — Revoke a single session
- `revokeAllOtherSessions()` — Revoke all other active sessions
- `listOAuthAccounts()` — List linked Google/OAuth accounts
- `unlinkOAuthAccount(input: UnlinkOAuthSchema)` — Unlink an OAuth account
- `getGoogleLinkUrl()` — Generate OAuth account linking URL

---

## State Management & Synchronization

### React Query Keys (`lib/reactQuery/query-keys.ts`)

- `sessionQueryKey`: `["session"]`
- `accountQueryKey`: `["account"]`
- `accountHasPasswordQueryKey`: `["account", "has-password"]`
- `accountSessionsQueryKey`: `["account", "sessions"]`
- `accountConnectionsQueryKey`: `["account", "connections"]`
- `adminQueryKey`: `["admin"]`
- `adminUsersQueryKey`: `["admin", "users"]`
- `adminUserDetailQueryKey(id)`: `["admin", "users", id]`
- `adminUserSessionsQueryKey(id)`: `["admin", "users", id, "sessions"]`
- `adminAuditLogsQueryKey`: `["admin", "audit-logs"]`

### Multi-Tab Synchronization & Locking

- **Web Locks API (`navigator.locks.request('auth-refresh')`):** Synchronizes token refresh across browser tabs so that only one tab calls `POST /api/auth/refresh` at a time.
- **BroadcastChannel (`project_name_auth_refresh`):** Broadcasts token refresh success events to other active tabs so waiting requests reuse the freshly set access token.
- **Revocation Broadcast (`project_name_auth_revocation`):** Broadcasts session revocation events to immediately clear query caches and redirect all open tabs to `/login`.

---

## AI Working Guidelines

1. **Always read this file first** before making any changes in the frontend codebase.
2. **Follow Next.js App Router conventions** — server components by default, client components (`"use client"`) only when interactivity/hooks are required.
3. **Use `next-safe-action`** for all server action definitions with Zod schema inputs.
4. **Unwrap safe action results using `unwrapAction()`** when consuming actions inside React Query or event handlers.
5. **Enforce the warm editorial design aesthetic**:
   - `font-serif-display` for page titles and section headers
   - `font-mono uppercase tracking-widest` for badges, metadata, labels, and table headers
   - `rounded-none` on cards, inputs, buttons, dialogs, and borders
   - No box shadows — use subtle border weight hierarchy
6. **Use centralized `ROUTES` constants** (`@/constants/routes`) for all navigation and redirects.
7. **Keep `PROJECT_REFERENCE.md` updated** automatically after every code change without requiring user reminders.
