# Finance Dashboard Backend (Production-Ready)

A production-style Node.js + Express + MongoDB backend for finance data processing, access control, and dashboard analytics.

## Overview

This backend is designed for a finance dashboard where users interact with financial records based on role-based permissions. It provides secure authentication, strict access control, robust validation, centralized error handling, and aggregated dashboard insights.

## Features

- JWT authentication
- Strict role-based access control (RBAC)
- User management (admin only)
- Financial records CRUD with soft delete
- Pagination and filtering for records listing
- Advanced dashboard aggregation APIs
- Centralized error handling with consistent response format
- Clean architecture with route/controller/service separation

## Tech Stack

- Node.js (ES modules)
- Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Validation with Zod
- Logging with Morgan

## Access Control Matrix

- Viewer:
  - Can read records (GET)
  - Cannot access dashboard insights
  - Cannot create/update/delete records
  - Cannot manage users
- Analyst:
  - Can read records (GET)
  - Can access dashboard summary
  - Cannot create/update/delete records
  - Cannot manage users
- Admin:
  - Full records CRUD
  - Dashboard summary access
  - User management access

## Project Structure

- src/app.js: app wiring and middleware registration
- src/server.js: startup, DB connection, admin bootstrap
- src/config: environment and database setup
- src/models: Mongoose schemas and indexes
- src/routes: endpoint definitions + route-level policies
- src/controllers: request/response handlers
- src/services: business logic and DB operations
- src/middleware: auth, RBAC, validation, error handling
- src/utils: async wrapper and HTTP error helper

## Core APIs

### Auth

- POST /api/auth/login

Request:

```json
{
  "username": "admin",
  "password": "Admin@1234"
}
```

Response:

```json
{
  "token": "<jwt>",
  "user": {
    "id": "...",
    "username": "admin",
    "fullName": "System Admin",
    "role": "admin",
    "isActive": true
  }
}
```

### Users (Admin only)

- GET /api/users
- POST /api/users
- PATCH /api/users/:id

Create user request:

```json
{
  "username": "analyst1",
  "fullName": "Analyst One",
  "password": "StrongPass123",
  "role": "analyst",
  "isActive": true
}
```

### Financial Records

- GET /api/records (viewer, analyst, admin)
  - Query params: page, limit, category, type, startDate, endDate
- POST /api/records (admin)
- PUT /api/records/:id (admin)
- DELETE /api/records/:id (admin)

Create record request:

```json
{
  "amount": 2500,
  "type": "income",
  "category": "salary",
  "recordDate": "2026-04-01",
  "notes": "Monthly payout"
}
```

### Dashboard

- GET /api/dashboard/summary (analyst, admin)
  - Query params: startDate, endDate

Response data includes:

- totalIncome
- totalExpenses
- netBalance
- categoryTotals
- recentTransactions (last 5)
- monthlyTrends

## Validation and Error Format

Validation enforces:

- Required fields
- amount > 0
- type in [income, expense]
- Date format checks

Example error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    {
      "path": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

## Soft Delete Behavior

Delete operation marks records as deleted (`isDeleted=true`, `deletedAt`) instead of permanently removing them. Listing and dashboard queries automatically ignore soft-deleted records.

## Environment Variables

Create `.env` from `.env.example`:

- PORT=8000
- MONGODB_URI=<your-mongodb-uri>
- JWT_SECRET=<your-secret>
- JWT_EXPIRES_IN=1d
- ADMIN_USERNAME=admin
- ADMIN_PASSWORD=Admin@1234
- ADMIN_FULL_NAME=System Admin

## Setup and Run

1. Install dependencies:

```bash
npm install
```

2. Configure `.env`.

3. Run server:

```bash
npm start
```

For development:

```bash
npm run dev
```

Health check:

- GET /health

## Production Notes

- Uses centralized error middleware to avoid leaking raw server errors.
- Uses route-level role middleware plus auth middleware to protect all private routes.
- Startup includes database connection logging and explicit port-in-use handling.
- Designed for scalability with service-layer architecture and query-level filtering/pagination.
