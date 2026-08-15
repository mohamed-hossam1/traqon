# 📝 Customization & Branding Guide (Front-End)

This guide lists all files and locations in the **Front-End (Next.js 16)** codebase inside `apps/frontend` that should be customized when using this repository as a template for a new project/company. You can pass these instructions directly to any AI coding assistant to automatically brand the project.

---

## 🤖 Prompt for AI Assistants

```text
Please rebrand this Next.js front-end project for my company/project:
- App/Project Name: <YOUR_PROJECT_NAME> (e.g. Acme)
- Support Email: <YOUR_SUPPORT_EMAIL> (e.g. support@acme.com)
- API Base URL: <YOUR_API_URL> (e.g. https://api.acme.com/api)

Please update package.json, HTML metadata, page titles, layout branding, email links, environment files, and documentation according to REBRANDING.md.
```

---

## 📌 File Locations & Customization Checklist

### 1. Package & Lock Files
- **File:** `apps/frontend/package.json`
  - Property: `"name"`
  - Description: Change to your front-end package name (e.g., `"acme-frontend"` or `"frontend"`).
- **Files:** `pnpm-lock.yaml` (Monorepo root lockfile)
  - Workspace root name property.

### 2. Global Layout & Page Metadata
- **File:** `apps/frontend/app/layout.tsx`
  - `metadata.title.template` and `metadata.title.default` (Browser tab titles).
- **File:** `apps/frontend/app/page.tsx`
  - `metadata.title` for the landing page.
- **File:** `apps/frontend/app/(admin)/admin/audit-logs/page.tsx`
  - Admin page metadata title.
- **File:** `apps/frontend/components/admin/AdminSidebar.tsx`
  - Sidebar logo/brand text (e.g., `<Link ...>Acme Admin</Link>`).
- **File:** `apps/frontend/app/(root)/dashboard/page.tsx`
  - Header brand text.

### 3. Banned Notice & Support Contact
- **File:** `apps/frontend/app/(auth)/banned/page.tsx`
  - `supportEmail` fallback value.
  - Mailto subject and body pre-filled text.

### 4. Environment Variables
- **Files:** `apps/frontend/.env.local` and `apps/frontend/.env.example`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_SUPPORT_EMAIL`

### 5. Multi-Tab Storage & BroadcastChannel Keys (Optional Prefix Customization)
- **File:** `apps/frontend/lib/auth/revocation.ts`
  - `REVOCATION_CHANNEL_NAME` (e.g., `"acme_auth_revocation"`)
  - `REVOCATION_STORAGE_KEY` (e.g., `"acme_session_revoked_at"`)
- **File:** `apps/frontend/lib/api/client.ts`
  - `AUTH_REFRESH_CHANNEL` (e.g., `"acme_auth_refresh"`)

### 6. Project Documentation
- **File:** `apps/frontend/README.md`
  - Title header and project overview description.
- **File:** `apps/frontend/PROJECT_REFERENCE.md`
  - Project name metadata and overview section.
