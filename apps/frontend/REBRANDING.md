# 📝 Customization & Branding Guide (Front-End)

This guide lists all files and locations in the **Front-End (Next.js 16)** codebase that should be customized when using this repository as a template for a new project/company. You can pass these instructions directly to any AI coding assistant to automatically brand the project.

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
- **File:** `package.json`
  - Property: `"name"`
  - Description: Change to your front-end package name (e.g., `"acme-frontend"`).
- **Files:** `package-lock.json` and `bun.lock`
  - Workspace root name property.

### 2. Global Layout & Page Metadata
- **File:** `app/layout.tsx`
  - `metadata.title.template` and `metadata.title.default` (Browser tab titles).
- **File:** `app/page.tsx`
  - `metadata.title` for the landing page.
- **File:** `app/(admin)/admin/audit-logs/page.tsx`
  - Admin page metadata title.
- **File:** `components/admin/AdminSidebar.tsx`
  - Sidebar logo/brand text (e.g., `<Link ...>Acme Admin</Link>`).
- **File:** `app/(root)/dashboard/page.tsx`
  - Header brand text.

### 3. Banned Notice & Support Contact
- **File:** `app/(auth)/banned/page.tsx`
  - `supportEmail` fallback value.
  - Mailto subject and body pre-filled text.

### 4. Environment Variables
- **Files:** `.env.local` and `.env.example`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_SUPPORT_EMAIL`

### 5. Multi-Tab Storage & BroadcastChannel Keys (Optional Prefix Customization)
- **File:** `lib/auth/revocation.ts`
  - `REVOCATION_CHANNEL_NAME` (e.g., `"acme_auth_revocation"`)
  - `REVOCATION_STORAGE_KEY` (e.g., `"acme_session_revoked_at"`)
- **File:** `lib/api/client.ts`
  - `AUTH_REFRESH_CHANNEL` (e.g., `"acme_auth_refresh"`)

### 6. Project Documentation
- **File:** `README.md`
  - Title header and project overview description.
- **File:** `PROJECT_REFERENCE.md`
  - Project name metadata and overview section.
