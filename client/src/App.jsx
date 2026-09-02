import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import Attendance from "./pages/employee/Attendance";
import Leave from "./pages/employee/Leave";

import HRDashboard from "./pages/hr/HRDashboard";
import Employees from "./pages/hr/Employees";
import AttendanceManagement from "./pages/hr/AttendanceManagement";
import LeaveRequests from "./pages/hr/LeaveRequests";

const HomeRedirect = () => {
  const { employee } = useAuth();

  return (
    <Navigate
      to={
        employee?.role === "hr"
          ? "/hr"
          : "/dashboard"
      }
      replace
    />
  );
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["employee"]}
          />
        }
      >
        <Route
          element={<DashboardLayout />}
        >
          <Route
            path="/dashboard"
            element={<EmployeeDashboard />}
          />

          <Route
            path="/attendance"
            element={<Attendance />}
          />

          <Route
            path="/leave"
            element={<Leave />}
          />
        </Route>
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["hr"]}
          />
        }
      >
        <Route
          element={<DashboardLayout />}
        >
          <Route
            path="/hr"
            element={<HRDashboard />}
          />

          <Route
            path="/hr/employees"
            element={<Employees />}
          />

          <Route
            path="/hr/attendance"
            element={<AttendanceManagement />}
          />

          <Route
            path="/hr/leaves"
            element={<LeaveRequests />}
          />

          <Route
            path="/hr/analytics"
            element={
              <HRDashboard
                analyticsOnly
              />
            }
          />
        </Route>
      </Route>

      <Route
        path="/"
        element={<HomeRedirect />}
      />

      <Route
        path="*"
        element={<HomeRedirect />}
      />
    </Routes>
  );
};

export default App;