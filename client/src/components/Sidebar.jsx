import logo from "../assets/attendpro-icon.svg";
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Users,
  X
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ open, onClose }) => {
  const { isHR } = useAuth();

  const employeeLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      to: "/attendance",
      label: "Attendance",
      icon: CalendarCheck
    },
    {
      to: "/leave",
      label: "Leave",
      icon: ClipboardList
    }
  ];

  const hrLinks = [
    {
      to: "/hr",
      label: "HR Dashboard",
      icon: LayoutDashboard
    },
    {
      to: "/hr/employees",
      label: "Employees",
      icon: Users
    },
    {
      to: "/hr/attendance",
      label: "Attendance",
      icon: Clock3
    },
    {
      to: "/hr/leaves",
      label: "Leave Requests",
      icon: ClipboardList
    },
    {
      to: "/hr/analytics",
      label: "Analytics",
      icon: BarChart3
    }
  ];

  const links = isHR ? hrLinks : employeeLinks;

  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <img
              src={logo}
              alt="AttendPro Logo"
              className="brand-icon-img"
              />
            <div>
              <strong>AttendPro</strong>
              <span>Management System</span>
            </div>
          </div>

          <button
            type="button"
            className="icon-button sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-title">
            {isHR ? "HR Management" : "Employee"}
          </p>

          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/dashboard" || link.to === "/hr"}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
                onClick={onClose}
              >
                <Icon size={19} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>Employee Attendance System</p>
          <span>v1.0.0</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
