import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  UserCircle
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { employee, logout, isHR } = useAuth();

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

        <div className="navbar-titles">
          <h1 className="navbar-title">
            {isHR ? "HR Dashboard" : "My Dashboard"}
          </h1>
          <p className="navbar-subtitle">
            {isHR
              ? "Overview of your organization attendance"
              : "Your attendance & leave overview"}
          </p>
        </div>
      </div>

      <div className="navbar-right">
        {isHR && (
          <div className="search-box navbar-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search employees..."
              aria-label="Search employees"
            />
          </div>
        )}

        <button
          type="button"
          className="icon-button navbar-icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          {isHR && <span className="notification-dot" />}
        </button>

        <div className="navbar-user">
          <UserCircle size={27} />
          <div className="navbar-user-info">
            <strong>{employee?.name || "User"}</strong>
            <span>
              {isHR ? "HR Admin" : employee?.employeeId}
            </span>
          </div>
          <ChevronDown size={15} className="navbar-chevron" />
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
          aria-label="Logout"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
