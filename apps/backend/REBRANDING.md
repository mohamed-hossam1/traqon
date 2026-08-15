# 📝 Customization & Branding Guide (Back-End)

This guide lists all files and locations in the **Back-End (NestJS)** codebase inside `apps/backend` that should be customized when using this repository as a template for a new project/company. You can pass these instructions directly to any AI coding assistant to automatically brand the project.

---

## 🤖 Prompt for AI Assistants

```text
Please rebrand this NestJS back-end project for my company/project:
- App/Project Name: <YOUR_PROJECT_NAME> (e.g. AcmeAuth)
- Database Name: <YOUR_DB_NAME> (e.g. acme_db)
- Docker Container Prefixes: <YOUR_CONTAINER_PREFIX> (e.g. acme_postgres, acme_redis)
- Support / From Email: <YOUR_EMAIL> (e.g. noreply@acme.com)

Please update all references across apps/backend/package.json, apps/backend/docker-compose.yml, db connection strings, email templates, and documentation according to REBRANDING.md.
```

---

## 📌 File Locations & Customization Checklist

### 1. Project Package Configuration
- **File:** `apps/backend/package.json`
  - Property: `"name"`
  - Description: Change to your backend package name (e.g., `"acme-backend"` or `"backend"`).

### 2. Docker & Database Setup
- **File:** `apps/backend/docker-compose.yml`
  - `container_name` for PostgreSQL & Redis.
  - `POSTGRES_DB` environment variable.
- **File:** `apps/backend/src/db/index.ts`
  - Default fallback database connection string URL (`postgresql://.../your_db_name`).
- **Files:** `apps/backend/.env` and `apps/backend/.env.example`
  - `DATABASE_URL` (Database connection URL).
  - `EMAIL_FROM` (Default sender address).
  - `FRONTEND_URL` (Frontend client URL).

### 3. Email Delivery & HTML Templates
- **File:** `apps/backend/src/email/email.service.ts`
  - Fallback sender email (`EMAIL_FROM`).
- **File:** `apps/backend/src/email/templates/layout.email.ts`
  - Header brand name text inside `<span style="...">BRAND_NAME</span>`.
  - Footer copyright text.
- **File:** `apps/backend/src/email/templates/verification.email.ts`
  - Welcome greeting message and title metadata.
- **File:** `apps/backend/src/email/templates/password-reset.email.ts`
  - Reset email body text and title metadata.

### 4. Open API / Swagger Documentation
- **File:** `apps/backend/src/swagger-setup.ts`
  - Title, description, and site title for Swagger UI (`/api/docs`).

### 5. Environment Variable Schema
- **File:** `apps/backend/src/common/config/env.validation.ts`
  - Adjust any required defaults or enum values if adding new environment variables.

### 6. Project Documentation
- **File:** `apps/backend/README.md`
  - Title header and project overview description.
- **File:** `apps/backend/PROJECT_REFERENCE.md`
  - Project name metadata and overview section.
