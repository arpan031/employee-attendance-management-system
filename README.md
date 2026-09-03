# AttendPro — Employee Attendance Management System

A modern full-stack **Employee Attendance Management System** built with the MERN stack. AttendPro provides separate HR and Employee portals for attendance tracking, working-hour calculation, leave management, analytics, and employee administration.

## 🚀 Live Demo

**Production:** https://attendpro-seven.vercel.app

**GitHub:** https://github.com/arpan031/employee-attendance-management-system

---

## ✨ Features

### 👨‍💼 HR Portal

- HR authentication and protected routes
- HR dashboard with workforce statistics
- Total employee overview
- Present and late employee tracking
- Attendance analytics and trends
- Attendance distribution chart
- Employee management
- Activate/deactivate employee accounts
- Employee search and pagination
- Attendance management
- Leave request management
- Approve/reject leave requests
- Recent attendance activity
- Monthly attendance summary

### 👨‍💻 Employee Portal

- Employee registration and login
- Protected employee dashboard
- Attendance check-in
- Attendance check-out
- Working-hours calculation
- Overtime calculation
- Attendance status tracking
- Personal attendance history
- Leave balance
- Leave application
- Leave request history
- Leave approval status

---

## 🛠️ Technology Stack

### Frontend

- React 19
- Vite 7
- React Router
- Axios
- Recharts
- Lucide React
- CSS3

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Helmet
- Express Rate Limit
- CORS
- Joi validation

### Deployment

- Vercel
- MongoDB Atlas
- Vercel Serverless Functions

---

## 📁 Project Structure

```text
employee-attendance-management-system/
│
├── api/
│   └── index.js
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── StatCard.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   │
│   │   │   ├── employee/
│   │   │   │   ├── EmployeeDashboard.jsx
│   │   │   │   ├── Attendance.jsx
│   │   │   │   └── Leave.jsx
│   │   │   │
│   │   │   └── hr/
│   │   │       ├── HRDashboard.jsx
│   │   │       ├── Employees.jsx
│   │   │       ├── AttendanceManagement.jsx
│   │   │       └── LeaveRequests.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   │   ├── cors.js
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   └── hrController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validateMiddleware.js
│   │
│   ├── models/
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   └── Leave.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── leaveRoutes.js
│   │   └── hrRoutes.js
│   │
│   ├── services/
│   │   └── attendanceService.js
│   │
│   ├── utils/
│   │   ├── dateUtils.js
│   │   └── seedDemo.js
│   │
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── attendance.test.js
│   │   └── leave.test.js
│   │
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── vercel.json
```

---

## 🔐 Authentication & Security

AttendPro uses JWT-based authentication.

Security measures include:

- JWT authentication
- Role-based authorization
- Protected API routes
- Password hashing
- Helmet security headers
- CORS configuration
- API rate limiting
- Request validation
- Centralized error handling
- HTTP-only-compatible authentication architecture
- Environment variables for secrets
- Disabled Express `x-powered-by` header

HR-only endpoints are protected from normal employee accounts.

---

## 🕘 Attendance Rules

The attendance service uses the following standard configuration:

| Rule | Value |
|---|---|
| Office start time | 09:00 |
| Standard working time | 8 hours |
| Half-day threshold | 4 hours |
| Timezone | Asia/Kolkata |

The system calculates:

- Check-in time
- Check-out time
- Total working hours
- Overtime
- Late status
- Half-day status
- Attendance status

---

## 🗄️ Database

The application uses **MongoDB Atlas**.

Main collections/models:

### Employee

Stores:

- Employee name
- Email
- Password hash
- Employee ID
- Department
- Designation
- Role
- Leave balance
- Active status

### Attendance

Stores:

- Employee reference
- Attendance date
- Check-in
- Check-out
- Working hours
- Overtime
- Attendance status

### Leave

Stores:

- Employee reference
- Leave type
- Start date
- End date
- Total days
- Reason
- Status
- HR remarks/rejection reason

---

## 🔌 API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Attendance

```text
POST /api/attendance/check-in
POST /api/attendance/check-out
GET  /api/attendance/today
GET  /api/attendance/my
```

### Leaves

```text
POST /api/leaves
GET  /api/leaves/my
GET  /api/leaves/all
PATCH /api/leaves/:id/approve
PATCH /api/leaves/:id/reject
```

### HR

```text
GET   /api/hr/dashboard
GET   /api/hr/analytics
GET   /api/hr/employees
PATCH /api/hr/employees/:id/status
GET   /api/hr/attendance
```

### Health Check

```text
GET /health
```

---

## ⚙️ Environment Variables

### Server

Create:

```text
server/.env
```

Example:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string
TEST_MONGODB_URI=your_test_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

