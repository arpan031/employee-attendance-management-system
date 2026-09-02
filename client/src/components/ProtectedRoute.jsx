import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const {
    employee,
    loading,
    isAuthenticated
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(employee?.role)
  ) {
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
  }

  return <Outlet />;
};

export default ProtectedRoute;