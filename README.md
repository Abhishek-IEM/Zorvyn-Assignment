# Finance Data Processing and Access Control Backend

Node.js + Express + MongoDB backend for a finance dashboard system with role-based access control, financial record management, and dashboard-level analytics.

## Stack

- Node.js (ES modules)
- Express
- MongoDB + Mongoose
- JWT authentication
- Zod validation

## Implemented Requirements

### 1. User and Role Management

- User creation and management (admin-only)
- Role assignment: viewer, analyst, admin
- Active/inactive status support
- Admin bootstrap account created automatically on first run

### 2. Financial Records Management

- Create financial records (admin)
- View records with filtering and pagination (analyst, admin)
- Update records (admin)
- Delete records (admin)
- Filters: type, category, date range

### 3. Dashboard Summary APIs

- Total income
- Total expenses
- Net balance
- Category-wise totals
- Recent activity
- Monthly trends

### 4. Access Control Logic

- JWT-based authentication middleware
- Role-based authorization middleware for endpoint-level permissions

### 5. Validation and Error Handling

- Request validation via Zod
- Structured error payloads with status codes and details
- Invalid IDs and invalid operations handled with clear messages

### 6. Data Persistence

- MongoDB persistence using Mongoose models and indexes

## Project Structure

- src/config: environment and database config
- src/models: Mongoose models
- src/middleware: auth, RBAC, validation, error handling
- src/routes: auth, users, records, dashboard endpoints
- src/app.js: Express app wiring
- src/server.js: startup, DB connect, admin bootstrap

## Environment Variables

Copy .env.example to .env and update values.

- PORT: API port (default 4000)
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: JWT signing secret
- JWT_EXPIRES_IN: token TTL (example 1d)
- ADMIN_USERNAME: initial admin username
- ADMIN_PASSWORD: initial admin password
- ADMIN_FULL_NAME: initial admin name

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create .env from .env.example and set values.

3. Start development server:

```bash
npm run dev
```

4. Or start normally:

```bash
npm start
```

Health endpoint:

- GET /health

## Authentication Flow

1. Login with POST /api/auth/login
2. Receive JWT token
3. Send header on protected routes:

Authorization: Bearer <token>

## Role Access Matrix

- Viewer:
  - Can access dashboard summary
  - Cannot read records list
  - Cannot create/update/delete records
  - Cannot manage users
- Analyst:
  - Can read records list and dashboard summary
  - Cannot create/update/delete records
  - Cannot manage users
- Admin:
  - Full access to users, records, and dashboard

## API Endpoints

### Auth

- POST /api/auth/login

Request body:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Users (admin only)

- GET /api/users
- POST /api/users
- PATCH /api/users/:id

Create user body:

```json
{
  "username": "analyst1",
  "fullName": "Analyst User",
  "password": "strongpass",
  "role": "analyst",
  "isActive": true
}
```

### Financial Records

- GET /api/records (analyst, admin)
  - Query params: type, category, startDate, endDate, page, limit
- POST /api/records (admin)
- PUT /api/records/:id (admin)
- DELETE /api/records/:id (admin)

Create record body:

```json
{
  "amount": 1200.5,
  "type": "income",
  "category": "salary",
  "recordDate": "2026-04-01",
  "notes": "April salary"
}
```

### Dashboard

- GET /api/dashboard/summary (viewer, analyst, admin)
  - Optional query params: startDate, endDate

## Error Response Shape

```json
{
  "message": "Validation failed",
  "details": [
    {
      "path": "amount",
      "message": "Number must be greater than 0"
    }
  ]
}
```

## Assumptions and Tradeoffs

- Username is unique.
- Viewer can only see dashboard summary, not raw records.
- Authentication is simplified to JWT login without refresh tokens.
- No test suite included in this version (can be added with Jest + Supertest).
- No soft-delete implemented; records are permanently deleted.

## Submission Notes

This implementation matches the assignment by covering backend design, RBAC logic, CRUD + analytics APIs, persistence, and validation/error handling with clear structure and maintainable code organization.