CLIENT_URL=http://localhost:5173
APP_TIMEZONE=Asia/Kolkata
```

### Production

Configure the following environment variables in Vercel:

```text
MONGODB_URI
JWT_SECRET
CLIENT_URL
APP_TIMEZONE
NODE_ENV
```

For production, `CLIENT_URL` should contain the deployed frontend URL.

Do not commit `.env` files or secrets to GitHub.

---

## 💻 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/arpan031/employee-attendance-management-system.git
cd employee-attendance-management-system
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Install client dependencies

```bash
cd client
npm install
```

### 4. Install server dependencies

```bash
cd ../server
npm install
```

### 5. Configure environment variables

Create:

```text
server/.env
```

and add your MongoDB Atlas connection string and JWT secret.

### 6. Start the application

From the project root:

```bash
npm run dev
```

The application runs on:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## 🧪 Testing

The backend includes Jest tests covering authentication, attendance, and leave functionality.

Run:

```bash
cd server
npm test
```

Expected result for the current test suite:

```text
Test Suites: 3 passed, 3 total
Tests:       9 passed, 9 total
```

---

## 🏗️ Production Build

Build the React frontend:

```bash
cd client
npm run build
```

The production files are generated in:

```text
client/dist
```

---

## ☁️ Deployment

The application is configured for Vercel deployment.

### Vercel

The root project contains:

```text
vercel.json
```

The configuration builds the React frontend and routes `/api/*` requests to the serverless API.

### MongoDB Atlas

MongoDB Atlas is used as the production database.

For Vercel deployment, make sure the Atlas network access configuration allows connections from the deployment environment.

---

## 🎨 UI/UX

AttendPro uses a modern SaaS dashboard design with:

- Purple/indigo visual identity
- Responsive sidebar navigation
- Dashboard KPI cards
- Interactive charts
- Attendance distribution visualization
- Employee profile cards
- Status badges
- Responsive tables
- Mobile-friendly layouts
- Loading states
- Empty states
- Error and success notifications
- Lucide icons

The UI is designed for both HR administrators and employees.

---

## 👥 User Roles

### HR Administrator

Can:

- View workforce statistics
- Manage employees
- View attendance
- Review leave requests
- Approve/reject leaves
- Analyze attendance

### Employee

Can:

- View personal dashboard
- Check in
- Check out
- View attendance history
- Apply for leave
- View leave history
- Track leave balance

---

## 📊 Dashboard

The HR dashboard provides:

- Total employees
- Present today
- Late today
- Pending leaves
- Daily attendance trend
- Attendance distribution
- Pending leave requests
- Recent attendance activity
- Monthly attendance summary

---

## 🔄 Application Flow

```text
                    ┌─────────────────┐
                    │   Login/Register│
                    └────────┬────────┘
                             │
                       JWT Authentication
                             │
              ┌──────────────┴──────────────┐
              │                             │
        ┌─────▼─────┐                 ┌─────▼─────┐
        │ Employee  │                 │    HR     │
        │  Portal   │                 │  Portal   │
        └─────┬─────┘                 └─────┬─────┘
              │                             │
       ┌──────┼──────┐              ┌───────┼────────┐
       │      │      │              │       │        │
    Attend  Leave  History       Employees Attendance Leaves
       │      │                     │       │        │
       └──────┴──────────┐          └───────┴────────┘
                         │
                    MongoDB Atlas
```

---

## 🧑‍💻 Development Principles

The project follows:

- Separation of frontend and backend concerns
- RESTful API architecture
- MVC-style backend organization
- Reusable React components
- Protected routes
- Role-based access control
- Centralized API handling
- Centralized error handling
- Environment-based configuration
- Responsive UI design
- Automated backend testing

---

## ⚠️ Demo Credentials

For local/demo testing only:

### HR

```text
Email: hr@company.com
Password: Admin@123
Employee ID: HR001
```

### Employee

```text
Email: employee@company.com
Password: Employee@123
Employee ID: EMP001
```

**Important:** Change demo passwords before using the application in a real production environment.

---

## 📌 Project Status

**Status:** Production deployed

The application has:

- ✅ MERN architecture
- ✅ Authentication
- ✅ Role-based authorization
- ✅ Attendance management
- ✅ Leave management
- ✅ HR dashboard
- ✅ Analytics
- ✅ Employee management
- ✅ MongoDB Atlas
- ✅ Vercel deployment
- ✅ Backend tests
- ✅ Responsive UI

---

## 📄 License

This project is developed as an Employee Attendance Management System project/assessment.

---

## 👨‍💻 Author

**Arpan Ghosh**

GitHub:

https://github.com/arpan031/employee-attendance-management-system

Live Application:

https://attendpro-seven.vercel.app
