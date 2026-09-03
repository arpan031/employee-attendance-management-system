# AttendPro — Employee Attendance Management System

A full-stack **Employee Attendance Management System** built on the MERN stack (MongoDB, Express, React, Node.js). AttendPro provides separate HR and Employee portals covering authentication, attendance check-in/check-out, automatic working-hour and overtime calculation, leave application with automatic leave-balance deduction, and an analytics dashboard for HR.

This project was built to satisfy the following assignment requirements:

- Employee Login & Registration
- Attendance Check-In / Check-Out
- Working Hours Calculation
- Leave Deduction Calculation
- HR Dashboard
- Employee Dashboard
- Attendance Status Tracking

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Design](#database-design)
5. [Application Architecture](#application-architecture)
6. [Security](#security)
7. [API Reference](#api-reference)
8. [Environment Variables](#environment-variables)
9. [Setup Instructions](#setup-instructions)
10. [Seeding Demo Data](#seeding-demo-data)
11. [Running Tests](#running-tests)
12. [Production Build & Deployment](#production-build--deployment)
13. [Demo Credentials](#demo-credentials)
14. [Design Decisions & Trade-offs](#design-decisions--trade-offs)
15. [Future Improvements](#future-improvements)

---

##  Live Demo

**Production:** https://attendpro-seven.vercel.app

**GitHub:** https://github.com/arpan031/employee-attendance-management-system

## Feature Overview

### Employee Portal

| Requirement | Implementation |
|---|---|
| Login & Registration | Self-service registration and JWT-based login (`/api/auth/register`, `/api/auth/login`) |
| Attendance Check-In / Check-Out | One check-in and one check-out per day, timestamped server-side |
| Working Hours Calculation | Automatically computed from check-in/check-out timestamps on every check-out |
| Attendance Status Tracking | Each day is automatically classified as **Present**, **Late**, **Half Day**, **Absent**, or **Leave** |
| Leave Application | Employees apply for leave with a date range, type, and reason |
| Leave Deduction Calculation | Approved leave days are atomically deducted from the employee's leave balance |
| Personal Dashboard | Attendance history, leave balance, and leave request status in one place |

### HR Portal

| Requirement | Implementation |
|---|---|
| HR Dashboard | Live workforce KPIs — total employees, present today, late today, pending leave requests |
| Employee Management | Add, view, search, paginate, activate/deactivate, and delete employee accounts |
| Attendance Management | Company-wide attendance log with search, filters, and pagination |
| Leave Management | Review, approve, or reject pending leave requests |
| Attendance Analytics | Daily attendance distribution chart and monthly summary breakdown |

### Attendance Rules Engine

| Rule | Value |
|---|---|
| Office start time | 09:00 |
| Standard working day | 8 hours |
| Half-day threshold | 4 hours |
| Timezone | Asia/Kolkata (configurable) |

On every check-out, the system automatically derives:

- Total working minutes
- Overtime minutes (time beyond the standard 8-hour day)
- Late arrival flag (check-in after 09:00)
- Half-day flag (fewer than 4 working hours)
- Final daily attendance status

---

## Technology Stack

**Frontend**
- React 19 + Vite 7
- React Router for client-side routing
- Axios for API communication
- Recharts for attendance analytics visualization
- Lucide React for icons
- Plain CSS3 (custom design system, no framework dependency)

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication
- Helmet (security headers)
- express-rate-limit (API rate limiting)
- express-validator (request validation)
- bcryptjs (password hashing)
- CORS with an explicit allow-list

**Testing**
- Jest + Supertest
- mongodb-memory-server (isolated, disposable test database — no real database is touched by the test suite)

**Deployment**
- Vercel (static frontend + serverless API function)
- MongoDB Atlas

---

## Project Structure

```text
employee-attendance-system/
│
├── api/
│   └── index.js                    # Vercel serverless entry point
│
├── client/                         # React frontend
│   ├── src/
│   │   ├── components/             # Sidebar, Navbar, Pagination, StatCard, ProtectedRoute
│   │   ├── context/                # AuthContext (session/token state)
│   │   ├── pages/
│   │   │   ├── auth/               # Login, Register
│   │   │   ├── employee/           # EmployeeDashboard, Attendance, Leave
│   │   │   └── hr/                 # HRDashboard, Employees, AttendanceManagement, LeaveRequests
│   │   ├── services/api.js         # Axios instance, JWT attach/refresh interceptors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Design system (colors, typography, layout, components)
│   └── package.json
│
├── server/                         # Express backend
│   ├── config/                     # db.js, cors.js
│   ├── controllers/                # authController, attendanceController, leaveController, hrController
│   ├── middleware/                 # authMiddleware, roleMiddleware, validateMiddleware, errorMiddleware
│   ├── models/                     # Employee, Attendance, Leave (Mongoose schemas)
│   ├── routes/                     # authRoutes, attendanceRoutes, leaveRoutes, hrRoutes
│   ├── services/attendanceService.js  # Working hours / overtime / status calculation engine
│   ├── validators/                 # authValidator, attendanceValidator, leaveValidator, hrValidator
│   ├── utils/                      # dateUtils, generateToken, seedDemo
│   ├── tests/                      # auth.test.js, attendance.test.js, leave.test.js
│   ├── app.js                      # Express app (middleware + route wiring)
│   ├── server.js                   # Server bootstrap
│   └── package.json
│
├── .gitignore
├── package.json                    # Root scripts (installs & runs both apps together)
├── vercel.json
└── README.md
```

---

## Database Design

MongoDB Atlas is used as the primary datastore, with three core collections.

### `Employee`

| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Required, unique, lowercase |
| password | String | Bcrypt-hashed, never returned in API responses |
| employeeId | String | Required, unique, uppercase |
| department | String | Required |
| designation | String | Required |
| role | String | `employee` \| `hr` |
| joiningDate | Date | Defaults to record creation date |
| leaveBalance | Number | Defaults to 18 days, decremented on approved leave |
| isActive | Boolean | Deactivated accounts cannot log in |

### `Attendance`

| Field | Type | Notes |
|---|---|---|
| employeeId | ObjectId (ref: Employee) | Indexed |
| date | String (`YYYY-MM-DD`) | Local calendar date, indexed with `employeeId` |
| checkIn / checkOut | Date | Timestamps |
| workingMinutes | Number | Derived |
| overtimeMinutes | Number | Derived |
| status | String | `Present` \| `Late` \| `Half Day` \| `Absent` \| `Leave` |

### `Leave`

| Field | Type | Notes |
|---|---|---|
| employeeId | ObjectId (ref: Employee) | Indexed |
| leaveType | String | e.g. Casual, Sick, Earned |
| startDate / endDate | Date | Leave range |
| totalDays | Number | Derived from date range |
| reason | String | |
| status | String | `Pending` \| `Approved` \| `Rejected` |
| remarks | String | HR's rejection reason, if any |

Indexes are defined on `(employeeId, date)` for attendance and `(department, isActive)` for employees to keep HR list/filter queries fast as data grows.

---

## Application Architecture

The backend follows an **MVC-inspired layered architecture**:

```
Route  →  Validator  →  Middleware (auth/role)  →  Controller  →  Service/Model  →  MongoDB
```

- **Routes** only wire HTTP verbs/paths to middleware and controllers.
- **Validators** (`express-validator`) reject malformed input before it reaches business logic.
- **Middleware** handles authentication (`authMiddleware`), role-based authorization (`roleMiddleware`), and centralized error handling.
- **Controllers** contain request/response orchestration only.
- **Services** (e.g. `attendanceService.js`) hold pure business logic — working hours, overtime, and status derivation — decoupled from HTTP so it's independently testable.
- **Models** define schema, validation rules, and indexes at the database layer.

The frontend mirrors this separation: `services/api.js` centralizes all HTTP calls, `context/AuthContext.jsx` owns session state, and pages are grouped by role (`employee/`, `hr/`) with shared, reusable components (`StatCard`, `Pagination`, `ProtectedRoute`).

```text
                    ┌──────────────────┐
                    │  Login/Register  │
                    └────────┬─────────┘
                             │
                     JWT Authentication
                             │
              ┌──────────────┴───────────────┐
              │                              │
        ┌─────▼─────┐                  ┌─────▼─────┐
        │ Employee  │                  │    HR     │
        │  Portal   │                  │  Portal   │
        └─────┬─────┘                  └─────┬─────┘
              │                              │
     ┌────────┼────────┐         ┌───────────┼────────────┐
     │        │         │        │           │            │
  Check-in  Leave   History   Employees  Attendance    Leave
  Check-out Apply             (add/edit/  Management  Requests
                               delete)                (approve/
                                                        reject)
     │        │         │        │           │            │
     └────────┴─────────┴────────┴───────────┴────────────┘
                             │
                       MongoDB Atlas
```

---

## Security

- **JWT authentication** on every protected route, validated by `authMiddleware`
- **Role-based access control** (`employee` vs `hr`) enforced by `roleMiddleware` — HR-only endpoints are inaccessible to employee accounts, even with a valid token
- **Password hashing** with bcrypt (cost factor 12); password hashes are never included in any API response
- **Helmet** for standard security headers, with `x-powered-by` disabled
- **CORS** restricted to an explicit allow-list via `CLIENT_URL`
- **API rate limiting** (300 requests / 15 minutes per client) to reduce abuse/brute-force risk
- **Server-side input validation** on every mutating endpoint via `express-validator`, with structured error responses
- **Centralized error handling** so raw stack traces/internals are never leaked to clients
- **Self-protection guards** — an HR user cannot deactivate or delete their own account, preventing accidental lockout
- **Environment-based secrets** — no credentials or JWT secrets are committed to source control

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth (public)

```text
POST /auth/register        Register a new employee
POST /auth/login           Log in and receive a JWT
GET  /auth/me              Get the current authenticated user      [protected]
```

### Attendance (employee, protected)

```text
POST /attendance/check-in    Record today's check-in
POST /attendance/check-out   Record today's check-out and compute working hours
GET  /attendance/today       Get today's attendance record
GET  /attendance/my          Get my attendance history
```

### Leave (protected)

```text
POST  /leaves                 Apply for leave                       [employee]
GET   /leaves/my              View my leave requests                [employee]
GET   /leaves/all             View all leave requests                    [hr]
PATCH /leaves/:id/approve     Approve a leave request (deducts balance)  [hr]
PATCH /leaves/:id/reject      Reject a leave request                     [hr]
```

### HR (protected, `hr` role only)

```text
GET    /hr/dashboard              Workforce KPIs
GET    /hr/analytics              Attendance analytics & monthly summary
POST   /hr/employees              Add a new employee
GET    /hr/employees              List / search / paginate employees
PATCH  /hr/employees/:id/status   Activate / deactivate an employee
DELETE /hr/employees/:id          Delete an employee and their records
GET    /hr/attendance             Company-wide attendance log
```

### Health Check

```text
GET /health
```

---

## Environment Variables

Create `server/.env` (see `server/.env.example`):

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string
TEST_MONGODB_URI=your_test_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

CLIENT_URL=http://localhost:5173
APP_TIMEZONE=Asia/Kolkata
```

For production (e.g. Vercel), configure the same keys in the hosting provider's environment settings, with `CLIENT_URL` set to the deployed frontend's URL.

> **Never commit `.env` files or real secrets to version control.**

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm
- A MongoDB connection string (local MongoDB or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/arpan031/employee-attendance-system.git
cd employee-attendance-system
```

### 2. Install all dependencies

```bash
npm run install:all
```

This installs the root, `server`, and `client` dependencies in one step.

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

Then edit `server/.env` with your MongoDB URI and a JWT secret.

### 4. Start the application

From the project root:

```bash
npm run dev
```

This runs the backend and frontend concurrently:

```text
Backend:   http://localhost:5000
Frontend:  http://localhost:5173
```

You can also run each independently:

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

---

## Seeding Demo Data

A seed script provisions demo HR and Employee accounts:

```bash
cd server
npm run seed
```

This creates the accounts listed under [Demo Credentials](#demo-credentials). Safe to re-run — existing demo accounts are cleared and recreated each time.

---

## Running Tests

The backend test suite runs against an in-memory MongoDB instance (`mongodb-memory-server`), so it never touches your real database:

```bash
cd server
npm test
```

Coverage includes authentication, attendance (check-in/check-out/working-hours logic), and leave application/approval flows.

---

## Production Build & Deployment

### Build the frontend

```bash
cd client
npm run build
```

Output is generated in `client/dist`.

### Deploy to Vercel

The repository includes `vercel.json`, which:

- Builds the React frontend as a static site
- Deploys `api/index.js` as a serverless function
- Routes `/api/*` requests to the serverless function and everything else to the React app

Set the [environment variables](#environment-variables) in the Vercel project settings, and ensure your MongoDB Atlas cluster's network access allows connections from Vercel's deployment environment.

---

## Demo Credentials

For local/demo testing only — created by `npm run seed`:

**HR**
```text
Email: hr@company.com
Password: Admin@123
Employee ID: HR001
```

**Employee**
```text
Email: employee@company.com
Password: Employee@123
Employee ID: EMP001
```

> Change or remove these before deploying to any real/production environment.

---

## Design Decisions & Trade-offs

- **Server-derived timestamps for attendance** — check-in/check-out times are stamped by the server rather than trusted from the client, to prevent time manipulation.
- **Leave deduction is atomic** — the leave-balance decrement happens as part of the approval transaction, avoiding race conditions if two requests are approved in quick succession.
- **Cascade delete on employee removal** — deleting an employee also removes their attendance and leave history, keeping the database free of orphaned references (an alternative "soft delete / archive" strategy was considered, but the existing activate/deactivate flag already covers the common case of retaining a former employee's record without permanent deletion).
- **Business logic isolated in `attendanceService.js`** — working-hours/overtime/status calculation is kept independent of Express request/response objects, making it directly unit-testable and reusable if the API surface changes.
- **No frontend UI framework dependency** — styling is implemented in a single, hand-tuned CSS design system rather than a component library, keeping bundle size small and every visual detail explicit and easy to theme.

---

## Future Improvements

- Email notifications for leave approval/rejection
- CSV/Excel export for attendance and payroll reporting
- Configurable per-employee shift timings (current rules are company-wide)
- Refresh-token rotation for longer-lived sessions
- Audit log for HR actions (employee creation/deletion, status changes)

---

## Author

**Arpan Ghosh**

**GitHub:** https://github.com/arpan031/employee-attendance-management-system

**Production:** https://attendpro-seven.vercel.app
