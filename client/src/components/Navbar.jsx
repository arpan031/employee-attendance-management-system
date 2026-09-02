import { Menu, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { employee, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="icon-button mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="navbar-title">
            Attendance Management
          </h1>
          <p className="navbar-subtitle">
            {employee?.role === "hr"
              ? "HR Management Portal"
              : "Employee Portal"}
          </p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <UserCircle size={28} />
          <div className="navbar-user-info">
            <strong>{employee?.name}</strong>
            <span>{employee?.employeeId}</span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;