# Finance Data Processing & Access Control Backend

A complete Node.js over Express backend application with a robust role-based access control system for managing users and financial records. Built with TypeScript, Prisma, SQLite, and Zod.

## Features implemented
- **User Management**: Create, list, and manage user statuses and roles (`ADMIN` only).
- **Authentication**: JWT based authentication with bcrypt password hashing.
- **Role Guards**: Configurable `requireRole` middleware to restrict endpoint access (`VIEWER`, `ANALYST`, `ADMIN`).
- **Financial Records**: Filtering by date range, category, and type. Pagination supported.
- **Dashboard APIs**: Aggregation queries using Prisma for summary totals and category breakdowns. SQLite raw query used for monthly distribution trend.
- **Validation**: Strict request body, params, and query validation via `zod`.
- **Error Handling**: Global error handler middleware providing consistent JSON responses.
- **Rate Limiting**: Configured for basic endpoints.
- **Documentation**: Standardized OpenAPI / Swagger annotations.
- **Automated Tests**: Unit testing for Role Guards and Dashboard summarize logic using Jest.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   This will run Prisma generation, push the schema to local dev.db, and seed standard users.
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## Standard Users Provided in Seed

| User Email | Password | Role | Permissions |
| -------- | ------- |-------|-------|
| admin@test.com | password123 | ADMIN | Full overall CRUD. Manage users & view dashboard |
| analyst@test.com | password123 | ANALYST | Can read records & view dashboard. |
| viewer@test.com | password123 | VIEWER | Can only view dashboard summaries. |

## Role Permissions Table

| Action | VIEWER | ANALYST | ADMIN |
| -------- | ------- |-------|-------|
| Login (`/api/auth/login`) | ✅ | ✅ | ✅ |
| View Dashboard (`/api/dashboard/*`) | ✅ | ✅ | ✅ |
| Read Records (`/api/records`) | ❌ | ✅ | ✅ |
| Create Record (`/api/records`) | ❌ | ❌ | ✅ |
| Update Record (`/api/records/:id`) | ❌ | ❌ | ✅ |
| Delete Record (`/api/records/:id`) | ❌ | ❌ | ✅ |
| Read/Update Users (`/api/users`) | ❌ | ❌ | ✅ |

## System Technical Assumptions
- **Database Architecture**: Prisma cleanly connects to `SQLite` and manages standard schema tracking. In real production, we'd persist `dev.db` carefully or migrate to Postgres. A seed script initializes 3 default users.
- **Error Consistency**: All failed responses return a `{ "error": "message" }`. Detail validation errors have a `details` array attached.
- **Access Control Methodology**: An `auth.middleware.ts` first intercepts tokens verifying the raw authorization and setting `req.user`. Only afterward can `requireRole(['ROLE1', 'ROLE2'])` be evaluated directly from memory payload resolving the 401 unauthenticated and 403 forbidden differences perfectly.
- **Summary Logic**: Prisma features its efficient `$sum` aggregations mapping perfectly through SQLite `GROUP BY` mechanisms meaning it is performed safely in DB layer avoiding high Javascript execution costs.

## API Documentation Snapshot

If the server is running, visit **http://localhost:3000/api-docs** to see the interactive Swagger UI.

### 1) Auth
- `POST /api/auth/login` → Authenticate using credentials, returns JWT.

### 2) Users
- `GET /api/users` → Fetch list of all registered users (Admin only)
- `POST /api/users` → Create user and assign Role / Status (Admin only)
- `PUT /api/users/:id/role` → Update Role payload (Admin)
- `PUT /api/users/:id/status` → Update status properties Active / Inactive (Admin)

### 3) Records
- `GET /api/records` → Lists all items. Accepts standard query params: `?startDate=2024-01-01&endDate=2024-12-31&category=Food&type=EXPENSE&limit=10&offset=0`
- `POST /api/records` → Body requires `amount`, `type` (INCOME/EXPENSE), `category`, `date`.
- `PUT /api/records/:id` → Partial update properties.
- `DELETE /api/records/:id` → Drops permanently.

### 4) Dashboard
- `GET /api/dashboard/summary` → Totals logic yielding total properties and net balance.
- `GET /api/dashboard/category-totals` → Sub-totals dynamically mapped by group properties.
- `GET /api/dashboard/recent` → Latest basic ledger entries pulled aggressively.
- `GET /api/dashboard/monthly-trend` → Database driven aggregated groupings formatting strictly the specific `year-month`.
